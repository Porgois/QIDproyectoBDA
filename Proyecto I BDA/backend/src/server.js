import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import searchRoutes from './routes/search.js';
import { connectMongo, initializeTables, closeDatabases } from './config/database.js';
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
    // Connect databases
    //await connectMongo();
    //await initializeTables();

    // Start RabbitMQ consumer
    //const rabbitmqConsumer = new RabbitMQConsumer();
    //await rabbitmqConsumer.connect();

    // Start
    app.listen(PORT, () => {
      console.log(` Server running on port ${PORT}
    Environment: ${process.env.NODE_ENV}
    Frontend URL: ${process.env.FRONTEND_URL}
      `);
    });

    // shutdown
    process.on('SIGTERM', async () => {
      console.log('SIGTERM received, closing...');
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