import Particles from "../components/Particles.jsx";
import GlobeBackground from "../components/GlobeBackground.jsx";
import Shuffle from "../Shuffle";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {/* BACKGROUND EFFECTS */}
      <Particles />
      <GlobeBackground />

      {/* CENTERED OVERLAY */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 5,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          pointerEvents: "none",
        }}
      >
        {/* WELCOME TO */}
        <p
          style={{
            color: "#ffffff",
            letterSpacing: "3px",
            fontSize: "2rem",
            marginBottom: "0.6rem",
          }}
        >
          WELCOME TO
        </p>

        {/* GEO VISION */}
        <Shuffle text="GEO VISION" />

        {/* DESCRIPTION */}
        <p
          style={{
            marginTop: "1rem",
            maxWidth: "520px",
            fontSize: "1.5rem",
            color: "#eaedf4ff",
            lineHeight: 1,
          }}
        >
          Click here to know more about the world through intelligent
          geospatial visualization.
        </p>

        {/* BUTTON */}
        <button
  onClick={() => {
    console.log("Explore clicked");
    navigate("/dashboard");
  }}
  style={{
    marginTop: "1.8rem",
    padding: "0.7rem 1.8rem",
    borderRadius: "999px",
    border: "none",
    background: "#00eaff",
    color: "#000",
    fontWeight: "600",
    cursor: "pointer",
    pointerEvents: "auto",
  }}
>
  EXPLORE MORE →
</button>

      </div>
    </div>
  );
}
