import pg from 'pg';
import mysql from 'mysql2/promise';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// PostgreSQL (Índices de búsqueda)
export const pgPool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  max: 10,
});

// MySQL (Metadatos)
export const mysqlPool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB,
  waitForConnections: true,
  connectionLimit: 10,
});

// MongoDB (Contenido)
let mongoClient;
let mongoDb;

export const connectMongo = async () => {
  try {
    const uri = `${process.env.MONGO_URI}`;
    mongoClient = new MongoClient(uri);
    await mongoClient.connect();
    mongoDb = mongoClient.db(process.env.MONGO_DB);
    console.log('MongoDB connected');
    return mongoDb;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

export const getMongoDb = () => {
  if (!mongoDb) {
    throw new Error('MongoDB not initialized');
  }
  return mongoDb;
};

// Inicializar tablas
export const initializeTables = async () => {
  // PostgreSQL
  try {
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS search_index (
        id SERIAL PRIMARY KEY,
        url TEXT NOT NULL,
        keyword VARCHAR(255) NOT NULL,
        relevance DECIMAL(5,4) DEFAULT 1.0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(url, keyword)
      );
      CREATE INDEX IF NOT EXISTS idx_keyword ON search_index(keyword);
      CREATE INDEX IF NOT EXISTS idx_url ON search_index(url);
    `);
    console.log('PostgreSQL tables ready');
  } catch (error) {
    console.error('PostgreSQL init error:', error);
  }

  // MySQL
  try {
    await mysqlPool.query(`
      CREATE TABLE IF NOT EXISTS pages_metadata (
        id INT AUTO_INCREMENT PRIMARY KEY,
        url TEXT NOT NULL,
        title TEXT NOT NULL,
        crawled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_title (title(255))
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('MySQL tables ready');
  } catch (error) {
    console.error('MySQL init error:', error);
  }

  // MongoDB - crear índices
  try {
    const db = getMongoDb();
    await db.collection('pages_content').createIndex({ url: 1 }, { unique: true });
    await db.collection('pages_content').createIndex({ paragraphs: 'text', 'list-items': 'text' });
    console.log('MongoDB indexes ready');
  } catch (error) {
    console.error('MongoDB init error:', error);
  }
};

export const closeDatabases = async () => {
  await pgPool.end();
  await mysqlPool.end();
  if (mongoClient) await mongoClient.close();
  console.log('Databases closed');
};