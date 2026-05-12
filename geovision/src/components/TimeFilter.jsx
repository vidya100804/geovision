export default function TimeFilter({ value, onChange }) {
  const options = [
    { label: "24 Hours", value: "24h" },
    { label: "7 Days", value: "7d" },
    { label: "30 Days", value: "30d" },
  ];

  return (
    <div style={{
      display: "flex",
      gap: "0.5rem",
      marginTop: "0.5rem",
    }}>
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          style={{
            padding: "0.4rem 0.8rem",
            borderRadius: "999px",
            border: "none",
            cursor: "pointer",
            fontSize: "0.8rem",
            background:
              value === o.value
                ? "#00eaff"
                : "rgba(255,255,255,0.08)",
            color: value === o.value ? "#000" : "#fff",
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
