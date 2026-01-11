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

// 2️⃣ AI narration (serverless – works everywhere)
async function fetchNarration(payload) {
  try {
    const res = await fetch("/api/ai-narrate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    return data.text || "";
  } catch (err) {
    console.error("AI narration fetch error:", err);
    return "";
  }
}

// 3️⃣ MAIN HANDLER (MINIMALLY MODIFIED)
export default async function exploreHandler(query, selectedEventType) {
  const detected = detectEvent(query);

  // ✅ normalize event type (non-breaking)
  const normalizeType = (t) =>
    t
      ?.toLowerCase()
      .replace("&", "")
      .replace(/\s+/g, "");

  const eventType =
    normalizeType(selectedEventType) ||
    normalizeType(detected.eventType);

  const locationText = detected.location;

  if (!eventType || !locationText) {
    return { events: [], location: null, text: "" };
  }

  // Geocode location
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

  // 🔥 EVENT FETCHING (UNCHANGED LOGIC)
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
      events = await fetchRainfall(lat, lon, geo.name);
      break;

    case "deforestation":
      events = fetchDeforestation();
      break;

    case "snow":
      events = await fetchSnow(lat, lon, geo.name);
      break;

    case "oceans":
      events = await fetchOceans(lat, lon, geo.name);
      break;

    default:
      events = [];
  }

  // 🛡️ HARD SAFETY GUARD
  if (!Array.isArray(events)) events = [];

  // 🔒 COORDINATE SANITIZATION
  events = events.filter(
    (e) =>
      e &&
      Number.isFinite(e.lat) &&
      Number.isFinite(e.lon) &&
      Math.abs(e.lat) <= 90 &&
      Math.abs(e.lon) <= 180
  );

  // 🎙️ AI narration
  const narration = await fetchNarration({
    eventType,
    location: geo.name,
    eventCount: events.length,
  });

  // ✅ FINAL RETURN (ADDITIVE ONLY)
  return {
    events,
    location: geo,
    center: { lat, lon },     // 🧭 optional for map zoom
    hasEvents: events.length > 0,
    text: narration,
  };
}
  