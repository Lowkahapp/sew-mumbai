const MAX_BYTES = 750_000;
const ALLOWED = /^data:image\/(jpeg|jpg|png|webp);base64,/i;

/** Validate base64 data-URL image and return normalized string or throw. */
export function normalizeImageData(value) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error('Image data is required');
  }
  const trimmed = value.trim();
  if (!ALLOWED.test(trimmed)) {
    throw new Error('Only JPEG, PNG, or WebP images are allowed');
  }
  const base64 = trimmed.split(',')[1];
  if (!base64) {
    throw new Error('Invalid image data');
  }
  const bytes = Math.ceil((base64.length * 3) / 4);
  if (bytes > MAX_BYTES) {
    throw new Error('Image must be under 750 KB');
  }
  return trimmed;
}

/** Accept uploaded base64 or a normal https URL. */
export function resolveImageSource({ imageData, imageUrl }) {
  if (imageData) return normalizeImageData(imageData);
  if (typeof imageUrl === 'string' && imageUrl.trim()) return imageUrl.trim();
  return '';
}
