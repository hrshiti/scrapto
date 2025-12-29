import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { connectDB } from './config/database.js';
import { configureCloudinary } from './config/cloudinary.js';
import { validateEnv } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import logger from './utils/logger.js';
import { handleRazorpayWebhook } from './controllers/paymentController.js';
import authRoutes from './routes/authRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import kycRoutes from './routes/kycRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import earningsRoutes from './routes/earningsRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import scrapperRoutes from './routes/scrapperRoutes.js';
import bannerRoutes from './routes/bannerRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import supportRoutes from './routes/supportRoutes.js';
import referralRoutes from './routes/referralRoutes.js';
import { initializeSocket } from './services/socketService.js';

// Validate environment variables
try {
  validateEnv();
} catch (error) {
  logger.error('Environment validation failed:', error.message);
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 7000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Allow any localhost origin in development
    if (process.env.NODE_ENV !== 'production' && origin.includes('localhost')) {
      return callback(null, true);
    }

    // Check against allowed origins
    const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173').split(',');
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Razorpay webhook (raw body required for signature validation)
app.post(
  '/api/v1/payments/webhook',
  express.raw({ type: 'application/json' }),
  (req, res, next) => {
    req.rawBody = req.body;
    try {
      req.body = JSON.parse(req.rawBody.toString());
    } catch (err) {
      return res.status(400).json({ success: false, message: 'Invalid webhook payload' });
    }
    next();
  },
  handleRazorpayWebhook
);

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

// Rate limiting (excludes admin routes - they have separate limiter)
app.use('/api/', (req, res, next) => {
  // Skip rate limiting for admin routes (they'll have their own limiter)
  if (req.path.startsWith('/admin')) {
    return next();
  }
  rateLimiter(req, res, next);
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Debug route to check JWT_SECRET configuration (development only)
if (process.env.NODE_ENV !== 'production') {
  app.get('/api/debug/jwt-config', (req, res) => {
    const hasEnvSecret = !!process.env.JWT_SECRET;
    const defaultSecret = 'scrapto-dev-secret-key-change-in-production-2024';
    const secret = process.env.JWT_SECRET || defaultSecret;

    res.status(200).json({
      success: true,
      data: {
        hasEnvSecret,
        secretSource: hasEnvSecret ? 'process.env.JWT_SECRET' : 'DEFAULT_JWT_SECRET',
        secretLength: secret.length,
        secretPreview: secret.length > 20 ? `${secret.substring(0, 20)}...` : secret,
        jwtExpire: process.env.JWT_EXPIRE || '7d',
        nodeEnv: process.env.NODE_ENV || 'development'
      }
    });
  });
}

// Version 1 API routes
const v1Router = express.Router();
v1Router.use('/auth', authRoutes);
v1Router.use('/orders', orderRoutes);
v1Router.use('/payments', paymentRoutes);
v1Router.use('/uploads', uploadRoutes);
v1Router.use('/kyc', kycRoutes);
v1Router.use('/subscriptions', subscriptionRoutes);
v1Router.use('/admin', adminRoutes);
v1Router.use('/scrapper/earnings', earningsRoutes);
v1Router.use('/chats', chatRoutes);
v1Router.use('/reviews', reviewRoutes);
v1Router.use('/scrappers', scrapperRoutes);
v1Router.use('/banners', bannerRoutes);
v1Router.use('/public', publicRoutes);
v1Router.use('/support', supportRoutes);
v1Router.use('/admin/referral-system', referralRoutes);

// Mount versioned routes
app.use('/api/v1', v1Router);

// Legacy routes (for backward compatibility - remove in future)
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/scrapper/earnings', earningsRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/scrappers', scrapperRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/admin/referral-system', referralRoutes);

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

    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
      logger.info(`📡 API available at http://localhost:${PORT}/api/v1`);
    });

    // Initialize Socket.io
    initializeSocket(server);
    logger.info('✅ Socket.io initialized');
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
