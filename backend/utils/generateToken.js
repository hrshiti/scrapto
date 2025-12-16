import jwt from 'jsonwebtoken';
import logger from './logger.js';

// Default secret for development (should be overridden in production)
const DEFAULT_JWT_SECRET = 'scrapto-dev-secret-key-change-in-production-2024';

export const generateToken = (userId, role) => {
  const secret = process.env.JWT_SECRET || DEFAULT_JWT_SECRET;
  
  if (!secret) {
    logger.error('JWT_SECRET is not set in environment variables');
    throw new Error('JWT_SECRET is not configured. Please set JWT_SECRET in your .env file.');
  }

  // Warn if using default secret
  if (secret === DEFAULT_JWT_SECRET && process.env.NODE_ENV !== 'development') {
    logger.warn('⚠️  WARNING: Using default JWT_SECRET. This is insecure for production!');
  }

  return jwt.sign(
    { id: userId, role },
    secret,
    {
      expiresIn: process.env.JWT_EXPIRE || '7d'
    }
  );
};

export const generateRefreshToken = (userId) => {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || DEFAULT_JWT_SECRET;
  
  if (!secret) {
    logger.error('JWT_REFRESH_SECRET is not set in environment variables');
    throw new Error('JWT_REFRESH_SECRET is not configured. Please set JWT_REFRESH_SECRET in your .env file.');
  }

  return jwt.sign(
    { id: userId },
    secret,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d'
    }
  );
};

