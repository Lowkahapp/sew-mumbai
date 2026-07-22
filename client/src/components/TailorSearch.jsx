import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import StarRating from './StarRating';

const SPECIALTIES = [
  { label: 'Lehengas', query: 'Lehenga' },
  { label: 'Suits', query: 'Suit' },
  { label: 'Alterations', query: 'Alterations' },
];

const FALLBACK_LOCALITIES = [
  'Andheri',
  'Bandra',
  'Colaba',
  'Dadar',
  'Powai',
  'Worli',
  'Juhu',
  'Malad',
  'Borivali',
  'Thane',
  'Kurla',
  'Chembur',
  'Goregaon',
  'Santacruz',
  'Vile Parle',
  'Lower Parel',
];

function businessName(tailor) {
  return tailor.businessName || tailor.shopName || tailor.user?.name || 'Tailor';
}

export default function TailorSearch({ initialLocality = '', initialSpecialty = '' }) {
  const [localityQuery, setLocalityQuery] = useState(initialLocality);
  const [specialty, setSpecialty] = useState(initialSpecialty);
  const [localities, setLocalities] = useState(FALLBACK_LOCALITIES);
  const [tailors, setTailors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/localities')
      .then(({ data }) => {
        if (data.localities?.length) setLocalities(data.localities);
      })
      .catch(() => {});
  }, []);

  const matchedLocality = useMemo(() => {
    const q = localityQuery.trim().toLowerCase();
    if (!q) return '';
    const exact = localities.find((loc) => loc.toLowerCase() === q);
    if (exact) return exact;
    const starts = localities.find((loc) => loc.toLowerCase().startsWith(q));
    return starts || localityQuery.trim();
  }, [localityQuery, localities]);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const query = new URLSearchParams();
        if (matchedLocality) query.set('locality', matchedLocality);
        if (specialty) query.set('specialty', specialty);
        const { data } = await api.get(`/tailors/search?${query.toString()}`, {
          signal: controller.signal,
        });
        setTailors(data.tailors || []);
      } catch (err) {
        if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
        setError(err.message || 'Could not load tailors');
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(load, 250);
    return () => {
      clearTimeout(debounce);
      controller.abort();
    };
  }, [matchedLocality, specialty]);

  return (
    <section className="space-y-5" aria-label="Search Mumbai tailors">
      <div className="space-y-4">
        <div>
          <label htmlFor="locality-search" className="label">
            Mumbai locality
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-navy/35">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            <input
              id="locality-search"
              type="search"
              list="mumbai-localities"
              className="input pl-9"
              placeholder="Search locality — e.g. Bandra, Andheri"
              value={localityQuery}
              onChange={(e) => setLocalityQuery(e.target.value)}
              autoComplete="off"
            />
            <datalist id="mumbai-localities">
              {localities.map((loc) => (
                <option key={loc} value={loc} />
              ))}
            </datalist>
          </div>
        </div>

        <div>
          <p className="label" id="specialty-filter-label">
            Specialty
          </p>
          <div
            className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="group"
            aria-labelledby="specialty-filter-label"
          >
            <button
              type="button"
              onClick={() => setSpecialty('')}
              className={`shrink-0 rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
                specialty === ''
                  ? 'bg-navy text-white'
                  : 'border border-navy-100 bg-white text-navy/70 hover:border-saffron/40'
              }`}
            >
              All
            </button>
            {SPECIALTIES.map(({ label, query }) => {
              const active = specialty === query;
              return (
                <button
                  key={query}
                  type="button"
                  onClick={() => setSpecialty(active ? '' : query)}
                  className={`shrink-0 rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
                    active
                      ? 'bg-saffron text-white'
                      : 'border border-navy-100 bg-white text-navy/70 hover:border-saffron/40'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {loading && (
        <p className="py-6 text-center text-sm text-navy/50" role="status">
          Finding tailors near you…
        </p>
      )}

      {error && (
        <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">
          {error}
        </p>
      )}

      {!loading && !error && tailors.length === 0 && (
        <p className="rounded-2xl border border-dashed border-navy/15 px-4 py-10 text-center text-sm text-navy/50">
          No approved tailors match{' '}
          {matchedLocality ? (
            <span className="font-semibold text-navy/70">{matchedLocality}</span>
          ) : (
            'these filters'
          )}
          {specialty ? (
            <>
              {' '}
              for <span className="font-semibold text-navy/70">{specialty}</span>
            </>
          ) : null}
          .
        </p>
      )}

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {tailors.map((tailor) => {
          const name = businessName(tailor);
          const rating = tailor.averageRating ?? 0;
          return (
            <li key={tailor._id} className="card-surface flex flex-col p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate font-display text-lg font-semibold text-navy">{name}</h3>
                  <p className="mt-0.5 text-sm text-navy/55">{tailor.locality}</p>
                </div>
                <div className="shrink-0 text-right">
                  <StarRating value={rating} readOnly size="sm" />
                  <p className="mt-0.5 text-xs text-navy/45">
                    {rating > 0 ? rating.toFixed(1) : 'New'}
                    {tailor.reviewCount ? ` · ${tailor.reviewCount}` : ''}
                  </p>
                </div>
              </div>

              {(tailor.specialties || []).length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {tailor.specialties.slice(0, 3).map((s) => (
                    <span
                      key={s}
                      className="rounded-md bg-navy/5 px-2 py-0.5 text-xs font-medium text-navy/65"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-4 flex items-center justify-between gap-3 border-t border-navy/5 pt-3">
                <span className="text-sm font-semibold text-navy">
                  {tailor.startingPrice != null ? `from ₹${tailor.startingPrice}` : 'Custom quote'}
                </span>
                <Link
                  to={`/tailors/${tailor._id}`}
                  className="btn-primary px-4 py-2 text-sm"
                >
                  Book Now
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
