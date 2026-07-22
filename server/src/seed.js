import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import User from './models/User.js';
import TailorProfile from './models/TailorProfile.js';
import Service from './models/Service.js';
import Booking from './models/Booking.js';
import Review from './models/Review.js';

dotenv.config();

const seed = async () => {
  await connectDB();

  console.log('Clearing existing data...');
  await Promise.all([
    Review.deleteMany({}),
    Booking.deleteMany({}),
    Service.deleteMany({}),
    TailorProfile.deleteMany({}),
    User.deleteMany({}),
  ]);

  console.log('Creating users...');
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@sewmumbai.com',
    password: 'Admin123!',
    phone: '9000000001',
    role: 'admin',
  });

  const customer = await User.create({
    name: 'Priya Sharma',
    email: 'customer@sewmumbai.com',
    password: 'Customer123!',
    phone: '9000000002',
    role: 'customer',
  });

  const customer2 = await User.create({
    name: 'Rahul Mehta',
    email: 'rahul@sewmumbai.com',
    password: 'Customer123!',
    phone: '9000000003',
    role: 'customer',
  });

  const tailorUser = await User.create({
    name: 'Asha Tailors',
    email: 'tailor@sewmumbai.com',
    password: 'Tailor123!',
    phone: '9000000004',
    role: 'tailor',
  });

  const pendingTailorUser = await User.create({
    name: 'Pending Stitches',
    email: 'pending.tailor@sewmumbai.com',
    password: 'Tailor123!',
    phone: '9000000005',
    role: 'tailor',
  });

  const tailor2User = await User.create({
    name: 'Bombay Blouse Studio',
    email: 'blouse@sewmumbai.com',
    password: 'Tailor123!',
    phone: '9000000006',
    role: 'tailor',
  });

  console.log('Creating tailor profiles...');
  const approvedTailor = await TailorProfile.create({
    user: tailorUser._id,
    bio: 'Custom alterations and ethnic wear in Bandra. 12+ years fitting Mumbai wardrobes.',
    locality: 'Bandra West',
    coordinates: { lat: 19.061, lng: 72.829 },
    specialties: ['Alterations', 'Saree Blouse', 'Lehenga'],
    experienceYears: 12,
    startingPrice: 499,
    homeVisitEnabled: true,
    homeVisitFee: 350,
    isVerifiedArtisan: true,
    verificationChecks: {
      shopLicense: true,
      identityProof: true,
      portfolioReview: true,
    },
    verifiedAt: new Date(),
    approvalStatus: 'approved',
    averageRating: 4.8,
    reviewCount: 1,
    isActive: true,
    portfolio: [
      {
        title: 'Bridal blouse set',
        imageUrl: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600',
        description: 'Heavy work bridal blouse with custom fit',
      },
      {
        title: 'Office kurta alteration',
        imageUrl: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=600',
        description: 'Taper and hem for ready-to-wear kurta',
      },
    ],
  });

  const pendingTailor = await TailorProfile.create({
    user: pendingTailorUser._id,
    bio: 'New workshop in Andheri specializing in kidswear and uniforms.',
    locality: 'Andheri',
    specialties: ['Kidswear', 'Uniforms'],
    experienceYears: 3,
    startingPrice: 299,
    approvalStatus: 'pending',
    isActive: true,
  });

  const approvedTailor2 = await TailorProfile.create({
    user: tailor2User._id,
    bio: 'Powai-based blouse and western wear specialist with quick turnaround.',
    locality: 'Powai',
    specialties: ['Saree Blouse', 'Western Wear', 'Gowns'],
    experienceYears: 8,
    startingPrice: 699,
    approvalStatus: 'approved',
    averageRating: 0,
    reviewCount: 0,
    isActive: true,
    portfolio: [
      {
        title: 'Boat-neck blouse',
        imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600',
        description: 'Lightweight party blouse',
      },
    ],
  });

  console.log('Creating services...');
  const svc1 = await Service.create({
    tailor: approvedTailor._id,
    name: 'Saree Blouse Stitching',
    description: 'Custom blouse with lining and hooks',
    category: 'Ethnic',
    price: 1200,
    turnaroundDays: 5,
    approvalStatus: 'approved',
  });

  const svc2 = await Service.create({
    tailor: approvedTailor._id,
    name: 'Pant Hem & Taper',
    description: 'Professional hem with optional taper',
    category: 'Alterations',
    price: 499,
    turnaroundDays: 2,
    approvalStatus: 'approved',
  });

  const svcPending = await Service.create({
    tailor: approvedTailor._id,
    name: 'Lehenga Flare Adjustment',
    description: 'Adjust circumference and length',
    category: 'Ethnic',
    price: 1800,
    turnaroundDays: 7,
    approvalStatus: 'pending',
  });

  const svc3 = await Service.create({
    tailor: approvedTailor2._id,
    name: 'Party Gown Fit',
    description: 'Full fitting for ready-made gown',
    category: 'Western Wear',
    price: 2500,
    turnaroundDays: 6,
    approvalStatus: 'approved',
  });

  await Service.create({
    tailor: pendingTailor._id,
    name: 'School Uniform Set',
    description: 'Shirt and pant/skirt for school',
    category: 'Uniforms',
    price: 900,
    turnaroundDays: 4,
    approvalStatus: 'pending',
  });

  console.log('Creating bookings & reviews...');
  const completedBooking = await Booking.create({
    customer: customer._id,
    tailor: approvedTailor._id,
    service: svc1._id,
    locality: 'Bandra',
    notes: 'Need deep back neck',
    preferredDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    status: 'completed',
    price: svc1.price,
  });

  await Booking.create({
    customer: customer._id,
    tailor: approvedTailor._id,
    service: svc2._id,
    locality: 'Bandra',
    notes: 'Taper slightly',
    preferredDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    status: 'requested',
    price: svc2.price,
  });

  await Booking.create({
    customer: customer2._id,
    tailor: approvedTailor2._id,
    service: svc3._id,
    locality: 'Powai',
    notes: 'Event next weekend',
    preferredDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    status: 'accepted',
    price: svc3.price,
  });

  await Review.create({
    booking: completedBooking._id,
    customer: customer._id,
    tailor: approvedTailor._id,
    rating: 5,
    comment: 'Perfect fit and finished on time. Highly recommend!',
  });

  console.log('\nSeed complete.\n');
  console.log('Accounts:');
  console.log('  admin@sewmumbai.com / Admin123!');
  console.log('  customer@sewmumbai.com / Customer123!');
  console.log('  tailor@sewmumbai.com / Tailor123! (approved)');
  console.log('  pending.tailor@sewmumbai.com / Tailor123! (pending)');
  console.log(`\nIDs — admin:${admin._id} customer:${customer._id} pendingService:${svcPending._id}`);

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
