import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { projectToMap } from '../utils/geo';

const W = 320;
const H = 380;
const MIN_ZOOM = 0.6;
const MAX_ZOOM = 2.5;

/** OpenStreetMap static tile — Mumbai overview */
const MAP_BG =
  'https://staticmap.openstreetmap.de/staticmap.php?center=19.076,72.8777&zoom=11&size=800x480&maptype=mapnik';

function tailorName(t) {
  return t.businessName || t.shopName || t.user?.name || 'Tailor';
}

function clampView(view) {
  const maxW = W / MIN_ZOOM;
  const minW = W / MAX_ZOOM;
  const w = Math.min(maxW, Math.max(minW, view.w));
  const h = w * (H / W);
  const x = Math.min(W - w * 0.15, Math.max(-w * 0.15, view.x));
  const y = Math.min(H - h * 0.15, Math.max(-h * 0.15, view.y));
  return { x, y, w, h };
}

export default function TailorMap({
  tailors = [],
  center = null,
  selectedId = null,
  onPinClick,
  loading = false,
  fitKey = '',
}) {
  const svgRef = useRef(null);
  const [view, setView] = useState({ x: 0, y: 0, w: W, h: H });
  const [drag, setDrag] = useState(null);
  const [activeTip, setActiveTip] = useState(null);

  const pins = useMemo(
    () => tailors.filter((t) => t.coordinates?.lat != null && t.coordinates?.lng != null),
    [tailors]
  );

  const resetView = useCallback(() => {
    setView({ x: 0, y: 0, w: W, h: H });
  }, []);

  useEffect(() => {
    resetView();
    setActiveTip(null);
  }, [fitKey, resetView]);

  useEffect(() => {
    if (!selectedId) return;
    const pin = pins.find((p) => p._id === selectedId);
    if (!pin?.coordinates) return;
    const { x, y } = projectToMap(pin.coordinates.lat, pin.coordinates.lng, W, H);
    setView((prev) =>
      clampView({
        x: x - prev.w / 2,
        y: y - prev.h / 2,
        w: prev.w,
        h: prev.h,
      })
    );
    setActiveTip(selectedId);
  }, [selectedId, pins]);

  const viewBox = `${view.x} ${view.y} ${view.w} ${view.h}`;

  const zoom = (factor, clientX, clientY) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const px = ((clientX - rect.left) / rect.width) * view.w + view.x;
    const py = ((clientY - rect.top) / rect.height) * view.h + view.y;
    setView((prev) => {
      const nextW = prev.w * factor;
      const nextH = prev.h * factor;
      return clampView({
        w: nextW,
        h: nextH,
        x: px - (px - prev.x) * (nextW / prev.w),
        y: py - (py - prev.y) * (nextH / prev.h),
      });
    });
  };

  const onWheel = (e) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 1.12 : 0.88;
    zoom(factor, e.clientX, e.clientY);
  };

  const onPointerDown = (e) => {
    if (e.target.closest('[data-map-pin]')) return;
    setDrag({ x: e.clientX, y: e.clientY, view: { ...view } });
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!drag || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const dx = ((e.clientX - drag.x) / rect.width) * drag.view.w;
    const dy = ((e.clientY - drag.y) / rect.height) * drag.view.h;
    setView(clampView({
      ...drag.view,
      x: drag.view.x - dx,
      y: drag.view.y - dy,
    }));
  };

  const onPointerUp = (e) => {
    setDrag(null);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-soft">
      <div className="flex items-center justify-between gap-2 border-b border-navy/8 bg-sand-100 px-4 py-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-navy/45">Map view</p>
          <p className="text-sm font-medium text-navy">
            {center ? `Near ${center.label}` : 'Mumbai tailors'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-navy/60 ring-1 ring-navy/10">
            {pins.length} pin{pins.length === 1 ? '' : 's'}
          </span>
          <div className="flex overflow-hidden rounded-lg ring-1 ring-navy/10">
            <button
              type="button"
              className="bg-white px-2.5 py-1 text-sm font-semibold text-navy hover:bg-sand-100"
              onClick={() => zoom(0.85, svgRef.current?.getBoundingClientRect().left + 200, 200)}
              aria-label="Zoom in"
            >
              +
            </button>
            <button
              type="button"
              className="border-l border-navy/10 bg-white px-2.5 py-1 text-sm font-semibold text-navy hover:bg-sand-100"
              onClick={() => zoom(1.15, svgRef.current?.getBoundingClientRect().left + 200, 200)}
              aria-label="Zoom out"
            >
              −
            </button>
            <button
              type="button"
              className="border-l border-navy/10 bg-white px-2 py-1 text-xs font-medium text-navy/60 hover:bg-sand-100"
              onClick={resetView}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="relative bg-sky-100">
        <svg
          ref={svgRef}
          viewBox={viewBox}
          width="100%"
          height="400"
          className="block w-full cursor-grab touch-none active:cursor-grabbing"
          role="application"
          aria-label="Interactive Mumbai tailor map — drag to pan, scroll to zoom"
          onWheel={onWheel}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <rect x="0" y="0" width={W} height={H} fill="#dbeafe" />
          <image href={MAP_BG} x="0" y="0" width={W} height={H} preserveAspectRatio="xMidYMid slice" />

          {center?.lat != null && center?.lng != null && (() => {
            const { x, y } = projectToMap(center.lat, center.lng, W, H);
            return (
              <g pointerEvents="none">
                <circle cx={x} cy={y} r="18" fill="#E07A3D" fillOpacity="0.2" stroke="#E07A3D" strokeWidth="2" />
                <circle cx={x} cy={y} r="5" fill="#E07A3D" stroke="#fff" strokeWidth="2" />
                <text x={x} y={y - 22} textAnchor="middle" fill="#C9652B" fontSize="8" fontWeight="700">
                  You searched
                </text>
              </g>
            );
          })()}

          {pins.map((t) => {
            const { x, y } = projectToMap(t.coordinates.lat, t.coordinates.lng, W, H);
            const active = selectedId === t._id || activeTip === t._id;
            const name = tailorName(t);
            return (
              <g key={t._id} data-map-pin>
                <circle
                  cx={x}
                  cy={y}
                  r="18"
                  fill="transparent"
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPinClick?.(t._id);
                    setActiveTip(t._id);
                  }}
                />
                <circle
                  cx={x}
                  cy={y}
                  r={active ? 10 : 7}
                  fill={active ? '#E07A3D' : '#0B1D36'}
                  stroke="#fff"
                  strokeWidth="2.5"
                  className="pointer-events-none"
                />
                {active && (
                  <foreignObject x={x - 70} y={y - 58} width="140" height="52">
                    <div
                      xmlns="http://www.w3.org/1999/xhtml"
                      className="rounded-lg border border-navy/10 bg-white px-2 py-1.5 text-center shadow-soft"
                    >
                      <p className="truncate text-[10px] font-semibold text-navy">{name}</p>
                      <Link
                        to={`/tailors/${t._id}`}
                        className="text-[9px] font-semibold text-saffron-600 underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View profile
                      </Link>
                    </div>
                  </foreignObject>
                )}
              </g>
            );
          })}
        </svg>

        {loading && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/50">
            <span className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-navy/60 shadow-soft ring-1 ring-navy/10">
              Updating pins…
            </span>
          </div>
        )}

        {pins.length === 0 && !loading && (
          <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white/95 px-3 py-1.5 text-xs font-medium text-navy/55 shadow-soft ring-1 ring-navy/10">
            No pins for this filter — drag and zoom to explore
          </div>
        )}
      </div>

      <p className="border-t border-navy/8 bg-white px-4 py-2.5 text-center text-xs text-navy/50">
        Drag to pan · scroll or use +/− to zoom · click a pin to highlight the tailor below
      </p>
    </div>
  );
}
