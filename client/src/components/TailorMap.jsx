import { projectToMap } from '../utils/geo';

const W = 320;
const H = 380;

export default function TailorMap({ tailors = [], center = null, selectedId = null, onPinClick }) {
  const pins = tailors.filter((t) => t.coordinates?.lat && t.coordinates?.lng);

  return (
    <div className="rounded-2xl border border-navy/8 bg-gradient-to-b from-sand-100 to-white p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-navy/45">Map view</p>
          <p className="text-sm font-medium text-navy">
            {center ? `Near ${center.label}` : 'Mumbai tailors'}
          </p>
        </div>
        <span className="rounded-full bg-navy/5 px-2.5 py-1 text-xs font-medium text-navy/60">
          {pins.length} pin{pins.length === 1 ? '' : 's'}
        </span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto h-auto w-full max-w-[320px]" role="img" aria-label="Mumbai tailor map">
        <defs>
          <pattern id="map-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(11,29,54,0.04)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width={W} height={H} fill="url(#map-grid)" rx="12" />
        <path
          d="M40 340 Q80 300 120 320 T200 310 Q260 290 280 340"
          fill="none"
          stroke="rgba(11,29,54,0.08)"
          strokeWidth="2"
        />
        <text x={W / 2} y={H - 8} textAnchor="middle" className="fill-navy/30 text-[9px]">
          Arabian Sea ← West · East →
        </text>

        {center?.lat && (
          <g>
            {(() => {
              const { x, y } = projectToMap(center.lat, center.lng, W, H);
              return (
                <>
                  <circle cx={x} cy={y} r="18" className="fill-saffron/15 stroke-saffron/40" strokeWidth="1" />
                  <circle cx={x} cy={y} r="5" className="fill-saffron" />
                  <text x={x} y={y - 22} textAnchor="middle" className="fill-saffron-600 text-[8px] font-semibold">
                    You searched
                  </text>
                </>
              );
            })()}
          </g>
        )}

        {pins.map((t) => {
          const { x, y } = projectToMap(t.coordinates.lat, t.coordinates.lng, W, H);
          const active = selectedId === t._id;
          return (
            <g
              key={t._id}
              className={onPinClick ? 'cursor-pointer' : ''}
              onClick={() => onPinClick?.(t._id)}
            >
              <circle
                cx={x}
                cy={y}
                r={active ? 9 : 7}
                className={active ? 'fill-navy stroke-saffron' : 'fill-navy/80 stroke-white'}
                strokeWidth="2"
              />
              {active && (
                <text x={x} y={y - 12} textAnchor="middle" className="fill-navy text-[7px] font-semibold">
                  {(t.businessName || t.user?.name || 'Tailor').slice(0, 14)}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      <p className="mt-2 text-center text-xs text-navy/45">
        Pins show approximate workshop areas — sorted by distance when a neighborhood is selected.
      </p>
    </div>
  );
}
