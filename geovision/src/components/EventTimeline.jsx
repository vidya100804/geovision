// src/components/EventTimeline.jsx
import React, { useRef } from "react";
import { EVENT_COLORS } from "../utils/eventColors";

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const TYPE_ICONS = {
  earthquake: "🌋",
  wildfire: "🔥",
  flood: "🌊",
  tsunami: "🌊",
  volcano: "🌋",
  snowfall: "❄️",
  hurricane: "🌀",
  drought: "☀️",
  airquality: "💨",
  weather: "🌤️",
  ocean: "🐋",
  climate: "🌡️",
  general: "📍",
};

export default function EventTimeline({ events }) {
  const scrollRef = useRef(null);

  if (!events || events.length === 0) {
    return (
      <div style={{ opacity: 0.4, fontSize: "0.8rem", padding: "0.5rem 0" }}>
        No events to display. Run a query to see results.
      </div>
    );
  }

  const sorted = [...events].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div>
      <div style={{ fontSize: "0.68rem", opacity: 0.5, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem" }}>
        Event Timeline — {events.length} events
      </div>
      <div
        ref={scrollRef}
        style={{
          display: "flex",
          gap: "0.5rem",
          overflowX: "auto",
          paddingBottom: "0.4rem",
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(0,234,255,0.2) transparent",
        }}
      >
        {sorted.map((event, i) => {
          const color = EVENT_COLORS[event.type] || "#ffffff";
          const icon = TYPE_ICONS[event.type] || "📍";
          return (
            <div
              key={event.id || i}
              style={{
                flexShrink: 0,
                width: 140,
                borderRadius: 12,
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${color}44`,
                padding: "0.6rem 0.75rem",
                cursor: "default",
                transition: "border-color 0.2s, transform 0.2s",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = color;
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = `${color}44`;
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${color}, transparent)` }} />
              <div style={{ fontSize: "1.1rem", marginBottom: "0.2rem" }}>{icon}</div>
              <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {event.title || event.place || "Unknown"}
              </div>
              {event.magnitude && (
                <div style={{ fontSize: "0.7rem", color, fontWeight: 700, marginTop: 2 }}>
                  M {event.magnitude}
                </div>
              )}
              <div style={{ fontSize: "0.65rem", opacity: 0.5, marginTop: 4 }}>{timeAgo(event.date)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
