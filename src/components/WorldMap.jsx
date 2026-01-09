import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import L from "leaflet";
import { renderToString } from "react-dom/server";

import { createMapIcon } from "./mapIcons";
import PlaceIcon from "@mui/icons-material/Place";

/*  HARD VALIDATION */
function isValidCoord(lat, lon) {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lon) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lon) <= 180
  );
}

/*  LOCATION ICON (MUI → LEAFLET SAFE) */
const locationIcon = L.divIcon({
  className: "",
  html: renderToString(
    <PlaceIcon style={{ color: "#22d3ee", fontSize: 34 }} />
  ),
  iconSize: [34, 34],
  iconAnchor: [17, 34],
});

/*  SAFE AUTO-FIT */
function FitToEvents({ events, location }) {
  const map = useMap();

  useEffect(() => {
    const points = events
      .filter((e) => isValidCoord(e.lat, e.lon))
      .map((e) => [e.lat, e.lon]);

    if (points.length > 0) {
      map.fitBounds(points, {
        padding: [80, 80],
        maxZoom: 6,
      });
    } else if (isValidCoord(location?.lat, location?.lon)) {
      map.setView([location.lat, location.lon], 6);
    }
  }, [events, location, map]);

  return null;
}

export default function WorldMap({ events = [], location }) {
  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      style={{ height: "100%", width: "100%" }}
      zoomControl={true}
      attributionControl={true}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution="© OpenStreetMap, © CARTO"
      />

      <FitToEvents events={events} location={location} />

      {/*  SEARCHED LOCATION MARKER */}
      {location && isValidCoord(location.lat, location.lon) && (
        <Marker
          position={[location.lat, location.lon]}
          icon={locationIcon}
        >
          <Popup>
            <strong>{location.name}</strong>
          </Popup>
        </Marker>
      )}

      {/*  EVENT MARKERS (EARTHQUAKES ETC.) */}
      {events
        .filter((e) => isValidCoord(e.lat, e.lon))
        .map((e, idx) => (
          <Marker
            key={`marker-${idx}`}
            position={[e.lat, e.lon]}
            icon={createMapIcon(e.type || "earthquake")}
          >
            <Popup>
              <strong>{e.title || e.place || "Event"}</strong>
              <br />
              {e.magnitude && <>Magnitude: {e.magnitude}<br /></>}
              <small>{e.source || "Live feed"}</small>
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
}
