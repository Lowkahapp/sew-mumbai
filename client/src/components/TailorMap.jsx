import { useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'react-leaflet-cluster/lib/assets/MarkerCluster.css';
import 'react-leaflet-cluster/lib/assets/MarkerCluster.Default.css';
import TailorMapPopup from './TailorMapPopup';

const MUMBAI_CENTER = [19.076, 72.8777];
const DEFAULT_ZOOM = 11;

/** Carto Dark Matter — high contrast for rose markers */
const TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

function createTailorIcon(active) {
  return L.divIcon({
    className: 'tailor-map-marker-wrap',
    html: active
      ? `<div class="tailor-map-marker tailor-map-marker--active" aria-hidden="true"><span class="tailor-map-marker-pulse"></span><span class="tailor-map-marker-dot"></span></div>`
      : `<div class="tailor-map-marker" aria-hidden="true"><span class="tailor-map-marker-dot"></span></div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -22],
  });
}

function createClusterIcon(cluster) {
  const count = cluster.getChildCount();
  return L.divIcon({
    className: 'tailor-map-cluster-wrap',
    html: `<div class="tailor-map-cluster"><span>${count}</span></div>`,
    iconSize: L.point(48, 48),
    iconAnchor: L.point(24, 24),
  });
}

function MapBoundsController({ pins, center, fitKey }) {
  const map = useMap();

  useEffect(() => {
    const points = pins
      .filter((p) => p.coordinates?.lat != null)
      .map((p) => [p.coordinates.lat, p.coordinates.lng]);

    if (center?.lat != null && center?.lng != null) {
      points.push([center.lat, center.lng]);
    }

    if (points.length === 0) {
      map.setView(MUMBAI_CENTER, DEFAULT_ZOOM);
      return;
    }
    if (points.length === 1) {
      map.setView(points[0], 14);
      return;
    }
    map.fitBounds(L.latLngBounds(points), { padding: [52, 52], maxZoom: 14 });
  }, [fitKey, map, pins, center]);

  return null;
}

function MapFlyToController({ selectedId, pins }) {
  const map = useMap();

  useEffect(() => {
    if (!selectedId) return;
    const pin = pins.find((p) => p._id === selectedId);
    if (!pin?.coordinates?.lat) return;

    map.flyTo([pin.coordinates.lat, pin.coordinates.lng], Math.max(map.getZoom(), 14), {
      duration: 0.75,
      easeLinearity: 0.25,
    });
  }, [selectedId, pins, map]);

  return null;
}

function TailorMarker({ tailor, active, onSelect }) {
  const markerRef = useRef(null);

  useEffect(() => {
    if (active && markerRef.current) {
      markerRef.current.openPopup();
    }
  }, [active]);

  return (
    <Marker
      ref={markerRef}
      position={[tailor.coordinates.lat, tailor.coordinates.lng]}
      icon={createTailorIcon(active)}
      eventHandlers={{
        click: () => onSelect(tailor._id),
      }}
    >
      <Popup className="tailor-map-popup" closeButton minWidth={240} maxWidth={280}>
        <TailorMapPopup tailor={tailor} />
      </Popup>
    </Marker>
  );
}

export default function TailorMap({
  tailors = [],
  center = null,
  selectedId = null,
  onPinClick,
  loading = false,
  fitKey = '',
}) {
  const pins = useMemo(
    () => tailors.filter((t) => t.coordinates?.lat != null && t.coordinates?.lng != null),
    [tailors]
  );

  return (
    <div className="tailor-map-shell overflow-hidden rounded-2xl border border-navy/20 bg-navy shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-navy-800/80 px-4 py-3 backdrop-blur-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-400">
            Map view
          </p>
          <p className="text-sm font-medium text-white/90">
            {center ? `Near ${center.label}` : 'Mumbai tailors'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-white/70">
            {pins.length} tailor{pins.length === 1 ? '' : 's'}
          </span>
          <span className="hidden rounded-full border border-rose-500/30 bg-rose-600/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-rose-300 sm:inline">
            Dark Matter
          </span>
        </div>
      </div>

      <div className="relative">
        <MapContainer
          center={MUMBAI_CENTER}
          zoom={DEFAULT_ZOOM}
          className="tailor-map-container z-0 h-[min(440px,62vh)] w-full min-h-[320px]"
          scrollWheelZoom
          zoomControl
        >
          <TileLayer attribution={TILE_ATTRIBUTION} url={TILE_URL} />

          <MapBoundsController pins={pins} center={center} fitKey={fitKey} />
          <MapFlyToController selectedId={selectedId} pins={pins} />

          {center?.lat != null && center?.lng != null && (
            <CircleMarker
              center={[center.lat, center.lng]}
              radius={14}
              pathOptions={{
                color: '#fb7185',
                fillColor: '#e11d48',
                fillOpacity: 0.25,
                weight: 2,
              }}
            >
              <Popup className="tailor-map-popup">
                <div className="tailor-map-popup-card py-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-rose-400">
                    Search area
                  </p>
                  <p className="mt-1 font-display text-sm font-bold text-white">{center.label}</p>
                </div>
              </Popup>
            </CircleMarker>
          )}

          <MarkerClusterGroup
            chunkedLoading
            showCoverageOnHover={false}
            spiderfyOnMaxZoom
            zoomToBoundsOnClick
            maxClusterRadius={52}
            iconCreateFunction={createClusterIcon}
          >
            {pins.map((t) => (
              <TailorMarker
                key={t._id}
                tailor={t}
                active={selectedId === t._id}
                onSelect={onPinClick}
              />
            ))}
          </MarkerClusterGroup>
        </MapContainer>

        {loading && (
          <div className="pointer-events-none absolute inset-0 z-[500] flex items-center justify-center bg-navy/40 backdrop-blur-[2px]">
            <span className="rounded-full border border-white/10 bg-navy-800/90 px-4 py-2 text-xs font-medium text-white/80 shadow-soft">
              Updating map…
            </span>
          </div>
        )}

        {pins.length === 0 && !loading && (
          <div className="pointer-events-none absolute bottom-4 left-1/2 z-[500] -translate-x-1/2 rounded-full border border-white/10 bg-navy-800/95 px-4 py-2 text-xs font-medium text-white/60 shadow-soft">
            No pins for this filter — zoom in to explore clusters
          </div>
        )}
      </div>

      <p className="border-t border-white/10 bg-navy-900/50 px-4 py-2.5 text-center text-xs text-white/45">
        Clusters expand as you zoom · click a pin for details · selected marker pulses rose
      </p>
    </div>
  );
}
