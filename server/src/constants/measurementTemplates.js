/** Garment measurement templates + how-to-measure guides (inches by default). */
export const GARMENT_TYPES = ['blouse', 'shirt', 'pants'];

export const MEASUREMENT_TEMPLATES = {
  blouse: {
    key: 'blouse',
    label: 'Blouse',
    description: 'Saree blouse, choli, or fitted top',
    unit: 'in',
    fields: [
      {
        key: 'bust',
        label: 'Bust',
        hint: 'Fullest part of chest, tape parallel to floor',
        guide: 'Wrap the tape around the fullest part of your chest. Keep it level across your back and under your arms. Breathe normally — the tape should be snug, not tight.',
      },
      {
        key: 'underBust',
        label: 'Under bust',
        hint: 'Directly under the bust line',
        guide: 'Measure directly under the bust where the blouse band would sit. Keep the tape horizontal all the way around.',
      },
      {
        key: 'waist',
        label: 'Waist',
        hint: 'Natural waist, usually narrowest point',
        guide: 'Find your natural waist — the narrowest part of your torso. Measure around it without sucking in.',
      },
      {
        key: 'shoulder',
        label: 'Shoulder width',
        hint: 'Bone to bone across back',
        guide: 'Measure from the edge of one shoulder bone to the other across your upper back. This sets the blouse fit at the yoke.',
      },
      {
        key: 'armhole',
        label: 'Armhole',
        hint: 'Around shoulder joint where sleeve joins',
        guide: 'Measure around the shoulder joint where the sleeve attaches. Keep the tape close to the body without pinching.',
      },
      {
        key: 'sleeveLength',
        label: 'Sleeve length',
        hint: 'Shoulder point to wrist bone',
        guide: 'From the shoulder point down the outer arm to the wrist bone. Bend the arm slightly for a natural fit.',
      },
      {
        key: 'blouseLength',
        label: 'Blouse length',
        hint: 'Shoulder to desired hem',
        guide: 'Measure from the shoulder seam down to where you want the blouse to end — usually at the waist or below.',
      },
      {
        key: 'frontNeckDepth',
        label: 'Front neck depth',
        hint: 'Collar bone to desired neckline',
        guide: 'From the collar bone straight down to your desired front neckline depth.',
      },
      {
        key: 'backNeckDepth',
        label: 'Back neck depth',
        hint: 'Nape to desired back neckline',
        guide: 'From the nape of the neck down to your desired back neckline depth.',
      },
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
      {
        key: 'neck',
        label: 'Neck',
        hint: 'Around base of neck where collar sits',
        guide: 'Wrap the tape around the base of your neck where the shirt collar would button. Leave room for one finger inside.',
      },
      {
        key: 'chest',
        label: 'Chest',
        hint: 'Fullest part, tape under arms',
        guide: 'Measure around the fullest part of your chest with the tape under your arms and parallel to the floor.',
      },
      {
        key: 'waist',
        label: 'Waist',
        hint: 'At belly button level',
        guide: 'Measure around your waist at belly button level. This helps tailors taper the shirt correctly.',
      },
      {
        key: 'shoulder',
        label: 'Shoulder',
        hint: 'Bone to bone across back',
        guide: 'Measure straight across from one shoulder bone to the other across your upper back.',
      },
      {
        key: 'sleeveLength',
        label: 'Sleeve length',
        hint: 'Shoulder to wrist along bent arm',
        guide: 'With a slightly bent arm, measure from the shoulder point to the wrist bone along the outer arm.',
      },
      {
        key: 'shirtLength',
        label: 'Shirt length',
        hint: 'Base of neck to desired hem',
        guide: 'From the base of the neck at the back down to where you want the shirt hem to fall.',
      },
      {
        key: 'bicep',
        label: 'Bicep',
        hint: 'Fullest part of upper arm',
        guide: 'Measure around the fullest part of your upper arm with the arm relaxed at your side.',
      },
      {
        key: 'wrist',
        label: 'Wrist',
        hint: 'Around wrist bone',
        guide: 'Measure around the wrist bone for accurate cuff sizing.',
      },
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
      {
        key: 'waist',
        label: 'Waist',
        hint: 'Where the waistband will sit',
        guide: 'Measure where you want the waistband to sit — natural waist or slightly lower. Keep the tape snug and level.',
      },
      {
        key: 'hip',
        label: 'Hip',
        hint: 'Fullest part of seat, tape parallel to floor',
        guide: 'Measure around the fullest part of your hips and seat, keeping the tape parallel to the floor.',
      },
      {
        key: 'thigh',
        label: 'Thigh',
        hint: 'Fullest part, 2–3 in below crotch',
        guide: 'Measure around the fullest part of the thigh, about 2–3 inches below the crotch point.',
      },
      {
        key: 'knee',
        label: 'Knee',
        hint: 'Around the knee cap',
        guide: 'With your leg straight, measure around the knee cap for tapered pant fits.',
      },
      {
        key: 'inseam',
        label: 'Inseam',
        hint: 'Crotch seam to ankle bone',
        guide: 'Measure from the crotch seam down the inner leg to the ankle bone. Best taken from a well-fitting pair of pants.',
      },
      {
        key: 'outseam',
        label: 'Outseam / length',
        hint: 'Waist to ankle along outer leg',
        guide: 'Measure from the waist down the outer leg to the ankle for total pant length.',
      },
      {
        key: 'rise',
        label: 'Front rise',
        hint: 'Waist front to crotch seam',
        guide: 'Measure from the front waist down to the crotch seam. This sets how high the pants sit.',
      },
      {
        key: 'ankle',
        label: 'Ankle / bottom',
        hint: 'Around ankle or desired hem width',
        guide: 'Measure around the ankle or your desired bottom opening width for slim or straight cuts.',
      },
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
