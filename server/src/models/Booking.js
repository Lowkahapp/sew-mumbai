import mongoose from 'mongoose';
import { LOCALITIES } from '../constants/localities.js';

const bookingSchema = new mongoose.Schema(
  {
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
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    locality: {
      type: String,
      enum: LOCALITIES,
      required: true,
    },
    notes: { type: String, default: '' },
    /** Snapshot of customer measurements at booking time */
    measurements: {
      label: { type: String, default: '' },
      garmentType: { type: String, default: '' },
      unit: { type: String, default: 'in' },
      values: { type: mongoose.Schema.Types.Mixed, default: {} },
    },
    preferredDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['requested', 'accepted', 'rejected', 'completed', 'cancelled'],
      default: 'requested',
    },
    price: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

bookingSchema.index({ customer: 1, status: 1 });
bookingSchema.index({ tailor: 1, status: 1 });

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
