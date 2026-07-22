import { Router } from 'express';
import {
  getPending,
  approveTailor,
  approveService,
  verifyTailor,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.use(protect, authorize('admin'));

router.get('/pending', getPending);
router.patch('/tailors/:id/approve', approveTailor);
router.put('/tailors/:id/approve', approveTailor);
router.patch('/tailors/:id/verify', verifyTailor);
router.put('/tailors/:id/verify', verifyTailor);
router.patch('/services/:id/approve', approveService);
router.put('/services/:id/approve', approveService);

export default router;
