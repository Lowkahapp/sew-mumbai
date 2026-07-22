import { validationResult } from 'express-validator';
import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import TailorProfile from '../models/TailorProfile.js';

const formatErrors = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return errors.array().map((e) => e.msg);
  return null;
};

export const createReview = async (req, res) => {
  try {
    const msgs = formatErrors(req);
    if (msgs) return res.status(400).json({ message: msgs[0], errors: msgs });

    const { bookingId, rating, comment } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (String(booking.customer) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not your booking' });
    }
    if (booking.status !== 'completed') {
      return res.status(400).json({ message: 'Only completed bookings can be reviewed' });
    }

    const existing = await Review.findOne({ booking: booking._id });
    if (existing) {
      return res.status(400).json({ message: 'Booking already reviewed' });
    }

    const review = await Review.create({
      booking: booking._id,
      customer: req.user._id,
      tailor: booking.tailor,
      rating,
      comment: comment || '',
    });

    const stats = await Review.aggregate([
      { $match: { tailor: booking.tailor } },
      {
        $group: {
          _id: '$tailor',
          averageRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 },
        },
      },
    ]);

    if (stats[0]) {
      await TailorProfile.findByIdAndUpdate(booking.tailor, {
        averageRating: Math.round(stats[0].averageRating * 10) / 10,
        reviewCount: stats[0].reviewCount,
      });
    }

    const populated = await Review.findById(review._id).populate('customer', 'name');
    res.status(201).json({ review: populated });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Booking already reviewed' });
    }
    res.status(500).json({ message: 'Failed to create review' });
  }
};
