import { pgPool, mysqlPool, getMongoDb } from '../config/database.js';

export class SearchService {
  async search(query) {
    const keywords = query.toLowerCase().trim().split(/\s+/).filter(k => k.length > 2);
    
    if (keywords.length === 0) {
      return { success: true, results: [], total: 0 };
    }

    try {
      // Búsqueda paralela
      const [pgResults, mongoResults] = await Promise.all([
        this.searchPostgres(keywords),
        this.searchMongo(keywords)
      ]);

      // Combinar resultados
      const combined = this.mergeResults(pgResults, mongoResults);

      return {
        success: true,
        results: combined,
        total: combined.length,
        sources: {
          postgres: pgResults.length,
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
      // Buscar en título y headers
      const conditions = keywords.map(() => `
        (LOWER(title) LIKE $1 OR 
         EXISTS (SELECT 1 FROM unnest(first_headers) AS header WHERE LOWER(header) LIKE $1))
      `).join(' OR ');
      
      const params = keywords.map(k => `%${k}%`);
      
      const query = `
        SELECT 
          page_id,
          url,
          title,
          first_headers,
          datetimes,
          created_at
        FROM PageMetadata
        WHERE ${conditions.replace(/\$1/g, (_, i) => `$${i + 1}`)}
        ORDER BY created_at DESC
        LIMIT 50
      `;

      const result = await pgPool.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Postgres search error:', error);
      return [];
    }
  }

  async searchMongo(keywords) {
    try {
      const db = getMongoDb();
      const collection = db.collection('page_content');
      
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

  mergeResults(pgResults, mongoResults) {
    const resultsMap = new Map();

    // Agregar resultados de PostgreSQL
    pgResults.forEach(pg => {
      resultsMap.set(pg.url, {
        url: pg.url,
        title: pg.title || 'Sin título',
        description: pg.first_headers?.join(' • ') || '',
        score: 1.0,
        sources: ['postgres'],
        metadata: {
          page_id: pg.page_id,
          created_at: pg.created_at,
          datetimes: pg.datetimes
        }
      });
    });

    // Agregar contenido de MongoDB
    mongoResults.forEach(mongo => {
      // Crear descripción del contenido
      const paragraphs = mongo.paragraphs || [];
      const listItems = mongo['list-items'] || [];
      const description = [...paragraphs.slice(0, 2), ...listItems.slice(0, 1)]
        .join(' ')
        .substring(0, 200);

      const url = mongo.url || `content_${mongo._id}`;

      if (resultsMap.has(url)) {
        // Si ya existe, actualizar
        const existing = resultsMap.get(url);
        existing.description = description || existing.description;
        existing.sources.push('mongodb');
        existing.score += 1.5; // Bonus por tener contenido
        existing.content = {
          paragraphs: paragraphs.length,
          listItems: listItems.length,
          images: mongo.image?.length || 0
        };
      } else {
        // Crear nuevo resultado
        resultsMap.set(url, {
          url: url,
          title: paragraphs[0]?.substring(0, 100) || 'Sin título',
          description: description,
          score: 0.5,
          sources: ['mongodb'],
          content: {
            paragraphs: paragraphs.length,
            listItems: listItems.length,
            images: mongo.image?.length || 0
          }
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

  // Método para obtener estadísticas
  async getStats() {
    try {
      const [pgCount] = await Promise.all([
        pgPool.query('SELECT COUNT(*) as count FROM PageMetadata')
      ]);

      const db = getMongoDb();
      const mongoCount = await db.collection('page_content').countDocuments();

      return {
        postgres: parseInt(pgCount.rows[0].count),
        mongodb: mongoCount,
        total: parseInt(pgCount.rows[0].count) + mongoCount
      };
    } catch (error) {
      console.error('Stats error:', error);
      return { postgres: 0, mongodb: 0, total: 0 };
    }
  }
}