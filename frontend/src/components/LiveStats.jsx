// src/components/LiveStats.jsx
import React, { useEffect, useState, useRef } from "react";
import { fetchGlobalStats } from "../services/weatherService";

const REFRESH_INTERVAL = 60000; // 60 seconds

function StatCard({ icon, label, value, color, pulse }) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        borderRadius: 14,
        background: "rgba(255,255,255,0.04)",
        border: `1px solid ${color}33`,
        padding: "0.8rem 1rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.3rem",
        position: "relative",
        overflow: "hidden",
        transition: "border-color 0.3s",
      }}
    >
      {/* Pulse glow */}
      {pulse && (
        <div
          style={{
            position: "absolute",
            top: 0, left: 0, right: 0, bottom: 0,
            borderRadius: 14,
            boxShadow: `inset 0 0 20px ${color}44`,
            animation: "gvPulseGlow 1s ease-out",
            pointerEvents: "none",
          }}
        />
      )}
      {/* Live dot */}
      <div style={{ position: "absolute", top: 8, right: 10, display: "flex", alignItems: "center", gap: 4 }}>
        <div
          style={{
            width: 6, height: 6, borderRadius: "50%",
            background: color,
            animation: "gvLiveDot 2s ease-in-out infinite",
          }}
        />
      </div>

      <div style={{ fontSize: "1.4rem", lineHeight: 1 }}>{icon}</div>
      <div style={{ fontSize: "0.62rem", opacity: 0.55, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
      <div style={{ fontSize: "1.5rem", fontWeight: 800, color, lineHeight: 1 }}>{value ?? "–"}</div>
    </div>
  );
}

export default function LiveStats({ location, aqiData }) {
  const [stats, setStats] = useState({ earthquakeCount: null, wildfireCount: null });
  const [pulse, setPulse] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const timerRef = useRef(null);

  const refresh = async () => {
    const data = await fetchGlobalStats();
    setStats(data);
    setLastUpdated(new Date());
    setPulse(true);
    setTimeout(() => setPulse(false), 1200);
  };

  useEffect(() => {
    refresh();
    timerRef.current = setInterval(refresh, REFRESH_INTERVAL);
    return () => clearInterval(timerRef.current);
  }, []);

  const formatTime = (d) => {
    if (!d) return "–";
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.6rem" }}>
        <span style={{ fontSize: "0.72rem", opacity: 0.55, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          🔴 Live Global Monitoring
        </span>
        <span style={{ fontSize: "0.65rem", opacity: 0.4 }}>
          Updated {formatTime(lastUpdated)}
        </span>
      </div>
      <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
        <StatCard
          icon="🌋"
          label="Earthquakes 24h"
          value={stats.earthquakeCount !== null ? stats.earthquakeCount.toLocaleString() : "…"}
          color="#ff4757"
          pulse={pulse}
        />
        <StatCard
          icon="🔥"
          label="Active Wildfires"
          value={stats.wildfireCount !== null ? stats.wildfireCount.toLocaleString() : "…"}
          color="#ff6b35"
          pulse={pulse}
        />
        <StatCard
          icon="💨"
          label="Local AQI"
          value={aqiData ? aqiData.aqi : location ? "…" : "–"}
          color={aqiData?.aqiColor || "#00eaff"}
          pulse={pulse}
        />
        <StatCard
          icon="🛰️"
          label="Data Sources"
          value="6"
          color="#1abc9c"
          pulse={pulse}
        />
      </div>
    </div>
  );
}
