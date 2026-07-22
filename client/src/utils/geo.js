export const MUMBAI_BOUNDS = {
  minLat: 18.89,
  maxLat: 19.27,
  minLng: 72.77,
  maxLng: 72.98,
};

export function projectToMap(lat, lng, width = 320, height = 380) {
  const { minLat, maxLat, minLng, maxLng } = MUMBAI_BOUNDS;
  return {
    x: ((lng - minLng) / (maxLng - minLng)) * width,
    y: ((maxLat - lat) / (maxLat - minLat)) * height,
  };
}

export function formatDistance(km) {
  if (km == null) return null;
  if (km < 1) return `${Math.round(km * 1000)} m away`;
  return `${km.toFixed(1)} km away`;
}
