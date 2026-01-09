import { useNavigate } from "react-router-dom";
import Particles from "../components/Particles";
import GlobeBackground from "../components/GlobeBackground";
import Shuffle from "../components/Shuffle";


<Shuffle
  text="GEO VISION"
  shuffleDirection="right"
  duration={350}
  stagger={30}
  triggerOnHover={true}
/>



export default function Home() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "black",
      }}
    >
      {/*  PARTICLES BACKGROUND */}
      <Particles />

      {/* ROTATING GLOBE */}
      <GlobeBackground />

      {/*  TEXT OVERLAY */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          color: "white",
          pointerEvents: "auto",
        }}
      >
        <p
          style={{
            letterSpacing: "3px",
            fontSize: "1.8rem",
            marginBottom: "0.5rem",
          }}
        >
          WELCOME TO
        </p>

        {/*  SHUFFLE TEXT */}
        <Shuffle text="GEO VISION" />

        <p
          style={{
            marginTop: "1rem",
            maxWidth: "520px",
            fontSize: "1.2rem",
            color: "#eaedf4",
          }}
        >
          Click here to know more about the world through intelligent
          geospatial visualization.
        </p>

        <button
          onClick={() => navigate("/dashboard")}
          style={{
            marginTop: "2rem",
            padding: "0.8rem 2rem",
            borderRadius: "999px",
            border: "none",
            background: "#00eaff",
            color: "#000",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          EXPLORE MORE →
        </button>
      </div>
    </div>
  );
}
