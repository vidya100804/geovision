import { EVENT_COLORS } from "../utils/eventColors";

export default function EventLegend({ visibleEvents, toggle }) {
  return (
    <div style={{
      position: "absolute",
      bottom: 20,
      left: 20,
      background: "rgba(0,0,0,0.6)",
      padding: "1rem",
      borderRadius: "12px",
      color: "#fff",
      fontSize: "0.85rem",
    }}>
      {Object.keys(visibleEvents).map((type) => (
        <div
          key={type}
          onClick={() => toggle(type)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            cursor: "pointer",
            opacity: visibleEvents[type] ? 1 : 0.4,
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: EVENT_COLORS[type],
            }}
          />
          {type}
        </div>
      ))}
    </div>
  );
}
