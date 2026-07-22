import { validationResult } from 'express-validator';
import Booking from '../models/Booking.js';
import Service from '../models/Service.js';
import TailorProfile from '../models/TailorProfile.js';
import CustomerMeasurement from '../models/CustomerMeasurement.js';
import { LOCALITIES } from '../constants/localities.js';

const formatErrors = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return errors.array().map((e) => e.msg);
  return null;
};

export const createBooking = async (req, res) => {
  try {
    const msgs = formatErrors(req);
    if (msgs) return res.status(400).json({ message: msgs[0], errors: msgs });

    const { tailorId, serviceId, locality, notes, preferredDate, measurementId } = req.body;

    if (!LOCALITIES.includes(locality)) {
      return res.status(400).json({ message: 'Invalid locality' });
    }

    const tailor = await TailorProfile.findOne({
      _id: tailorId,
      approvalStatus: 'approved',
      isActive: true,
    });
    if (!tailor) return res.status(404).json({ message: 'Tailor not available' });

    const service = await Service.findOne({
      _id: serviceId,
      tailor: tailor._id,
      approvalStatus: 'approved',
    });
    if (!service) return res.status(404).json({ message: 'Service not available' });

    let measurements = { label: '', garmentType: '', unit: 'in', values: {} };
    if (measurementId) {
      const saved = await CustomerMeasurement.findOne({
        _id: measurementId,
        user: req.user._id,
      });
      if (!saved) {
        return res.status(404).json({ message: 'Saved measurements not found' });
      }
      measurements = {
        label: saved.label,
        garmentType: saved.garmentType,
        unit: saved.unit,
        values: saved.values,
      };
    }

    const booking = await Booking.create({
      customer: req.user._id,
      tailor: tailor._id,
      service: service._id,
      locality,
      notes: notes || '',
      preferredDate,
      price: service.price,
      status: 'requested',
      measurements,
    });

    const populated = await Booking.findById(booking._id)
      .populate('customer', 'name email phone')
      .populate({ path: 'tailor', populate: { path: 'user', select: 'name email phone' } })
      .populate('service');

    res.status(201).json({ booking: populated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create booking' });
  }
};

export const listMyBookings = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === 'customer') {
      filter = { customer: req.user._id };
    } else if (req.user.role === 'tailor') {
      const profile = await TailorProfile.findOne({ user: req.user._id });
      if (!profile) return res.status(404).json({ message: 'Tailor profile not found' });
      filter = { tailor: profile._id };
    } else if (req.user.role === 'admin') {
      filter = {};
    } else {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const bookings = await Booking.find(filter)
      .populate('customer', 'name email phone')
      .populate({ path: 'tailor', populate: { path: 'user', select: 'name email phone' } })
      .populate('service')
      .sort({ createdAt: -1 });

    res.json({ bookings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to list bookings' });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const msgs = formatErrors(req);
    if (msgs) return res.status(400).json({ message: msgs[0], errors: msgs });

    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const role = req.user.role;

    if (role === 'tailor') {
      const profile = await TailorProfile.findOne({ user: req.user._id });
      if (!profile || String(booking.tailor) !== String(profile._id)) {
        return res.status(403).json({ message: 'Not your booking' });
      }
      if (!['accepted', 'rejected', 'completed'].includes(status)) {
        return res.status(400).json({ message: 'Tailors may accept, reject, or complete' });
      }
      if (status === 'accepted' || status === 'rejected') {
        if (booking.status !== 'requested') {
          return res.status(400).json({ message: 'Only requested bookings can be accepted/rejected' });
        }
      }
      if (status === 'completed' && booking.status !== 'accepted') {
        return res.status(400).json({ message: 'Only accepted bookings can be completed' });
      }
    } else if (role === 'customer') {
      if (String(booking.customer) !== String(req.user._id)) {
        return res.status(403).json({ message: 'Not your booking' });
      }
      if (status !== 'cancelled') {
        return res.status(400).json({ message: 'Customers may only cancel' });
      }
      if (!['requested', 'accepted'].includes(booking.status)) {
        return res.status(400).json({ message: 'Cannot cancel this booking' });
      }
    } else if (role === 'admin') {
      // admin can set any valid status
    } else {
      return res.status(403).json({ message: 'Forbidden' });
    }

    booking.status = status;
    await booking.save();

    const populated = await Booking.findById(booking._id)
      .populate('customer', 'name email phone')
      .populate({ path: 'tailor', populate: { path: 'user', select: 'name email phone' } })
      .populate('service');

    res.json({ booking: populated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update booking' });
  }
};
