// 1️⃣ imports
import { detectEvent } from "../utils/eventDetector";
import { geocodeLocation } from "../utils/locationService";

import {
  fetchEarthquakes,
  fetchWildfires,
  fetchFloods,
  fetchRainfall,
  fetchDeforestation,
  fetchSnow,
  fetchOceans,
} from "../utils/eventService.js";

// 2️⃣ helper function (AI narration)
async function fetchNarration(payload) {
  const res = await fetch("http://localhost:5000/api/ai-narrate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  return data.text || "";
}

// 3️⃣ MAIN HANDLER (FINAL)
export default async function exploreHandler(query, selectedEventType) {
  // 🔍 Detect from text
  const detected = detectEvent(query);

  // 🎯 FINAL event type priority:
  // Button selection > detected from text
  const eventType = selectedEventType || detected.eventType;
  const locationText = detected.location;

  if (!eventType || !locationText) {
    return { events: [], location: null, text: "" };
  }

  // 🌍 Geocode location
  const geo = await geocodeLocation(locationText);
  if (!geo) {
    return { events: [], location: null, text: "" };
  }

  const lat = Number(geo.lat);
  const lon = Number(geo.lon);

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return { events: [], location: geo, text: "Invalid coordinates" };
  }

  // ✅ ALWAYS INITIALIZE
  let events = [];

  // 🚀 EVENT FETCHING (FINAL & CORRECT)
  switch (eventType) {
    case "earthquake":
      events = await fetchEarthquakes(lat, lon);
      break;

    case "wildfire":
      events = await fetchWildfires(lat, lon);
      break;

    case "flood":
      events = await fetchFloods(lat, lon);
      break;

    case "rainfall":
      events = await fetchRainfall(lat, lon);
      break;

    case "deforestation":
      events = fetchDeforestation();
      break;

    case "snow":
      events = await fetchSnow(lat, lon);
      break;

    case "oceans":
      events = await fetchOceans(lat, lon);
      break;

    default:
      events = [];
  }
  


  // 🛡️ HARD SAFETY GUARD
  if (!Array.isArray(events)) events = [];

  // 🧹 COORDINATE SANITIZATION (ZOOM RELIABILITY)
  events = events.filter(
    (e) =>
      e &&
      Number.isFinite(e.lat) &&
      Number.isFinite(e.lon) &&
      Math.abs(e.lat) <= 90 &&
      Math.abs(e.lon) <= 180
  );

  // 🤖 AI narration
  const narration = await fetchNarration({
    eventType,
    location: geo.name,
    eventCount: events.length,
  });

  // ✅ FINAL RETURN
  return {
    events,
    location: geo,
    text: narration,
  };
  
}
