import { Router } from 'express';
import { body } from 'express-validator';
import {
  createBooking,
  listMyBookings,
  updateBookingStatus,
} from '../controllers/bookingController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

/**
 * Customer booking requests + tailor acceptance workflow
 * POST   /api/bookings              — customer creates request
 * GET    /api/bookings/me           — role-aware list
 * PUT    /api/bookings/:id/status   — tailor accept/reject/complete; customer cancel
 * PATCH  /api/bookings/:id/status   — same (compat)
 */

router.post(
  '/',
  protect,
  authorize('customer'),
  [
    body('tailorId').notEmpty().withMessage('Tailor is required'),
    body('serviceId').notEmpty().withMessage('Service is required'),
    body('locality').notEmpty().withMessage('Locality is required'),
    body('preferredDate').isISO8601().withMessage('Valid preferred date is required'),
  ],
  createBooking
);

router.get('/me', protect, authorize('customer', 'tailor', 'admin'), listMyBookings);

const statusValidators = [
  body('status')
    .isIn(['requested', 'accepted', 'rejected', 'completed', 'cancelled'])
    .withMessage('Invalid status'),
];

router.put(
  '/:id/status',
  protect,
  authorize('customer', 'tailor', 'admin'),
  statusValidators,
  updateBookingStatus
);

router.patch(
  '/:id/status',
  protect,
  authorize('customer', 'tailor', 'admin'),
  statusValidators,
  updateBookingStatus
);

export default router;
