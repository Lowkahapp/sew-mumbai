import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LocalitySelect from '../components/LocalitySelect';
import ImageUpload from '../components/ImageUpload';

export default function BecomeTailor() {
  const { user, loading, becomeTailor } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    businessName: '',
    locality: '',
    bio: '',
    specialties: '',
    experienceYears: '',
    startingPrice: '',
    profileImageData: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return <p className="text-navy/50">Loading…</p>;
  }

  if (!user) {
    return <Navigate to="/register" replace state={{ asTailor: true }} />;
  }

  if (user.role === 'tailor') {
    return <Navigate to="/tailor" replace />;
  }

  if (user.role !== 'customer') {
    return <Navigate to="/" replace />;
  }

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await becomeTailor({
        businessName: form.businessName.trim(),
        locality: form.locality,
        bio: form.bio.trim(),
        specialties: form.specialties
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        experienceYears: Number(form.experienceYears) || 0,
        startingPrice: Number(form.startingPrice) || 0,
        profileImageData: form.profileImageData || undefined,
      });
      navigate('/tailor', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header className="space-y-2 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-saffron">
          For Mumbai tailors
        </p>
        <h1 className="font-display text-3xl font-bold text-navy sm:text-4xl">
          List your workshop
        </h1>
        <p className="text-navy/60">
          Upload your photo, add services, and get discovered by customers in your locality.
          Profiles are reviewed before going live.
        </p>
      </header>

      <form onSubmit={onSubmit} className="card-surface space-y-5 p-6 sm:p-8">
        <ImageUpload
          label="Workshop photo"
          value={form.profileImageData}
          onChange={(v) => setForm((f) => ({ ...f, profileImageData: v }))}
        />

        <div>
          <label className="label">Business / workshop name</label>
          <input
            className="input"
            placeholder="e.g. Priya Stitch Studio"
            value={form.businessName}
            onChange={set('businessName')}
          />
        </div>

        <div>
          <label className="label">Locality</label>
          <LocalitySelect
            value={form.locality}
            onChange={(v) => setForm((f) => ({ ...f, locality: v }))}
          />
        </div>

        <div>
          <label className="label">About your work</label>
          <textarea
            className="input min-h-[100px]"
            placeholder="Alterations, blouses, bridal wear…"
            value={form.bio}
            onChange={set('bio')}
          />
        </div>

        <div>
          <label className="label">Specialties (comma-separated)</label>
          <input
            className="input"
            placeholder="Alterations, Saree Blouse, Kurti"
            value={form.specialties}
            onChange={set('specialties')}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Experience (years)</label>
            <input
              type="number"
              min="0"
              className="input"
              value={form.experienceYears}
              onChange={set('experienceYears')}
            />
          </div>
          <div>
            <label className="label">Starting price (₹)</label>
            <input
              type="number"
              min="0"
              className="input"
              value={form.startingPrice}
              onChange={set('startingPrice')}
            />
          </div>
        </div>

        {error && (
          <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="btn-primary w-full" disabled={submitting || !form.locality}>
          {submitting ? 'Submitting…' : 'Become a tailor'}
        </button>

        <p className="text-center text-sm text-navy/55">
          New here?{' '}
          <Link to="/register" className="font-semibold text-saffron-600">
            Sign up as a tailor
          </Link>
        </p>
      </form>
    </div>
  );
}
