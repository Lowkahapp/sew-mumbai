import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, getMe, becomeTailor } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

/**
 * POST /api/auth/register
 * POST /api/auth/login
 * GET  /api/auth/me
 */
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['customer', 'tailor']).withMessage('Invalid role'),
  ],
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  login
);

router.get('/me', protect, getMe);

router.post(
  '/become-tailor',
  protect,
  [
    body('locality').trim().notEmpty().withMessage('Locality is required'),
    body('bio').optional().isString(),
    body('businessName').optional().isString(),
    body('specialties').optional().isArray(),
    body('experienceYears').optional().isNumeric(),
    body('startingPrice').optional().isNumeric(),
  ],
  becomeTailor
);

export default router;
