import mongoose from 'mongoose';
import { LOCALITIES } from '../constants/localities.js';

const portfolioItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    imageUrl: { type: String, default: '' },
    description: { type: String, default: '' },
  },
  { _id: true }
);

const tailorProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    businessName: { type: String, trim: true, default: '' },
    bio: { type: String, default: '' },
    locality: {
      type: String,
      enum: LOCALITIES,
      required: true,
    },
    specialties: [{ type: String, trim: true }],
    portfolio: [portfolioItemSchema],
    experienceYears: { type: Number, default: 0, min: 0 },
    /** Display / booking starting price (₹) */
    startingPrice: { type: Number, default: 0, min: 0 },
    /** Alias used by live scrape seed — kept in sync with startingPrice */
    pricing: { type: Number, default: 0, min: 0 },
    /** Stable key from scrape source for upserts */
    sourceKey: { type: String, trim: true, sparse: true, unique: true },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

tailorProfileSchema.index({ locality: 1, approvalStatus: 1 });
tailorProfileSchema.index({ specialties: 1 });
tailorProfileSchema.index({ businessName: 1, locality: 1 });

const TailorProfile = mongoose.model('TailorProfile', tailorProfileSchema);
export default TailorProfile;
