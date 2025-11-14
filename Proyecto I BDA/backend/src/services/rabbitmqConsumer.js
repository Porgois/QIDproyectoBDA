import amqp from 'amqplib';
import { pgPool, mysqlPool, getMongoDb } from '../config/database.js';

export class RabbitMQConsumer {
  constructor() {
    this.connection = null;
    this.channel = null;
  }

  async connect() {
    try {
      const rabbitmqUrl = `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASS}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}`;
      
      this.connection = await amqp.connect(rabbitmqUrl);
      this.channel = await this.connection.createChannel();
      
      console.log('RabbitMQ connected');
      
      // Consumir ambas colas
      await this.consumeMetadata();
      await this.consumeContent();
      
    } catch (error) {
      console.error('RabbitMQ connection error:', error);
      // Reintentar en 5 segundos
      setTimeout(() => this.connect(), 5000);
    }
  }

  async consumeMetadata() {
    await this.channel.assertQueue('page-metadata', { durable: true });
    
    this.channel.consume('page-metadata', async (msg) => {
      if (msg) {
        try {
          const data = JSON.parse(msg.content.toString());
          await this.saveMetadata(data);
          this.channel.ack(msg);
        } catch (error) {
          console.error('Error processing metadata:', error);
          this.channel.nack(msg, false, false); // No requeue
        }
      }
    });
    
    console.log('Consuming page-metadata queue');
  }

  async consumeContent() {
    await this.channel.assertQueue('page-content', { durable: true });
    
    this.channel.consume('page-content', async (msg) => {
      if (msg) {
        try {
          const data = JSON.parse(msg.content.toString());
          await this.saveContent(data);
          this.channel.ack(msg);
        } catch (error) {
          console.error('Error processing content:', error);
          this.channel.nack(msg, false, false);
        }
      }
    });
    
    console.log('Consuming page-content queue');
  }

  async saveMetadata(data) {
    const { url, title, 'first-headers': headers } = data;
    
    // Guardar en MySQL (metadatos)
    try {
      await mysqlPool.query(
        'INSERT INTO pages_metadata (url, title) VALUES (?, ?) ON DUPLICATE KEY UPDATE title = ?',
        [url, title, title]
      );
      console.log(`Metadata saved: ${title}`);
    } catch (error) {
      console.error('Error saving to MySQL:', error);
    }

    // Guardar keywords en PostgreSQL (índice)
    try {
      const keywords = this.extractKeywords(title, headers);
      for (const keyword of keywords) {
        await pgPool.query(
          `INSERT INTO search_index (url, keyword, relevance) 
           VALUES ($1, $2, $3) 
           ON CONFLICT (url, keyword) DO UPDATE SET relevance = $3`,
          [url, keyword.word, keyword.relevance]
        );
      }
      console.log(`🔍 Keywords indexed: ${keywords.length}`);
    } catch (error) {
      console.error('Error saving to PostgreSQL:', error);
    }
  }

  async saveContent(data) {
    try {
      const db = getMongoDb();
      await db.collection('pages_content').updateOne(
        { url: data.url },
        { $set: { ...data, updated_at: new Date() } },
        { upsert: true }
      );
      console.log(`Content saved: ${data.url}`);
    } catch (error) {
      console.error('Error saving to MongoDB:', error);
    }
  }

  extractKeywords(title, headers = []) {
    const keywords = new Set();
    
    // Extraer del título
    if (title) {
      title.split(/\s+/).forEach(word => {
        const clean = word.toLowerCase().replace(/[^\w]/g, '');
        if (clean.length > 3) keywords.add({ word: clean, relevance: 1.0 });
      });
    }

    // Extraer de headers
    headers.forEach((header, index) => {
      header.split(/\s+/).forEach(word => {
        const clean = word.toLowerCase().replace(/[^\w]/g, '');
        if (clean.length > 3) {
          keywords.add({ word: clean, relevance: 0.8 - (index * 0.1) });
        }
      });
    });

    return Array.from(keywords).slice(0, 20);
  }

  async close() {
    if (this.channel) await this.channel.close();
    if (this.connection) await this.connection.close();
    console.log('RabbitMQ connection closed');
  }
}