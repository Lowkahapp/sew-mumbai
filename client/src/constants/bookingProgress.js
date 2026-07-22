/** In-production progress steps after a booking is accepted. */
export const PROGRESS_STEPS = [
  { key: 'accepted', label: 'Request accepted', shortLabel: 'Accepted' },
  { key: 'fabric_received', label: 'Fabric received / measured', shortLabel: 'Measured' },
  { key: 'stitching', label: 'Stitching in progress', shortLabel: 'Stitching' },
  { key: 'ready', label: 'Ready for delivery', shortLabel: 'Ready' },
];

export function getProgressStepCount(booking) {
  const status = booking?.status;
  if (status === 'completed') return PROGRESS_STEPS.length;
  if (status !== 'accepted') return 0;

  const order = PROGRESS_STEPS.map((s) => s.key);
  const stage = booking?.progressStage || 'accepted';
  const idx = order.indexOf(stage);
  if (idx < 0) return 1;
  return idx + 1;
}

export function canShowProgressTracker(booking) {
  return ['requested', 'accepted', 'completed'].includes(booking?.status);
}

export function nextProgressStage(current) {
  const order = PROGRESS_STEPS.map((s) => s.key);
  const idx = order.indexOf(current);
  if (idx < 0 || idx >= order.length - 1) return null;
  return order[idx + 1];
}

export function nextProgressStepLabel(current) {
  const next = nextProgressStage(current || 'accepted');
  if (!next) return null;
  return PROGRESS_STEPS.find((s) => s.key === next)?.label || null;
}
