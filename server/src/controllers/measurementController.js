import { validationResult } from 'express-validator';
import CustomerMeasurement from '../models/CustomerMeasurement.js';
import {
  GARMENT_TYPES,
  getTemplate,
  listTemplates,
} from '../constants/measurementTemplates.js';

const formatErrors = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return errors.array().map((e) => e.msg);
  return null;
};

const sanitizeValues = (garmentType, raw = {}) => {
  const template = getTemplate(garmentType);
  if (!template) return {};
  const allowed = new Set(template.fields.map((f) => f.key));
  const values = {};
  for (const [key, val] of Object.entries(raw)) {
    if (!allowed.has(key)) continue;
    const num = Number(val);
    if (Number.isFinite(num) && num >= 0) values[key] = num;
  }
  return values;
};

export const getTemplates = (_req, res) => {
  res.json({ templates: listTemplates() });
};

export const getTemplateByType = (req, res) => {
  const template = getTemplate(req.params.type);
  if (!template) {
    return res.status(404).json({ message: 'Unknown garment type' });
  }
  res.json({ template });
};

export const listMyMeasurements = async (req, res) => {
  try {
    const measurements = await CustomerMeasurement.find({ user: req.user._id }).sort({
      updatedAt: -1,
    });
    res.json({ measurements });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load measurements' });
  }
};

export const createMeasurement = async (req, res) => {
  try {
    const msgs = formatErrors(req);
    if (msgs) return res.status(400).json({ message: msgs[0], errors: msgs });

    const { label, garmentType, unit = 'in', values = {}, isDefault = false } = req.body;

    if (!GARMENT_TYPES.includes(garmentType)) {
      return res.status(400).json({ message: 'Invalid garment type' });
    }

    const cleanValues = sanitizeValues(garmentType, values);
    if (Object.keys(cleanValues).length === 0) {
      return res.status(400).json({ message: 'Enter at least one measurement' });
    }

    if (isDefault) {
      await CustomerMeasurement.updateMany(
        { user: req.user._id, garmentType },
        { isDefault: false }
      );
    }

    const measurement = await CustomerMeasurement.create({
      user: req.user._id,
      label: label?.trim() || `${getTemplate(garmentType).label} size`,
      garmentType,
      unit: unit === 'cm' ? 'cm' : 'in',
      values: cleanValues,
      isDefault: Boolean(isDefault),
    });

    res.status(201).json({ measurement });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to save measurements' });
  }
};

export const updateMeasurement = async (req, res) => {
  try {
    const msgs = formatErrors(req);
    if (msgs) return res.status(400).json({ message: msgs[0], errors: msgs });

    const measurement = await CustomerMeasurement.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!measurement) {
      return res.status(404).json({ message: 'Measurement not found' });
    }

    const { label, garmentType, unit, values, isDefault } = req.body;

    if (garmentType !== undefined) {
      if (!GARMENT_TYPES.includes(garmentType)) {
        return res.status(400).json({ message: 'Invalid garment type' });
      }
      measurement.garmentType = garmentType;
    }

    if (label !== undefined) measurement.label = label.trim() || measurement.label;
    if (unit !== undefined) measurement.unit = unit === 'cm' ? 'cm' : 'in';

    if (values !== undefined) {
      const cleanValues = sanitizeValues(measurement.garmentType, values);
      if (Object.keys(cleanValues).length === 0) {
        return res.status(400).json({ message: 'Enter at least one measurement' });
      }
      measurement.values = cleanValues;
    }

    if (isDefault) {
      await CustomerMeasurement.updateMany(
        { user: req.user._id, garmentType: measurement.garmentType, _id: { $ne: measurement._id } },
        { isDefault: false }
      );
      measurement.isDefault = true;
    } else if (isDefault === false) {
      measurement.isDefault = false;
    }

    await measurement.save();
    res.json({ measurement });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update measurements' });
  }
};

export const deleteMeasurement = async (req, res) => {
  try {
    const measurement = await CustomerMeasurement.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!measurement) {
      return res.status(404).json({ message: 'Measurement not found' });
    }
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete measurements' });
  }
};
