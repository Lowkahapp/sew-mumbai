import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import MeasurementGuide, { formatMeasurementSummary, garmentLabel } from '../components/MeasurementGuide';
import MeasurementForm from '../components/MeasurementForm';

const EMPTY_FORM = { label: '', values: {}, unit: 'in', isDefault: false };

export default function CustomerMeasurements() {
  const [templates, setTemplates] = useState([]);
  const [saved, setSaved] = useState([]);
  const [activeType, setActiveType] = useState('blouse');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const template = useMemo(
    () => templates.find((t) => t.key === activeType),
    [templates, activeType]
  );

  const load = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const [tplRes, mineRes] = await Promise.all([
        api.get('/measurements/templates'),
        api.get('/measurements/me'),
      ]);
      setTemplates(tplRes.data.templates || []);
      setSaved(mineRes.data.measurements || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const resetForm = (type = activeType) => {
    setEditingId(null);
    setForm({
      label: `${garmentLabel(type)} size`,
      values: {},
      unit: 'in',
      isDefault: false,
    });
  };

  const switchType = (type) => {
    setActiveType(type);
    resetForm(type);
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setActiveType(item.garmentType);
    setForm({
      label: item.label,
      values: { ...item.values },
      unit: item.unit || 'in',
      isDefault: item.isDefault,
    });
  };

  const save = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);
    try {
      const payload = {
        label: form.label.trim() || `${garmentLabel(activeType)} size`,
        garmentType: activeType,
        unit: form.unit,
        values: form.values,
        isDefault: form.isDefault,
      };

      if (editingId) {
        await api.put(`/measurements/me/${editingId}`, payload);
        setMessage('Measurements updated');
      } else {
        await api.post('/measurements/me', payload);
        setMessage('Measurements saved');
      }
      resetForm(activeType);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    setError('');
    try {
      await api.delete(`/measurements/me/${id}`);
      if (editingId === id) resetForm(activeType);
      setMessage('Measurements removed');
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredSaved = saved.filter((s) => s.garmentType === activeType);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-saffron">
          Fit profiles
        </p>
        <h1 className="font-display text-3xl font-bold text-navy">My measurements</h1>
        <p className="text-navy/60">
          Save blouse, shirt, and pants sizes once — reuse them when you book a tailor.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {templates.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => switchType(t.key)}
            className={activeType === t.key ? 'btn-secondary' : 'btn-ghost'}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800" role="status">
          {message}
        </p>
      )}

      {loading ? (
        <p className="text-navy/50">Loading…</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="card-surface space-y-5 p-5">
            <MeasurementGuide template={template} />

            <form onSubmit={save} className="space-y-4 border-t border-navy/8 pt-5">
              <h2 className="font-display text-xl font-semibold text-navy">
                {editingId ? 'Edit saved size' : `Save ${template?.label} measurements`}
              </h2>

              <div>
                <label className="label">Profile name</label>
                <input
                  className="input"
                  placeholder="e.g. Wedding blouse, Office shirt"
                  value={form.label}
                  onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                />
              </div>

              <MeasurementForm
                template={template}
                values={form.values}
                unit={form.unit}
                onChange={(values) => setForm((f) => ({ ...f, values }))}
                onUnitChange={(unit) => setForm((f) => ({ ...f, unit }))}
              />

              <label className="flex items-center gap-2 text-sm text-navy/70">
                <input
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
                />
                Use as default for {template?.label.toLowerCase()} bookings
              </label>

              <div className="flex flex-wrap gap-2">
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : editingId ? 'Update' : 'Save measurements'}
                </button>
                {editingId && (
                  <button type="button" className="btn-ghost" onClick={() => resetForm(activeType)}>
                    Cancel edit
                  </button>
                )}
              </div>
            </form>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-xl font-semibold text-navy">
              Saved {template?.label} profiles
            </h2>

            {filteredSaved.length === 0 && (
              <p className="rounded-2xl border border-dashed border-navy/15 px-4 py-10 text-center text-sm text-navy/50">
                No saved {template?.label.toLowerCase()} measurements yet.
              </p>
            )}

            <ul className="space-y-3">
              {filteredSaved.map((item) => (
                <li key={item._id} className="card-surface p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-navy">
                        {item.label}
                        {item.isDefault && (
                          <span className="ml-2 rounded-full bg-saffron/15 px-2 py-0.5 text-xs font-medium text-saffron-700">
                            Default
                          </span>
                        )}
                      </h3>
                      <p className="mt-1 text-sm text-navy/60">
                        {formatMeasurementSummary(item, template)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" className="btn-ghost text-sm" onClick={() => startEdit(item)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn-ghost text-sm text-rose-700"
                        onClick={() => remove(item._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-3">
                    {template?.fields
                      .filter((f) => item.values[f.key] != null)
                      .map((f) => (
                        <div key={f.key}>
                          <dt className="text-navy/45">{f.label}</dt>
                          <dd className="font-medium text-navy">
                            {item.values[f.key]} {item.unit}
                          </dd>
                        </div>
                      ))}
                  </dl>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}
