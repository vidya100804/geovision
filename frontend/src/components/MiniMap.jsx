import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { EVENT_COLORS } from "../utils/eventColors";


// Fix default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});


export default function MiniMap({ location, events, onEventClick, onFocusLocation }) {


  if (!location) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: "20px",
        right: "20px",
        width: "300px",
        height: "200px",
        borderRadius: "14px",
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.15)",
        zIndex: 5,
      }}
    >
      <MapContainer
        center={[location.lat, location.lng]}
        zoom={5}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution="© OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={[location.lat, location.lng]}>
          <Popup>
            <strong>{location.name}</strong>
          </Popup>
        </Marker>

        {events.map((e, i) => (
          <CircleMarker
            key={i}
            center={[e.lat, e.lng]}
            radius={6}
            pathOptions={{ color: EVENT_COLORS[e.type] }}
            eventHandlers={{
              click: () => onEventClick(e),
            }}
          />
        ))}
      </MapContainer>
    </div>
  );
}
