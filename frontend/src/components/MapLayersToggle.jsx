// src/components/MapLayersToggle.jsx
import React from "react";

export const LAYER_OPTIONS = [
  { id: "dark", label: "🗺️ Dark", title: "Dark map base" },
  { id: "satellite", label: "🛰️ Satellite", title: "Satellite imagery" },
  { id: "precipitation", label: "🌧️ Rain", title: "Precipitation overlay" },
  { id: "wind", label: "💨 Wind", title: "Wind speed overlay" },
  { id: "temp", label: "🌡️ Temp", title: "Surface temperature overlay" },
];

export default function MapLayersToggle({ activeLayer, onLayerChange }) {
  return (
    <div
      style={{
        display: "flex",
        gap: "0.4rem",
        flexWrap: "wrap",
      }}
    >
      {LAYER_OPTIONS.map((layer) => {
        const isActive = activeLayer === layer.id;
        return (
          <button
            key={layer.id}
            title={layer.title}
            onClick={() => onLayerChange(layer.id)}
            style={{
              padding: "0.35rem 0.7rem",
              borderRadius: 10,
              border: "1px solid",
              borderColor: isActive ? "#00eaff" : "rgba(255,255,255,0.12)",
              background: isActive
                ? "rgba(0,234,255,0.15)"
                : "rgba(2,6,23,0.7)",
              color: isActive ? "#00eaff" : "rgba(255,255,255,0.6)",
              fontSize: "0.72rem",
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
              fontWeight: isActive ? 700 : 400,
              transition: "all 0.2s ease",
              backdropFilter: "blur(6px)",
              boxShadow: isActive ? "0 0 10px rgba(0,234,255,0.25)" : "none",
            }}
          >
            {layer.label}
          </button>
        );
      })}
    </div>
  );
}
