export default function TimeFilter() {
  return (
    <div style={{ marginTop: "1rem" }}>
      <label style={{ fontSize: "0.9rem" }}>Time Range</label>
      <select
        style={{
          width: "100%",
          marginTop: "0.4rem",
          padding: "0.4rem",
        }}
      >
        <option>Past 24 Hours</option>
        <option>Past 7 Days</option>
        <option>Past 30 Days</option>
      </select>
    </div>
  );
}
