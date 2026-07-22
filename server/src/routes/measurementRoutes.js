import { Router } from 'express';
import { body } from 'express-validator';
import {
  getTemplates,
  getTemplateByType,
  listMyMeasurements,
  createMeasurement,
  updateMeasurement,
  deleteMeasurement,
} from '../controllers/measurementController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

/**
 * GET    /api/measurements/templates
 * GET    /api/measurements/templates/:type
 * GET    /api/measurements/me
 * POST   /api/measurements/me
 * PUT    /api/measurements/me/:id
 * DELETE /api/measurements/me/:id
 */

router.get('/templates', getTemplates);
router.get('/templates/:type', getTemplateByType);

router.get('/me', protect, authorize('customer'), listMyMeasurements);

router.post(
  '/me',
  protect,
  authorize('customer'),
  [
    body('garmentType').notEmpty().withMessage('Garment type is required'),
    body('label').optional().isString(),
    body('unit').optional().isIn(['in', 'cm']),
    body('values').optional().isObject(),
  ],
  createMeasurement
);

router.put(
  '/me/:id',
  protect,
  authorize('customer'),
  [
    body('garmentType').optional().isString(),
    body('label').optional().isString(),
    body('unit').optional().isIn(['in', 'cm']),
    body('values').optional().isObject(),
  ],
  updateMeasurement
);

router.delete('/me/:id', protect, authorize('customer'), deleteMeasurement);

export default router;
