import { validationResult } from 'express-validator';
import mongoose from 'mongoose';
import TailorProfile from '../models/TailorProfile.js';
import Service from '../models/Service.js';
import Review from '../models/Review.js';
import { LOCALITIES } from '../constants/localities.js';

const formatErrors = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return errors.array().map((e) => e.msg);
  return null;
};

const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Locality-first search via MongoDB aggregation pipeline.
 * Query: locality, specialty, q
 */
export const searchTailors = async (req, res) => {
  try {
    const { locality, specialty, q } = req.query;

    const match = {
      approvalStatus: 'approved',
      isActive: true,
    };

    if (locality) {
      match.locality = {
        $regex: new RegExp(`^${escapeRegex(String(locality).trim())}$`, 'i'),
      };
    }
    if (specialty) {
      match.specialties = {
        $regex: new RegExp(escapeRegex(String(specialty).trim()), 'i'),
      };
    }
    if (q) {
      const term = escapeRegex(String(q).trim());
      match.$or = [
        { bio: { $regex: term, $options: 'i' } },
        { specialties: { $regex: term, $options: 'i' } },
      ];
    }

    const [result] = await TailorProfile.aggregate([
      {
        $facet: {
          tailors: [
            { $match: match },
            {
              $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'user',
                pipeline: [{ $project: { name: 1, email: 1, phone: 1 } }],
              },
            },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
            { $sort: { averageRating: -1, startingPrice: 1, createdAt: -1 } },
          ],
          byLocality: [
            { $match: { approvalStatus: 'approved', isActive: true } },
            {
              $group: {
                _id: '$locality',
                count: { $sum: 1 },
                avgRating: { $avg: '$averageRating' },
              },
            },
            { $sort: { count: -1, _id: 1 } },
            {
              $project: {
                _id: 0,
                locality: '$_id',
                count: 1,
                avgRating: { $round: ['$avgRating', 1] },
              },
            },
          ],
        },
      },
    ]);

    res.json({
      tailors: result?.tailors || [],
      byLocality: result?.byLocality || [],
      filters: {
        locality: locality || null,
        specialty: specialty || null,
        q: q || null,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to search tailors' });
  }
};

/** Compat alias for GET /api/tailors */
export const listTailors = searchTailors;

export const getTailor = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid tailor id' });
    }

    const tailor = await TailorProfile.findOne({
      _id: req.params.id,
      approvalStatus: 'approved',
      isActive: true,
    }).populate('user', 'name email phone');

    if (!tailor) {
      return res.status(404).json({ message: 'Tailor not found' });
    }

    const services = await Service.find({
      tailor: tailor._id,
      approvalStatus: 'approved',
    });

    const reviews = await Review.find({ tailor: tailor._id })
      .populate('customer', 'name')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ tailor, services, reviews });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load tailor' });
  }
};

/** Create tailor profile (pending admin approval) */
export const createProfile = async (req, res) => {
  try {
    const msgs = formatErrors(req);
    if (msgs) return res.status(400).json({ message: msgs[0], errors: msgs });

    const existing = await TailorProfile.findOne({ user: req.user._id });
    if (existing) {
      return res.status(400).json({ message: 'Tailor profile already exists' });
    }

    const {
      bio = '',
      locality,
      specialties = [],
      experienceYears = 0,
      startingPrice = 0,
      portfolio = [],
    } = req.body;

    if (!locality || !LOCALITIES.includes(locality)) {
      return res.status(400).json({ message: 'Valid Mumbai locality is required' });
    }

    const tailor = await TailorProfile.create({
      user: req.user._id,
      bio,
      locality,
      specialties: Array.isArray(specialties) ? specialties : [],
      experienceYears: Number(experienceYears) || 0,
      startingPrice: Number(startingPrice) || 0,
      portfolio: Array.isArray(portfolio) ? portfolio : [],
      approvalStatus: 'pending',
      isActive: true,
    });

    const populated = await TailorProfile.findById(tailor._id).populate(
      'user',
      'name email phone'
    );

    res.status(201).json({
      message: 'Profile created — awaiting admin approval',
      tailor: populated,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create profile' });
  }
};

export const updateMyProfile = async (req, res) => {
  try {
    const msgs = formatErrors(req);
    if (msgs) return res.status(400).json({ message: msgs[0], errors: msgs });

    const profile = await TailorProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: 'Tailor profile not found' });
    }

    const { bio, locality, specialties, experienceYears, startingPrice, isActive } = req.body;

    if (bio !== undefined) profile.bio = bio;
    if (locality !== undefined) {
      if (!LOCALITIES.includes(locality)) {
        return res.status(400).json({ message: 'Invalid locality' });
      }
      profile.locality = locality;
    }
    if (specialties !== undefined) profile.specialties = specialties;
    if (experienceYears !== undefined) profile.experienceYears = experienceYears;
    if (startingPrice !== undefined) profile.startingPrice = startingPrice;
    if (isActive !== undefined) profile.isActive = isActive;

    await profile.save();
    res.json({ tailor: profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

export const addPortfolioItem = async (req, res) => {
  try {
    const msgs = formatErrors(req);
    if (msgs) return res.status(400).json({ message: msgs[0], errors: msgs });

    const profile = await TailorProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: 'Tailor profile not found' });
    }

    const { title, imageUrl, description } = req.body;
    profile.portfolio.push({
      title,
      imageUrl: imageUrl || '',
      description: description || '',
    });
    await profile.save();

    res.status(201).json({ portfolio: profile.portfolio });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to add portfolio item' });
  }
};

export const getMyProfile = async (req, res) => {
  try {
    const profile = await TailorProfile.findOne({ user: req.user._id }).populate(
      'user',
      'name email phone'
    );
    if (!profile) {
      return res.status(404).json({ message: 'Tailor profile not found' });
    }
    const services = await Service.find({ tailor: profile._id });
    res.json({ tailor: profile, services });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load profile' });
  }
};
