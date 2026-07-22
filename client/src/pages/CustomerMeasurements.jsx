import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import InteractiveMeasurementWizard from '../components/InteractiveMeasurementWizard';
import { formatMeasurementSummary, garmentLabel } from '../components/MeasurementGuide';

export default function CustomerMeasurements() {
  const [templates, setTemplates] = useState([]);
  const [saved, setSaved] = useState([]);
  const [activeType, setActiveType] = useState('blouse');
  const [view, setView] = useState('profiles');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);
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

  const filteredSaved = saved.filter((s) => s.garmentType === activeType);

  const openWizard = (item = null) => {
    setEditingId(item?._id || null);
    setEditForm(
      item
        ? {
            label: item.label,
            values: { ...item.values },
            unit: item.unit || 'in',
            isDefault: item.isDefault,
          }
        : null
    );
    setView('wizard');
  };

  const closeWizard = () => {
    setView('profiles');
    setEditingId(null);
    setEditForm(null);
  };

  const switchType = (type) => {
    setActiveType(type);
    if (view === 'wizard' && !editingId) closeWizard();
  };

  const saveProfile = async (payload) => {
    setError('');
    setMessage('');
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/measurements/me/${editingId}`, payload);
        setMessage('Measurement profile updated');
      } else {
        await api.post('/measurements/me', payload);
        setMessage('Measurement profile saved securely to your account');
      }
      closeWizard();
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
      setMessage('Profile removed');
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-saffron">
          Digital fit profile
        </p>
        <h1 className="font-display text-3xl font-bold text-navy sm:text-4xl">
          Interactive measurement guide
        </h1>
        <p className="max-w-2xl text-navy/60">
          Follow the step-by-step diagram to measure blouse, shirt, or pants. Save profiles to your
          account and reuse them with any tailor when you book.
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
      ) : view === 'wizard' && template ? (
        <InteractiveMeasurementWizard
          template={template}
          initialLabel={editForm?.label}
          initialValues={editForm?.values || {}}
          initialUnit={editForm?.unit || 'in'}
          initialIsDefault={editForm?.isDefault || false}
          editingId={editingId}
          onSave={saveProfile}
          onCancel={closeWizard}
          saving={saving}
        />
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-xl font-semibold text-navy">
              Your {template?.label} profiles
            </h2>
            <button type="button" className="btn-primary" onClick={() => openWizard()}>
              + New guided profile
            </button>
          </div>

          {filteredSaved.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-navy/15 bg-sand-100/50 px-6 py-14 text-center">
              <p className="font-display text-lg text-navy/70">No {template?.label.toLowerCase()} profile yet</p>
              <p className="mx-auto mt-2 max-w-md text-sm text-navy/50">
                Start the interactive guide — we&apos;ll walk you through each measurement with a
                diagram and save it to your account.
              </p>
              <button type="button" className="btn-primary mt-6" onClick={() => openWizard()}>
                Start interactive guide
              </button>
            </div>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2">
              {filteredSaved.map((item) => (
                <li key={item._id} className="card-surface p-5">
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
                      <p className="mt-1 text-sm text-navy/55">
                        {garmentLabel(item.garmentType)} · {item.unit}
                      </p>
                      <p className="mt-1 text-sm text-navy/60">
                        {formatMeasurementSummary(item, template)}
                      </p>
                    </div>
                  </div>

                  <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
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

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button type="button" className="btn-secondary text-sm" onClick={() => openWizard(item)}>
                      Edit in guide
                    </button>
                    <button
                      type="button"
                      className="btn-ghost text-sm text-rose-700"
                      onClick={() => remove(item._id)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="rounded-xl border border-navy/8 bg-navy px-5 py-4 text-white sm:flex sm:items-center sm:justify-between sm:gap-4">
            <div>
              <p className="font-medium">Reuse with any tailor</p>
              <p className="mt-1 text-sm text-white/70">
                Attach a saved profile when booking — dimensions are shared only with that tailor.
              </p>
            </div>
            <Link to="/tailors" className="btn-secondary mt-3 shrink-0 bg-white/10 text-white hover:bg-white/20 sm:mt-0">
              Find tailors
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
