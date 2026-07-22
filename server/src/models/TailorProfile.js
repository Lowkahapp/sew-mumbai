import mongoose from 'mongoose';
import { LOCALITIES } from '../constants/neighborhoods.js';

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
    /** Workshop / profile photo (URL or base64 data URL) */
    profileImageUrl: { type: String, default: '' },
    bio: { type: String, default: '' },
    locality: {
      type: String,
      enum: LOCALITIES,
      required: true,
    },
    /** Map pin — auto-filled from neighborhood if omitted */
    coordinates: {
      lat: { type: Number, min: -90, max: 90 },
      lng: { type: Number, min: -180, max: 180 },
    },
    specialties: [{ type: String, trim: true }],
    portfolio: [portfolioItemSchema],
    experienceYears: { type: Number, default: 0, min: 0 },
    /** Display / booking starting price (₹) */
    startingPrice: { type: Number, default: 0, min: 0 },
    /** Optional home visit for fittings / pickup-drop */
    homeVisitEnabled: { type: Boolean, default: false },
    /** Transport / visit fee (₹) when homeVisitEnabled */
    homeVisitFee: { type: Number, default: 0, min: 0, max: 5000 },
    /** Alias used by live scrape seed — kept in sync with startingPrice */
    pricing: { type: Number, default: 0, min: 0 },
    /** Stable key from scrape source for upserts */
    sourceKey: { type: String, trim: true, sparse: true, unique: true },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    /** Admin-verified trust badge (shop license, ID, portfolio) */
    isVerifiedArtisan: { type: Boolean, default: false },
    verificationChecks: {
      shopLicense: { type: Boolean, default: false },
      identityProof: { type: Boolean, default: false },
      portfolioReview: { type: Boolean, default: false },
    },
    verifiedAt: { type: Date },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
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
