import { validationResult } from 'express-validator';
import User from '../models/User.js';
import TailorProfile from '../models/TailorProfile.js';
import { signToken } from '../middleware/auth.js';
import { LOCALITIES } from '../constants/localities.js';

const formatErrors = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errors.array().map((e) => e.msg);
  }
  return null;
};

export const register = async (req, res) => {
  try {
    const msgs = formatErrors(req);
    if (msgs) return res.status(400).json({ message: msgs[0], errors: msgs });

    const { name, email, password, phone, role, locality, specialties } = req.body;
    const allowedRoles = ['customer', 'tailor'];
    const userRole = allowedRoles.includes(role) ? role : 'customer';

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    if (userRole === 'tailor') {
      if (!locality || !LOCALITIES.includes(locality)) {
        return res.status(400).json({ message: 'Valid Mumbai locality required for tailors' });
      }
    }

    const user = await User.create({
      name,
      email,
      password,
      phone: phone || '',
      role: userRole,
    });

    let tailorProfile = null;
    if (userRole === 'tailor') {
      tailorProfile = await TailorProfile.create({
        user: user._id,
        locality,
        specialties: Array.isArray(specialties) ? specialties : [],
        bio: '',
        approvalStatus: 'pending',
      });
    }

    const token = signToken(user._id);
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      tailorProfile,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Registration failed' });
  }
};

export const login = async (req, res) => {
  try {
    const msgs = formatErrors(req);
    if (msgs) return res.status(400).json({ message: msgs[0], errors: msgs });

    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = signToken(user._id);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Login failed' });
  }
};

export const getMe = async (req, res) => {
  try {
    const payload = {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      role: req.user.role,
    };

    if (req.user.role === 'tailor') {
      payload.tailorProfile = await TailorProfile.findOne({ user: req.user._id });
    }

    res.json({ user: payload });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load profile' });
  }
};
