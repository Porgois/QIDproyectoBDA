import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import searchRoutes from './routes/search.js';
import { connectMongo, initializeTables, testConnections, closeDatabases } from './config/database.js';
import { RabbitMQConsumer } from './services/rabbitmqConsumer.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Distributed Search API',
    version: '1.0.0',
    endpoints: {
      search: 'POST /api/search',
      stats: 'GET /api/stats',
      health: 'GET /api/health'
    }
  });
});

app.use('/api', searchRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: err.message
  });
});

// Initialize
const startServer = async () => {
  try {
    console.log('Starting Distributed Search Backend...\n');
    
    // Connect databases
    await connectMongo();
    await initializeTables();
    
    // Test all connections
    console.log('\nTesting database connections...');
    const connectionStatus = await testConnections();
    
    if (!connectionStatus.postgres || !connectionStatus.mongodb) {
      console.warn('\nWarning: Some databases are not connected!');
    }

    // Start RabbitMQ consumer
    const rabbitmqConsumer = new RabbitMQConsumer();
    rabbitmqConsumer.connect();

    // Start server
    app.listen(PORT, () => {
      console.log(`
    Server:      http://localhost:${PORT}
    Environment: ${process.env.NODE_ENV.padEnd(24)}
    Frontend:    ${process.env.FRONTEND_URL.padEnd(24)}
      `);
    });

    // shutdown
    process.on('SIGTERM', async () => {
      console.log('\nSIGTERM received, closing...');
      await rabbitmqConsumer.close();
      await closeDatabases();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      console.log('\nSIGINT received, closing...');
      await rabbitmqConsumer.close();
      await closeDatabases();
      process.exit(0);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();