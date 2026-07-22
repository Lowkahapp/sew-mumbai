export default function MeasurementForm({ template, values, unit, onChange, onUnitChange }) {
  if (!template) return null;

  const set = (key) => (e) => {
    onChange({ ...values, [key]: e.target.value });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-navy">Enter measurements</p>
        <div className="flex rounded-lg border border-navy/10 p-0.5 text-sm">
          {['in', 'cm'].map((u) => (
            <button
              key={u}
              type="button"
              className={`rounded-md px-3 py-1 font-medium transition ${
                unit === u ? 'bg-navy text-white' : 'text-navy/60 hover:text-navy'
              }`}
              onClick={() => onUnitChange(u)}
            >
              {u}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {template.fields.map((field) => (
          <div key={field.key}>
            <label className="label">{field.label}</label>
            <input
              type="number"
              min="0"
              step="0.25"
              className="input"
              placeholder={`${field.label} (${unit})`}
              value={values[field.key] ?? ''}
              onChange={set(field.key)}
            />
            <p className="mt-1 text-xs text-navy/45">{field.hint}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
