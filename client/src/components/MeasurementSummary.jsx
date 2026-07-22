import { garmentLabel } from './MeasurementGuide';

export default function MeasurementSummary({ measurements, compact = false }) {
  if (!measurements?.garmentType || !measurements?.values) return null;

  const entries = Object.entries(measurements.values || {});
  if (entries.length === 0) return null;

  const unit = measurements.unit || 'in';

  if (compact) {
    return (
      <p className="text-sm text-navy/70">
        {measurements.label || garmentLabel(measurements.garmentType)} —{' '}
        {entries.slice(0, 3).map(([k, v]) => `${k}: ${v}${unit}`).join(', ')}
        {entries.length > 3 ? '…' : ''}
      </p>
    );
  }

  return (
    <div className="rounded-xl bg-sand-100 px-3 py-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-navy/45">
        Measurements · {garmentLabel(measurements.garmentType)}
      </p>
      <p className="text-sm font-medium text-navy">{measurements.label}</p>
      <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-sm sm:grid-cols-3">
        {entries.map(([key, val]) => (
          <div key={key}>
            <dt className="capitalize text-navy/45">{key.replace(/([A-Z])/g, ' $1')}</dt>
            <dd className="font-medium text-navy">
              {val} {unit}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
