import { validationResult } from 'express-validator';
import Service from '../models/Service.js';
import TailorProfile from '../models/TailorProfile.js';

const formatErrors = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return errors.array().map((e) => e.msg);
  return null;
};

const getMyTailor = async (userId) => TailorProfile.findOne({ user: userId });

export const listMyServices = async (req, res) => {
  try {
    const tailor = await getMyTailor(req.user._id);
    if (!tailor) return res.status(404).json({ message: 'Tailor profile not found' });

    const services = await Service.find({ tailor: tailor._id }).sort({ createdAt: -1 });
    res.json({ services });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to list services' });
  }
};

export const createService = async (req, res) => {
  try {
    const msgs = formatErrors(req);
    if (msgs) return res.status(400).json({ message: msgs[0], errors: msgs });

    const tailor = await getMyTailor(req.user._id);
    if (!tailor) return res.status(404).json({ message: 'Tailor profile not found' });

    const { name, description, category, price, turnaroundDays } = req.body;
    const service = await Service.create({
      tailor: tailor._id,
      name,
      description: description || '',
      category,
      price,
      turnaroundDays,
      approvalStatus: 'pending',
    });

    res.status(201).json({ service });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create service' });
  }
};

export const updateService = async (req, res) => {
  try {
    const msgs = formatErrors(req);
    if (msgs) return res.status(400).json({ message: msgs[0], errors: msgs });

    const tailor = await getMyTailor(req.user._id);
    if (!tailor) return res.status(404).json({ message: 'Tailor profile not found' });

    const service = await Service.findOne({ _id: req.params.id, tailor: tailor._id });
    if (!service) return res.status(404).json({ message: 'Service not found' });

    const { name, description, category, price, turnaroundDays } = req.body;
    if (name !== undefined) service.name = name;
    if (description !== undefined) service.description = description;
    if (category !== undefined) service.category = category;
    if (price !== undefined) service.price = price;
    if (turnaroundDays !== undefined) service.turnaroundDays = turnaroundDays;

    // Re-approval when content changes
    service.approvalStatus = 'pending';
    await service.save();

    res.json({ service });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update service' });
  }
};

export const deleteService = async (req, res) => {
  try {
    const tailor = await getMyTailor(req.user._id);
    if (!tailor) return res.status(404).json({ message: 'Tailor profile not found' });

    const service = await Service.findOneAndDelete({
      _id: req.params.id,
      tailor: tailor._id,
    });
    if (!service) return res.status(404).json({ message: 'Service not found' });

    res.json({ message: 'Service deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete service' });
  }
};
