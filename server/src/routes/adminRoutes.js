import { Router } from 'express';
import {
  getPending,
  approveTailor,
  approveService,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.use(protect, authorize('admin'));

router.get('/pending', getPending);
router.patch('/tailors/:id/approve', approveTailor);
router.put('/tailors/:id/approve', approveTailor);
router.patch('/services/:id/approve', approveService);
router.put('/services/:id/approve', approveService);

export default router;
