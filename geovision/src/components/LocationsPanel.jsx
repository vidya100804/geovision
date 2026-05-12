export default function LocationsPanel({ location }) {
  if (!location) return null;

  return (
    <div
      style={{
        position: "absolute",
        bottom: "20px",
        left: "20px",
        right: "20px",
        background: "rgba(2, 6, 23, 0.85)",
        borderRadius: "14px",
        padding: "1rem",
        color: "#e5e7eb",
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(8px)",
      }}
    >
      <strong style={{ display: "block", marginBottom: "0.5rem" }}>
        Location
      </strong>

      <div style={{ fontSize: "0.9rem", lineHeight: "1.6" }}>
        <div>
          <span style={{ opacity: 0.6 }}>Place:</span> {location.name}
        </div>

        <div>
          <span style={{ opacity: 0.6 }}>Latitude:</span>{" "}
          {location.lat.toFixed(4)}
        </div>

        <div>
          <span style={{ opacity: 0.6 }}>Longitude:</span>{" "}
          {location.lng.toFixed(4)}
        </div>
      </div>
    </div>
  );
}
