import { validationResult } from 'express-validator';
import mongoose from 'mongoose';
import TailorProfile from '../models/TailorProfile.js';
import Service from '../models/Service.js';
import Review from '../models/Review.js';
import {
  LOCALITIES,
  localityMatchValues,
  getNeighborhood,
  resolveCoordinates,
  distanceKm as haversineKm,
} from '../constants/neighborhoods.js';
import { normalizeImageData, resolveImageSource } from '../utils/imageData.js';
import { normalizeWhatsAppNumber } from '../utils/whatsapp.js';

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
    const { locality, specialty, q, sort } = req.query;

    const match = {
      approvalStatus: 'approved',
      isActive: true,
    };

    let center = null;
    if (locality) {
      const values = localityMatchValues(locality);
      center = getNeighborhood(locality);
      match.locality = { $in: values };
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

    let tailors = result?.tailors || [];

    tailors = tailors.map((t) => {
      const coords = t.coordinates?.lat
        ? t.coordinates
        : resolveCoordinates(t.locality) || null;
      let distKm = null;
      if (center && coords?.lat) {
        distKm = Math.round(haversineKm(center.lat, center.lng, coords.lat, coords.lng) * 10) / 10;
      }
      return {
        ...t,
        coordinates: coords,
        distanceKm: distKm,
        neighborhood: getNeighborhood(t.locality)?.label || t.locality,
      };
    });

    if (center && (sort === 'distance' || locality)) {
      tailors.sort((a, b) => {
        const da = a.distanceKm ?? 999;
        const db = b.distanceKm ?? 999;
        if (da !== db) return da - db;
        return (b.averageRating || 0) - (a.averageRating || 0);
      });
    }

    res.json({
      tailors,
      byLocality: result?.byLocality || [],
      filters: {
        locality: locality || null,
        specialty: specialty || null,
        q: q || null,
      },
      center: center ? { label: center.label, lat: center.lat, lng: center.lng } : null,
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

    const coords = resolveCoordinates(locality);

    const tailor = await TailorProfile.create({
      user: req.user._id,
      bio,
      locality,
      coordinates: coords || undefined,
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

    const {
      bio,
      locality,
      specialties,
      experienceYears,
      startingPrice,
      isActive,
      profileImageUrl,
      profileImageData,
      homeVisitEnabled,
      homeVisitFee,
      whatsappNumber,
    } = req.body;

    if (bio !== undefined) profile.bio = bio;
    if (locality !== undefined) {
      if (!LOCALITIES.includes(locality)) {
        return res.status(400).json({ message: 'Invalid locality' });
      }
      profile.locality = locality;
      const coords = resolveCoordinates(locality);
      if (coords) profile.coordinates = coords;
    }
    if (specialties !== undefined) profile.specialties = specialties;
    if (experienceYears !== undefined) profile.experienceYears = experienceYears;
    if (startingPrice !== undefined) profile.startingPrice = startingPrice;
    if (isActive !== undefined) profile.isActive = isActive;
    if (homeVisitEnabled !== undefined) profile.homeVisitEnabled = Boolean(homeVisitEnabled);
    if (homeVisitFee !== undefined || homeVisitEnabled !== undefined) {
      const enabled = homeVisitEnabled !== undefined ? Boolean(homeVisitEnabled) : profile.homeVisitEnabled;
      const fee = homeVisitFee !== undefined ? Number(homeVisitFee) : profile.homeVisitFee;
      if (enabled) {
        if (!Number.isFinite(fee) || fee < 200 || fee > 500) {
          return res.status(400).json({ message: 'Home visit fee must be between ₹200 and ₹500' });
        }
        profile.homeVisitFee = fee;
        profile.homeVisitEnabled = true;
      } else {
        profile.homeVisitEnabled = false;
        profile.homeVisitFee = 0;
      }
    }
    if (profileImageData) {
      profile.profileImageUrl = normalizeImageData(profileImageData);
    } else if (profileImageUrl !== undefined) {
      profile.profileImageUrl = profileImageUrl || '';
    }
    if (whatsappNumber !== undefined) {
      const normalized = normalizeWhatsAppNumber(whatsappNumber);
      if (normalized === null) {
        return res.status(400).json({ message: 'Enter a valid 10-digit WhatsApp number' });
      }
      profile.whatsappNumber = normalized;
    }

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

    const { title, imageUrl, imageData, description } = req.body;
    let resolvedImage = '';
    try {
      resolvedImage = resolveImageSource({ imageData, imageUrl });
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }

    profile.portfolio.push({
      title,
      imageUrl: resolvedImage,
      description: description || '',
    });
    await profile.save();

    res.status(201).json({ portfolio: profile.portfolio });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to add portfolio item' });
  }
};

export const uploadProfilePhoto = async (req, res) => {
  try {
    const profile = await TailorProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: 'Tailor profile not found' });
    }

    const { imageData } = req.body;
    if (!imageData) {
      return res.status(400).json({ message: 'Image data is required' });
    }

    try {
      profile.profileImageUrl = normalizeImageData(imageData);
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }

    await profile.save();
    res.json({ profileImageUrl: profile.profileImageUrl, tailor: profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to upload photo' });
  }
};

export const deletePortfolioItem = async (req, res) => {
  try {
    const profile = await TailorProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: 'Tailor profile not found' });
    }

    const { itemId } = req.params;
    const item = profile.portfolio.id(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Portfolio item not found' });
    }

    item.deleteOne();
    await profile.save();
    res.json({ portfolio: profile.portfolio });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete portfolio item' });
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
