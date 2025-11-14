import amqp from 'amqplib';
import { pgPool, getMongoDb } from '../config/database.js';

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
      
      await this.consumeMetadata();
      await this.consumeContent();
      
    } catch (error) {
      console.error('❌ RabbitMQ connection error:', error.message);
      setTimeout(() => this.connect(), 5000);
    }
  }

  async consumeMetadata() {
    await this.channel.assertQueue('page-metadata', { durable: true });
    
    this.channel.consume('page-metadata', async (msg) => {
      if (msg) {
        try {
          const data = JSON.parse(msg.content.toString());
          console.log('Received metadata:', data.url);
          await this.saveMetadata(data);
          this.channel.ack(msg);
        } catch (error) {
          console.error('Error processing metadata:', error.message);
          this.channel.nack(msg, false, false);
        }
      }
    });
    
    console.log('📥 Consuming page-metadata queue');
  }

  async consumeContent() {
    await this.channel.assertQueue('page-content', { durable: true });
    
    this.channel.consume('page-content', async (msg) => {
      if (msg) {
        try {
          const data = JSON.parse(msg.content.toString());
          console.log('Received content for:', data.url || 'unknown');
          await this.saveContent(data);
          this.channel.ack(msg);
        } catch (error) {
          console.error('Error processing content:', error.message);
          this.channel.nack(msg, false, false);
        }
      }
    });
    
    console.log('Consuming page-content queue');
  }

  async saveMetadata(data) {
    try {
      const { url, title, 'first-headers': headers, datetimes } = data;

      await pgPool.query(`
        INSERT INTO PageMetadata (url, title, first_headers, datetimes)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (url) 
        DO UPDATE SET 
          title = EXCLUDED.title,
          first_headers = EXCLUDED.first_headers,
          datetimes = EXCLUDED.datetimes,
          created_at = NOW()
      `, [url, title, headers || [], datetimes || []]);

      console.log('Metadata saved to PostgreSQL:', title);
    } catch (error) {
      console.error('Error saving metadata to PostgreSQL:', error.message);
      throw error;
    }
  }

  async saveContent(data) {
    try {
      const db = getMongoDb();
      
      // Asegurarse de que tenga los campos requeridos
      const contentData = {
        url: data.url || `content_${Date.now()}`,
        paragraphs: data.paragraphs || [],
        'list-items': data['list-items'] || [],
        image: data.image || [],
        created_at: new Date(),
        updated_at: new Date()
      };

      await db.collection('page_content').updateOne(
        { url: contentData.url },
        { $set: contentData },
        { upsert: true }
      );

      console.log('Content saved to MongoDB:', contentData.url);
    } catch (error) {
      console.error('Error saving content to MongoDB:', error.message);
      throw error;
    }
  }

  async close() {
    try {
      if (this.channel) await this.channel.close();
      if (this.connection) await this.connection.close();
      console.log('RabbitMQ connection closed');
    } catch (error) {
      console.error('Error closing RabbitMQ:', error);
    }
  }
}