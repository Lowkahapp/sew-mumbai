/** SVG diagram markers per garment field — viewBox 0 0 240 320. */
export const MEASUREMENT_DIAGRAMS = {
  blouse: {
    viewBox: '0 0 240 320',
    title: 'Blouse — front view',
    markers: {
      bust: { x1: 78, y1: 108, x2: 162, y2: 108, lx: 120, ly: 98, label: 'Bust' },
      underBust: { x1: 82, y1: 122, x2: 158, y2: 122, lx: 120, ly: 112, label: 'Under bust' },
      waist: { x1: 90, y1: 138, x2: 150, y2: 138, lx: 120, ly: 128, label: 'Waist' },
      shoulder: { x1: 88, y1: 72, x2: 152, y2: 72, lx: 120, ly: 62, label: 'Shoulder' },
      armhole: { x1: 72, y1: 95, x2: 72, y2: 125, lx: 58, ly: 110, label: 'Armhole' },
      sleeveLength: { x1: 68, y1: 72, x2: 48, y2: 195, lx: 38, ly: 135, label: 'Sleeve' },
      blouseLength: { x1: 120, y1: 68, x2: 120, y2: 155, lx: 132, ly: 112, label: 'Length' },
      frontNeckDepth: { x1: 120, y1: 55, x2: 120, y2: 82, lx: 138, ly: 68, label: 'Front neck' },
      backNeckDepth: { x1: 120, y1: 48, x2: 120, y2: 65, lx: 138, ly: 52, label: 'Back neck' },
    },
  },
  shirt: {
    viewBox: '0 0 240 320',
    title: 'Shirt — front view',
    markers: {
      neck: { x1: 105, y1: 52, x2: 135, y2: 52, lx: 120, ly: 42, label: 'Neck' },
      chest: { x1: 82, y1: 105, x2: 158, y2: 105, lx: 120, ly: 95, label: 'Chest' },
      waist: { x1: 88, y1: 145, x2: 152, y2: 145, lx: 120, ly: 135, label: 'Waist' },
      shoulder: { x1: 90, y1: 68, x2: 150, y2: 68, lx: 120, ly: 58, label: 'Shoulder' },
      sleeveLength: { x1: 55, y1: 68, x2: 42, y2: 188, lx: 28, ly: 130, label: 'Sleeve' },
      shirtLength: { x1: 120, y1: 58, x2: 120, y2: 198, lx: 134, ly: 128, label: 'Length' },
      bicep: { x1: 52, y1: 95, x2: 52, y2: 115, lx: 38, ly: 105, label: 'Bicep' },
      wrist: { x1: 38, y1: 178, x2: 38, y2: 192, lx: 22, ly: 185, label: 'Wrist' },
    },
  },
  pants: {
    viewBox: '0 0 240 320',
    title: 'Pants — front view',
    markers: {
      waist: { x1: 92, y1: 48, x2: 148, y2: 48, lx: 120, ly: 38, label: 'Waist' },
      hip: { x1: 86, y1: 78, x2: 154, y2: 78, lx: 120, ly: 68, label: 'Hip' },
      thigh: { x1: 82, y1: 115, x2: 118, y2: 115, lx: 100, ly: 105, label: 'Thigh' },
      knee: { x1: 80, y1: 175, x2: 112, y2: 175, lx: 96, ly: 165, label: 'Knee' },
      inseam: { x1: 120, y1: 120, x2: 105, y2: 275, lx: 128, ly: 200, label: 'Inseam' },
      outseam: { x1: 148, y1: 48, x2: 158, y2: 275, lx: 168, ly: 160, label: 'Outseam' },
      rise: { x1: 120, y1: 48, x2: 120, y2: 118, lx: 134, ly: 82, label: 'Rise' },
      ankle: { x1: 78, y1: 268, x2: 108, y2: 268, lx: 93, ly: 258, label: 'Ankle' },
    },
  },
};

export function getDiagram(garmentType) {
  return MEASUREMENT_DIAGRAMS[garmentType] || null;
}
