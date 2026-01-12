import { useState } from "react";
import WorldMap from "../components/WorldMap";
import LocationsPanel from "../components/LocationsPanel";
import TimeFilter from "../components/TimeFilter";
import exploreHandler from "../handlers/exploreHandler";
import { EVENT_ICONS } from "../utils/eventIcons";

//import VolumeUpIcon from "@mui/icons-material/VolumeUp";
//import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import MicSharpIcon from "@mui/icons-material/MicSharp";
import SmartToyIcon from "@mui/icons-material/SmartToy";

import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeDownIcon from "@mui/icons-material/VolumeDown";




export default function Dashboard() {
  const [query, setQuery] = useState("");

  const [events, setEvents] = useState([]);
  const [location, setLocation] = useState(null);

  const [narrative, setNarrative] = useState("");
  const [impact, setImpact] = useState("");
  const [precautions, setPrecautions] = useState("");
  const [riskLevel, setRiskLevel] = useState("");

  const [loading, setLoading] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState("earthquake");

  

const [listening, setListening] = useState(false);
const [isSpeaking, setIsSpeaking] = useState(false);
let utteranceRef = null;
const fullNarrationText = `
Description:
${narrative}

Impact:
${impact}

Precautions:
${precautions}
  `;


  /*  LOCATION-BASED SEARCH ONLY */
function parseNarration(text) {
  if (!text) return {};

  const normalize = text.replace(/\r/g, "").trim();

  const extract = (start, end) => {
    const regex = new RegExp(
      `${start}:\\s*([\\s\\S]*?)\\s*(?=${end}:|$)`,
      "i"
    );
    const match = normalize.match(regex);
    return match ? match[1].trim() : "";
  };

  return {
    description: extract("DESCRIPTION", "IMPACT"),
    impact: extract("IMPACT", "PRECAUTIONS"),
    precautions: extract("PRECAUTIONS", "$"),
  };
}


  const handleExplore = async () => {
    if (!query.trim()) return;
    

    setLoading(true);
    setEvents([]);
    setLocation(null);
    setNarrative("");
    setImpact("");
    setPrecautions("");
    setRiskLevel("");

    try {
      const result = await exploreHandler(query);

      /*  STRONG FILTER — KILLS VERTICAL LINE BUG */
      const safeEvents = (result.events || []).filter(
        (e) =>
          Number.isFinite(e.lat) &&
          Number.isFinite(e.lon) &&
          Math.abs(e.lat) <= 90 &&
          Math.abs(e.lon) <= 180
      );

      setEvents(safeEvents);
      setLocation(result.location || null);

      /*  SINGLE SOURCE OF TEXT */
      const parsed = parseNarration(result.text || "");

setNarrative(parsed.description || "—");
setImpact(parsed.impact || "—");
setPrecautions(parsed.precautions || "—");



    } catch (err) {
      console.error("Explore failed", err);
      setNarrative("Failed to load event data.");
    } finally {
      setLoading(false);
    }
  };

  

const toggleNarration = () => {
  if (isSpeaking) {
    speechSynthesis.cancel();
    setIsSpeaking(false);
    return;
  }

  if (!fullNarrationText.trim()) return;

  speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(fullNarrationText);
  utterance.rate = 0.95;

  utterance.onend = () => setIsSpeaking(false);

  speechSynthesis.speak(utterance);
  setIsSpeaking(true);
};




const handleVoiceSearch = () => {
  if (!("webkitSpeechRecognition" in window)) {
    alert("Voice search not supported in this browser");
    return;
  }

  const recognition = new window.webkitSpeechRecognition();
  recognition.lang = "en-US";
  recognition.continuous = false;
  recognition.interimResults = false;

  setListening(true);

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    setQuery(transcript);
    setListening(false);
  };

  recognition.onerror = () => setListening(false);
  recognition.onend = () => setListening(false);

  recognition.start();
};

return (
  <div
  className="dashboard-root"
  style={{
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "#0b0f14",
    color: "#fff",
  }}
>

      



{/*  TOP BAR */}
<div
  style={{
    height: "64px",
    display: "flex",
    alignItems: "center",
    padding: "0.8rem 1.2rem",
    borderBottom: "1px solid #1f2933",
    background: "#020617",
  }}
>
  {/*  LOGO — LEFT */}
  <h2 style={{ margin: 0, whiteSpace: "nowrap" }}>
    🌍 GeoVisionAI
  </h2>

  {/*  SEARCH + EXPLORE — CENTER */}
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "0.8rem",
      margin: "0 auto", 
    }}
  >
    {/* SEARCH BAR */}
    <div style={{ position: "relative", width: "420px" }}>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search… e.g. earthquakes in Turkey"
        style={{
          width: "100%",
          padding: "0.6rem 2.6rem 0.6rem 1rem",
          borderRadius: "20px",
          border: "1px solid #333",
          background: "#0f172a",
          color: "#fff",
        }}
      />

      {/*  MIC INSIDE INPUT */}
      <button
        onClick={handleVoiceSearch}
        style={{
          position: "absolute",
          right: "10px",
          top: "50%",
          transform: "translateY(-50%)",
          background: "none",
          border: "none",
          color: listening ? "#22d3ee" : "#9ca3af",
          cursor: "pointer",
        }}
        title="Voice Search"
      >
        <MicSharpIcon />
      </button>
    </div>

    {/*  EXPLORE BUTTON */}
    <button
      className="dashboard-explore-btn"
      onClick={handleExplore}
      style={{
        padding: "0.6rem 1.4rem",
        borderRadius: "20px",
        border: "none",
        background: "#22d3ee",
        color: "#000",
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {loading ? "Loading…" : "Explore"}
    </button>
  </div>
</div>


      {/*  MAIN CONTENT */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* 🟦 LEFT PANEL */}
       <div
  className="dashboard-left"
  style={{
    width: "260px",
    padding: "1rem",
    borderRight: "1px solid #1f2933",
    overflowY: "auto",
  }}
>

          <h3 className="event-title">Select Event Type</h3>


          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {[
              { label: "Earthquakes", key: "earthquake" },
              { label: "Wildfires", key: "wildfire" },
              { label: "Floods", key: "flood" },
              { label: "Rainfall", key: "rainfall" },
              { label: "Deforestation", key: "deforestation" },
              { label: "Oceans", key: "oceans" },
              { label: "Snow & Ice", key: "snow" },
            ].map((item) => {
              const Icon = EVENT_ICONS[item.key];
              return (
                <button
  key={item.key}
  className={`event-btn ${
    selectedEventType === item.key ? "active" : ""
  }`}
  onClick={() => setSelectedEventType(item.key)}
  style={{
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "0.6rem",
    borderRadius: "10px",
    border: "1px solid #1f2933",
    background:
      selectedEventType === item.key
        ? "#22d3ee"
        : "#0f172a",
    color:
      selectedEventType === item.key ? "#000" : "#fff",
  }}
>
  {Icon && <Icon fontSize="small" />}
  {item.label}
</button>
              );
            })}
          </div>

          <TimeFilter />
          <LocationsPanel events={events} />
        </div>

        {/*  MAP */}
        <div className="dashboard-map" style={{ flex: 1 }}>

          <WorldMap events={events} location={location} />
        </div>

        {/*  RIGHT PANEL */}
        <div
         className="dashboard-right"
          style={{
            width: "340px",
            padding: "1rem",
            borderLeft: "1px solid #1f2933",
            overflowY: "auto",
          }}
        >
          

    
    
     {/*  AI NARRATION HEADER */}
<h4
  style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
  }}
>
  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
    <SmartToyIcon fontSize="small" />
    AI Narration
  </span>

 <button
  onClick={toggleNarration}
  style={{
    background: "none",
    border: "none",
    color: "#22d3ee",
    cursor: "pointer",
  }}
  title={isSpeaking ? "Stop narration" : "Play narration"}
>
  {isSpeaking ? <VolumeUpIcon /> : <VolumeDownIcon />}
</button>


</h4>






{/*  DESCRIPTION */}
<h4
  style={{
    marginTop: "0.8rem",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  }}
>
  <EVENT_ICONS.description fontSize="small" />
  Description
</h4>
<p style={{ whiteSpace: "pre-line", lineHeight: 1.6 }}>
  {narrative}
</p>

{/*  IMPACT */}
<h4
  style={{
    marginTop: "1rem",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  }}
>
  <EVENT_ICONS.impact fontSize="small" />
  Impact
</h4>
<p style={{ whiteSpace: "pre-line" }}>
  {impact}
</p>

{/*  PRECAUTIONS */}
<h4
  style={{
    marginTop: "1rem",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  }}
>
  <EVENT_ICONS.precautions fontSize="small" />
  Precautions
</h4>
<p style={{ whiteSpace: "pre-line" }}>
  {precautions}
</p>




        </div>
      </div>
    </div>
  );
}