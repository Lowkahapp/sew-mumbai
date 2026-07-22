import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const redirectFor = (user) => {
    if (user.role === 'admin') return '/admin';
    if (user.role === 'tailor') return '/tailor';
    return location.state?.from || '/dashboard';
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(redirectFor(user), { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="card-surface p-6 sm:p-8">
        <h1 className="font-display text-3xl font-bold text-navy">Welcome back</h1>
        <p className="mt-1 text-sm text-navy/60">Log in to manage bookings and profiles</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Signing in…' : 'Log in'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-navy/60">
          New here?{' '}
          <Link to="/register" className="font-semibold text-saffron-600">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
