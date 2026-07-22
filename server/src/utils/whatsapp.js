/** Normalize Indian mobile numbers to 10 digits, or return null if invalid. */
export function normalizeWhatsAppNumber(value) {
  if (value === undefined || value === null) return undefined;
  const trimmed = String(value).trim();
  if (!trimmed) return '';

  const digits = trimmed.replace(/\D/g, '');
  if (digits.length === 10) return digits;
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);

  return null;
}

export function whatsAppUrl(number, message = '') {
  const digits = normalizeWhatsAppNumber(number);
  if (!digits) return null;
  const base = `https://wa.me/91${digits}`;
  if (message) return `${base}?text=${encodeURIComponent(message)}`;
  return base;
}
