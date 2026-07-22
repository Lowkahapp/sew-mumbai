import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import LocalitySelect from '../components/LocalitySelect';
import StarRating from '../components/StarRating';

export default function TailorDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [serviceId, setServiceId] = useState('');
  const [locality, setLocality] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [notes, setNotes] = useState('');
  const [bookingMsg, setBookingMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get(`/tailors/${id}`)
      .then(({ data: res }) => {
        setData(res);
        setLocality(res.tailor?.locality || '');
        if (res.services?.[0]) setServiceId(res.services[0]._id);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const book = async (e) => {
    e.preventDefault();
    setBookingMsg('');
    if (!user) {
      navigate('/login', { state: { from: `/tailors/${id}` } });
      return;
    }
    if (user.role !== 'customer') {
      setBookingMsg('Only customers can book services.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/bookings', {
        tailorId: id,
        serviceId,
        locality,
        preferredDate,
        notes,
      });
      setBookingMsg('Booking requested! Track it on your dashboard.');
      setTimeout(() => navigate('/dashboard'), 800);
    } catch (err) {
      setBookingMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="text-navy/50">Loading profile…</p>;
  if (error) return <p className="text-rose-600">{error}</p>;
  if (!data) return null;

  const { tailor, services, reviews } = data;
  const name = tailor.user?.name || 'Tailor';

  return (
    <div className="space-y-8">
      <div className="overflow-hidden rounded-[1.75rem] bg-navy text-white">
        <div className="bg-gradient-to-r from-navy via-navy-700 to-saffron/70 px-6 py-10 sm:px-8">
          <p className="text-sm font-medium text-white/70">{tailor.locality}</p>
          <h1 className="mt-1 font-display text-3xl font-bold sm:text-4xl">{name}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
            <StarRating value={tailor.averageRating || 0} readOnly />
            <span className="text-white/70">
              {tailor.averageRating || 0} · {tailor.reviewCount || 0} reviews
            </span>
            <span className="text-white/70">{tailor.experienceYears || 0} yrs experience</span>
          </div>
          <p className="mt-4 max-w-2xl text-white/80">{tailor.bio}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {(tailor.specialties || []).map((s) => (
              <span key={s} className="rounded-full bg-white/10 px-3 py-1 text-xs">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <section className="card-surface p-5">
            <h2 className="font-display text-xl font-semibold">Services</h2>
            <ul className="mt-4 space-y-3">
              {(services || []).map((s) => (
                <li key={s._id} className="flex items-start justify-between gap-3 border-b border-navy/8 pb-3 last:border-0">
                  <div>
                    <p className="font-medium text-navy">{s.name}</p>
                    <p className="text-sm text-navy/60">{s.description}</p>
                    <p className="mt-1 text-xs text-navy/45">
                      {s.category} · {s.turnaroundDays} days
                    </p>
                  </div>
                  <p className="font-semibold text-navy">₹{s.price}</p>
                </li>
              ))}
              {services?.length === 0 && (
                <p className="text-sm text-navy/50">No approved services yet.</p>
              )}
            </ul>
          </section>

          <section className="card-surface p-5">
            <h2 className="font-display text-xl font-semibold">Portfolio</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {(tailor.portfolio || []).map((item) => (
                <article key={item._id || item.title} className="overflow-hidden rounded-xl border border-navy/8">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.title} className="h-36 w-full object-cover" />
                  ) : (
                    <div className="flex h-36 items-center justify-center bg-sand-200 text-navy/40">
                      No image
                    </div>
                  )}
                  <div className="p-3">
                    <h3 className="font-medium">{item.title}</h3>
                    <p className="text-sm text-navy/60">{item.description}</p>
                  </div>
                </article>
              ))}
              {(tailor.portfolio || []).length === 0 && (
                <p className="text-sm text-navy/50">Portfolio coming soon.</p>
              )}
            </div>
          </section>

          <section className="card-surface p-5">
            <h2 className="font-display text-xl font-semibold">Reviews</h2>
            <ul className="mt-4 space-y-4">
              {(reviews || []).map((r) => (
                <li key={r._id} className="border-b border-navy/8 pb-3 last:border-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{r.customer?.name || 'Customer'}</p>
                    <StarRating value={r.rating} readOnly size="sm" />
                  </div>
                  <p className="mt-1 text-sm text-navy/65">{r.comment}</p>
                </li>
              ))}
              {(reviews || []).length === 0 && (
                <p className="text-sm text-navy/50">No reviews yet.</p>
              )}
            </ul>
          </section>
        </div>

        <aside className="lg:col-span-2">
          <form onSubmit={book} className="card-surface sticky top-24 space-y-4 p-5">
            <h2 className="font-display text-xl font-semibold">Book a service</h2>
            <div>
              <label className="label">Service</label>
              <select
                className="input"
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                required
              >
                <option value="">Select service</option>
                {(services || []).map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} — ₹{s.price}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Your locality</label>
              <LocalitySelect value={locality} onChange={setLocality} />
            </div>
            <div>
              <label className="label">Preferred date</label>
              <input
                type="date"
                className="input"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Notes</label>
              <textarea
                className="input min-h-[90px]"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Fit preferences, fabric, timeline…"
              />
            </div>
            {bookingMsg && <p className="text-sm text-navy/70">{bookingMsg}</p>}
            <button type="submit" className="btn-primary w-full" disabled={submitting || !services?.length}>
              {submitting ? 'Sending…' : user ? 'Request booking' : 'Log in to book'}
            </button>
            {!user && (
              <p className="text-center text-xs text-navy/50">
                <Link to="/register" className="text-saffron-600 underline">
                  Create a customer account
                </Link>
              </p>
            )}
          </form>
        </aside>
      </div>
    </div>
  );
}
