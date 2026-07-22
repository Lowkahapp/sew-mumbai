/** In-production progress steps after a booking is accepted. */
export const PROGRESS_STEPS = [
  { key: 'accepted', label: 'Request accepted', shortLabel: 'Accepted' },
  { key: 'fabric_received', label: 'Fabric received / measured', shortLabel: 'Measured' },
  { key: 'stitching', label: 'Stitching in progress', shortLabel: 'Stitching' },
  { key: 'ready', label: 'Ready for delivery', shortLabel: 'Ready' },
];

export const PROGRESS_STAGE_ORDER = PROGRESS_STEPS.map((s) => s.key);

export function nextProgressStage(current) {
  const idx = PROGRESS_STAGE_ORDER.indexOf(current);
  if (idx < 0 || idx >= PROGRESS_STAGE_ORDER.length - 1) return null;
  return PROGRESS_STAGE_ORDER[idx + 1];
}

/** Number of completed steps (0–4) for the visual tracker. */
export function getProgressStepCount(booking) {
  const status = booking?.status;
  if (status === 'completed') return PROGRESS_STEPS.length;
  if (status !== 'accepted') return 0;

  const stage = booking?.progressStage || 'accepted';
  const idx = PROGRESS_STAGE_ORDER.indexOf(stage);
  if (idx < 0) return 1;
  return idx + 1;
}

export function getProgressLabel(stage) {
  return PROGRESS_STEPS.find((s) => s.key === stage)?.label || stage;
}

export function canShowProgressTracker(booking) {
  return ['requested', 'accepted', 'completed'].includes(booking?.status);
}
