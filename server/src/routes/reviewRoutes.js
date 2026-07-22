import { Router } from 'express';
import { body } from 'express-validator';
import { createReview } from '../controllers/reviewController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.post(
  '/',
  protect,
  authorize('customer'),
  [
    body('bookingId').notEmpty().withMessage('Booking is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
    body('comment').optional().isString(),
  ],
  createReview
);

export default router;
