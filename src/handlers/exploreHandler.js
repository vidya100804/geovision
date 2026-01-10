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

// 2️⃣ ENV (FRONTEND)
const API_URL = import.meta.env.VITE_AI_API_URL || null;

// 3️⃣ AI NARRATION (FIXED)
async function fetchNarration(payload) {
  if (!API_URL) {
    console.warn("AI narration skipped: API_URL missing");
    return "";
  }

  try {
    const res = await fetch(`${API_URL}/api/ai-narrate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error("AI narration failed:", res.status);
      return "";
    }

    const data = await res.json();
    return data.text || "";
  } catch (err) {
    console.error("AI narration fetch error:", err);
    return "";
  }
}

// 4️⃣ MAIN HANDLER (FINAL)
export default async function exploreHandler(query, selectedEventType) {
  const detected = detectEvent(query);

  // Button selection > detected text
  const eventType = selectedEventType || detected.eventType;
  const locationText = detected.location;

  if (!eventType || !locationText) {
    return { events: [], location: null, text: "" };
  }

  const geo = await geocodeLocation(locationText);
  if (!geo) {
    return { events: [], location: null, text: "" };
  }

  const lat = Number(geo.lat);
  const lon = Number(geo.lon);

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return { events: [], location: geo, text: "Invalid coordinates" };
  }

  let events = [];

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

  if (!Array.isArray(events)) events = [];

  events = events.filter(
    (e) =>
      e &&
      Number.isFinite(e.lat) &&
      Number.isFinite(e.lon) &&
      Math.abs(e.lat) <= 90 &&
      Math.abs(e.lon) <= 180
  );

  const narration = await fetchNarration({
    eventType,
    location: geo.name,
    eventCount: events.length,
  });

  return {
    events,
    location: geo,
    text: narration,
  };
}
