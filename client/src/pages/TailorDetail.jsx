import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import LocalitySelect from '../components/LocalitySelect';
import StarRating from '../components/StarRating';
import VerifiedArtisanBadge from '../components/VerifiedArtisanBadge';
import { garmentLabel } from '../components/MeasurementGuide';
import { formatWhatsAppDisplay, whatsAppHref } from '../utils/whatsapp';

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
  const [measurementId, setMeasurementId] = useState('');
  const [savedMeasurements, setSavedMeasurements] = useState([]);
  const [homeVisitRequested, setHomeVisitRequested] = useState(false);
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

  useEffect(() => {
    if (!user || user.role !== 'customer') {
      setSavedMeasurements([]);
      setMeasurementId('');
      return;
    }
    api
      .get('/measurements/me')
      .then(({ data }) => {
        const list = data.measurements || [];
        setSavedMeasurements(list);
        const preferred = list.find((m) => m.isDefault) || list[0];
        setMeasurementId(preferred?._id || '');
      })
      .catch(() => setSavedMeasurements([]));
  }, [user]);

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
        measurementId: measurementId || undefined,
        homeVisitRequested: homeVisitRequested || undefined,
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
  const selectedService = services?.find((s) => s._id === serviceId);
  const homeVisitAvailable = tailor.homeVisitEnabled && tailor.homeVisitFee > 0;
  const visitFee = homeVisitRequested && homeVisitAvailable ? tailor.homeVisitFee : 0;
  const estimatedTotal = (selectedService?.price || 0) + visitFee;
  const whatsappLink = whatsAppHref(
    tailor.whatsappNumber,
    `Hi ${name}, I found you on SewMumbai and would like to inquire about your tailoring services.`
  );

  return (
    <div className="space-y-8">
      <div className="overflow-hidden rounded-[1.75rem] bg-navy text-white">
        <div className="bg-gradient-to-r from-navy via-navy-700 to-saffron/70 px-6 py-10 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {tailor.profileImageUrl ? (
              <img
                src={tailor.profileImageUrl}
                alt=""
                className="h-20 w-20 shrink-0 rounded-2xl border-2 border-white/20 object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-2 border-white/20 bg-white/10 text-2xl font-display font-bold">
                {name.charAt(0)}
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-white/70">{tailor.locality}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <h1 className="font-display text-3xl font-bold sm:text-4xl">{name}</h1>
                {tailor.isVerifiedArtisan && <VerifiedArtisanBadge size="md" />}
              </div>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
            <StarRating value={tailor.averageRating || 0} readOnly />
            <span className="text-white/70">
              {tailor.averageRating || 0} · {tailor.reviewCount || 0} reviews
            </span>
            <span className="text-white/70">{tailor.experienceYears || 0} yrs experience</span>
            {homeVisitAvailable && (
              <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-white/90">
                Home visits +₹{tailor.homeVisitFee}
              </span>
            )}
          </div>
          <p className="mt-4 max-w-2xl text-white/80">{tailor.bio}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {(tailor.specialties || []).map((s) => (
              <span key={s} className="rounded-full bg-white/10 px-3 py-1 text-xs">
                {s}
              </span>
            ))}
          </div>
          {whatsappLink && (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1ebe57]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Chat on WhatsApp
              <span className="text-white/85">· {formatWhatsAppDisplay(tailor.whatsappNumber)}</span>
            </a>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          {tailor.isVerifiedArtisan && (
            <section className="card-surface p-4">
              <div className="flex flex-wrap items-center gap-3">
                <VerifiedArtisanBadge />
                <p className="text-sm text-navy/65">
                  SewMumbai admin verified this artisan
                  {(tailor.verificationChecks?.shopLicense ||
                    tailor.verificationChecks?.identityProof ||
                    tailor.verificationChecks?.portfolioReview) && (
                    <>
                      {' '}
                      (
                      {[
                        tailor.verificationChecks?.shopLicense && 'shop license',
                        tailor.verificationChecks?.identityProof && 'identity',
                        tailor.verificationChecks?.portfolioReview && 'portfolio',
                      ]
                        .filter(Boolean)
                        .join(', ')}
                      )
                    </>
                  )}
                  .
                </p>
              </div>
            </section>
          )}

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
              <label className="label">Saved measurements</label>
              {user?.role === 'customer' ? (
                <>
                  <select
                    className="input"
                    value={measurementId}
                    onChange={(e) => setMeasurementId(e.target.value)}
                  >
                    <option value="">None — add notes only</option>
                    {savedMeasurements.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.label} ({garmentLabel(m.garmentType)})
                        {m.isDefault ? ' · default' : ''}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-navy/45">
                    <Link to="/measurements" className="text-saffron-600 underline">
                      Manage or add measurements
                    </Link>
                  </p>
                </>
              ) : (
                <p className="text-sm text-navy/50">Log in as a customer to attach saved sizes.</p>
              )}
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

            {homeVisitAvailable && (
              <div className="rounded-xl border border-navy/10 bg-sand-100 p-3">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={homeVisitRequested}
                    onChange={(e) => setHomeVisitRequested(e.target.checked)}
                  />
                  <span>
                    <span className="block text-sm font-semibold text-navy">Request home visit</span>
                    <span className="mt-0.5 block text-xs text-navy/55">
                      Fitting or pickup at your address · +₹{tailor.homeVisitFee} transport fee
                    </span>
                  </span>
                </label>
              </div>
            )}

            {selectedService && (
              <div className="rounded-xl bg-navy/5 px-3 py-2 text-sm text-navy/75">
                <p>
                  Service: ₹{selectedService.price}
                  {visitFee > 0 && ` · Home visit: +₹${visitFee}`}
                </p>
                <p className="font-semibold text-navy">Estimated total: ₹{estimatedTotal}</p>
              </div>
            )}

            {bookingMsg && <p className="text-sm text-navy/70">{bookingMsg}</p>}
            {whatsappLink && (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost w-full border-[#25D366]/30 text-[#128C7E] hover:bg-[#25D366]/10"
              >
                Message on WhatsApp
              </a>
            )}
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
