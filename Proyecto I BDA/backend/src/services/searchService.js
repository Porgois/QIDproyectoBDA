import { pgPool, mysqlPool, getMongoDb } from '../config/database.js';

export class SearchService {
  async search(query) {
    const keywords = query.toLowerCase().trim().split(/\s+/).filter(k => k.length > 2);
    
    if (keywords.length === 0) {
      return { success: true, results: [], total: 0 };
    }

    try {
      // Búsqueda paralela en las 3 bases de datos
      const [pgResults, mysqlResults, mongoResults] = await Promise.all([
        this.searchPostgres(keywords),
        this.searchMySQL(keywords),
        this.searchMongo(keywords)
      ]);

      // Combinar y rankear resultados
      const combined = this.mergeResults(pgResults, mysqlResults, mongoResults);

      return {
        success: true,
        results: combined,
        total: combined.length,
        sources: {
          postgres: pgResults.length,
          mysql: mysqlResults.length,
          mongodb: mongoResults.length
        }
      };
    } catch (error) {
      console.error('Search error:', error);
      return { success: false, error: error.message, results: [] };
    }
  }

  async searchPostgres(keywords) {
    try {
      const query = `
        SELECT url, keyword, relevance
        FROM search_index
        WHERE keyword = ANY($1)
        ORDER BY relevance DESC
        LIMIT 50
      `;
      const result = await pgPool.query(query, [keywords]);
      return result.rows;
    } catch (error) {
      console.error('Postgres search error:', error);
      return [];
    }
  }

  async searchMySQL(keywords) {
    try {
      const likeConditions = keywords.map(() => 'title LIKE ?').join(' OR ');
      const params = keywords.map(k => `%${k}%`);
      
      const [rows] = await mysqlPool.query(
        `SELECT url, title FROM pages_metadata WHERE ${likeConditions} LIMIT 50`,
        params
      );
      return rows;
    } catch (error) {
      console.error('MySQL search error:', error);
      return [];
    }
  }

  async searchMongo(keywords) {
    try {
      const db = getMongoDb();
      const collection = db.collection('pages_content');
      
      const searchRegex = keywords.join('|');
      const results = await collection.find({
        $or: [
          { paragraphs: { $regex: searchRegex, $options: 'i' } },
          { 'list-items': { $regex: searchRegex, $options: 'i' } }
        ]
      }).limit(50).toArray();

      return results;
    } catch (error) {
      console.error('MongoDB search error:', error);
      return [];
    }
  }

  mergeResults(pgResults, mysqlResults, mongoResults) {
    const resultsMap = new Map();

    // Agregar resultados de PostgreSQL (keywords con relevancia)
    pgResults.forEach(pg => {
      if (!resultsMap.has(pg.url)) {
        resultsMap.set(pg.url, {
          url: pg.url,
          title: '',
          description: '',
          score: parseFloat(pg.relevance) || 0,
          sources: ['postgres']
        });
      } else {
        const existing = resultsMap.get(pg.url);
        existing.score += parseFloat(pg.relevance) || 0;
      }
    });

    // Agregar títulos de MySQL
    mysqlResults.forEach(mysql => {
      if (resultsMap.has(mysql.url)) {
        resultsMap.get(mysql.url).title = mysql.title;
        resultsMap.get(mysql.url).sources.push('mysql');
      } else {
        resultsMap.set(mysql.url, {
          url: mysql.url,
          title: mysql.title,
          description: '',
          score: 0.5,
          sources: ['mysql']
        });
      }
    });

    // Agregar contenido de MongoDB
    mongoResults.forEach(mongo => {
      const description = (mongo.paragraphs || []).slice(0, 2).join(' ').substring(0, 200);
      
      if (resultsMap.has(mongo.url)) {
        const existing = resultsMap.get(mongo.url);
        existing.description = description;
        existing.sources.push('mongodb');
        existing.score += 1; // Bonus por tener contenido
      } else {
        resultsMap.set(mongo.url, {
          url: mongo.url,
          title: mongo.url.split('/').pop() || 'Sin título',
          description,
          score: 0.3,
          sources: ['mongodb']
        });
      }
    });

    // Convertir a array y ordenar
    return Array.from(resultsMap.values())
      .sort((a, b) => b.score - a.score)
      .map((item, index) => ({
        id: index + 1,
        ...item
      }));
  }
}