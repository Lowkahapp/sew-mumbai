import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    tailor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TailorProfile',
      required: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    turnaroundDays: { type: Number, required: true, min: 1 },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

serviceSchema.index({ tailor: 1, approvalStatus: 1 });

const Service = mongoose.model('Service', serviceSchema);
export default Service;
