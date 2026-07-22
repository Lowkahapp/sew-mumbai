import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LocalitySelect from '../components/LocalitySelect';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'customer',
    locality: '',
    specialties: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        role: form.role,
      };
      if (form.role === 'tailor') {
        payload.locality = form.locality;
        payload.specialties = form.specialties
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      }
      const user = await register(payload);
      navigate(user.role === 'tailor' ? '/tailor' : '/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <div className="card-surface p-6 sm:p-8">
        <h1 className="font-display text-3xl font-bold text-navy">Join SewMumbai</h1>
        <p className="mt-1 text-sm text-navy/60">Book as a customer or list your workshop as a tailor</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label">Full name</label>
              <input className="input" value={form.name} onChange={set('name')} required />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" value={form.email} onChange={set('email')} required />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" value={form.phone} onChange={set('phone')} />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                value={form.password}
                onChange={set('password')}
                minLength={6}
                required
              />
            </div>
            <div>
              <label className="label">I am a</label>
              <select className="input" value={form.role} onChange={set('role')}>
                <option value="customer">Customer</option>
                <option value="tailor">Tailor</option>
              </select>
            </div>
          </div>

          {form.role === 'tailor' && (
            <div className="space-y-4 rounded-xl border border-navy/10 bg-sand-100 p-4">
              <div>
                <label className="label">Workshop locality</label>
                <LocalitySelect
                  value={form.locality}
                  onChange={(v) => setForm((f) => ({ ...f, locality: v }))}
                />
              </div>
              <div>
                <label className="label">Specialties (comma-separated)</label>
                <input
                  className="input"
                  placeholder="Alterations, Saree Blouse"
                  value={form.specialties}
                  onChange={set('specialties')}
                />
              </div>
              <p className="text-xs text-navy/50">Tailor profiles require admin approval before appearing publicly.</p>
            </div>
          )}

          {error && <p className="text-sm text-rose-600">{error}</p>}
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Creating…' : 'Create account'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-navy/60">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-saffron-600">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
