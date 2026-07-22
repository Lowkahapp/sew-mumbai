import { getDiagram } from '../constants/measurementDiagrams';

function Silhouette({ garmentType }) {
  if (garmentType === 'blouse') {
    return (
      <>
        <ellipse cx="120" cy="42" rx="22" ry="26" className="fill-sand-200 stroke-navy/20" strokeWidth="1.5" />
        <path
          d="M88 68 Q120 78 152 68 L168 130 L188 200 L168 210 L152 130 L120 140 L88 130 L72 210 L52 200 L72 130 Z"
          className="fill-sand-100 stroke-navy/25"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </>
    );
  }
  if (garmentType === 'shirt') {
    return (
      <>
        <ellipse cx="120" cy="40" rx="20" ry="24" className="fill-sand-200 stroke-navy/20" strokeWidth="1.5" />
        <path
          d="M90 64 L75 200 L165 200 L150 64 Q120 74 90 64 Z"
          className="fill-sand-100 stroke-navy/25"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M90 64 L55 190 M150 64 L185 190" className="stroke-navy/20" strokeWidth="8" strokeLinecap="round" fill="none" />
      </>
    );
  }
  return (
    <>
      <path
        d="M95 40 L85 120 L78 280 L108 280 L115 140 L125 140 L132 280 L162 280 L155 120 L145 40 Z"
        className="fill-sand-100 stroke-navy/25"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M95 40 L145 40" className="stroke-navy/20" strokeWidth="2" fill="none" />
    </>
  );
}

export default function MeasurementDiagram({ garmentType, activeFieldKey, filledKeys = [] }) {
  const diagram = getDiagram(garmentType);
  if (!diagram) return null;

  const markers = Object.entries(diagram.markers);

  return (
    <div className="rounded-2xl border border-navy/8 bg-gradient-to-b from-sand-100 to-white p-4">
      <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wide text-navy/45">
        {diagram.title}
      </p>
      <svg viewBox={diagram.viewBox} className="mx-auto h-auto w-full max-w-[220px]" aria-hidden="true">
        <Silhouette garmentType={garmentType} />

        {markers.map(([key, m]) => {
          const isActive = key === activeFieldKey;
          const isFilled = filledKeys.includes(key);
          const color = isActive ? '#E07A3D' : isFilled ? '#0B1D36' : '#0B1D3640';

          return (
            <g key={key}>
              <line
                x1={m.x1}
                y1={m.y1}
                x2={m.x2}
                y2={m.y2}
                stroke={color}
                strokeWidth={isActive ? 2.5 : 1.5}
                strokeDasharray={isActive ? undefined : '5 4'}
              />
              {(isActive || isFilled) && (
                <text
                  x={m.lx}
                  y={m.ly}
                  textAnchor="middle"
                  className="fill-navy text-[9px] font-semibold"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  {m.label}
                </text>
              )}
              {isActive && (
                <circle cx={m.lx} cy={(m.y1 + m.y2) / 2} r="14" className="fill-saffron/15 stroke-saffron" strokeWidth="1.5" />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
