const CHECKS = [
  { key: 'shopLicense', label: 'Shop license', hint: 'Local trade / shop establishment proof' },
  { key: 'identityProof', label: 'Identity proof', hint: 'Aadhaar, PAN, or government ID' },
  { key: 'portfolioReview', label: 'Portfolio reviewed', hint: 'Past work samples verified' },
];

export default function VerificationChecklist({ value = {}, onChange, compact = false }) {
  const set = (key, checked) => {
    onChange({ ...value, [key]: checked });
  };

  return (
    <fieldset className={compact ? 'space-y-1.5' : 'space-y-2'}>
      <legend className={`font-semibold text-navy ${compact ? 'text-xs' : 'text-sm'}`}>
        Verification checks
      </legend>
      <p className={`text-navy/50 ${compact ? 'text-[10px]' : 'text-xs'}`}>
        Check at least one to award the Verified Artisan badge on approval.
      </p>
      <ul className="space-y-2">
        {CHECKS.map(({ key, label, hint }) => (
          <li key={key}>
            <label className={`flex cursor-pointer items-start gap-2 ${compact ? 'text-xs' : 'text-sm'} text-navy/80`}>
              <input
                type="checkbox"
                className="mt-0.5"
                checked={Boolean(value[key])}
                onChange={(e) => set(key, e.target.checked)}
              />
              <span>
                <span className="font-medium text-navy">{label}</span>
                {!compact && <span className="mt-0.5 block text-xs text-navy/45">{hint}</span>}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </fieldset>
  );
}

export { CHECKS };
