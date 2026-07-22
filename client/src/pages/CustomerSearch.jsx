import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import StarRating from '../components/StarRating';
import VerifiedArtisanBadge from '../components/VerifiedArtisanBadge';
import NeighborhoodSelector from '../components/NeighborhoodSelector';
import TailorMap from '../components/TailorMap';
import { formatDistance } from '../utils/geo';

const SPECIALTIES = [
  { label: 'Lehengas', query: 'Lehenga' },
  { label: 'Suits', query: 'Suit' },
  { label: 'Alterations', query: 'Alterations' },
];

function businessName(tailor) {
  return tailor.businessName || tailor.shopName || tailor.user?.name || 'Tailor';
}

/**
 * Customer Search — neighborhood selector + map pins + tailor grid
 */
export default function CustomerSearch() {
  const [params, setParams] = useSearchParams();
  const [neighborhood, setNeighborhood] = useState(params.get('locality') || '');
  const [specialty, setSpecialty] = useState(params.get('specialty') || '');
  const [tailors, setTailors] = useState([]);
  const [mapCenter, setMapCenter] = useState(null);
  const [highlightId, setHighlightId] = useState(null);
  const [showMap, setShowMap] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const query = new URLSearchParams();
        if (neighborhood) query.set('locality', neighborhood);
        if (specialty) query.set('specialty', specialty);
        if (neighborhood) query.set('sort', 'distance');
        setParams(query, { replace: true });

        const { data } = await api.get(`/tailors/search?${query.toString()}`, {
          signal: controller.signal,
        });
        setTailors(data.tailors || []);
        setMapCenter(data.center || null);
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
  }, [neighborhood, specialty, setParams]);

  const resultLabel = useMemo(() => {
    if (loading) return 'Searching…';
    const n = tailors.length;
    const base = `${n} tailor${n === 1 ? '' : 's'}`;
    return neighborhood ? `${base} near ${neighborhood}` : `${base} across Mumbai`;
  }, [loading, tailors.length, neighborhood]);

  const mapFitKey = useMemo(
    () => `${neighborhood}|${specialty}|${tailors.map((t) => t._id).join(',')}`,
    [neighborhood, specialty, tailors]
  );

  const handlePinClick = (id) => {
    setHighlightId(id);
    requestAnimationFrame(() => {
      document.getElementById(`tailor-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  };

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-saffron">
          Customer search
        </p>
        <h1 className="font-display text-3xl font-bold text-navy sm:text-4xl">
          Find a tailor near you
        </h1>
        <p className="max-w-xl text-navy/60">
          Filter by neighborhood, see map pins, and book the closest tailor for fittings or drop-offs.
        </p>
      </header>

      <div className="card-surface">
        <div className="relative z-10 p-4">
          <label className="label">Neighborhood</label>
          <NeighborhoodSelector value={neighborhood} onChange={setNeighborhood} includeAll />
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
        <p className="text-sm text-navy/55">{resultLabel}</p>
        <button
          type="button"
          className="btn-ghost text-sm"
          onClick={() => setShowMap((v) => !v)}
        >
          {showMap ? 'Hide map' : 'Show map'}
        </button>
      </div>

      {showMap && (
        <TailorMap
          tailors={tailors}
          center={mapCenter}
          selectedId={highlightId}
          onPinClick={handlePinClick}
          loading={loading}
          fitKey={mapFitKey}
        />
      )}

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
            const highlighted = highlightId === tailor._id;
            return (
              <li key={tailor._id} id={`tailor-${tailor._id}`}>
                <article
                  className={`card-surface flex h-full flex-col overflow-hidden transition hover:-translate-y-0.5 ${
                    highlighted ? 'border-saffron ring-2 ring-saffron/30' : 'hover:border-saffron/30'
                  }`}
                  onMouseEnter={() => setHighlightId(tailor._id)}
                >
                  <div className="h-2 bg-gradient-to-r from-navy via-navy-700 to-saffron" />
                  <div className="flex flex-1 flex-col p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="truncate font-display text-lg font-semibold text-navy">
                          {name}
                        </h2>
                        {tailor.isVerifiedArtisan && (
                          <VerifiedArtisanBadge size="sm" className="mt-1" />
                        )}
                        <p className="mt-0.5 text-sm font-medium text-saffron-600">
                          {tailor.neighborhood || tailor.locality}
                        </p>
                        {tailor.distanceKm != null && (
                          <p className="text-xs font-medium text-navy/50">
                            {formatDistance(tailor.distanceKm)}
                          </p>
                        )}
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
