// src/components/WorldMap.jsx
import { useEffect, useRef } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { EVENT_COLORS } from "../utils/eventColors";

// Fix default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Event type → emoji icon
const EVENT_ICONS = {
  earthquake: "🌋",
  wildfire:   "🔥",
  flood:      "🌊",
  tsunami:    "🌊",
  volcano:    "🌋",
  hurricane:  "🌀",
  drought:    "☀️",
  snowfall:   "❄️",
  ocean:      "🌐",
  airquality: "💨",
  weather:    "🌤️",
  general:    "📍",
};

// Pulse CSS injected once
let pulseInjected = false;
function injectPulseCSS() {
  if (pulseInjected) return;
  pulseInjected = true;
  const style = document.createElement("style");
  style.textContent = `
    @keyframes gvRingPulse {
      0%   { transform: translate(-50%,-50%) scale(1);   opacity: 0.85; }
      70%  { transform: translate(-50%,-50%) scale(2.6); opacity: 0;    }
      100% { transform: translate(-50%,-50%) scale(2.6); opacity: 0;    }
    }
    @keyframes gvRingPulse2 {
      0%   { transform: translate(-50%,-50%) scale(1);   opacity: 0.5; }
      70%  { transform: translate(-50%,-50%) scale(3.4); opacity: 0;   }
      100% { transform: translate(-50%,-50%) scale(3.4); opacity: 0;   }
    }
    @keyframes gvIconDrop {
      0%   { opacity: 0; transform: translate(-50%,-50%) translateY(-10px) scale(0.5); }
      65%  { transform: translate(-50%,-50%) translateY(3px) scale(1.1); }
      100% { opacity: 1; transform: translate(-50%,-50%) translateY(0)  scale(1);   }
    }
    @keyframes gvPinBounce {
      0%   { transform: translateY(-16px) scale(0.7); opacity: 0; }
      55%  { transform: translateY(4px) scale(1.05); }
      75%  { transform: translateY(-3px) scale(0.98); }
      100% { transform: translateY(0) scale(1); opacity: 1; }
    }
    @keyframes gvPinGlow {
      0%, 100% { box-shadow: 0 0 12px 4px var(--gv-pin-color, #00eaff); }
      50%       { box-shadow: 0 0 24px 10px var(--gv-pin-color, #00eaff); }
    }
    /* Shared centering for all marker children */
    .gv-marker-child {
      position: absolute;
      top: 50%;
      left: 50%;
      border-radius: 50%;
      pointer-events: none;
    }
    .gv-location-pin {
      position: absolute;
      top: 50%; left: 50%;
      animation: gvPinBounce 0.6s ease both;
      display: flex;
      flex-direction: column;
      align-items: center;
      transform: translate(-50%, -100%);
    }
    .gv-pin-head {
      width: 20px; height: 20px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      animation: gvPinGlow 2s ease-in-out infinite;
    }
    .gv-pin-tail {
      width: 2px;
      height: 10px;
      background: rgba(255,255,255,0.4);
      border-radius: 2px;
      margin-top: -1px;
    }
    .leaflet-container {
      background: #020617 !important;
    }
    .gv-popup .leaflet-popup-content-wrapper {
      background: rgba(8,14,30,0.95);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 12px;
      backdrop-filter: blur(12px);
      box-shadow: 0 8px 32px rgba(0,0,0,0.6);
      color: #e0e6f0;
      padding: 0;
    }
    .gv-popup .leaflet-popup-tip {
      background: rgba(8,14,30,0.95);
    }
    .gv-popup .leaflet-popup-content {
      margin: 0;
      padding: 0;
    }
  `;
  document.head.appendChild(style);
}

function createEventIcon(type, color, size = 24) {
  injectPulseCSS();
  const emoji = EVENT_ICONS[type] || EVENT_ICONS.general;
  // Container has real dimensions so top:50%/left:50% resolves to visual center
  const boxSize = size * 3.2;
  const half = boxSize / 2;
  return L.divIcon({
    className: "",
    iconSize:   [boxSize, boxSize],
    iconAnchor: [half, half],          // anchor at visual center
    html: `
      <div style="position:relative;width:${boxSize}px;height:${boxSize}px;">
        <!-- Ring 1 -->
        <div style="
          position:absolute; top:50%; left:50%;
          width:${size * 1.8}px; height:${size * 1.8}px;
          border-radius:50%;
          border:2px solid ${color};
          animation:gvRingPulse 2.2s ease-out infinite;
          pointer-events:none;
        "></div>
        <!-- Ring 2 (delayed, larger) -->
        <div style="
          position:absolute; top:50%; left:50%;
          width:${size * 1.8}px; height:${size * 1.8}px;
          border-radius:50%;
          border:1.5px solid ${color};
          animation:gvRingPulse2 2.2s ease-out infinite;
          animation-delay:0.55s;
          pointer-events:none;
        "></div>
        <!-- Emoji icon centered -->
        <div style="
          position:absolute; top:50%; left:50%;
          transform:translate(-50%,-50%);
          font-size:${size}px;
          line-height:1;
          animation:gvIconDrop 0.5s cubic-bezier(.36,.07,.19,.97) both;
          filter:drop-shadow(0 2px 6px rgba(0,0,0,0.85));
          cursor:pointer;
          user-select:none;
        ">${emoji}</div>
      </div>
    `,
  });
}

function createLocationPin(color = "#ff2d2d") {
  injectPulseCSS();
  return L.divIcon({
    className: "",
    iconSize: [38, 52],
    iconAnchor: [19, 52],
    html: `
      <div style="position:relative;width:38px;height:52px;animation:gvPinBounce 0.6s cubic-bezier(.36,.07,.19,.97) both;filter:drop-shadow(0 6px 12px rgba(0,0,0,0.55));">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 38 52" width="38" height="52">
          <defs>
            <radialGradient id="pinGrad" cx="38%" cy="32%" r="60%">
              <stop offset="0%" stop-color="#ff6666"/>
              <stop offset="60%" stop-color="${color}"/>
              <stop offset="100%" stop-color="#8b0000"/>
            </radialGradient>
            <filter id="pinShadow" x="-20%" y="-10%" width="140%" height="140%">
              <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="rgba(0,0,0,0.4)"/>
            </filter>
          </defs>
          <!-- Teardrop body -->
          <path
            d="M19 1 C9.06 1 1 9.06 1 19 C1 30.5 19 51 19 51 C19 51 37 30.5 37 19 C37 9.06 28.94 1 19 1 Z"
            fill="url(#pinGrad)"
            filter="url(#pinShadow)"
          />
          <!-- Highlight sheen -->
          <ellipse cx="13.5" cy="13" rx="5" ry="6.5" fill="rgba(255,255,255,0.22)" transform="rotate(-15,13.5,13)"/>
          <!-- Circular hole -->
          <circle cx="19" cy="19" r="7.5" fill="rgba(80,0,0,0.75)"/>
          <circle cx="19" cy="19" r="6.2" fill="rgba(20,0,0,0.9)"/>
        </svg>
      </div>
    `,
  });
}

function RecenterMap({ location }) {
  const map = useMap();
  useEffect(() => {
    const nextCenter = location ? [location.lat, location.lng] : [20, 0];
    const nextZoom = location ? 5 : 2;
    map.setView(nextCenter, nextZoom, { animate: true, duration: 1.2 });
  }, [location, map]);
  return null;
}

// Forces Leaflet to recalculate canvas size after DOM settles
function InvalidateSize() {
  const map = useMap();
  useEffect(() => {
    // Slight delay lets the flex layout finish before Leaflet measures
    const t = setTimeout(() => map.invalidateSize(), 120);
    const onResize = () => map.invalidateSize();
    window.addEventListener("resize", onResize);
    return () => { clearTimeout(t); window.removeEventListener("resize", onResize); };
  }, [map]);
  return null;
}


// Tile layer configs
const TILE_LAYERS = {
  dark: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "&copy; Esri",
  },
  precipitation: {
    base: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    overlay: "https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=demo",
    attribution: "&copy; CARTO &copy; OpenWeatherMap",
  },
  wind: {
    base: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    overlay: "https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=demo",
    attribution: "&copy; CARTO &copy; OpenWeatherMap",
  },
  temp: {
    base: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    overlay: "https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=demo",
    attribution: "&copy; CARTO &copy; OpenWeatherMap",
  },
};

function LayerManager({ activeLayer }) {
  const map = useMap();
  const overlayRef = useRef(null);

  useEffect(() => {
    if (overlayRef.current) {
      map.removeLayer(overlayRef.current);
      overlayRef.current = null;
    }
    const config = TILE_LAYERS[activeLayer];
    if (!config) return;
    if (config.overlay) {
      const overlay = L.tileLayer(config.overlay, { opacity: 0.7 });
      overlay.addTo(map);
      overlayRef.current = overlay;
    }
    return () => {
      if (overlayRef.current) map.removeLayer(overlayRef.current);
    };
  }, [activeLayer, map]);

  return null;
}

export default function WorldMap({ location, events, activeLayer = "dark" }) {
  const cfg = TILE_LAYERS[activeLayer] || TILE_LAYERS.dark;
  const baseUrl = cfg.url || cfg.base || TILE_LAYERS.dark.url;
  const attribution = cfg.attribution || TILE_LAYERS.dark.attribution;

  const magnitudeToSize = (mag) => {
    if (!mag) return 26;
    return Math.max(22, Math.min(38, mag * 4));
  };

  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      style={{ height: "100%", width: "100%" }}
      worldCopyJump
      zoomControl={false}
    >
      <InvalidateSize />
      <RecenterMap location={location} />
      <LayerManager activeLayer={activeLayer} />
      <TileLayer url={baseUrl} attribution={attribution} />

      {/* Location pin */}
      {location && (
        <Marker
          position={[location.lat, location.lng]}
          icon={createLocationPin("#ff2d2d")}
        >
          <Popup className="gv-popup" maxWidth={240}>
            <div style={{ padding: "10px 14px", fontFamily: "Inter, sans-serif" }}>
              <div style={{ fontSize: "0.75rem", color: "#ff2d2d", fontWeight: 700, marginBottom: 2 }}>
                📍 {location.name?.split(",")[0]}
              </div>
              <div style={{ opacity: 0.55, fontSize: "0.68rem" }}>{location.name}</div>
              {location.lat && (
                <div style={{ marginTop: 6, fontSize: "0.65rem", opacity: 0.4 }}>
                  {location.lat.toFixed(4)}°N, {location.lng.toFixed(4)}°E
                </div>
              )}
            </div>
          </Popup>
        </Marker>
      )}

      {/* Event markers with emoji icons */}
      {events.map((event, index) => {
        const color = EVENT_COLORS[event.type] || "#ffffff";
        const size = magnitudeToSize(event.magnitude);
        const emoji = EVENT_ICONS[event.type] || "📍";
        return (
          <Marker
            key={event.id || index}
            position={[event.lat, event.lng]}
            icon={createEventIcon(event.type, color, size)}
          >
            <Popup className="gv-popup" maxWidth={270}>
              <div style={{ fontFamily: "Inter, sans-serif" }}>
                {/* Header strip */}
                <div style={{
                  background: `linear-gradient(135deg, ${color}22, transparent)`,
                  borderBottom: `1px solid ${color}33`,
                  padding: "10px 14px 8px",
                  borderRadius: "12px 12px 0 0",
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  <span style={{ fontSize: 20 }}>{emoji}</span>
                  <div>
                    <div style={{ color, fontWeight: 700, fontSize: "0.82rem" }}>
                      {event.title || event.type?.toUpperCase()}
                    </div>
                    <div style={{ opacity: 0.55, fontSize: "0.67rem", marginTop: 1 }}>
                      {event.place || "Unknown location"}
                    </div>
                  </div>
                </div>
                {/* Body */}
                <div style={{ padding: "8px 14px 10px" }}>
                  {event.magnitude && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      <span style={{
                        background: `${color}22`, border: `1px solid ${color}44`,
                        color, borderRadius: 6, padding: "2px 8px",
                        fontSize: "0.72rem", fontWeight: 700,
                      }}>
                        M {event.magnitude}
                      </span>
                    </div>
                  )}
                  {event.date && (
                    <div style={{ fontSize: "0.65rem", opacity: 0.4 }}>
                      🕐 {new Date(event.date).toLocaleString()}
                    </div>
                  )}
                  {event.sourceUrl && (
                    <a
                      href={event.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: "inline-block", marginTop: 6,
                        color: "#00eaff", fontSize: "0.68rem",
                        textDecoration: "none",
                      }}
                    >
                      View Source →
                    </a>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
