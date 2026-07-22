import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import StarRating from '../components/StarRating';

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
];

function businessName(tailor) {
  return tailor.businessName || tailor.shopName || tailor.user?.name || 'Tailor';
}

/**
 * Customer Search View — Mumbai locality search bar + tailor card grid
 */
export default function CustomerSearch() {
  const [params, setParams] = useSearchParams();
  const [localityQuery, setLocalityQuery] = useState(params.get('locality') || '');
  const [specialty, setSpecialty] = useState(params.get('specialty') || '');
  const [localities, setLocalities] = useState(FALLBACK_LOCALITIES);
  const [tailors, setTailors] = useState([]);
  const [byLocality, setByLocality] = useState([]);
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
        setParams(query, { replace: true });

        const { data } = await api.get(`/tailors/search?${query.toString()}`, {
          signal: controller.signal,
        });
        setTailors(data.tailors || []);
        setByLocality(data.byLocality || []);
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
  }, [matchedLocality, specialty, setParams]);

  const quickLocalities = useMemo(() => {
    const popular = ['Bandra', 'Andheri', 'Powai', 'Dadar', 'Juhu', 'Worli'];
    return popular.filter((loc) => localities.includes(loc));
  }, [localities]);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-saffron">
          Customer search
        </p>
        <h1 className="font-display text-3xl font-bold text-navy sm:text-4xl">
          Find a tailor in Mumbai
        </h1>
        <p className="max-w-xl text-navy/60">
          Search by locality, filter by specialty, then book an approved maker near you.
        </p>
      </header>

      {/* Locality search bar */}
      <div className="card-surface overflow-hidden">
        <form
          className="flex flex-col gap-3 p-4 sm:flex-row sm:items-end"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="min-w-0 flex-1">
            <label htmlFor="customer-locality-search" className="label">
              Mumbai locality
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-navy/35">
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
                id="customer-locality-search"
                type="search"
                list="customer-mumbai-localities"
                className="input pl-10"
                placeholder="e.g. Bandra, Andheri, Powai"
                value={localityQuery}
                onChange={(e) => setLocalityQuery(e.target.value)}
                autoComplete="off"
              />
              <datalist id="customer-mumbai-localities">
                {localities.map((loc) => (
                  <option key={loc} value={loc} />
                ))}
              </datalist>
            </div>
          </div>
          {localityQuery && (
            <button
              type="button"
              className="btn-ghost shrink-0"
              onClick={() => setLocalityQuery('')}
            >
              Clear
            </button>
          )}
        </form>

        <div className="border-t border-navy/5 px-4 py-3">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-navy/40">
            Popular areas
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {quickLocalities.map((loc) => {
              const active = matchedLocality.toLowerCase() === loc.toLowerCase();
              return (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setLocalityQuery(loc)}
                  className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    active
                      ? 'bg-navy text-white'
                      : 'bg-sand-200 text-navy/70 hover:bg-navy/10'
                  }`}
                >
                  {loc}
                </button>
              );
            })}
          </div>
        </div>

        <div className="border-t border-navy/5 px-4 py-3">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-navy/40">
            Specialty
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-navy/55">
          {loading
            ? 'Searching…'
            : `${tailors.length} tailor${tailors.length === 1 ? '' : 's'}${
                matchedLocality ? ` in ${matchedLocality}` : ' across Mumbai'
              }`}
        </p>
        {byLocality.length > 0 && !matchedLocality && (
          <p className="text-xs text-navy/40">
            {byLocality.length} localities with approved makers
          </p>
        )}
      </div>

      {error && (
        <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">
          {error}
        </p>
      )}

      {loading && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card-surface h-44 animate-pulse bg-sand-200/80" />
          ))}
        </div>
      )}

      {!loading && !error && tailors.length === 0 && (
        <div className="rounded-2xl border border-dashed border-navy/15 px-4 py-14 text-center">
          <p className="font-display text-lg text-navy/70">No tailors found</p>
          <p className="mt-1 text-sm text-navy/45">
            Try another locality or clear specialty filters.
          </p>
        </div>
      )}

      {/* Tailor card grid */}
      {!loading && (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tailors.map((tailor) => {
            const name = businessName(tailor);
            const rating = tailor.averageRating ?? 0;
            return (
              <li key={tailor._id}>
                <article className="card-surface flex h-full flex-col overflow-hidden transition hover:-translate-y-0.5 hover:border-saffron/30">
                  <div className="h-2 bg-gradient-to-r from-navy via-navy-700 to-saffron" />
                  <div className="flex flex-1 flex-col p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="truncate font-display text-lg font-semibold text-navy">
                          {name}
                        </h2>
                        <p className="mt-0.5 text-sm font-medium text-saffron-600">
                          {tailor.locality}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <StarRating value={rating} readOnly size="sm" />
                        <p className="mt-0.5 text-xs text-navy/45">
                          {rating > 0 ? rating.toFixed(1) : 'New'}
                          {tailor.reviewCount ? ` · ${tailor.reviewCount}` : ''}
                        </p>
                      </div>
                    </div>

                    {tailor.bio && (
                      <p className="mt-2 line-clamp-2 text-sm text-navy/60">{tailor.bio}</p>
                    )}

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

                    <div className="mt-auto flex items-center justify-between gap-3 border-t border-navy/5 pt-4">
                      <span className="text-sm font-semibold text-navy">
                        {tailor.startingPrice != null
                          ? `from ₹${tailor.startingPrice}`
                          : 'Custom quote'}
                      </span>
                      <Link
                        to={`/tailors/${tailor._id}`}
                        className="btn-primary px-4 py-2 text-sm"
                      >
                        Book Now
                      </Link>
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
