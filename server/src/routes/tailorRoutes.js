import { Router } from 'express';
import { body } from 'express-validator';
import {
  searchTailors,
  listTailors,
  getTailor,
  createProfile,
  updateMyProfile,
  addPortfolioItem,
  getMyProfile,
} from '../controllers/tailorController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

/**
 * GET  /api/tailors/search  — locality aggregation pipeline
 * POST /api/tailors/profile — create tailor profile (pending approval)
 * GET  /api/tailors         — same search (compat)
 * GET  /api/tailors/me
 * PUT  /api/tailors/me
 * POST /api/tailors/me/portfolio
 * GET  /api/tailors/:id
 */

router.get('/search', searchTailors);
router.get('/', listTailors);

router.post(
  '/profile',
  protect,
  authorize('tailor'),
  [
    body('locality').trim().notEmpty().withMessage('Locality is required'),
    body('bio').optional().isString(),
    body('specialties').optional().isArray(),
    body('experienceYears').optional().isNumeric(),
    body('startingPrice').optional().isNumeric(),
  ],
  createProfile
);

router.get('/me', protect, authorize('tailor'), getMyProfile);

router.put(
  '/me',
  protect,
  authorize('tailor'),
  [
    body('bio').optional().isString(),
    body('locality').optional().isString(),
    body('specialties').optional().isArray(),
    body('experienceYears').optional().isNumeric(),
    body('startingPrice').optional().isNumeric(),
  ],
  updateMyProfile
);

router.post(
  '/me/portfolio',
  protect,
  authorize('tailor'),
  [body('title').trim().notEmpty().withMessage('Title is required')],
  addPortfolioItem
);

router.get('/:id', getTailor);

export default router;
