// Application Constants

export const USER_ROLES = {
  USER: 'user',
  SCRAPPER: 'scrapper',
  ADMIN: 'admin'
};

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded'
};

export const SCRAP_CATEGORIES = {
  METAL: 'metal',
  PLASTIC: 'plastic',
  PAPER: 'paper',
  ELECTRONIC: 'electronic',
  GLASS: 'glass',
  OTHER: 'other'
};

export const NOTIFICATION_TYPES = {
  ORDER_UPDATE: 'order_update',
  PAYMENT: 'payment',
  SYSTEM: 'system',
  PROMOTION: 'promotion'
};

export const FILE_TYPES = {
  IMAGE: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
  DOCUMENT: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
};

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
};

