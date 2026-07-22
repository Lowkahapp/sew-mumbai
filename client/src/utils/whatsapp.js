function normalizeDigits(value) {
  const trimmed = String(value || '').trim();
  if (!trimmed) return '';
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length === 10) return digits;
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  return '';
}

export function formatWhatsAppDisplay(number) {
  const digits = normalizeDigits(number);
  if (!digits) return '';
  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
}

export function whatsAppHref(number, message = '') {
  const digits = normalizeDigits(number);
  if (!digits) return null;
  const base = `https://wa.me/91${digits}`;
  if (message) return `${base}?text=${encodeURIComponent(message)}`;
  return base;
}
