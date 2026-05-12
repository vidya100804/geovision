export default function QueryPanel({ query, setQuery, onSubmit }) {
  return (
    <>
      <h2 style={{ marginBottom: "0.5rem" }}>GeoVisionAI</h2>
      <p style={{ opacity: 0.6, marginBottom: "1.5rem" }}>
        Ask about any place or event
      </p>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Ask GeoVisionAI about any place or event..."
        style={{
          width: "100%",
          padding: "0.75rem 1rem",
          borderRadius: "10px",
          border: "none",
          outline: "none",
          fontSize: "1rem",
          marginBottom: "1rem",
        }}
      />

      <button
        onClick={onSubmit}
        style={{
          width: "100%",
          padding: "0.75rem",
          borderRadius: "12px",
          border: "none",
          background: "#00eaff",
          color: "#000",
          fontWeight: "bold",
          cursor: "pointer",
          marginBottom: "1.5rem",
        }}
      >
        Explore
      </button>

      <p style={{ opacity: 0.6, marginBottom: "0.5rem" }}>
        Try asking about:
      </p>

      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        {[
          "Earthquakes in Japan",
          "Wildfires",
          "Storms",
          "Volcano activity",
          "Climate change effects",
        ].map((item) => (
          <span
            key={item}
            onClick={() => setQuery(item)}
            style={{
              padding: "0.4rem 0.7rem",
              borderRadius: "999px",
              background: "rgba(255,255,255,0.1)",
              fontSize: "0.8rem",
              cursor: "pointer",
            }}
          >
            {item}
          </span>
        ))}
      </div>
    </>
  );
}
