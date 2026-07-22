import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const POPULAR = ['Bandra West', 'Andheri West', 'Powai', 'Dadar West', 'Colaba', 'Juhu'];

export default function NeighborhoodSelector({ value, onChange, includeAll = false }) {
  const [byZone, setByZone] = useState([]);
  const [query, setQuery] = useState(value || '');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    api
      .get('/neighborhoods')
      .then(({ data }) => setByZone(data.byZone || []))
      .catch(() => setByZone([]));
  }, []);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  const allNeighborhoods = useMemo(
    () => byZone.flatMap((z) => z.neighborhoods),
    [byZone]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return byZone;
    return byZone
      .map(({ zone, neighborhoods }) => ({
        zone,
        neighborhoods: neighborhoods.filter(
          (n) =>
            n.label.toLowerCase().includes(q) ||
            n.zone.toLowerCase().includes(q) ||
            n.id.toLowerCase().includes(q)
        ),
      }))
      .filter((z) => z.neighborhoods.length > 0);
  }, [byZone, query]);

  const pick = (label) => {
    onChange(label);
    setQuery(label);
    setOpen(false);
  };

  const clear = () => {
    onChange('');
    setQuery('');
  };

  const popular = POPULAR.filter((p) =>
    allNeighborhoods.some((n) => n.label === p)
  );

  return (
    <div className="space-y-3">
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-navy/35 z-10">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
            <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
          </svg>
        </span>
        <input
          type="search"
          className="input pl-10"
          placeholder="Search neighborhood — Bandra West, Powai…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            if (!e.target.value) onChange('');
          }}
          onFocus={() => setOpen(true)}
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            className="absolute inset-y-0 right-2 text-xs font-medium text-navy/45 hover:text-navy"
            onClick={clear}
          >
            Clear
          </button>
        )}
      </div>

      {open && filtered.length > 0 && (
        <div className="absolute z-30 max-h-64 w-full overflow-y-auto rounded-xl border border-navy/10 bg-white shadow-soft">
          {includeAll && (
            <button
              type="button"
              className="block w-full px-4 py-2.5 text-left text-sm hover:bg-sand-100"
              onClick={() => pick('')}
            >
              All neighborhoods
            </button>
          )}
          {filtered.map(({ zone, neighborhoods }) => (
            <div key={zone}>
              <p className="sticky top-0 bg-sand-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-navy/45">
                {zone}
              </p>
              {neighborhoods.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  className={`block w-full px-4 py-2 text-left text-sm hover:bg-saffron/10 ${
                    value === n.label ? 'bg-saffron/15 font-semibold text-navy' : 'text-navy/75'
                  }`}
                  onClick={() => pick(n.label)}
                >
                  {n.label}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}

      {popular.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-navy/40">
            Popular neighborhoods
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {popular.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => pick(label)}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  value === label ? 'bg-navy text-white' : 'bg-sand-200 text-navy/70 hover:bg-navy/10'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
