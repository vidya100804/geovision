export default function TimeFilter({ value = "24h", onChange = () => {} }) {
  return (
    <div style={{ marginTop: "1rem" }}>
      <label style={{ fontSize: "0.9rem" }}>Time Range</label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={{
          width: "100%",
          marginTop: "0.4rem",
          padding: "0.4rem",
        }}
      >
        <option value="24h">Past 24 Hours</option>
        <option value="7d">Past 7 Days</option>
        <option value="30d">Past 30 Days</option>
      </select>
    </div>
  );
}
