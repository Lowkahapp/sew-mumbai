/**
 * Mumbai neighborhoods with map coordinates (approximate centers).
 * `legacyAliases` — older locality strings still stored on some tailor profiles.
 */
export const MUMBAI_BOUNDS = {
  minLat: 18.89,
  maxLat: 19.27,
  minLng: 72.77,
  maxLng: 72.98,
};

export const NEIGHBORHOODS = [
  { id: 'colaba', label: 'Colaba', zone: 'South Mumbai', lat: 18.9067, lng: 72.8147, legacyAliases: ['Colaba'] },
  { id: 'fort', label: 'Fort', zone: 'South Mumbai', lat: 18.9322, lng: 72.8358, legacyAliases: ['Fort'] },
  { id: 'marine-lines', label: 'Marine Lines', zone: 'South Mumbai', lat: 18.9433, lng: 72.8238, legacyAliases: ['Marine Lines'] },
  { id: 'churchgate', label: 'Churchgate', zone: 'South Mumbai', lat: 18.932, lng: 72.8264, legacyAliases: [] },
  { id: 'lower-parel', label: 'Lower Parel', zone: 'South Mumbai', lat: 18.997, lng: 72.828, legacyAliases: ['Lower Parel'] },
  { id: 'worli', label: 'Worli', zone: 'South Mumbai', lat: 19.017, lng: 72.817, legacyAliases: ['Worli'] },
  { id: 'byculla', label: 'Byculla', zone: 'South Mumbai', lat: 18.974, lng: 72.833, legacyAliases: ['Byculla'] },
  { id: 'pedder-road', label: 'Pedder Road', zone: 'South Mumbai', lat: 18.968, lng: 72.809, legacyAliases: ['Pedder Road'] },

  { id: 'dadar-west', label: 'Dadar West', zone: 'Central Mumbai', lat: 19.017, lng: 72.847, legacyAliases: ['Dadar'] },
  { id: 'dadar-east', label: 'Dadar East', zone: 'Central Mumbai', lat: 19.018, lng: 72.856, legacyAliases: [] },
  { id: 'parel', label: 'Parel', zone: 'Central Mumbai', lat: 19.007, lng: 72.841, legacyAliases: ['Parel'] },
  { id: 'matunga', label: 'Matunga', zone: 'Central Mumbai', lat: 19.023, lng: 72.855, legacyAliases: ['Matunga'] },
  { id: 'sion', label: 'Sion', zone: 'Central Mumbai', lat: 19.043, lng: 72.864, legacyAliases: ['Sion'] },
  { id: 'mahim', label: 'Mahim', zone: 'Central Mumbai', lat: 19.035, lng: 72.839, legacyAliases: ['Mahim'] },
  { id: 'wadala', label: 'Wadala', zone: 'Central Mumbai', lat: 19.021, lng: 72.867, legacyAliases: [] },

  { id: 'bandra-west', label: 'Bandra West', zone: 'Western Suburbs', lat: 19.061, lng: 72.829, legacyAliases: ['Bandra'] },
  { id: 'bandra-east', label: 'Bandra East', zone: 'Western Suburbs', lat: 19.054, lng: 72.849, legacyAliases: [] },
  { id: 'khar', label: 'Khar', zone: 'Western Suburbs', lat: 19.069, lng: 72.836, legacyAliases: ['Khar'] },
  { id: 'santacruz-west', label: 'Santacruz West', zone: 'Western Suburbs', lat: 19.082, lng: 72.836, legacyAliases: ['Santacruz'] },
  { id: 'santacruz-east', label: 'Santacruz East', zone: 'Western Suburbs', lat: 19.081, lng: 72.851, legacyAliases: [] },
  { id: 'vile-parle', label: 'Vile Parle', zone: 'Western Suburbs', lat: 19.099, lng: 72.843, legacyAliases: ['Vile Parle'] },
  { id: 'andheri-west', label: 'Andheri West', zone: 'Western Suburbs', lat: 19.136, lng: 72.829, legacyAliases: ['Andheri'] },
  { id: 'andheri-east', label: 'Andheri East', zone: 'Western Suburbs', lat: 19.113, lng: 72.869, legacyAliases: [] },
  { id: 'versova', label: 'Versova', zone: 'Western Suburbs', lat: 19.128, lng: 72.812, legacyAliases: ['Versova'] },
  { id: 'lokhandwala', label: 'Lokhandwala', zone: 'Western Suburbs', lat: 19.144, lng: 72.823, legacyAliases: ['Lokhandwala'] },
  { id: 'juhu', label: 'Juhu', zone: 'Western Suburbs', lat: 19.107, lng: 72.826, legacyAliases: ['Juhu'] },
  { id: 'goregaon-west', label: 'Goregaon West', zone: 'Western Suburbs', lat: 19.155, lng: 72.849, legacyAliases: ['Goregaon'] },
  { id: 'goregaon-east', label: 'Goregaon East', zone: 'Western Suburbs', lat: 19.166, lng: 72.862, legacyAliases: [] },
  { id: 'malad-west', label: 'Malad West', zone: 'Western Suburbs', lat: 19.186, lng: 72.848, legacyAliases: ['Malad'] },
  { id: 'malad-east', label: 'Malad East', zone: 'Western Suburbs', lat: 19.187, lng: 72.857, legacyAliases: [] },
  { id: 'kandivali-west', label: 'Kandivali West', zone: 'Western Suburbs', lat: 19.203, lng: 72.846, legacyAliases: ['Kandivali'] },
  { id: 'kandivali-east', label: 'Kandivali East', zone: 'Western Suburbs', lat: 19.205, lng: 72.872, legacyAliases: [] },
  { id: 'borivali-west', label: 'Borivali West', zone: 'Western Suburbs', lat: 19.229, lng: 72.857, legacyAliases: ['Borivali'] },
  { id: 'borivali-east', label: 'Borivali East', zone: 'Western Suburbs', lat: 19.231, lng: 72.868, legacyAliases: [] },
  { id: 'dahisar', label: 'Dahisar', zone: 'Western Suburbs', lat: 19.252, lng: 72.859, legacyAliases: [] },

  { id: 'powai', label: 'Powai', zone: 'Eastern Suburbs', lat: 19.117, lng: 72.905, legacyAliases: ['Powai'] },
  { id: 'chembur', label: 'Chembur', zone: 'Eastern Suburbs', lat: 19.052, lng: 72.899, legacyAliases: ['Chembur'] },
  { id: 'ghatkopar', label: 'Ghatkopar', zone: 'Eastern Suburbs', lat: 19.086, lng: 72.908, legacyAliases: ['Ghatkopar'] },
  { id: 'kurla', label: 'Kurla', zone: 'Eastern Suburbs', lat: 19.066, lng: 72.879, legacyAliases: ['Kurla'] },
  { id: 'bhandup', label: 'Bhandup', zone: 'Eastern Suburbs', lat: 19.143, lng: 72.936, legacyAliases: ['Bhandup'] },
  { id: 'mulund', label: 'Mulund', zone: 'Eastern Suburbs', lat: 19.172, lng: 72.956, legacyAliases: ['Mulund'] },
  { id: 'thane', label: 'Thane', zone: 'Thane', lat: 19.218, lng: 72.978, legacyAliases: ['Thane'] },
];

const byLabel = new Map();
const byId = new Map();

for (const n of NEIGHBORHOODS) {
  byLabel.set(n.label.toLowerCase(), n);
  byId.set(n.id, n);
  for (const alias of n.legacyAliases) {
    byLabel.set(alias.toLowerCase(), n);
  }
}

/** All valid locality strings for mongoose enum (neighborhoods + legacy aliases). */
export const LOCALITIES = [
  ...new Set([
    ...NEIGHBORHOODS.map((n) => n.label),
    ...NEIGHBORHOODS.flatMap((n) => n.legacyAliases),
  ]),
].sort();

export function getNeighborhood(input) {
  if (!input) return null;
  return byLabel.get(String(input).trim().toLowerCase()) || null;
}

export function getNeighborhoodById(id) {
  return byId.get(id) || null;
}

export function localityMatchValues(input) {
  const n = getNeighborhood(input);
  if (!n) return [String(input).trim()];
  return [...new Set([n.label, ...n.legacyAliases])];
}

export function resolveCoordinates(locality) {
  const n = getNeighborhood(locality);
  if (!n) return null;
  return { lat: n.lat, lng: n.lng };
}

export function listNeighborhoodsByZone() {
  const zones = {};
  for (const n of NEIGHBORHOODS) {
    if (!zones[n.zone]) zones[n.zone] = [];
    zones[n.zone].push(n);
  }
  return Object.entries(zones).map(([zone, neighborhoods]) => ({ zone, neighborhoods }));
}

export function projectToMap(lat, lng, width = 320, height = 380) {
  const { minLat, maxLat, minLng, maxLng } = MUMBAI_BOUNDS;
  const x = ((lng - minLng) / (maxLng - minLng)) * width;
  const y = ((maxLat - lat) / (maxLat - minLat)) * height;
  return { x, y };
}

export function distanceKm(lat1, lng1, lat2, lng2) {
  const r = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return r * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default NEIGHBORHOODS;
