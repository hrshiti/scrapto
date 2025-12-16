import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { generateToken } from '../utils/generateToken.js';
import User from '../models/User.js';
import { sendOTP, sendWelcomeSMS } from '../utils/otpService.js';
import logger from '../utils/logger.js';

// Helper: bypass OTP sending for specific test numbers
const isBypassOtpNumber = (phone) => {
  const bypassList = new Set(['9685974247', '9876543210', '9999999999', '7610416911']);
  return bypassList.has(phone);
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password, role } = req.body;

  // Check if user exists
  const userExists = await User.findOne({ $or: [{ email }, { phone }] });
  if (userExists) {
    return sendError(res, 'User already exists with this email or phone', 400);
  }

  // Create user
  const user = await User.create({
    name,
    email,
    phone,
    password,
    role: role || 'user'
  });

  // Generate OTP for phone verification
  let otp;
  if (isBypassOtpNumber(phone)) {
    // Use custom OTP for specific phone numbers
    if (phone === '7610416911') {
      otp = '110211';
    } else {
      otp = '123456';
    }
    user.phoneVerificationOTP = otp;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
  } else {
    otp = user.generateOTP();
  }
  await user.save();

  // Send OTP via SMS
  try {
    if (isBypassOtpNumber(phone)) {
      logger.info(`📵 Bypass SMS for ${phone}. Using fixed OTP ${otp}.`);
    } else {
      await sendOTP(phone, otp);
      logger.info(`📱 OTP sent successfully to ${phone}`);
    }
  } catch (smsError) {
    logger.error('SMS sending failed:', smsError.message);
    // In development mode, allow registration even if SMS fails
    if (process.env.NODE_ENV === 'development') {
      logger.warn(`⚠️ SMS failed but allowing registration in development mode. OTP: ${otp}`);
    } else {
      // In production, return error if SMS fails
      return sendError(res, 'Failed to send OTP. Please try again.', 500);
    }
  }

  // Generate token
  const token = generateToken(user._id, user.role);

  sendSuccess(res, 'User registered successfully. Please verify your phone number with OTP.', {
    user,
    token,
    otpSent: true
  }, 201);
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check if user exists and get password
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return sendError(res, 'Invalid credentials', 401);
  }

  // Check if user is active
  if (!user.isActive) {
    return sendError(res, 'Account is deactivated', 403);
  }

  // Check password
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return sendError(res, 'Invalid credentials', 401);
  }

  // Generate token
  const token = generateToken(user._id, user.role);

  sendSuccess(res, 'Login successful', {
    user,
    token
  });
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  sendSuccess(res, 'User retrieved successfully', { user });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, address } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      name,
      phone,
      address
    },
    {
      new: true,
      runValidators: true
    }
  );

  sendSuccess(res, 'Profile updated successfully', { user });
});

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOTP = asyncHandler(async (req, res) => {
  const { phone, otp, purpose } = req.body;

  const user = await User.findOne({ phone });

  if (!user) {
    return sendError(res, 'User not found', 404);
  }

  // Debug logging
  logger.info('🔍 OTP Verification Debug:', {
    phone,
    providedOTP: otp,
    storedOTP: user.phoneVerificationOTP,
    otpExpiresAt: user.otpExpiresAt,
    currentTime: new Date(),
    isExpired: user.otpExpiresAt ? user.otpExpiresAt < new Date() : 'No expiry set'
  });

  // Verify OTP (allow bypass numbers without requiring a prior send step)
  let isOTPValid = false;

  // Bypass acceptance: if number is in bypass list, accept the configured code
  if (isBypassOtpNumber(phone)) {
    const expectedBypassOtp = phone === '7610416911' ? '110211' : '123456';
    isOTPValid = otp === expectedBypassOtp;
    if (isOTPValid) {
      // Mark OTP as valid regardless of stored values
      user.phoneVerificationOTP = null;
      user.otpExpiresAt = null;
    }
  }

  // Fallback to stored OTP validation when not already accepted via bypass
  if (!isOTPValid) {
    isOTPValid = user.verifyOTP(otp);
  }

  if (!isOTPValid) {
    logger.warn('❌ OTP verification failed:', {
      providedOTP: otp,
      storedOTP: user.phoneVerificationOTP,
      otpExpiresAt: user.otpExpiresAt,
      currentTime: new Date()
    });
    return sendError(res, 'Invalid or expired OTP', 400);
  }

  // If this is login verification (purpose === 'login' or token exists), generate login token
  const isLoginVerification = purpose === 'login' || req.headers.authorization;

  // Mark phone as verified
  if (!user.isPhoneVerified) {
    user.isPhoneVerified = true;
    user.isVerified = true;
  }

  // Clear OTP
  user.phoneVerificationOTP = null;
  user.otpExpiresAt = null;
  await user.save();

  // Generate token if login verification
  let token = null;
  if (isLoginVerification) {
    token = generateToken(user._id, user.role);
  }

  sendSuccess(res, 'OTP verified successfully', {
    user,
    ...(token && { token })
  });
});

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
export const resendOTP = asyncHandler(async (req, res) => {
  const { phone } = req.body;

  const user = await User.findOne({ phone });

  if (!user) {
    return sendError(res, 'User not found', 404);
  }

  // Generate new OTP
  let otp;
  if (isBypassOtpNumber(phone)) {
    // Use custom OTP for specific phone numbers
    if (phone === '7610416911') {
      otp = '110211';
    } else {
      otp = '123456';
    }
    user.phoneVerificationOTP = otp;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    logger.info(`🔧 Bypass OTP generated for ${phone}: ${otp}, expires at: ${user.otpExpiresAt}`);
  } else {
    otp = user.generateOTP();
    logger.info(`🔧 Regular OTP generated for ${phone}: ${otp}, expires at: ${user.otpExpiresAt}`);
  }
  await user.save();

  // Send OTP via SMS
  try {
    if (isBypassOtpNumber(phone)) {
      logger.info(`📵 Bypass SMS for ${phone}. Using fixed OTP ${otp}.`);
    } else {
      await sendOTP(phone, otp);
      logger.info(`📱 OTP resent successfully to ${phone}`);
    }
  } catch (smsError) {
    logger.error('SMS sending failed:', smsError.message);
    // In development mode, allow resend even if SMS fails
    if (process.env.NODE_ENV === 'development') {
      logger.warn(`⚠️ SMS failed but allowing resend in development mode. OTP: ${otp}`);
    } else {
      return sendError(res, 'Failed to send OTP. Please try again.', 500);
    }
  }

  sendSuccess(res, 'OTP resent successfully', {
    otpSent: true,
    ...(process.env.NODE_ENV === 'development' && { otp }) // Only send OTP in development
  });
});

// @desc    Send OTP for passwordless login
// @route   POST /api/auth/login-otp
// @access  Public
export const sendLoginOTP = asyncHandler(async (req, res) => {
  const { phone } = req.body;

  const user = await User.findOne({ phone });

  if (!user) {
    return sendError(res, 'User not found with this phone number', 404);
  }

  // Check if user is active
  if (!user.isActive) {
    return sendError(res, 'Account is deactivated. Please contact support.', 401);
  }

  // Generate new OTP
  let otp;
  if (isBypassOtpNumber(phone)) {
    // Use custom OTP for specific phone numbers
    if (phone === '7610416911') {
      otp = '110211';
    } else {
      otp = '123456';
    }
    user.phoneVerificationOTP = otp;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    logger.info(`🔧 Bypass OTP generated for ${phone}: ${otp}, expires at: ${user.otpExpiresAt}`);
  } else {
    otp = user.generateOTP();
    logger.info(`🔧 Regular OTP generated for ${phone}: ${otp}, expires at: ${user.otpExpiresAt}`);
  }
  await user.save();

  // Send OTP via SMS
  try {
    if (isBypassOtpNumber(phone)) {
      logger.info(`📵 Bypass SMS for ${phone}. Using fixed OTP ${otp}.`);
    } else {
      await sendOTP(phone, otp);
      logger.info(`📱 Login OTP sent successfully to ${phone}`);
    }
  } catch (smsError) {
    logger.error('SMS sending failed:', smsError.message);
    // In development mode, allow login OTP even if SMS fails
    if (process.env.NODE_ENV === 'development') {
      logger.warn(`⚠️ SMS failed but allowing login OTP in development mode. OTP: ${otp}`);
    } else {
      return sendError(res, 'Failed to send OTP. Please try again.', 500);
    }
  }

  sendSuccess(res, 'Login OTP sent successfully', {
    otpSent: true,
    ...(process.env.NODE_ENV === 'development' && { otp }) // Only send OTP in development
  });
});

// @desc    Refresh JWT token
// @route   POST /api/v1/auth/refresh-token
// @access  Public
export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;

  if (!token) {
    return sendError(res, 'Refresh token is required', 400);
  }

  try {
    const { getRefreshToken, deleteRefreshToken } = await import('../config/redis.js');
    const jwt = await import('jsonwebtoken');
    
    const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
    
    if (!secret) {
      return sendError(res, 'Server configuration error', 500);
    }

    // Verify refresh token
    const decoded = jwt.default.verify(token, secret);
    
    // Check if refresh token exists in Redis
    const storedToken = await getRefreshToken(decoded.id);
    if (!storedToken || storedToken !== token) {
      return sendError(res, 'Invalid or expired refresh token', 401);
    }

    // Find user
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return sendError(res, 'User not found or inactive', 401);
    }

    // Generate new access token
    const newAccessToken = generateToken(user._id, user.role);
    
    // Optionally generate new refresh token (token rotation)
    const rotateRefreshToken = process.env.ROTATE_REFRESH_TOKEN !== 'false';
    let newRefreshToken = null;
    
    if (rotateRefreshToken) {
      const { generateRefreshToken } = await import('../utils/generateToken.js');
      const { storeRefreshToken } = await import('../config/redis.js');
      
      newRefreshToken = generateRefreshToken(user._id);
      
      // Delete old refresh token
      await deleteRefreshToken(decoded.id);
      
      // Store new refresh token
      await storeRefreshToken(user._id, newRefreshToken);
    }

    sendSuccess(res, 'Token refreshed successfully', {
      token: newAccessToken,
      ...(newRefreshToken && { refreshToken: newRefreshToken })
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return sendError(res, 'Invalid or expired refresh token', 401);
    }
    logger.error('Refresh token error:', error);
    return sendError(res, 'Failed to refresh token', 500);
  }
});

