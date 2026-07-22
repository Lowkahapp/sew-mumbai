import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import MeasurementSummary from '../components/MeasurementSummary';

export default function CustomerDashboard() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/bookings/me');
      setBookings(data.bookings || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const cancel = async (id) => {
    try {
      await api.patch(`/bookings/${id}/status`, { status: 'cancelled' });
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-navy">My bookings</h1>
          <p className="text-navy/60">Track requests, cancellations, and reviews</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/tailors" className="btn-primary">
            Book a tailor
          </Link>
          <Link to="/measurements" className="btn-secondary">
            My measurements
          </Link>
        </div>
      </div>

      {loading && <p className="text-navy/50">Loading…</p>}
      {error && <p className="text-rose-600">{error}</p>}

      <div className="space-y-3">
        {bookings.map((b) => (
          <article key={b._id} className="card-surface p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold text-navy">
                  {b.service?.name || 'Service'} · {b.tailor?.user?.name || 'Tailor'}
                </h2>
                <p className="mt-1 text-sm text-navy/60">
                  {b.locality} · {new Date(b.preferredDate).toLocaleDateString()} · ₹{b.price}
                </p>
                {b.notes && <p className="mt-2 text-sm text-navy/70">{b.notes}</p>}
                {b.measurements?.garmentType && (
                  <div className="mt-2">
                    <MeasurementSummary measurements={b.measurements} compact />
                  </div>
                )}
              </div>
              <StatusBadge status={b.status} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {['requested', 'accepted'].includes(b.status) && (
                <button type="button" className="btn-ghost" onClick={() => cancel(b._id)}>
                  Cancel
                </button>
              )}
              {b.status === 'completed' && (
                <Link to={`/reviews/${b._id}`} className="btn-primary">
                  Leave review
                </Link>
              )}
            </div>
          </article>
        ))}
        {!loading && bookings.length === 0 && (
          <p className="rounded-2xl border border-dashed border-navy/20 px-4 py-10 text-center text-navy/50">
            No bookings yet. Find a tailor near you.
          </p>
        )}
      </div>
    </div>
  );
}
