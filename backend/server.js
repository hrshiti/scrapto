import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { connectDB } from './config/database.js';
import { connectRedis } from './config/redis.js';
import { configureCloudinary } from './config/cloudinary.js';
import { validateEnv } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import logger from './utils/logger.js';

// Validate environment variables
try {
  validateEnv();
} catch (error) {
  logger.error('Environment validation failed:', error.message);
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting
app.use('/api/', rateLimiter);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes with versioning
import authRoutes from './routes/authRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

// Version 1 API routes
const v1Router = express.Router();
v1Router.use('/auth', authRoutes);
v1Router.use('/orders', orderRoutes);

// Mount versioned routes
app.use('/api/v1', v1Router);

// Legacy routes (for backward compatibility - remove in future)
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);

// Add more routes here as you create them

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

// Connect to database, Redis, and start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    logger.info('✅ Database connected successfully');
    
    // Connect to Redis (optional - app continues if Redis unavailable in dev)
    try {
      await connectRedis();
    } catch (redisError) {
      logger.warn('⚠️  Redis connection failed, continuing without Redis');
    }
    
    // Configure Cloudinary (optional - only if credentials provided)
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      try {
        configureCloudinary();
        logger.info('✅ Cloudinary configured successfully');
      } catch (cloudinaryError) {
        logger.warn('⚠️  Cloudinary configuration failed:', cloudinaryError.message);
      }
    } else {
      logger.warn('⚠️  Cloudinary credentials not provided, file uploads will use local storage');
    }
    
    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
      logger.info(`📡 API available at http://localhost:${PORT}/api/v1`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;

