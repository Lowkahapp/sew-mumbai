import { useMemo, useState } from 'react';
import MeasurementDiagram from './MeasurementDiagram';
import { garmentLabel } from './MeasurementGuide';

const INTRO_STEP = 'intro';
const REVIEW_STEP = 'review';

export default function InteractiveMeasurementWizard({
  template,
  initialLabel = '',
  initialValues = {},
  initialUnit = 'in',
  initialIsDefault = false,
  editingId = null,
  onSave,
  onCancel,
  saving = false,
}) {
  const fields = template?.fields || [];
  const steps = useMemo(() => [INTRO_STEP, ...fields.map((f) => f.key), REVIEW_STEP], [fields]);

  const [stepIndex, setStepIndex] = useState(0);
  const [label, setLabel] = useState(initialLabel || `${garmentLabel(template?.key)} profile`);
  const [unit, setUnit] = useState(initialUnit);
  const [values, setValues] = useState(initialValues);
  const [isDefault, setIsDefault] = useState(initialIsDefault);

  const currentStep = steps[stepIndex];
  const isIntro = currentStep === INTRO_STEP;
  const isReview = currentStep === REVIEW_STEP;
  const activeField = fields.find((f) => f.key === currentStep);
  const progress = Math.round((stepIndex / (steps.length - 1)) * 100);

  const filledKeys = fields.filter((f) => values[f.key] != null && values[f.key] !== '').map((f) => f.key);

  const goNext = () => {
    if (stepIndex < steps.length - 1) setStepIndex((i) => i + 1);
  };

  const goPrev = () => {
    if (stepIndex > 0) setStepIndex((i) => i - 1);
  };

  const setFieldValue = (key, val) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  const handleSave = () => {
    onSave?.({
      label: label.trim() || `${garmentLabel(template?.key)} profile`,
      garmentType: template.key,
      unit,
      values,
      isDefault,
    });
  };

  const canProceedFromField = !activeField || (values[activeField.key] != null && values[activeField.key] !== '');

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-navy/50">
          <span>
            Step {stepIndex + 1} of {steps.length}
          </span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-sand-200">
          <div
            className="h-full rounded-full bg-saffron transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <MeasurementDiagram
          garmentType={template?.key}
          activeFieldKey={activeField?.key}
          filledKeys={filledKeys}
        />

        <div className="card-surface flex flex-col p-5">
          {isIntro && (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-saffron">Interactive guide</p>
                <h2 className="font-display text-2xl font-semibold text-navy">
                  Build your {template?.label} profile
                </h2>
                <p className="mt-2 text-sm text-navy/65">{template?.description}</p>
              </div>

              <div className="rounded-xl bg-navy/5 px-4 py-3 text-sm text-navy/70">
                <p className="font-medium text-navy">Secure & reusable</p>
                <p className="mt-1">
                  Measurements are saved to your account. They are only shared with a tailor when you
                  attach this profile to a booking — reuse with any tailor on SewMumbai.
                </p>
              </div>

              <div>
                <label className="label">Profile name</label>
                <input
                  className="input"
                  placeholder="e.g. Everyday blouse, Office shirt"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                />
              </div>

              <div>
                <label className="label">Unit</label>
                <div className="flex rounded-lg border border-navy/10 p-0.5 text-sm w-fit">
                  {['in', 'cm'].map((u) => (
                    <button
                      key={u}
                      type="button"
                      className={`rounded-md px-4 py-1.5 font-medium transition ${
                        unit === u ? 'bg-navy text-white' : 'text-navy/60 hover:text-navy'
                      }`}
                      onClick={() => setUnit(u)}
                    >
                      {u === 'in' ? 'Inches' : 'Centimetres'}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-sm text-navy/55">
                Tip: stand straight, use a soft tape snug — not tight. {fields.length} measurements
                ahead.
              </p>
            </div>
          )}

          {activeField && (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-saffron">
                  Measure now
                </p>
                <h2 className="font-display text-2xl font-semibold text-navy">{activeField.label}</h2>
              </div>

              <p className="rounded-xl bg-sand-100 px-4 py-3 text-sm leading-relaxed text-navy/75">
                {activeField.guide || activeField.hint}
              </p>

              <div>
                <label className="label">
                  {activeField.label} ({unit})
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.25"
                  className="input text-lg font-semibold"
                  autoFocus
                  placeholder="0"
                  value={values[activeField.key] ?? ''}
                  onChange={(e) => setFieldValue(activeField.key, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && canProceedFromField) goNext();
                  }}
                />
              </div>

              <p className="text-xs text-navy/45">
                {filledKeys.length} of {fields.length} measurements entered
              </p>
            </div>
          )}

          {isReview && (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-saffron">Review</p>
                <h2 className="font-display text-2xl font-semibold text-navy">Save your profile</h2>
              </div>

              <dl className="grid grid-cols-2 gap-3 text-sm">
                {fields
                  .filter((f) => values[f.key] != null && values[f.key] !== '')
                  .map((f) => (
                    <div key={f.key} className="rounded-lg bg-sand-100 px-3 py-2">
                      <dt className="text-navy/45">{f.label}</dt>
                      <dd className="font-semibold text-navy">
                        {values[f.key]} {unit}
                      </dd>
                    </div>
                  ))}
              </dl>

              {filledKeys.length < fields.length && (
                <p className="text-sm text-amber-700">
                  {fields.length - filledKeys.length} optional fields skipped — you can edit later.
                </p>
              )}

              <label className="flex items-center gap-2 text-sm text-navy/70">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                />
                Default {template?.label.toLowerCase()} profile for bookings
              </label>
            </div>
          )}

          <div className="mt-auto flex flex-wrap gap-2 border-t border-navy/8 pt-5">
            {stepIndex > 0 && (
              <button type="button" className="btn-ghost" onClick={goPrev}>
                Back
              </button>
            )}
            {!isReview && (
              <>
                {activeField && (
                  <button type="button" className="btn-ghost text-sm" onClick={goNext}>
                    Skip for now
                  </button>
                )}
                <button type="button" className="btn-primary" onClick={goNext}>
                  {isIntro ? 'Start measuring' : activeField ? 'Next measurement' : 'Continue'}
                </button>
              </>
            )}
            {isReview && (
              <button type="button" className="btn-primary" disabled={saving || filledKeys.length === 0} onClick={handleSave}>
                {saving ? 'Saving…' : editingId ? 'Update profile' : 'Save profile'}
              </button>
            )}
            {onCancel && (
              <button type="button" className="btn-ghost" onClick={onCancel}>
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
