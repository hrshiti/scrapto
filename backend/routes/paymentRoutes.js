import express from 'express';
import {
  createPaymentOrder,
  verifyPayment,
  getPayment,
  getMyPayments,
  refundPaymentAmount,
  getPaymentStatus
} from '../controllers/paymentController.js';
import { protect, isAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validator.js';
import {
  createPaymentOrderValidator,
  verifyPaymentValidator,
  refundPaymentValidator
} from '../validators/paymentValidator.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Payment routes
router.post('/create-order', createPaymentOrderValidator, validate, createPaymentOrder);
router.post('/verify', verifyPaymentValidator, validate, verifyPayment);
router.get('/my-payments', getMyPayments);
router.get('/order/:orderId/status', getPaymentStatus);
router.get('/:paymentId', getPayment);
router.post('/:paymentId/refund', refundPaymentValidator, validate, refundPaymentAmount);

export default router;

