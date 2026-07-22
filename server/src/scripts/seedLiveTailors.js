/**
 * seedLiveTailors.js — upsert extra Mumbai tailor listings + services (no wipe).
 *
 * Usage:
 *   npm run seed:live
 *   npm run seed:live -- --dry-run
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import TailorProfile from '../models/TailorProfile.js';
import Service from '../models/Service.js';
import { LOCALITIES } from '../constants/localities.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const DRY_RUN = process.argv.includes('--dry-run');
const PLACEHOLDER_PASSWORD = 'TailorSeed123!';
const SEED_APPROVE = String(process.env.SEED_APPROVE ?? 'true').toLowerCase() !== 'false';

/** Curated Mumbai directory listings (used when SCRAPE_URL is not set). */
const LIVE_TAILOR_LISTINGS = [
  { businessName: 'Bandra Stitch Atelier', locality: 'Bandra', specialties: ['Lehenga', 'Blouse', 'Alterations'], pricing: 899, experienceYears: 14, averageRating: 4.7, reviewCount: 28 },
  { businessName: 'Andheri Custom Fits', locality: 'Andheri', specialties: ['Suits', 'Formal Wear', 'Alterations'], pricing: 749, experienceYears: 9, averageRating: 4.5, reviewCount: 19 },
  { businessName: 'Powai Thread House', locality: 'Powai', specialties: ['Saree Blouse', 'Lehenga', 'Gowns'], pricing: 999, experienceYears: 11, averageRating: 4.8, reviewCount: 34 },
  { businessName: 'Dadar Heritage Tailors', locality: 'Dadar', specialties: ['Alterations', 'Sherwani', 'Suits'], pricing: 599, experienceYears: 22, averageRating: 4.6, reviewCount: 41 },
  { businessName: 'Juhu Couture Corner', locality: 'Juhu', specialties: ['Lehenga', 'Western Wear', 'Suits'], pricing: 1299, experienceYears: 7, averageRating: 4.4, reviewCount: 15 },
  { businessName: 'Worli Needle & Thread', locality: 'Worli', specialties: ['Alterations', 'Suits'], pricing: 650, experienceYears: 10, averageRating: 4.3, reviewCount: 12 },
  { businessName: 'Colaba Classic Tailors', locality: 'Colaba', specialties: ['Suits', 'Blazers', 'Alterations'], pricing: 1499, experienceYears: 18, averageRating: 4.9, reviewCount: 52 },
  { businessName: 'Chembur Stitch Studio', locality: 'Chembur', specialties: ['Saree Blouse', 'Alterations', 'Kidswear'], pricing: 549, experienceYears: 8, averageRating: 4.2, reviewCount: 21 },
  { businessName: 'Goregaon Fit Lab', locality: 'Goregaon', specialties: ['Alterations', 'Uniforms', 'Suits'], pricing: 499, experienceYears: 6, averageRating: 4.1, reviewCount: 9 },
  { businessName: 'Malad Master Cuts', locality: 'Malad', specialties: ['Alterations', 'Lehenga', 'Blouse'], pricing: 699, experienceYears: 13, averageRating: 4.5, reviewCount: 27 },
  { businessName: 'Thane Tailor Hub', locality: 'Thane', specialties: ['Suits', 'Sherwani', 'Alterations'], pricing: 799, experienceYears: 15, averageRating: 4.6, reviewCount: 38 },
  { businessName: 'Kurla Quick Stitch', locality: 'Kurla', specialties: ['Alterations', 'Saree Blouse'], pricing: 399, experienceYears: 5, averageRating: 4.0, reviewCount: 8 },
  { businessName: 'Santacruz Style Room', locality: 'Santacruz', specialties: ['Western Wear', 'Gowns', 'Alterations'], pricing: 950, experienceYears: 9, averageRating: 4.4, reviewCount: 16 },
  { businessName: 'Lower Parel Formal Co', locality: 'Lower Parel', specialties: ['Suits', 'Blazers', 'Trousers'], pricing: 1199, experienceYears: 12, averageRating: 4.7, reviewCount: 31 },
  { businessName: 'Fort Heritage Stitches', locality: 'Fort', specialties: ['Sherwani', 'Suits', 'Alterations'], pricing: 1599, experienceYears: 25, averageRating: 4.8, reviewCount: 44 },
  { businessName: 'Vile Parle Blouse Bar', locality: 'Vile Parle', specialties: ['Saree Blouse', 'Lehenga', 'Alterations'], pricing: 850, experienceYears: 10, averageRating: 4.5, reviewCount: 23 },
  { businessName: 'Borivali Family Tailors', locality: 'Borivali', specialties: ['Kidswear', 'Uniforms', 'Alterations'], pricing: 450, experienceYears: 16, averageRating: 4.3, reviewCount: 33 },
  { businessName: 'Versova Beach Tailors', locality: 'Versova', specialties: ['Alterations', 'Western Wear'], pricing: 550, experienceYears: 7, averageRating: 4.2, reviewCount: 11 },
  { businessName: 'Matunga Silk Studio', locality: 'Matunga', specialties: ['Saree Blouse', 'Lehenga', 'Alterations'], pricing: 780, experienceYears: 19, averageRating: 4.6, reviewCount: 29 },
  { businessName: 'Marine Lines Menswear', locality: 'Marine Lines', specialties: ['Suits', 'Formal Wear', 'Alterations'], pricing: 1100, experienceYears: 20, averageRating: 4.7, reviewCount: 36 },
  { businessName: 'Lokhandwala Luxe Fits', locality: 'Lokhandwala', specialties: ['Lehenga', 'Gowns', 'Designer Wear'], pricing: 1899, experienceYears: 8, averageRating: 4.5, reviewCount: 18 },
  { businessName: 'Parel Workwear Tailors', locality: 'Parel', specialties: ['Uniforms', 'Alterations', 'Suits'], pricing: 620, experienceYears: 11, averageRating: 4.1, reviewCount: 14 },
  { businessName: 'Sion Express Alterations', locality: 'Sion', specialties: ['Alterations', 'Hemming'], pricing: 350, experienceYears: 4, averageRating: 3.9, reviewCount: 6 },
  { businessName: 'Ghatkopar Bridal House', locality: 'Ghatkopar', specialties: ['Lehenga', 'Blouse', 'Bridal'], pricing: 1699, experienceYears: 14, averageRating: 4.8, reviewCount: 42 },
  // Western suburbs — Borivali, Kandivali, Malad, Goregaon
  { businessName: 'Borivali West Stitch Co', locality: 'Borivali', specialties: ['Alterations', 'Suits', 'Sherwani'], pricing: 520, experienceYears: 12, averageRating: 4.4, reviewCount: 26 },
  { businessName: 'Borivali East Tailor Mart', locality: 'Borivali', specialties: ['Uniforms', 'Kidswear', 'Alterations'], pricing: 380, experienceYears: 9, averageRating: 4.2, reviewCount: 18 },
  { businessName: 'IC Colony Master Tailors', locality: 'Borivali', specialties: ['Lehenga', 'Blouse', 'Alterations'], pricing: 720, experienceYears: 17, averageRating: 4.6, reviewCount: 35 },
  { businessName: 'Kandivali East Fit Studio', locality: 'Kandivali', specialties: ['Alterations', 'Saree Blouse', 'Suits'], pricing: 580, experienceYears: 8, averageRating: 4.3, reviewCount: 14 },
  { businessName: 'Kandivali West Couture', locality: 'Kandivali', specialties: ['Lehenga', 'Gowns', 'Western Wear'], pricing: 950, experienceYears: 10, averageRating: 4.5, reviewCount: 22 },
  { businessName: 'Thakur Village Tailors', locality: 'Kandivali', specialties: ['Alterations', 'Formal Wear', 'Blazers'], pricing: 640, experienceYears: 11, averageRating: 4.4, reviewCount: 19 },
  { businessName: 'Malad Link Road Tailors', locality: 'Malad', specialties: ['Alterations', 'Suits', 'Trousers'], pricing: 480, experienceYears: 7, averageRating: 4.1, reviewCount: 16 },
  { businessName: 'Malad West Blouse House', locality: 'Malad', specialties: ['Saree Blouse', 'Lehenga', 'Bridal'], pricing: 890, experienceYears: 15, averageRating: 4.7, reviewCount: 31 },
  { businessName: 'Inorbit Tailor Express', locality: 'Malad', specialties: ['Alterations', 'Western Wear'], pricing: 420, experienceYears: 5, averageRating: 4.0, reviewCount: 11 },
  { businessName: 'Goregaon West Formal Hub', locality: 'Goregaon', specialties: ['Suits', 'Blazers', 'Alterations'], pricing: 850, experienceYears: 13, averageRating: 4.5, reviewCount: 24 },
  { businessName: 'Goregaon East Stitch Line', locality: 'Goregaon', specialties: ['Alterations', 'Uniforms', 'Kidswear'], pricing: 410, experienceYears: 6, averageRating: 4.2, reviewCount: 13 },
  { businessName: 'Oshiwara Goregaon Tailors', locality: 'Goregaon', specialties: ['Lehenga', 'Blouse', 'Alterations'], pricing: 780, experienceYears: 14, averageRating: 4.6, reviewCount: 28 },
  { businessName: 'Film City Tailor Works', locality: 'Goregaon', specialties: ['Western Wear', 'Gowns', 'Designer Wear'], pricing: 1350, experienceYears: 9, averageRating: 4.5, reviewCount: 17 },
];

function slugify(value = '') {
  return String(value)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '.')
    .replace(/^\.+|\.+$/g, '')
    .slice(0, 48) || 'tailor';
}

function normalizeLocality(raw = '') {
  const cleaned = String(raw).trim();
  if (!cleaned) return null;
  const hit = LOCALITIES.find((loc) => loc.toLowerCase() === cleaned.toLowerCase());
  if (hit) return hit;
  const partial = LOCALITIES.find(
    (loc) =>
      cleaned.toLowerCase().includes(loc.toLowerCase()) ||
      loc.toLowerCase().includes(cleaned.toLowerCase())
  );
  return partial || null;
}

function parseSpecialties(raw) {
  if (Array.isArray(raw)) return raw.map((s) => String(s).trim()).filter(Boolean);
  return String(raw || '')
    .split(/[,|/•·]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 8);
}

function parsePricing(raw) {
  if (typeof raw === 'number' && Number.isFinite(raw)) return Math.max(0, Math.round(raw));
  const match = String(raw || '').replace(/,/g, '').match(/(\d+(\.\d+)?)/);
  return match ? Math.max(0, Math.round(Number(match[1]))) : 0;
}

function toListing(raw, sourceLabel) {
  const businessName = String(raw.businessName || '').trim();
  const locality = normalizeLocality(raw.locality);
  if (!businessName || !locality) return null;
  return {
    businessName,
    locality,
    specialties: parseSpecialties(raw.specialties),
    pricing: parsePricing(raw.pricing),
    experienceYears: Number(raw.experienceYears) || 5,
    averageRating: Number(raw.averageRating) || 4.2,
    reviewCount: Number(raw.reviewCount) || 10,
    sourceKey: `live:${slugify(businessName)}:${slugify(locality)}`,
    source: sourceLabel,
  };
}

async function fetchDirectoryHtml() {
  const url = process.env.SCRAPE_URL?.trim();
  if (!url) return null;

  console.log(`Fetching directory: ${url}`);
  const { data } = await axios.get(url, {
    timeout: 20000,
    headers: {
      'User-Agent': 'SewMumbaiSeedBot/1.0 (+local research)',
      Accept: 'text/html,application/xhtml+xml',
    },
    maxRedirects: 3,
    validateStatus: (status) => status >= 200 && status < 400,
  });

  if (typeof data !== 'string') throw new Error('SCRAPE_URL did not return HTML text');
  return { html: data, source: url };
}

function parseListingsFromHtml(html, sourceLabel) {
  const $ = cheerio.load(html);
  const listings = [];
  const seen = new Set();

  const push = (item) => {
    const listing = toListing(item, sourceLabel);
    if (!listing || seen.has(listing.sourceKey)) return;
    seen.add(listing.sourceKey);
    listings.push(listing);
  };

  $('.tailor-listing, [data-business-name]').each((_, el) => {
    const node = $(el);
    push({
      businessName: node.attr('data-business-name') || node.find('.business-name').first().text(),
      locality: node.attr('data-locality') || node.find('.locality').first().text(),
      specialties: node.attr('data-specialties') || node.find('.specialties').first().text(),
      pricing: node.attr('data-pricing') || node.find('.pricing, .price').first().text(),
    });
  });

  $('.listing-card').each((_, el) => {
    const node = $(el);
    push({
      businessName: node.find('.name, .business-name, h2, h3').first().text(),
      locality: node.find('.area, .locality').first().text(),
      specialties: node.find('.tags, .specialties').first().text(),
      pricing: node.find('.price, .pricing').first().text(),
    });
  });

  return listings;
}

function getListings() {
  const scraped = process.env.SCRAPE_URL;
  if (scraped) {
    return fetchDirectoryHtml().then(({ html, source }) =>
      parseListingsFromHtml(html, source)
    );
  }

  console.log(`Using ${LIVE_TAILOR_LISTINGS.length} curated Mumbai listings.`);
  const listings = LIVE_TAILOR_LISTINGS.map((row) => toListing(row, 'curated')).filter(Boolean);
  return Promise.resolve(listings);
}

async function ensureTailorUser(listing) {
  const email = `live.${slugify(listing.businessName)}.${slugify(listing.locality)}@seed.sewmumbai.local`;

  let user = await User.findOne({ email });
  if (user) {
    if (user.role !== 'tailor') {
      user.role = 'tailor';
      await user.save();
    }
    if (user.name !== listing.businessName) {
      user.name = listing.businessName;
      await user.save();
    }
    return user;
  }

  return User.create({
    name: listing.businessName,
    email,
    password: PLACEHOLDER_PASSWORD,
    phone: '',
    role: 'tailor',
  });
}

async function upsertTailorProfile(user, listing) {
  const pricing = listing.pricing || 499;
  const update = {
    user: user._id,
    businessName: listing.businessName,
    locality: listing.locality,
    specialties:
      listing.specialties.length > 0 ? listing.specialties : ['Alterations', 'Custom Stitching'],
    pricing,
    startingPrice: pricing,
    experienceYears: listing.experienceYears,
    averageRating: listing.averageRating,
    reviewCount: listing.reviewCount,
    bio: `${listing.businessName} — trusted tailoring in ${listing.locality}, Mumbai. Walk-ins welcome.`,
    sourceKey: listing.sourceKey,
    isActive: true,
    approvalStatus: SEED_APPROVE ? 'approved' : 'pending',
  };

  return TailorProfile.findOneAndUpdate(
    { $or: [{ sourceKey: listing.sourceKey }, { user: user._id }] },
    { $set: update },
    { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
  );
}

const CATEGORY_MAP = {
  Lehenga: 'Ethnic',
  Blouse: 'Ethnic',
  'Saree Blouse': 'Ethnic',
  Bridal: 'Ethnic',
  Suits: 'Formal',
  'Formal Wear': 'Formal',
  Blazers: 'Formal',
  Trousers: 'Formal',
  Sherwani: 'Ethnic',
  Alterations: 'Alterations',
  Hemming: 'Alterations',
  Gowns: 'Western Wear',
  'Western Wear': 'Western Wear',
  'Designer Wear': 'Designer',
  Kidswear: 'Kidswear',
  Uniforms: 'Uniforms',
};

async function upsertServices(profile, listing) {
  if (!SEED_APPROVE) return 0;

  const specs = listing.specialties.length ? listing.specialties : ['Alterations'];
  const base = listing.pricing || 499;
  let created = 0;

  for (const spec of specs.slice(0, 3)) {
    const category = CATEGORY_MAP[spec] || 'Custom';
    const price = Math.round(base * (spec === 'Alterations' || spec === 'Hemming' ? 0.6 : 1.2));
    const name = `${spec} — ${listing.locality}`;

    await Service.findOneAndUpdate(
      { tailor: profile._id, name },
      {
        $set: {
          tailor: profile._id,
          name,
          description: `${spec} by ${listing.businessName} in ${listing.locality}.`,
          category,
          price: Math.max(299, price),
          turnaroundDays: spec === 'Alterations' ? 2 : 5,
          approvalStatus: 'approved',
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    created += 1;
  }

  return created;
}

async function main() {
  console.log('— SewMumbai live tailor seed —');
  if (DRY_RUN) console.log('DRY RUN: no database writes.');

  const listings = await getListings();
  console.log(`Parsed ${listings.length} listing(s)`);

  listings.forEach((l, i) => {
    console.log(
      `  ${i + 1}. ${l.businessName} · ${l.locality} · ₹${l.pricing} · ★${l.averageRating}`
    );
  });

  if (listings.length === 0) return;
  if (DRY_RUN) {
    console.log('Dry run complete.');
    return;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set');
  await mongoose.connect(uri);
  console.log(`MongoDB connected: ${mongoose.connection.host}`);

  let newUsers = 0;
  let profiles = 0;
  let services = 0;

  for (const listing of listings) {
    const email = `live.${slugify(listing.businessName)}.${slugify(listing.locality)}@seed.sewmumbai.local`;
    const existed = await User.exists({ email });

    const user = await ensureTailorUser(listing);
    if (!existed) newUsers += 1;

    const profile = await upsertTailorProfile(user, listing);
    profiles += 1;
    services += await upsertServices(profile, listing);
  }

  console.log(`\nDone. New users: ${newUsers}. Profiles upserted: ${profiles}. Services upserted: ${services}.`);
}

main()
  .catch((err) => {
    console.error('seedLiveTailors failed:', err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  });
