import jwt from 'jsonwebtoken';
import { USER_ROLES } from '../config/constants.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }

  const secret = process.env.JWT_SECRET || 'scrapto-dev-secret-key-change-in-production-2024';
  
  if (!secret) {
    return res.status(500).json({
      success: false,
      error: 'Server configuration error. JWT_SECRET not set.'
    });
  }

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role '${req.user.role}' is not authorized to access this route`
      });
    }

    next();
  };
};

// Role-specific middleware
export const isUser = authorize(USER_ROLES.USER);
export const isScrapper = authorize(USER_ROLES.SCRAPPER);
export const isAdmin = authorize(USER_ROLES.ADMIN);

