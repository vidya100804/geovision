import { detectEventType } from "../utils/eventDetector";
import { fetchEarthquakes } from "../utils/eventService";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

export async function exploreQuery({ query, timeRange = "24h" }) {
  // No backend server — use the full in-browser pipeline directly
  return exploreInBrowser({ query, timeRange });
}

async function exploreInBrowser({ query, timeRange }) {
  const eventType = detectEventType(query);
  const locationQuery = extractLocationQuery(query);
  const location = await geocodeLocation(locationQuery);

  let events = [];
  if (location) {
    if (eventType === "earthquake") {
      events = await fetchEarthquakes(location);
    }
    // For weather/airquality/hurricane/drought, no event markers but weather panel will show data
  }

  return {
    query,
    eventType,
    locationQuery,
    location,
    events,
    narrative: buildLocalNarrative({
      query,
      location,
      eventType,
      events,
      timeRange,
    }),
    narrativeSource: "browser-fallback",
  };
}

function normalizeExplorePayload(payload) {
  return {
    ...payload,
    narrative: payload?.narrative || payload?.text || "",
    location: payload?.location
      ? {
          ...payload.location,
          lng: payload.location.lng ?? payload.location.lon,
        }
      : null,
    events: (payload?.events || []).map((event) => ({
      ...event,
      lng: event.lng ?? event.lon,
    })),
  };
}

function extractLocationQuery(query) {
  // Step 1: strip ALL leading/trailing punctuation and normalize whitespace
  const cleaned = query
    .replace(/[?.!,;:]+$/g, "")   // trailing punctuation (fixes "delhi?")
    .replace(/^[?.!,;:]+/g, "")   // leading punctuation
    .replace(/\s+/g, " ")
    .trim();

  // Step 2: preposition match — "weather in Delhi", "floods near Mumbai", "at Tokyo"
  const prepositionMatch = cleaned.match(
    /\b(?:in|near|around|at|across|for|off|on|over|from|of)\s+([A-Za-z0-9\s,.''-]+?)(?:\s*[?.!]|$)/i
  );
  if (prepositionMatch?.[1]) {
    const loc = cleanLocation(prepositionMatch[1]);
    if (loc.length > 1) return loc;
  }

  // Step 3: strip question/command/filler words + all event-type words
  const noiseWords = [
    // Question words & auxiliaries
    "what", "where", "how", "when", "which", "who", "is", "are", "was",
    "were", "will", "be", "being", "been", "do", "does", "did", "can",
    "could", "would", "should", "the", "a", "an", "this", "that", "there",
    // Command verbs
    "show", "find", "explore", "analyze", "track", "tell", "me", "give",
    "get", "fetch", "check", "display", "about", "any", "some", "all",
    "latest", "recent", "current", "active", "past", "last", "today",
    "now", "live", "real", "time", "realtime",
    // Event / topic words
    "weather", "temperature", "temp", "rain", "rainfall", "wind", "humidity",
    "forecast", "climate", "earthquake", "earthquakes", "quake", "quakes",
    "seismic", "tremor", "tremors", "wildfire", "wildfires", "fire", "fires",
    "flood", "floods", "flooding", "tsunami", "tsunamis", "volcano",
    "volcanoes", "eruption", "eruptions", "snowfall", "snow", "blizzard",
    "ocean", "hurricane", "cyclone", "typhoon", "drought", "heatwave",
    "heat", "wave", "aqi", "air", "quality", "pollution", "conditions",
    "condition", "update", "updates", "report", "reports", "news", "alert",
    "alerts", "warning", "warnings", "info", "information", "data",
    "happening", "going", "on",
  ];

  const noiseRegex = new RegExp(
    `\\b(${noiseWords.join("|")})\\b`,
    "gi"
  );

  const withoutNoise = cleaned
    .replace(noiseRegex, " ")
    .replace(/\s+/g, " ")
    .trim();

  return cleanLocation(withoutNoise || cleaned);
}

function cleanLocation(location) {
  return location?.replace(/[?.!,;:]+$/g, "").replace(/^[?.!,;:]+/g, "").trim() || "";
}


async function geocodeLocation(locationQuery) {
  if (!locationQuery) return null;

  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "1");
    url.searchParams.set("q", locationQuery);

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "Accept-Language": "en",
      },
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) return null;

    return {
      name: data[0].display_name,
      lat: Number.parseFloat(data[0].lat),
      lng: Number.parseFloat(data[0].lon),
    };
  } catch (error) {
    console.error("Browser geocoding failed:", error);
    return null;
  }
}

function buildLocalNarrative({ query, location, eventType, events, timeRange }) {
  const rangeLabel =
    timeRange === "24h"
      ? "the past 24 hours"
      : timeRange === "7d"
        ? "the past 7 days"
        : "the past 30 days";

  if (!location) {
    return `GeoVision couldn't pinpoint a location from your query. Try being more specific — for example: "weather in Delhi", "earthquakes near Tokyo", or "floods in Bangladesh".`;
  }

  if (events.length > 0) {
    return `GeoVision traced your query to ${location.name} and found ${events.length} ${formatEventType(eventType)} event${events.length === 1 ? "" : "s"} nearby during ${rangeLabel}. The map has been centered on the detected location and the event markers show related activity around it.`;
  }

  return `GeoVision traced your query to ${location.name} and centered the map there. No matching live ${formatEventType(eventType)} events were returned for ${rangeLabel}, but the location was resolved successfully so you can explore the area on the map.`;
}

function formatEventType(eventType) {
  const labels = {
    earthquake: "earthquake",
    wildfire: "wildfire",
    flood: "flood",
    snowfall: "snowfall",
    tsunami: "tsunami",
    volcano: "volcanic",
    climate: "climate-related",
    ocean: "ocean-related",
    hurricane: "hurricane / tropical storm",
    drought: "drought / heatwave",
    airquality: "air quality",
    weather: "weather",
    general: "natural",
  };

  return labels[eventType] || "natural";
}
