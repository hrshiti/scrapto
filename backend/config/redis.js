import Redis from 'ioredis';
import logger from '../utils/logger.js';

let redisClient = null;

/**
 * Connect to Redis
 */
export const connectRedis = async () => {
  try {
    if (redisClient) {
      return redisClient;
    }

    const redisConfig = {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      enableOfflineQueue: false
    };

    redisClient = new Redis(redisConfig);

    redisClient.on('connect', () => {
      logger.info('Redis client connected');
    });

    redisClient.on('ready', () => {
      logger.info('Redis client ready');
    });

    redisClient.on('error', (err) => {
      logger.error('Redis client error:', err);
    });

    redisClient.on('close', () => {
      logger.warn('Redis client connection closed');
    });

    redisClient.on('reconnecting', () => {
      logger.info('Redis client reconnecting...');
    });

    // Test connection
    await redisClient.ping();
    logger.info('Redis connection successful');

    return redisClient;
  } catch (error) {
    logger.error('Failed to connect to Redis:', error.message);
    // In development, allow app to continue without Redis
    if (process.env.NODE_ENV === 'development') {
      logger.warn('⚠️  Continuing without Redis in development mode');
      return null;
    }
    throw error;
  }
};

/**
 * Get Redis client instance
 */
export const getRedisClient = () => {
  if (!redisClient) {
    logger.warn('Redis client not initialized. Call connectRedis() first.');
  }
  return redisClient;
};

/**
 * Close Redis connection
 */
export const closeRedis = async () => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    logger.info('Redis connection closed');
  }
};

/**
 * Store OTP in Redis with TTL
 * @param {string} key - Redis key (e.g., 'otp:phone:1234567890')
 * @param {string} otp - OTP value
 * @param {number} ttl - Time to live in seconds (default: 600 = 10 minutes)
 */
export const storeOTP = async (key, otp, ttl = 600) => {
  try {
    const client = getRedisClient();
    if (!client) {
      logger.warn('Redis not available, OTP storage skipped');
      return false;
    }
    await client.setex(`otp:${key}`, ttl, otp);
    return true;
  } catch (error) {
    logger.error('Error storing OTP in Redis:', error);
    return false;
  }
};

/**
 * Get OTP from Redis
 * @param {string} key - Redis key
 * @returns {Promise<string|null>} - OTP value or null
 */
export const getOTP = async (key) => {
  try {
    const client = getRedisClient();
    if (!client) {
      return null;
    }
    const otp = await client.get(`otp:${key}`);
    return otp;
  } catch (error) {
    logger.error('Error getting OTP from Redis:', error);
    return null;
  }
};

/**
 * Delete OTP from Redis
 * @param {string} key - Redis key
 */
export const deleteOTP = async (key) => {
  try {
    const client = getRedisClient();
    if (!client) {
      return false;
    }
    await client.del(`otp:${key}`);
    return true;
  } catch (error) {
    logger.error('Error deleting OTP from Redis:', error);
    return false;
  }
};

/**
 * Store refresh token in Redis
 * @param {string} userId - User ID
 * @param {string} token - Refresh token
 * @param {number} ttl - Time to live in seconds (default: 2592000 = 30 days)
 */
export const storeRefreshToken = async (userId, token, ttl = 2592000) => {
  try {
    const client = getRedisClient();
    if (!client) {
      return false;
    }
    await client.setex(`refresh_token:${userId}`, ttl, token);
    return true;
  } catch (error) {
    logger.error('Error storing refresh token in Redis:', error);
    return false;
  }
};

/**
 * Get refresh token from Redis
 * @param {string} userId - User ID
 * @returns {Promise<string|null>} - Refresh token or null
 */
export const getRefreshToken = async (userId) => {
  try {
    const client = getRedisClient();
    if (!client) {
      return null;
    }
    const token = await client.get(`refresh_token:${userId}`);
    return token;
  } catch (error) {
    logger.error('Error getting refresh token from Redis:', error);
    return null;
  }
};

/**
 * Delete refresh token from Redis
 * @param {string} userId - User ID
 */
export const deleteRefreshToken = async (userId) => {
  try {
    const client = getRedisClient();
    if (!client) {
      return false;
    }
    await client.del(`refresh_token:${userId}`);
    return true;
  } catch (error) {
    logger.error('Error deleting refresh token from Redis:', error);
    return false;
  }
};

export default {
  connectRedis,
  getRedisClient,
  closeRedis,
  storeOTP,
  getOTP,
  deleteOTP,
  storeRefreshToken,
  getRefreshToken,
  deleteRefreshToken
};

