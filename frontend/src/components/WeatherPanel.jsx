// src/components/WeatherPanel.jsx
import React, { useEffect, useState } from "react";
import {
  fetchCurrentWeather,
  fetchAirQuality,
  fetchFloodRisk,
} from "../services/weatherService";
import WeatherChart from "./WeatherChart";

const statBox = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "0.65rem 0.8rem",
  borderRadius: 12,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.07)",
  flex: 1,
  minWidth: 0,
};

const label = { fontSize: "0.65rem", opacity: 0.55, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 };
const value = { fontSize: "1rem", fontWeight: 700, color: "#00eaff" };

export default function WeatherPanel({ location }) {
  const [weather, setWeather] = useState(null);
  const [aqi, setAqi] = useState(null);
  const [flood, setFlood] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!location?.lat || !location?.lng) return;
    setLoading(true);
    Promise.all([
      fetchCurrentWeather(location.lat, location.lng),
      fetchAirQuality(location.lat, location.lng),
      fetchFloodRisk(location.lat, location.lng),
    ]).then(([w, a, f]) => {
      setWeather(w);
      setAqi(a);
      setFlood(f);
      setLoading(false);
    });
  }, [location]);

  if (!location) return (
    <div style={{ padding: "1rem", opacity: 0.5, fontSize: "0.85rem" }}>
      🌍 Select a location to see live weather data
    </div>
  );

  if (loading) return (
    <div style={{ padding: "1rem" }}>
      <div className="gv-shimmer" style={{ height: 100, borderRadius: 12 }} />
    </div>
  );

  if (!weather) return (
    <div style={{ padding: "1rem", opacity: 0.5, fontSize: "0.85rem" }}>
      Unable to load weather data
    </div>
  );

  const windDir = () => {
    const d = weather.windDir;
    if (d == null) return "–";
    const dirs = ["N","NE","E","SE","S","SW","W","NW"];
    return dirs[Math.round(d / 45) % 8];
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {/* Hero weather block */}
      <div
        style={{
          borderRadius: 14,
          background: "linear-gradient(135deg, rgba(0,234,255,0.1), rgba(0,100,180,0.15))",
          border: "1px solid rgba(0,234,255,0.18)",
          padding: "1rem 1.1rem",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <div style={{ fontSize: "3rem", lineHeight: 1 }}>{weather.icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#fff", lineHeight: 1 }}>
            {Math.round(weather.temperature)}{weather.units?.temperature || "°C"}
          </div>
          <div style={{ fontSize: "0.8rem", color: "#00eaff", marginTop: 2 }}>{weather.description}</div>
          <div style={{ fontSize: "0.72rem", opacity: 0.6, marginTop: 2 }}>
            Feels like {Math.round(weather.feelsLike)}{weather.units?.temperature || "°C"}
          </div>
        </div>
        {aqi && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "0.62rem", opacity: 0.55, textTransform: "uppercase" }}>AQI</div>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: aqi.aqiColor }}>{aqi.aqi}</div>
            <div style={{ fontSize: "0.62rem", color: aqi.aqiColor }}>{aqi.aqiLevel}</div>
          </div>
        )}
      </div>

      {/* Stat grid */}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <div style={statBox}>
          <div style={label}>Humidity</div>
          <div style={value}>{weather.humidity}%</div>
        </div>
        <div style={statBox}>
          <div style={label}>Wind</div>
          <div style={value}>{Math.round(weather.windSpeed)} km/h {windDir()}</div>
        </div>
        <div style={statBox}>
          <div style={label}>UV Index</div>
          <div style={{ ...value, color: weather.uvIndex > 7 ? "#ff4757" : weather.uvIndex > 4 ? "#ffa726" : "#00e676" }}>
            {weather.uvIndex ?? "–"}
          </div>
        </div>
        <div style={statBox}>
          <div style={label}>Cloud Cover</div>
          <div style={value}>{weather.cloudCover}%</div>
        </div>
        <div style={statBox}>
          <div style={label}>Pressure</div>
          <div style={value}>{Math.round(weather.pressure)} hPa</div>
        </div>
        <div style={statBox}>
          <div style={label}>Precip.</div>
          <div style={value}>{weather.precipitation} mm</div>
        </div>
      </div>

      {/* Flood risk */}
      {flood && (
        <div style={{
          borderRadius: 12,
          background: "rgba(255,255,255,0.04)",
          border: `1px solid ${flood.floodColor}44`,
          padding: "0.65rem 0.9rem",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
        }}>
          <div style={{ fontSize: "1.4rem" }}>🌊</div>
          <div>
            <div style={{ fontSize: "0.7rem", opacity: 0.55, textTransform: "uppercase" }}>Flood Risk</div>
            <div style={{ fontSize: "0.95rem", fontWeight: 700, color: flood.floodColor }}>{flood.floodRisk}</div>
          </div>
          <div style={{ marginLeft: "auto", textAlign: "right" }}>
            <div style={{ fontSize: "0.65rem", opacity: 0.5 }}>Peak discharge</div>
            <div style={{ fontSize: "0.85rem", color: "#ccc" }}>{Math.round(flood.maxDischarge)} m³/s</div>
          </div>
        </div>
      )}

      {/* 7-day forecast chart */}
      <WeatherChart location={location} />

      {/* AQI details */}
      {aqi && aqi.pm25 != null && (
        <div style={{ borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", padding: "0.65rem 0.9rem" }}>
          <div style={{ fontSize: "0.68rem", opacity: 0.55, textTransform: "uppercase", marginBottom: "0.4rem" }}>Air Quality Details</div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {[
              { label: "PM2.5", val: aqi.pm25?.toFixed(1) },
              { label: "PM10", val: aqi.pm10?.toFixed(1) },
              { label: "NO₂", val: aqi.no2?.toFixed(1) },
              { label: "O₃", val: aqi.ozone?.toFixed(1) },
            ].map(({ label: l, val }) => val != null && (
              <div key={l} style={{ padding: "0.3rem 0.6rem", borderRadius: 8, background: "rgba(255,255,255,0.05)", fontSize: "0.75rem" }}>
                <span style={{ opacity: 0.6 }}>{l}: </span>
                <span style={{ color: "#00eaff" }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
