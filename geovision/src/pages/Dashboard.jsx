// src/pages/Dashboard.jsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import WorldMap from "../components/WorldMap";
import LocationsPanel from "../components/LocationsPanel";
import TimeFilter from "../components/TimeFilter";
import WeatherPanel from "../components/WeatherPanel";
import LiveStats from "../components/LiveStats";
import MapLayersToggle from "../components/MapLayersToggle";
import EventTimeline from "../components/EventTimeline";
import { handleExploreLogic } from "../handlers/exploreHandler";
import { initMLModel, classifyQuery } from "../services/mlQueryService";
import { fetchAirQuality } from "../services/weatherService";
import SendIcon from "@mui/icons-material/Send";
import PublicTwoToneIcon from "@mui/icons-material/PublicTwoTone";
import MicIcon from "@mui/icons-material/Mic";
import MicNoneIcon from "@mui/icons-material/MicNone";
import VolumeOffTwoToneIcon from "@mui/icons-material/VolumeOffTwoTone";
import VolumeUpTwoToneIcon from "@mui/icons-material/VolumeUpTwoTone";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import TimelineIcon from "@mui/icons-material/Timeline";
import LayersIcon from "@mui/icons-material/Layers";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

const SUGGESTIONS = [
  "🌋 Earthquakes in Japan",
  "🔥 Wildfires in California",
  "🌊 Floods in Bangladesh",
  "🌀 Hurricane near Florida",
  "🌤️ Weather in Tokyo",
  "💨 Air quality in Delhi",
  "❄️ Snow in Alaska",
  "🌡️ Heatwave in Spain",
];

const TAB_CONFIG = [
  { id: "query",   icon: <PublicTwoToneIcon fontSize="small" />, label: "Explore" },
  { id: "weather", icon: <WbSunnyIcon fontSize="small" />,       label: "Weather" },
  { id: "events",  icon: <TimelineIcon fontSize="small" />,      label: "Events"  },
];

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="gv-clock">
      {time.toUTCString().replace("GMT", "UTC")}
    </span>
  );
}

export default function Dashboard() {
  const [query, setQuery]               = useState("");
  const [detectedCoords, setDetectedCoords] = useState(null);
  const [events, setEvents]             = useState([]);
  const [narrative, setNarrative]       = useState("");
  const [loading, setLoading]           = useState(false);
  const [isListening, setIsListening]   = useState(false);
  const [isSpeaking, setIsSpeaking]     = useState(false);
  const [timeRange, setTimeRange]       = useState("24h");
  const [activeLayer, setActiveLayer]   = useState("dark");
  const [activeTab, setActiveTab]       = useState("query");
  const [mlResult, setMlResult]         = useState(null);
  const [mlReady, setMlReady]           = useState(false);
  const [aqiData, setAqiData]           = useState(null);
  const [drawerOpen, setDrawerOpen]     = useState(false);

  const speechRef = useRef(null);

  useEffect(() => { initMLModel().then(setMlReady); }, []);

  useEffect(() => {
    if (!detectedCoords) { setAqiData(null); return; }
    fetchAirQuality(detectedCoords.lat, detectedCoords.lng).then(setAqiData);
  }, [detectedCoords]);

  // Close drawer on outside tap (mobile)
  const handleMapClick = () => { if (drawerOpen) setDrawerOpen(false); };

  const startVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Voice input not supported in this browser"); return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    setIsListening(true);
    recognition.onresult = (e) => { setQuery(e.results[0][0].transcript); setIsListening(false); };
    recognition.onerror = recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const speakNarrative = (text) => {
    if (!text || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US"; u.rate = 0.95;
    u.onend = () => setIsSpeaking(false);
    speechRef.current = u;
    window.speechSynthesis.speak(u);
    setIsSpeaking(true);
  };

  const stopSpeaking = () => { window.speechSynthesis.cancel(); setIsSpeaking(false); };

  const handleExplore = useCallback(async () => {
    if (!query) return;
    const ml = await classifyQuery(query);
    setMlResult(ml);
    await handleExploreLogic({ query, timeRange, setDetectedCoords, setEvents, setNarrative, speakNarrative, setLoading });
    setActiveTab(ml.intent === "weather" || ml.intent === "airquality" ? "weather" : "events");
    // Auto-close drawer on mobile after exploring
    setDrawerOpen(false);
  }, [query, timeRange]);

  const handleKeyDown = (e) => { if (e.key === "Enter" && query && !loading) handleExplore(); };

  const SidebarContent = () => (
    <>
      {/* Tab bar */}
      <div className="gv-tabs">
        {TAB_CONFIG.map(tab => (
          <button
            key={tab.id}
            className={`gv-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── Explore Tab ── */}
      {activeTab === "query" && (
        <div className="gv-tab-content">
          <div className="gv-input-group">
            <div className="gv-input-label">Ask about any place or event on Earth</div>
            <div style={{ position: "relative" }}>
              <input
                id="gv-query-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g., earthquakes in Japan, weather in Tokyo…"
                className="gv-input"
              />
              <button onClick={startVoiceInput} className={`gv-mic-btn ${isListening ? "active" : ""}`} title="Voice input">
                {isListening ? <MicIcon style={{ fontSize: 18 }} /> : <MicNoneIcon style={{ fontSize: 18 }} />}
              </button>
            </div>
          </div>

          <div className="gv-section-row">
            <span className="gv-section-label">Time window</span>
            <TimeFilter value={timeRange} onChange={setTimeRange} />
          </div>

          <button
            id="gv-explore-btn"
            onClick={handleExplore}
            disabled={!query || loading}
            className={`gv-explore-btn ${loading ? "loading" : ""}`}
          >
            {loading ? <><span className="gv-spinner" /> Analyzing…</> : <><SendIcon style={{ fontSize: 16 }} /> Explore</>}
          </button>

          <div>
            <div className="gv-section-label" style={{ marginBottom: "0.5rem" }}>Quick queries</div>
            <div className="gv-suggestions">
              {SUGGESTIONS.map((s) => (
                <span key={s} className="gv-suggestion-chip"
                  onClick={() => setQuery(s.replace(/^[^\s]+\s/, ""))}>
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="gv-narrative-box">
            <div className="gv-narrative-header">
              <strong>AI Narrative</strong>
              <button className="gv-speak-btn"
                onClick={() => isSpeaking ? stopSpeaking() : speakNarrative(narrative)}
                title={isSpeaking ? "Stop speaking" : "Read aloud"}>
                {isSpeaking ? <VolumeUpTwoToneIcon /> : <VolumeOffTwoToneIcon />}
              </button>
            </div>
            <div className="gv-narrative-text">
              {narrative || "Explore the world through AI-powered geospatial storytelling. Try a query above."}
            </div>
          </div>

          <LiveStats location={detectedCoords} aqiData={aqiData} />
        </div>
      )}

      {/* ── Weather Tab ── */}
      {activeTab === "weather" && (
        <div className="gv-tab-content">
          {detectedCoords ? (
            <div>
              <div className="gv-section-label" style={{ marginBottom: "0.75rem" }}>
                📍 {detectedCoords.name?.split(",").slice(0, 2).join(", ")}
              </div>
              <WeatherPanel location={detectedCoords} />
            </div>
          ) : (
            <div className="gv-empty-state">
              <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>🌍</div>
              <div>Run a query to see live weather data for a location</div>
              <div style={{ opacity: 0.4, fontSize: "0.78rem", marginTop: "0.4rem" }}>
                Powered by Open-Meteo · No API key required
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Events Tab ── */}
      {activeTab === "events" && (
        <div className="gv-tab-content">
          <div className="gv-section-label" style={{ marginBottom: "0.75rem" }}>
            {events.length > 0 ? `${events.length} events detected` : "No events yet"}
          </div>
          <EventTimeline events={events} />
          {events.length > 0 && (
            <div className="gv-events-list">
              {events.slice(0, 20).map((event, i) => {
                const color = {
                  earthquake: "#ff4757", wildfire: "#ff6b35", flood: "#1e90ff",
                  tsunami: "#00bcd4", volcano: "#ff9f43", hurricane: "#9b59b6",
                }[event.type] || "#00eaff";
                return (
                  <div key={event.id || i} className="gv-event-row" style={{ borderLeftColor: color }}>
                    <div className="gv-event-row-title">{event.title || event.place}</div>
                    <div className="gv-event-row-meta">
                      <span style={{ color }}>{event.type}</span>
                      {event.magnitude && <span>M{event.magnitude}</span>}
                      <span style={{ opacity: 0.45, marginLeft: "auto" }}>
                        {new Date(event.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </>
  );

  return (
    <div className="gv-root">
      {/* ── Header ── */}
      <header className="gv-header">
        <div className="gv-header-left">
          {/* Hamburger — visible only on mobile */}
          <button
            className="gv-hamburger"
            onClick={() => setDrawerOpen(o => !o)}
            aria-label="Toggle sidebar"
          >
            {drawerOpen ? <CloseIcon fontSize="small" /> : <MenuIcon fontSize="small" />}
          </button>

          <div className="gv-logo">
            <PublicTwoToneIcon style={{ color: "#00eaff", fontSize: 22 }} />
            <span>GeoVision<span style={{ color: "#00eaff" }}>AI</span></span>
          </div>
          <div className="gv-header-badge">
            <span className="gv-live-dot" />
            LIVE
          </div>
        </div>

        <LiveClock />
        <div className="gv-header-subtitle">Earth Intelligence Platform</div>
      </header>

      <div className="gv-body">
        {/* ── Desktop sidebar ── */}
        <aside className="gv-sidebar gv-sidebar--desktop">
          <SidebarContent />
        </aside>

        {/* ── Mobile drawer backdrop ── */}
        {drawerOpen && (
          <div className="gv-drawer-backdrop" onClick={() => setDrawerOpen(false)} />
        )}

        {/* ── Mobile bottom drawer ── */}
        <aside className={`gv-sidebar gv-sidebar--mobile ${drawerOpen ? "open" : ""}`}>
          <div className="gv-drawer-handle" onClick={() => setDrawerOpen(false)}>
            <div className="gv-drawer-pill" />
          </div>
          <SidebarContent />
        </aside>

        {/* ── Map Panel ── */}
        <main className="gv-map-panel" onClick={handleMapClick}>
          <WorldMap location={detectedCoords} events={events} activeLayer={activeLayer} />
          <LocationsPanel location={detectedCoords} />

          {/* Floating top-left controls */}
          <div className="gv-map-controls">
            <div className="gv-glass-card" style={{ marginBottom: "0.5rem" }}>
              <div className="gv-section-label" style={{ marginBottom: "0.4rem" }}>
                <LayersIcon style={{ fontSize: 12, marginRight: 4 }} />
                Map Layer
              </div>
              <MapLayersToggle activeLayer={activeLayer} onLayerChange={setActiveLayer} />
            </div>
            <div className="gv-glass-card">
              <div className="gv-section-label" style={{ marginBottom: "0.3rem" }}>Live event window</div>
              <TimeFilter value={timeRange} onChange={setTimeRange} />
            </div>
          </div>

          {/* Event count badge */}
          {events.length > 0 && (
            <div className="gv-event-badge">
              <span className="gv-live-dot" />
              {events.length} live events
            </div>
          )}

          {/* Mobile FAB — open drawer */}
          <button className="gv-mobile-fab" onClick={(e) => { e.stopPropagation(); setDrawerOpen(true); }}>
            <PublicTwoToneIcon style={{ fontSize: 22, color: "#00eaff" }} />
          </button>
        </main>
      </div>
    </div>
  );
}
