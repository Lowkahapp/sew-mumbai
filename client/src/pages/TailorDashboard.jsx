import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import LocalitySelect from '../components/LocalitySelect';
import StatusBadge from '../components/StatusBadge';
import VerifiedArtisanBadge from '../components/VerifiedArtisanBadge';
import MeasurementSummary from '../components/MeasurementSummary';
import BookingProgressTracker from '../components/BookingProgressTracker';
import { nextProgressStage, nextProgressStepLabel } from '../constants/bookingProgress';
import ImageUpload from '../components/ImageUpload';
import { formatWhatsAppDisplay } from '../utils/whatsapp';

/**
 * Tailor Dashboard View — incoming bookings with Accept / Reject
 */
export default function TailorDashboard() {
  const { refreshMe } = useAuth();
  const [tab, setTab] = useState('requests');
  const [profile, setProfile] = useState(null);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [profileForm, setProfileForm] = useState({
    bio: '',
    locality: '',
    specialties: '',
    experienceYears: 0,
    startingPrice: 0,
    homeVisitEnabled: false,
    homeVisitFee: 300,
    whatsappNumber: '',
  });
  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    turnaroundDays: 3,
  });
  const [portfolioForm, setPortfolioForm] = useState({
    title: '',
    imageData: '',
    description: '',
  });
  const [profilePhoto, setProfilePhoto] = useState('');

  const load = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const [me, svc, books] = await Promise.all([
        api.get('/tailors/me'),
        api.get('/services'),
        api.get('/bookings/me'),
      ]);
      setProfile(me.data.tailor);
      setServices(svc.data.services || []);
      setBookings(books.data.bookings || []);
      const t = me.data.tailor;
      setProfileForm({
        bio: t.bio || '',
        locality: t.locality || '',
        specialties: (t.specialties || []).join(', '),
        experienceYears: t.experienceYears || 0,
        startingPrice: t.startingPrice || 0,
        homeVisitEnabled: Boolean(t.homeVisitEnabled),
        homeVisitFee: t.homeVisitFee || 300,
        whatsappNumber: t.whatsappNumber || '',
      });
      setProfilePhoto(t.profileImageUrl || '');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const incomingRequests = useMemo(
    () => bookings.filter((b) => b.status === 'requested'),
    [bookings]
  );

  const otherBookings = useMemo(
    () => bookings.filter((b) => b.status !== 'requested'),
    [bookings]
  );

  const updateBookingStatus = async (id, status) => {
    setError('');
    setMessage('');
    setUpdatingId(id);
    try {
      const { data } = await api.put(`/bookings/${id}/status`, { status });
      setBookings((prev) => prev.map((b) => (b._id === id ? data.booking : b)));
      setMessage(
        status === 'accepted'
          ? 'Job accepted'
          : status === 'rejected'
            ? 'Job rejected'
            : `Booking marked ${status}`
      );
    } catch (err) {
      setError(err.message);
      await load();
    } finally {
      setUpdatingId(null);
    }
  };

  const advanceProgress = async (booking) => {
    const next = nextProgressStage(booking.progressStage || 'accepted');
    if (!next) return;
    setError('');
    setMessage('');
    setUpdatingId(booking._id);
    try {
      const { data } = await api.patch(`/bookings/${booking._id}/progress`, {
        progressStage: next,
      });
      setBookings((prev) => prev.map((b) => (b._id === booking._id ? data.booking : b)));
      setMessage(`Progress updated — ${nextProgressStepLabel(booking.progressStage || 'accepted')}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await api.put('/tailors/me', {
        bio: profileForm.bio,
        locality: profileForm.locality,
        specialties: profileForm.specialties
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        experienceYears: Number(profileForm.experienceYears),
        startingPrice: Number(profileForm.startingPrice),
        homeVisitEnabled: profileForm.homeVisitEnabled,
        homeVisitFee: profileForm.homeVisitEnabled ? Number(profileForm.homeVisitFee) : 0,
        whatsappNumber: profileForm.whatsappNumber.trim(),
        profileImageData: profilePhoto.startsWith('data:') ? profilePhoto : undefined,
      });
      setMessage('Profile updated');
      await load();
      await refreshMe();
    } catch (err) {
      setError(err.message);
    }
  };

  const addPortfolio = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tailors/me/portfolio', {
        title: portfolioForm.title,
        description: portfolioForm.description,
        imageData: portfolioForm.imageData || undefined,
      });
      setPortfolioForm({ title: '', imageData: '', description: '' });
      setMessage('Portfolio item added');
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const removePortfolioItem = async (itemId) => {
    try {
      await api.delete(`/tailors/me/portfolio/${itemId}`);
      setMessage('Portfolio item removed');
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const createService = async (e) => {
    e.preventDefault();
    try {
      await api.post('/services', {
        ...serviceForm,
        price: Number(serviceForm.price),
        turnaroundDays: Number(serviceForm.turnaroundDays),
      });
      setServiceForm({
        name: '',
        description: '',
        category: '',
        price: '',
        turnaroundDays: 3,
      });
      setMessage('Service submitted for approval');
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteService = async (id) => {
    try {
      await api.delete(`/services/${id}`);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const tabs = [
    {
      id: 'requests',
      label: incomingRequests.length
        ? `Incoming (${incomingRequests.length})`
        : 'Incoming',
    },
    { id: 'profile', label: 'Profile' },
    { id: 'portfolio', label: 'Photos' },
    { id: 'services', label: 'Services' },
  ];

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-saffron">
          Tailor dashboard
        </p>
        <h1 className="font-display text-3xl font-bold text-navy">Your workspace</h1>
        <p className="text-navy/60">
          Profile status:{' '}
          {profile ? <StatusBadge status={profile.approvalStatus} /> : '…'}
          {profile?.isVerifiedArtisan && (
            <span className="ml-2 inline-flex align-middle">
              <VerifiedArtisanBadge size="sm" />
            </span>
          )}
        </p>
        {profile?.approvalStatus === 'approved' && !profile?.isVerifiedArtisan && (
          <p className="text-xs text-navy/50">
            Awaiting Verified Artisan review — admin may confirm your shop license, ID, or portfolio.
          </p>
        )}
      </header>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={tab === t.id ? 'btn-secondary' : 'btn-ghost'}
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

      {tab === 'requests' && (
        <div className="space-y-6">
          <section className="space-y-4" aria-labelledby="incoming-jobs-heading">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2
                  id="incoming-jobs-heading"
                  className="font-display text-xl font-semibold text-navy"
                >
                  Incoming booking requests
                </h2>
                <p className="text-sm text-navy/50">
                  Accept or reject new customer jobs
                </p>
              </div>
              <button
                type="button"
                className="btn-ghost text-sm"
                onClick={load}
                disabled={loading}
              >
                {loading ? 'Refreshing…' : 'Refresh'}
              </button>
            </div>

            {loading && bookings.length === 0 && (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="card-surface h-28 animate-pulse bg-sand-200/80" />
                ))}
              </div>
            )}

            {!loading && incomingRequests.length === 0 && (
              <div className="rounded-2xl border border-dashed border-navy/15 px-4 py-12 text-center">
                <p className="font-display text-lg text-navy/70">No incoming jobs</p>
                <p className="mt-1 text-sm text-navy/45">
                  New customer requests will show up here.
                </p>
              </div>
            )}

            <ul className="space-y-3">
              {incomingRequests.map((b) => {
                const busy = updatingId === b._id;
                return (
                  <li key={b._id}>
                    <article className="card-surface overflow-hidden">
                      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-stretch sm:justify-between">
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-navy">
                              {b.service?.name || 'Service request'}
                            </h3>
                            <StatusBadge status={b.status} />
                          </div>
                          <dl className="grid grid-cols-1 gap-1 text-sm text-navy/65 sm:grid-cols-2">
                            <div>
                              <dt className="inline text-navy/40">Customer: </dt>
                              <dd className="inline font-medium text-navy">
                                {b.customer?.name || '—'}
                              </dd>
                            </div>
                            <div>
                              <dt className="inline text-navy/40">Locality: </dt>
                              <dd className="inline">{b.locality}</dd>
                            </div>
                            <div>
                              <dt className="inline text-navy/40">Date: </dt>
                              <dd className="inline">
                                {b.preferredDate
                                  ? new Date(b.preferredDate).toLocaleDateString()
                                  : '—'}
                              </dd>
                            </div>
                            <div>
                              <dt className="inline text-navy/40">Price: </dt>
                              <dd className="inline font-semibold text-navy">
                                {b.price != null ? `₹${b.price}` : '—'}
                              </dd>
                            </div>
                            {b.customer?.phone && (
                              <div className="sm:col-span-2">
                                <dt className="inline text-navy/40">Phone: </dt>
                                <dd className="inline">{b.customer.phone}</dd>
                              </div>
                            )}
                            {b.homeVisitRequested && (
                              <div className="sm:col-span-2">
                                <dt className="inline text-navy/40">Visit: </dt>
                                <dd className="inline font-medium text-saffron-700">
                                  Home visit requested (+₹{b.homeVisitFee || 0})
                                </dd>
                              </div>
                            )}
                          </dl>
                          {b.notes && (
                            <p className="rounded-xl bg-sand-100 px-3 py-2 text-sm text-navy/80">
                              {b.notes}
                            </p>
                          )}
                          {b.measurements?.garmentType && (
                            <MeasurementSummary measurements={b.measurements} />
                          )}
                        </div>

                        <div className="flex shrink-0 flex-row gap-2 sm:w-36 sm:flex-col">
                          <button
                            type="button"
                            className="btn-primary flex-1"
                            disabled={busy}
                            onClick={() => updateBookingStatus(b._id, 'accepted')}
                          >
                            {busy ? '…' : 'Accept'}
                          </button>
                          <button
                            type="button"
                            className="btn-ghost flex-1 border-rose-200 text-rose-700 hover:bg-rose-50"
                            disabled={busy}
                            onClick={() => updateBookingStatus(b._id, 'rejected')}
                          >
                            {busy ? '…' : 'Reject'}
                          </button>
                        </div>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          </section>

          {otherBookings.length > 0 && (
            <section className="space-y-3" aria-labelledby="other-jobs-heading">
              <h2
                id="other-jobs-heading"
                className="font-display text-xl font-semibold text-navy"
              >
                Accepted & past jobs
              </h2>
              <ul className="space-y-3">
                {otherBookings.map((b) => (
                  <li key={b._id}>
                    <article className="card-surface p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-navy">
                            {b.service?.name} · {b.customer?.name}
                          </h3>
                          <p className="text-sm text-navy/60">
                            {b.locality}
                            {b.preferredDate
                              ? ` · ${new Date(b.preferredDate).toLocaleDateString()}`
                              : ''}
                            {b.price != null ? ` · ₹${b.price}` : ''}
                          </p>
                        </div>
                        <StatusBadge status={b.status} />
                      </div>
                      <BookingProgressTracker booking={b} compact />
                      {b.status === 'accepted' && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {nextProgressStage(b.progressStage || 'accepted') && (
                            <button
                              type="button"
                              className="btn-secondary text-sm"
                              disabled={updatingId === b._id}
                              onClick={() => advanceProgress(b)}
                            >
                              {updatingId === b._id
                                ? '…'
                                : `Mark: ${nextProgressStepLabel(b.progressStage || 'accepted')}`}
                            </button>
                          )}
                          <button
                            type="button"
                            className="btn-primary text-sm"
                            disabled={updatingId === b._id}
                            onClick={() => updateBookingStatus(b._id, 'completed')}
                          >
                            Mark completed
                          </button>
                        </div>
                      )}
                    </article>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}

      {tab === 'profile' && (
        <form onSubmit={saveProfile} className="card-surface mx-auto max-w-xl space-y-4 p-5">
          <h2 className="font-display text-xl font-semibold">Edit profile</h2>
          <ImageUpload
            label="Workshop photo"
            value={profilePhoto}
            onChange={setProfilePhoto}
          />
          <div>
            <label className="label">Bio</label>
            <textarea
              className="input min-h-[100px]"
              value={profileForm.bio}
              onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Locality</label>
            <LocalitySelect
              value={profileForm.locality}
              onChange={(v) => setProfileForm({ ...profileForm, locality: v })}
            />
          </div>
          <div>
            <label className="label">Specialties</label>
            <input
              className="input"
              placeholder="Alterations, Blouse, Kurti"
              value={profileForm.specialties}
              onChange={(e) => setProfileForm({ ...profileForm, specialties: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Experience (years)</label>
              <input
                type="number"
                className="input"
                value={profileForm.experienceYears}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, experienceYears: e.target.value })
                }
              />
            </div>
            <div>
              <label className="label">Starting price (₹)</label>
              <input
                type="number"
                className="input"
                value={profileForm.startingPrice}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, startingPrice: e.target.value })
                }
              />
            </div>
          </div>

          <div className="rounded-xl border border-navy/10 bg-sand-100 p-4 space-y-3">
            <div>
              <h3 className="font-display text-lg font-semibold text-navy">Home visit pricing</h3>
              <p className="text-xs text-navy/55">
                Offer fittings or pickup at the customer&apos;s home. Set a transport fee between ₹200–₹500.
              </p>
            </div>
            <label className="flex items-center gap-2 text-sm font-medium text-navy">
              <input
                type="checkbox"
                checked={profileForm.homeVisitEnabled}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, homeVisitEnabled: e.target.checked })
                }
              />
              Accept home visit requests
            </label>
            {profileForm.homeVisitEnabled && (
              <div>
                <label className="label">Visit / transport fee (₹200–₹500)</label>
                <input
                  type="number"
                  min="200"
                  max="500"
                  step="50"
                  className="input"
                  value={profileForm.homeVisitFee}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, homeVisitFee: e.target.value })
                  }
                />
              </div>
            )}
          </div>

          <div className="rounded-xl border border-navy/10 bg-sand-100 p-4 space-y-3">
            <div>
              <h3 className="font-display text-lg font-semibold text-navy">WhatsApp contact</h3>
              <p className="text-xs text-navy/55">
                Let customers message you on WhatsApp for fittings, quotes, or fabric questions.
              </p>
            </div>
            <div>
              <label className="label" htmlFor="whatsapp-number">
                WhatsApp number
              </label>
              <input
                id="whatsapp-number"
                type="tel"
                className="input"
                placeholder="9876543210 or +91 98765 43210"
                value={profileForm.whatsappNumber}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, whatsappNumber: e.target.value })
                }
                autoComplete="tel"
              />
              {profileForm.whatsappNumber.trim() && (
                <p className="mt-1 text-xs text-navy/45">
                  Shown as {formatWhatsAppDisplay(profileForm.whatsappNumber) || 'invalid number — use 10 digits'}
                </p>
              )}
            </div>
          </div>

          <button type="submit" className="btn-primary">
            Save profile
          </button>
        </form>
      )}

      {tab === 'portfolio' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <form onSubmit={addPortfolio} className="card-surface space-y-4 p-5">
            <h2 className="font-display text-xl font-semibold">Add work photo</h2>
            <p className="text-xs text-navy/50">
              Show customers your stitching, fittings, and finished pieces.
            </p>
            <div>
              <label className="label">Title</label>
              <input
                className="input"
                placeholder="Bridal blouse, Pant alteration…"
                value={portfolioForm.title}
                onChange={(e) => setPortfolioForm({ ...portfolioForm, title: e.target.value })}
                required
              />
            </div>
            <ImageUpload
              label="Work photo"
              value={portfolioForm.imageData}
              onChange={(v) => setPortfolioForm({ ...portfolioForm, imageData: v })}
            />
            <div>
              <label className="label">Description</label>
              <textarea
                className="input"
                value={portfolioForm.description}
                onChange={(e) =>
                  setPortfolioForm({ ...portfolioForm, description: e.target.value })
                }
              />
            </div>
            <button type="submit" className="btn-secondary">
              Add to portfolio
            </button>
          </form>

          <div className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-navy">Your portfolio</h2>
            {(profile?.portfolio || []).length === 0 && (
              <p className="text-sm text-navy/50">No photos yet — upload your first piece of work.</p>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              {(profile?.portfolio || []).map((item) => (
                <article
                  key={item._id}
                  className="card-surface overflow-hidden p-0"
                >
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.title} className="h-36 w-full object-cover" />
                  ) : (
                    <div className="flex h-36 items-center justify-center bg-sand-200 text-navy/40">
                      No image
                    </div>
                  )}
                  <div className="space-y-2 p-3">
                    <h3 className="font-semibold text-navy">{item.title}</h3>
                    {item.description && (
                      <p className="text-sm text-navy/60">{item.description}</p>
                    )}
                    <button
                      type="button"
                      className="btn-ghost text-sm text-rose-700"
                      onClick={() => removePortfolioItem(item._id)}
                    >
                      Remove
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'services' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <form onSubmit={createService} className="card-surface space-y-4 p-5">
            <h2 className="font-display text-xl font-semibold">New service</h2>
            <p className="text-xs text-navy/50">
              New services start as pending until admin approval.
            </p>
            <input
              className="input"
              placeholder="Name"
              value={serviceForm.name}
              onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
              required
            />
            <input
              className="input"
              placeholder="Category"
              value={serviceForm.category}
              onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
              required
            />
            <textarea
              className="input"
              placeholder="Description"
              value={serviceForm.description}
              onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                className="input"
                placeholder="Price"
                value={serviceForm.price}
                onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                required
              />
              <input
                type="number"
                className="input"
                placeholder="Days"
                value={serviceForm.turnaroundDays}
                onChange={(e) =>
                  setServiceForm({ ...serviceForm, turnaroundDays: e.target.value })
                }
                required
              />
            </div>
            <button type="submit" className="btn-primary">
              Submit service
            </button>
          </form>

          <div className="space-y-3">
            {services.map((s) => (
              <article key={s._id} className="card-surface p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold">{s.name}</h3>
                    <p className="text-sm text-navy/60">
                      {s.category} · ₹{s.price} · {s.turnaroundDays} days
                    </p>
                  </div>
                  <StatusBadge status={s.approvalStatus} />
                </div>
                <button
                  type="button"
                  className="btn-ghost mt-3"
                  onClick={() => deleteService(s._id)}
                >
                  Delete
                </button>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
