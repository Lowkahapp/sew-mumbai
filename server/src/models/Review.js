import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tailor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TailorProfile',
      required: true,
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '', trim: true },
  },
  { timestamps: true }
);

reviewSchema.index({ tailor: 1 });

const Review = mongoose.model('Review', reviewSchema);
export default Review;
