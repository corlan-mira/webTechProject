/**
 * Express Application Entry Point
 * Main server setup and configuration
 * 
 * Initializes:
 * - Express app
 * - Database connection
 * - Middleware
 * - Routes
 * - Background jobs
 * - Error handling
 * - Server listening
 */

const express = require('express');
const cors = require('cors');
const sequelize = require('./config/sequelize');
const { PORT, NODE_ENV, API_PREFIX } = require('./config/environment');
const corsOptions = require('./middleware/cors');
const requestLogger = require('./middleware/logging');
const errorHandler = require('./middleware/errorHandler');
const apiRoutes = require('./routes');
const { eventStateJob } = require('./jobs');

const app = express();

// Trust proxy
app.set('trust proxy', 1);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// CORS middleware
app.use(cors(corsOptions));

// Logging middleware
app.use(requestLogger);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', env: NODE_ENV });
});

// API routes
app.use(`${API_PREFIX}`, apiRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handling middleware (last)
app.use(errorHandler);

// Database connection and server startup
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✓ Database connection established');

    // Sync database (development only - use migrations in production)
    if (NODE_ENV === 'development') {
      await sequelize.sync({ alter: false });
      console.log('✓ Database synced');
    }

    // Initialize background jobs
    const jobStatus = eventStateJob.initEventStateJob();
    console.log(`✓ Event state job: ${jobStatus.message}`);

    // Start server
    const server = app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ Environment: ${NODE_ENV}`);
      console.log(`✓ API: http://localhost:${PORT}${API_PREFIX}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully...');
      
      // Stop background jobs
      eventStateJob.gracefulShutdown();
      
      server.close(async () => {
        await sequelize.close();
        console.log('✓ Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('✗ Failed to start server:', error);
    process.exit(1);
  }
};

// Start server if not testing
if (NODE_ENV !== 'test') {
  startServer();
}

module.exports = app;
