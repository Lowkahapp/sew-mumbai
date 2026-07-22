import mongoose from 'mongoose';
import { LOCALITIES } from '../constants/neighborhoods.js';

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
    /** Customer requested tailor home visit */
    homeVisitRequested: { type: Boolean, default: false },
    /** Visit fee snapshot at booking time (₹) */
    homeVisitFee: { type: Number, default: 0, min: 0 },
    /** Base service price before visit fee */
    servicePrice: { type: Number, min: 0 },
    status: {
      type: String,
      enum: ['requested', 'accepted', 'rejected', 'completed', 'cancelled'],
      default: 'requested',
    },
    /** Production pipeline after acceptance */
    progressStage: {
      type: String,
      enum: ['none', 'accepted', 'fabric_received', 'stitching', 'ready'],
      default: 'none',
    },
    price: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

bookingSchema.index({ customer: 1, status: 1 });
bookingSchema.index({ tailor: 1, status: 1 });

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
