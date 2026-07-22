/** Garment measurement templates + how-to-measure guides (inches by default). */
export const GARMENT_TYPES = ['blouse', 'shirt', 'pants'];

export const MEASUREMENT_TEMPLATES = {
  blouse: {
    key: 'blouse',
    label: 'Blouse',
    description: 'Saree blouse, choli, or fitted top',
    unit: 'in',
    fields: [
      { key: 'bust', label: 'Bust', hint: 'Fullest part of chest, tape parallel to floor' },
      { key: 'underBust', label: 'Under bust', hint: 'Directly under the bust line' },
      { key: 'waist', label: 'Waist', hint: 'Natural waist, usually narrowest point' },
      { key: 'shoulder', label: 'Shoulder width', hint: 'Bone to bone across back' },
      { key: 'armhole', label: 'Armhole', hint: 'Around shoulder joint where sleeve joins' },
      { key: 'sleeveLength', label: 'Sleeve length', hint: 'Shoulder point to wrist bone' },
      { key: 'blouseLength', label: 'Blouse length', hint: 'Shoulder to desired hem' },
      { key: 'frontNeckDepth', label: 'Front neck depth', hint: 'Collar bone to desired neckline' },
      { key: 'backNeckDepth', label: 'Back neck depth', hint: 'Nape to desired back neckline' },
    ],
    steps: [
      'Stand straight in well-fitting innerwear. Keep the measuring tape snug, not tight.',
      'Bust: measure around the fullest part of the chest, keeping the tape level.',
      'Under bust: measure directly under the bust line.',
      'Waist: measure at the natural waist (narrowest part).',
      'Shoulder: measure from one shoulder bone to the other across the back.',
      'Armhole: measure around the shoulder joint where the sleeve would attach.',
      'Sleeve length: from shoulder point down the arm to the wrist bone.',
      'Blouse length: from shoulder down to where you want the blouse to end.',
      'Neck depth: measure from collar bone (front) or nape (back) to desired neckline.',
    ],
  },
  shirt: {
    key: 'shirt',
    label: 'Shirt',
    description: 'Formal shirt, kurta shirt, or casual top',
    unit: 'in',
    fields: [
      { key: 'neck', label: 'Neck', hint: 'Around base of neck where collar sits' },
      { key: 'chest', label: 'Chest', hint: 'Fullest part, tape under arms' },
      { key: 'waist', label: 'Waist', hint: 'At belly button level' },
      { key: 'shoulder', label: 'Shoulder', hint: 'Bone to bone across back' },
      { key: 'sleeveLength', label: 'Sleeve length', hint: 'Shoulder to wrist along bent arm' },
      { key: 'shirtLength', label: 'Shirt length', hint: 'Base of neck to desired hem' },
      { key: 'bicep', label: 'Bicep', hint: 'Fullest part of upper arm' },
      { key: 'wrist', label: 'Wrist', hint: 'Around wrist bone' },
    ],
    steps: [
      'Wear a thin T-shirt. Relax arms naturally at your sides.',
      'Neck: wrap tape around the base of the neck where the collar would button.',
      'Chest: measure around the fullest part, keeping tape under the arms and level.',
      'Waist: measure around the belly button level.',
      'Shoulder: measure straight across from shoulder bone to shoulder bone.',
      'Sleeve: bend arm slightly; measure from shoulder point to wrist bone.',
      'Shirt length: from the base of the neck (back) down to desired shirt hem.',
      'Bicep: measure around the fullest part of the upper arm.',
      'Wrist: measure around the wrist bone for cuff sizing.',
    ],
  },
  pants: {
    key: 'pants',
    label: 'Pants',
    description: 'Trousers, salwar, or formal pants',
    unit: 'in',
    fields: [
      { key: 'waist', label: 'Waist', hint: 'Where the waistband will sit' },
      { key: 'hip', label: 'Hip', hint: 'Fullest part of seat, tape parallel to floor' },
      { key: 'thigh', label: 'Thigh', hint: 'Fullest part, 2–3 in below crotch' },
      { key: 'knee', label: 'Knee', hint: 'Around the knee cap' },
      { key: 'inseam', label: 'Inseam', hint: 'Crotch seam to ankle bone' },
      { key: 'outseam', label: 'Outseam / length', hint: 'Waist to ankle along outer leg' },
      { key: 'rise', label: 'Front rise', hint: 'Waist front to crotch seam' },
      { key: 'ankle', label: 'Ankle / bottom', hint: 'Around ankle or desired hem width' },
    ],
    steps: [
      'Wear well-fitting pants or innerwear. Stand with feet shoulder-width apart.',
      'Waist: measure where you want the waistband to sit (natural waist or lower).',
      'Hip: measure around the fullest part of the seat, keeping tape level.',
      'Thigh: measure around the fullest part of the thigh, about 2–3 inches below the crotch.',
      'Knee: measure around the knee cap with leg straight.',
      'Inseam: measure from the crotch seam down the inner leg to the ankle bone.',
      'Outseam: measure from the waist down the outer leg to the ankle.',
      'Front rise: measure from the front waist down to the crotch seam.',
      'Ankle: measure around the ankle or desired bottom opening width.',
    ],
  },
};

export function getTemplate(garmentType) {
  return MEASUREMENT_TEMPLATES[garmentType] || null;
}

export function listTemplates() {
  return GARMENT_TYPES.map((key) => MEASUREMENT_TEMPLATES[key]);
}
