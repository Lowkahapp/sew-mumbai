const TYPE_LABELS = {
  blouse: 'Blouse',
  shirt: 'Shirt',
  pants: 'Pants',
};

export default function MeasurementGuide({ template, compact = false }) {
  if (!template) return null;

  return (
    <div className={compact ? 'space-y-3' : 'space-y-4'}>
      <div>
        <h3 className="font-display text-lg font-semibold text-navy">
          How to measure — {template.label}
        </h3>
        <p className="text-sm text-navy/60">{template.description}</p>
      </div>

      <ol className="space-y-2">
        {template.steps.map((step, i) => (
          <li key={step} className="flex gap-3 text-sm text-navy/75">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-saffron/15 text-xs font-semibold text-saffron-700">
              {i + 1}
            </span>
            <span className="pt-0.5">{step}</span>
          </li>
        ))}
      </ol>

      {!compact && (
        <div className="rounded-xl bg-sand-100 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-navy/45">Fields to fill</p>
          <ul className="mt-2 space-y-1">
            {template.fields.map((f) => (
              <li key={f.key} className="text-sm text-navy/70">
                <span className="font-medium text-navy">{f.label}</span>
                <span className="text-navy/50"> — {f.hint}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function garmentLabel(type) {
  return TYPE_LABELS[type] || type;
}

export function formatMeasurementSummary(measurement, template) {
  if (!measurement?.values) return '';
  const fields = template?.fields || [];
  const parts = fields
    .filter((f) => measurement.values[f.key] != null)
    .slice(0, 4)
    .map((f) => `${f.label}: ${measurement.values[f.key]}${measurement.unit || 'in'}`);
  return parts.join(' · ');
}
