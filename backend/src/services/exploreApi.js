import { generateNarration } from "./aiNarration.js";
import { detectEvent, extractLocation } from "../utils/eventDetector.js";
import { geocodeLocation } from "../utils/locationService.js";
import {
  fetchDeforestation,
  fetchEarthquakes,
  fetchFloods,
  fetchOceans,
  fetchRainfall,
  fetchSnow,
  fetchWildfires,
} from "../utils/eventService.js";

const TIME_RANGE_TO_MS = {
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
};

export async function exploreNaturalEvents({
  query,
  selectedEventType,
  timeRange = "24h",
}) {
  const cleanedQuery = query?.trim();

  if (!cleanedQuery) {
    return { events: [], location: null, text: "" };
  }

  const detected = detectEvent(cleanedQuery);
  const eventType = normalizeEventType(selectedEventType || detected.eventType);
  const locationText = detected.location || extractLocation(cleanedQuery);

  if (!eventType || !locationText) {
    return {
      events: [],
      location: null,
      text: await generateNarration({
        eventType: eventType || "natural event",
        location: locationText || "the requested area",
        eventCount: 0,
      }),
    };
  }

  const location = await geocodeLocation(locationText);
  if (!location) {
    return {
      events: [],
      location: null,
      text: await generateNarration({
        eventType,
        location: locationText,
        eventCount: 0,
      }),
    };
  }

  const lat = Number(location.lat);
  const lon = Number(location.lon);

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return {
      events: [],
      location,
      text: "DESCRIPTION:\nInvalid coordinates were returned for this location.\n\nIMPACT:\nGeoVision cannot safely place live events on the map without valid coordinates.\n\nPRECAUTIONS:\nTry a more specific city, state, region, or country name.",
    };
  }

  const fetchedEvents = await fetchEvents(eventType, lat, lon, location.name);
  const events = filterEventsByTime(sanitizeEvents(fetchedEvents), timeRange);
  const text = await generateNarration({
    eventType,
    location: location.name,
    eventCount: events.length,
  });

  return {
    events,
    location,
    center: { lat, lon },
    hasEvents: events.length > 0,
    text,
  };
}

function normalizeEventType(eventType) {
  if (!eventType) return null;

  const normalized = eventType.toLowerCase().replace("&", "").replace(/\s+/g, "");
  const aliases = {
    snowfall: "snow",
    snowice: "snow",
    ocean: "oceans",
    tsunami: "oceans",
  };

  return aliases[normalized] || normalized;
}

async function fetchEvents(eventType, lat, lon, placeName) {
  switch (eventType) {
    case "earthquake":
      return fetchEarthquakes(lat, lon);
    case "wildfire":
      return fetchWildfires(lat, lon);
    case "flood":
      return fetchFloods(lat, lon);
    case "rainfall":
      return fetchRainfall(lat, lon, placeName);
    case "deforestation":
      return fetchDeforestation();
    case "snow":
      return fetchSnow(lat, lon, placeName);
    case "oceans":
      return fetchOceans(lat, lon, placeName);
    default:
      return [];
  }
}

function sanitizeEvents(events) {
  if (!Array.isArray(events)) return [];

  return events.filter(
    (event) =>
      event &&
      Number.isFinite(event.lat) &&
      Number.isFinite(event.lon) &&
      Math.abs(event.lat) <= 90 &&
      Math.abs(event.lon) <= 180
  );
}

function filterEventsByTime(events, timeRange) {
  const windowMs = TIME_RANGE_TO_MS[timeRange];
  if (!windowMs) return events;

  const cutoff = Date.now() - windowMs;
  return events.filter((event) => {
    const timestamp = Number(event.time || event.date || event.createdAt);
    return !Number.isFinite(timestamp) || timestamp >= cutoff;
  });
}
