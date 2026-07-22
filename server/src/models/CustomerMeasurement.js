import mongoose from 'mongoose';
import { GARMENT_TYPES } from '../constants/measurementTemplates.js';

const customerMeasurementSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    label: { type: String, trim: true, default: 'My measurements' },
    garmentType: {
      type: String,
      enum: GARMENT_TYPES,
      required: true,
    },
    unit: {
      type: String,
      enum: ['in', 'cm'],
      default: 'in',
    },
    values: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

customerMeasurementSchema.index({ user: 1, garmentType: 1 });

const CustomerMeasurement = mongoose.model('CustomerMeasurement', customerMeasurementSchema);
export default CustomerMeasurement;
