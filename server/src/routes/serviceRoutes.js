import { Router } from 'express';
import { body } from 'express-validator';
import {
  listMyServices,
  createService,
  updateService,
  deleteService,
} from '../controllers/serviceController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.use(protect, authorize('tailor'));

router.get('/', listMyServices);
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
    body('turnaroundDays').isInt({ min: 1 }).withMessage('Turnaround days required'),
  ],
  createService
);
router.put('/:id', updateService);
router.delete('/:id', deleteService);

export default router;
