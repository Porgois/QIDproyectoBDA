import pg from 'pg';
import mysql from 'mysql2/promise';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// PostgreSQL Connection
export const pgPool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  max: 10,
});

// MySQL Connection Pool
export const mysqlPool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB,
  waitForConnections: true,
  connectionLimit: 10,
});

// MongoDB Connection
let mongoClient;
let mongoDb;

export const connectMongo = async () => {
  try {
    mongoClient = new MongoClient(process.env.MONGO_URI);
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

// Test connections
export const testConnections = async () => {
  const results = {
    postgres: false,
    mysql: false,
    mongodb: false
  };

  // PostgreSQL
  try {
    const pgResult = await pgPool.query('SELECT NOW()');
    console.log('PostgreSQL connected:', pgResult.rows[0].now);
    results.postgres = true;
  } catch (error) {
    console.error('PostgreSQL connection failed:', error.message);
  }

  // MySQL
  try {
    const [mysqlResult] = await mysqlPool.query('SELECT NOW() as now');
    console.log('MySQL connected:', mysqlResult[0].now);
    results.mysql = true;
  } catch (error) {
    console.error('MySQL connection failed:', error.message);
  }

  // MongoDB
  try {
    await mongoDb.admin().ping();
    console.log('MongoDB connected');
    results.mongodb = true;
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
  }

  return results;
};

// Initialize tables
export const initializeTables = async () => {
  try {
    const tableCheck = await pgPool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'pagemetadata'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      await pgPool.query(`
        CREATE TABLE PageMetadata (
          page_id SERIAL PRIMARY KEY,
          url TEXT UNIQUE NOT NULL,
          title VARCHAR(255),
          first_headers TEXT[],
          datetimes TEXT[],
          created_at TIMESTAMP DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_page_url ON PageMetadata(url);
        CREATE INDEX IF NOT EXISTS idx_page_title ON PageMetadata(title);
      `);
      console.log('PostgreSQL table PageMetadata created');
    } else {
      console.log('PostgreSQL table PageMetadata already exists');
    }
  } catch (error) {
    console.error('PostgreSQL init error:', error.message);
  }

  // MySQL - tabla simple para metadatos
  try {
    await mysqlPool.query(`
      CREATE TABLE IF NOT EXISTS page_stats (
        id INT AUTO_INCREMENT PRIMARY KEY,
        url TEXT NOT NULL,
        view_count INT DEFAULT 0,
        last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('MySQL table page_stats ready');
  } catch (error) {
    console.error('MySQL init error:', error.message);
  }

  // MongoDB
  try {
    const db = getMongoDb();
    const collections = await db.listCollections({ name: 'page_content' }).toArray();
    
    if (collections.length === 0) {
      console.log('MongoDB collection "page_content" not found. Please create it manually.');
    } else {
      console.log('MongoDB collection "page_content" exists');
    }
    
    // Crear índice en la colección
    await db.collection('page_content').createIndex({ url: 1 });
  } catch (error) {
    console.error('MongoDB init error:', error.message);
  }
};

export const closeDatabases = async () => {
  try {
    await pgPool.end();
    await mysqlPool.end();
    if (mongoClient) await mongoClient.close();
    console.log('All databases closed');
  } catch (error) {
    console.error('Error closing databases:', error);
  }
};