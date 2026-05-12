import { EVENT_ICONS } from "../utils/eventIcons";

export default function LocationsPanel({ events = [] }) {
  return (
    <div
      style={{
        marginTop: "1rem",
        height: "320px",
        display: "flex",
        flexDirection: "column",
        background: "#020617",
        borderRadius: "12px",
        padding: "10px",
      }}
    >
      <h3 style={{ marginBottom: "8px" }}>Detected Events</h3>

      {/* SCROLL CONTAINER */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          paddingRight: "6px",
        }}
      >
        {events.length === 0 && (
          <p style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
            No events detected.
          </p>
        )}

        {events.map((e, i) => {
          const Icon = EVENT_ICONS[e.type] || EVENT_ICONS.all;

          return (
            <div
              key={i}
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "center",
                background: "#020617",
                border: "1px solid #1e293b",
                borderRadius: "10px",
                padding: "8px",
                marginBottom: "8px",
              }}
            >
              <Icon fontSize="small" />

              <div style={{ fontSize: "0.85rem" }}>
                <div style={{ color: "#e5e7eb" }}>
                  {e.place || e.title || "Event"}
                  {e.magnitude && ` | M ${e.magnitude}`}
                </div>

                <div style={{ color: "#94a3b8", fontSize: "0.7rem" }}>
                  {e.source || ""}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
