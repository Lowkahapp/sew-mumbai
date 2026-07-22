/**
 * seedLiveTailors.js
 *
 * Isolated scraper/seed script:
 * 1. Fetches a tailor directory page (Axios)
 * 2. Parses listings (Cheerio)
 * 3. Ensures placeholder User docs with role "tailor"
 * 4. Upserts TailorProfile (businessName, locality, specialties, pricing)
 *
 * Usage (from server/):
 *   npm run seed:live
 *   SCRAPE_URL=https://example.com/tailors npm run seed:live
 *   node src/scripts/seedLiveTailors.js --dry-run
 *
 * Env:
 *   MONGODB_URI   — required
 *   SCRAPE_URL    — optional; if omitted, parses embedded demo HTML via Cheerio
 *   SEED_APPROVE  — "true" to mark scraped profiles approved (default true for live seed)
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import TailorProfile from '../models/TailorProfile.js';
import { LOCALITIES } from '../constants/localities.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const DRY_RUN = process.argv.includes('--dry-run');
const PLACEHOLDER_PASSWORD = 'TailorSeed123!';
const SEED_APPROVE = String(process.env.SEED_APPROVE ?? 'true').toLowerCase() !== 'false';

/** Demo directory HTML used when SCRAPE_URL is not set (still parsed with Cheerio). */
const DEMO_DIRECTORY_HTML = `
<!DOCTYPE html>
<html>
<body>
  <div class="tailor-listing" data-business-name="Bandra Stitch Atelier" data-locality="Bandra"
       data-specialties="Lehenga, Blouse, Alterations" data-pricing="899">
    <h2 class="business-name">Bandra Stitch Atelier</h2>
    <span class="locality">Bandra</span>
  </div>
  <div class="tailor-listing" data-business-name="Andheri Custom Fits" data-locality="Andheri"
       data-specialties="Suits, Formal Wear, Alterations" data-pricing="749">
    <h2 class="business-name">Andheri Custom Fits</h2>
    <span class="locality">Andheri</span>
  </div>
  <div class="tailor-listing" data-business-name="Powai Thread House" data-locality="Powai"
       data-specialties="Saree Blouse, Lehenga, Gowns" data-pricing="999">
    <h2 class="business-name">Powai Thread House</h2>
    <span class="locality">Powai</span>
  </div>
  <div class="tailor-listing" data-business-name="Dadar Heritage Tailors" data-locality="Dadar"
       data-specialties="Alterations, Sherwani, Suits" data-pricing="599">
    <h2 class="business-name">Dadar Heritage Tailors</h2>
    <span class="locality">Dadar</span>
  </div>
  <div class="tailor-listing" data-business-name="Juhu Couture Corner" data-locality="Juhu"
       data-specialties="Lehenga, Western Wear, Suits" data-pricing="1299">
    <h2 class="business-name">Juhu Couture Corner</h2>
    <span class="locality">Juhu</span>
  </div>
  <article class="listing-card">
    <h3 class="name">Worli Needle &amp; Thread</h3>
    <p class="area">Worli</p>
    <p class="tags">Alterations, Suits</p>
    <p class="price">From ₹650</p>
  </article>
</body>
</html>
`;

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
  if (Array.isArray(raw)) {
    return raw.map((s) => String(s).trim()).filter(Boolean);
  }
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

/**
 * Fetch HTML from SCRAPE_URL (Axios) or fall back to demo markup.
 */
async function fetchDirectoryHtml() {
  const url = process.env.SCRAPE_URL?.trim();
  if (!url) {
    console.log('SCRAPE_URL not set — parsing embedded demo directory HTML with Cheerio.');
    return { html: DEMO_DIRECTORY_HTML, source: 'demo-embedded' };
  }

  console.log(`Fetching directory: ${url}`);
  const { data } = await axios.get(url, {
    timeout: 20000,
    headers: {
      'User-Agent':
        'SewMumbaiSeedBot/1.0 (+local research; contact admin@sewmumbai.local)',
      Accept: 'text/html,application/xhtml+xml',
    },
    // Do not follow to non-http schemes; keep this script polite and isolated.
    maxRedirects: 3,
    validateStatus: (status) => status >= 200 && status < 400,
  });

  if (typeof data !== 'string') {
    throw new Error('SCRAPE_URL did not return HTML text');
  }

  return { html: data, source: url };
}

/**
 * Parse listings with Cheerio.
 * Supports:
 *  - .tailor-listing[data-*] cards
 *  - .listing-card with .name / .area / .tags / .price
 *  - generic [data-business-name] nodes
 */
function parseListings(html, sourceLabel) {
  const $ = cheerio.load(html);
  const listings = [];
  const seen = new Set();

  const push = (item) => {
    const businessName = String(item.businessName || '').trim();
    const locality = normalizeLocality(item.locality);
    if (!businessName || !locality) return;

    const sourceKey = `live:${slugify(businessName)}:${slugify(locality)}`;
    if (seen.has(sourceKey)) return;
    seen.add(sourceKey);

    listings.push({
      businessName,
      locality,
      specialties: parseSpecialties(item.specialties),
      pricing: parsePricing(item.pricing),
      sourceKey,
      source: sourceLabel,
    });
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

  user = await User.create({
    name: listing.businessName,
    email,
    password: PLACEHOLDER_PASSWORD,
    phone: '',
    role: 'tailor',
  });

  return user;
}

async function upsertTailorProfile(user, listing) {
  const pricing = listing.pricing || 0;
  const update = {
    user: user._id,
    businessName: listing.businessName,
    locality: listing.locality,
    specialties:
      listing.specialties.length > 0 ? listing.specialties : ['Alterations', 'Custom Stitching'],
    pricing,
    startingPrice: pricing,
    bio: `${listing.businessName} — tailor services in ${listing.locality}, Mumbai.`,
    sourceKey: listing.sourceKey,
    isActive: true,
    ...(SEED_APPROVE ? { approvalStatus: 'approved' } : { approvalStatus: 'pending' }),
  };

  const profile = await TailorProfile.findOneAndUpdate(
    { $or: [{ sourceKey: listing.sourceKey }, { user: user._id }] },
    { $set: update },
    { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
  );

  return profile;
}

async function connectMongo() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set (check server/.env)');
  }
  await mongoose.connect(uri);
  console.log(`MongoDB connected: ${mongoose.connection.host}`);
}

async function main() {
  console.log('— SewMumbai live tailor seed —');
  if (DRY_RUN) console.log('DRY RUN: will parse listings but not write to MongoDB.');

  const { html, source } = await fetchDirectoryHtml();
  const listings = parseListings(html, source);
  console.log(`Parsed ${listings.length} listing(s) from ${source}`);

  if (listings.length === 0) {
    console.warn(
      'No listings matched. Ensure the page uses .tailor-listing[data-*] or .listing-card markup.'
    );
    return;
  }

  listings.forEach((l, i) => {
    console.log(
      `  ${i + 1}. ${l.businessName} · ${l.locality} · ₹${l.pricing} · [${l.specialties.join(', ')}]`
    );
  });

  if (DRY_RUN) {
    console.log('Dry run complete — no database changes.');
    return;
  }

  await connectMongo();

  let createdUsers = 0;
  let upsertedProfiles = 0;

  for (const listing of listings) {
    const existingEmail = `live.${slugify(listing.businessName)}.${slugify(listing.locality)}@seed.sewmumbai.local`;
    const existed = await User.exists({ email: existingEmail });

    const user = await ensureTailorUser(listing);
    if (!existed) createdUsers += 1;

    await upsertTailorProfile(user, listing);
    upsertedProfiles += 1;
  }

  console.log(`Done. Placeholder users created: ${createdUsers}. Profiles upserted: ${upsertedProfiles}.`);
  console.log(
    SEED_APPROVE
      ? 'Profiles marked approvalStatus=approved (searchable).'
      : 'Profiles left pending admin approval.'
  );
}

main()
  .catch((err) => {
    console.error('seedLiveTailors failed:', err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });
