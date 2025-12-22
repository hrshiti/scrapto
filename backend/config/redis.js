// In-memory stubs to disable Redis usage temporarily.
import logger from '../utils/logger.js';

const memoryStore = new Map();

const setWithTTL = (key, value, ttlSeconds) => {
  memoryStore.set(key, value);
  if (ttlSeconds > 0) {
    setTimeout(() => memoryStore.delete(key), ttlSeconds * 1000).unref?.();
  }
};

export const connectRedis = async () => {
  logger.info('Redis disabled: using in-memory store');
  return null;
};

export const getRedisClient = () => null;

export const closeRedis = async () => {
  memoryStore.clear();
  logger.info('In-memory store cleared');
};

export const storeOTP = async (key, otp, ttl = 600) => {
  setWithTTL(`otp:${key}`, otp, ttl);
  return true;
};

export const getOTP = async (key) => {
  return memoryStore.get(`otp:${key}`) || null;
};

export const deleteOTP = async (key) => {
  return memoryStore.delete(`otp:${key}`);
};

export const storeRefreshToken = async (userId, token, ttl = 2592000) => {
  setWithTTL(`refresh_token:${userId}`, token, ttl);
  return true;
};

export const getRefreshToken = async (userId) => {
  return memoryStore.get(`refresh_token:${userId}`) || null;
};

export const deleteRefreshToken = async (userId) => {
  return memoryStore.delete(`refresh_token:${userId}`);
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

