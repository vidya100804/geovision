export default function NarrativePanel({ narrative }) {
  return (
    <div
      style={{
        marginTop: "2rem",
        padding: "1rem",
        borderRadius: "12px",
        background: "rgba(255,255,255,0.05)",
      }}
    >
      <h4 style={{ marginBottom: "0.5rem" }}>AI Narrative</h4>
      <p style={{ fontSize: "0.9rem", opacity: 0.8 }}>
        {narrative || "AI-generated storytelling will appear here."}
      </p>
    </div>
  );
}
