import { useId } from 'react';
import { projectToMap } from '../utils/geo';

const W = 320;
const H = 380;

export default function TailorMap({ tailors = [], center = null, selectedId = null, onPinClick }) {
  const patternId = useId().replace(/:/g, '');
  const pins = tailors.filter((t) => t.coordinates?.lat != null && t.coordinates?.lng != null);

  return (
    <div className="overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-soft">
      <div className="flex items-center justify-between gap-2 border-b border-navy/8 bg-sand-100 px-4 py-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-navy/45">Map view</p>
          <p className="text-sm font-medium text-navy">
            {center ? `Near ${center.label}` : 'Mumbai tailors'}
          </p>
        </div>
        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-navy/60 ring-1 ring-navy/10">
          {pins.length} pin{pins.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className="bg-gradient-to-b from-sky-50/80 to-sand-100 p-4">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid meet"
          className="mx-auto block aspect-[320/380] w-full max-w-md min-h-[280px] max-h-[420px]"
          role="img"
          aria-label="Mumbai tailor map"
        >
          <defs>
            <pattern id={patternId} width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#0B1D36" strokeOpacity="0.05" strokeWidth="1" />
            </pattern>
            <linearGradient id={`${patternId}-sea`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#dbeafe" stopOpacity="0.9" />
              <stop offset="35%" stopColor="#f7f4ef" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#f7f4ef" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Map canvas */}
          <rect width={W} height={H} rx="16" fill={`url(#${patternId}-sea)`} />
          <rect width={W} height={H} rx="16" fill={`url(#${patternId})`} />

          {/* Simplified Mumbai landmass outline */}
          <path
            d="M28 320 L45 250 L70 180 L95 120 L130 85 L165 70 L200 75 L235 95 L265 130 L285 175 L295 230 L300 290 L295 340 L28 340 Z"
            fill="#F7F4EF"
            stroke="#0B1D36"
            strokeOpacity="0.12"
            strokeWidth="2"
          />

          {/* Coastline hint */}
          <path
            d="M28 320 Q60 280 95 250 T165 220 T235 250 T295 290"
            fill="none"
            stroke="#0B1D36"
            strokeOpacity="0.08"
            strokeWidth="2"
          />

          <text x={W / 2} y={H - 12} textAnchor="middle" fill="#0B1D36" fillOpacity="0.35" fontSize="9">
            Arabian Sea ← West · East →
          </text>

          {center?.lat != null && center?.lng != null && (() => {
            const { x, y } = projectToMap(center.lat, center.lng, W, H);
            return (
              <g>
                <circle cx={x} cy={y} r="20" fill="#E07A3D" fillOpacity="0.15" stroke="#E07A3D" strokeOpacity="0.5" strokeWidth="1.5" />
                <circle cx={x} cy={y} r="6" fill="#E07A3D" stroke="#fff" strokeWidth="2" />
                <text x={x} y={y - 26} textAnchor="middle" fill="#C9652B" fontSize="8" fontWeight="600">
                  You searched
                </text>
              </g>
            );
          })()}

          {pins.map((t) => {
            const { x, y } = projectToMap(t.coordinates.lat, t.coordinates.lng, W, H);
            const active = selectedId === t._id;
            const label = (t.businessName || t.user?.name || 'Tailor').slice(0, 12);
            return (
              <g
                key={t._id}
                style={{ cursor: onPinClick ? 'pointer' : 'default' }}
                onClick={() => onPinClick?.(t._id)}
                onKeyDown={(e) => e.key === 'Enter' && onPinClick?.(t._id)}
                role={onPinClick ? 'button' : undefined}
                tabIndex={onPinClick ? 0 : undefined}
              >
                <circle
                  cx={x}
                  cy={y}
                  r={active ? 11 : 8}
                  fill={active ? '#E07A3D' : '#0B1D36'}
                  fillOpacity={active ? 1 : 0.85}
                  stroke="#fff"
                  strokeWidth="2"
                />
                {active && (
                  <text x={x} y={y - 14} textAnchor="middle" fill="#0B1D36" fontSize="7" fontWeight="600">
                    {label}
                  </text>
                )}
              </g>
            );
          })}

          {pins.length === 0 && (
            <text x={W / 2} y={H / 2} textAnchor="middle" fill="#0B1D36" fillOpacity="0.45" fontSize="11">
              No tailor pins for this filter
            </text>
          )}
        </svg>
      </div>

      <p className="border-t border-navy/8 bg-white px-4 py-2.5 text-center text-xs text-navy/50">
        Pins show approximate workshop areas — sorted by distance when a neighborhood is selected.
      </p>
    </div>
  );
}
