import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import User from '../models/User.js';

const router = Router();

router.get('/me', protect, async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      role: req.user.role,
    },
  });
});

router.get('/', protect, authorize('admin'), async (_req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to list users' });
  }
});

export default router;
