import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import OpenAI from "openai";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { detectEvent } from "../utils/eventDetector.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, ".env") });

const app = express();
const PORT = Number(process.env.PORT || 5000);
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;
let aiClientEnabled = Boolean(openai);
let aiDisabledReason = openai ? null : "missing_api_key";

const TIME_RANGE_TO_DAYS = {
  "24h": 1,
  "7d": 7,
  "30d": 30,
};

const EONET_CATEGORY_MAP = {
  wildfire: "wildfires",
  flood: "severeStorms",
  snowfall: "severeStorms",
  tsunami: "severeStorms",
  volcano: "volcanoes",
  hurricane: "severeStorms",
  drought: "drought",
};

// ── Open-Meteo base URLs ──
const WEATHER_BASE = "https://api.open-meteo.com/v1";
const AIR_QUALITY_BASE = "https://air-quality-api.open-meteo.com/v1";
const FLOOD_BASE = "https://flood-api.open-meteo.com/v1";

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    aiConfigured: Boolean(process.env.OPENAI_API_KEY),
    aiEnabled: aiClientEnabled,
    aiDisabledReason,
    model: OPENAI_MODEL,
  });
});

app.post("/api/explore", async (req, res) => {
  const query = req.body?.query?.trim();
  const timeRange = req.body?.timeRange || "24h";

  if (!query) {
    res.status(400).json({ error: "A query is required." });
    return;
  }

  try {
    const eventType = detectEvent(query).eventType;
    const locationQuery = extractLocationQuery(query);
    const location = await geocodeLocation(locationQuery);
    const events = location
      ? await fetchEventsForQuery(eventType, location, timeRange)
      : [];
    const narrative = await generateNarrative({
      query,
      location,
      eventType,
      events,
      timeRange,
    });

    res.json({
      query,
      eventType,
      locationQuery,
      location,
      events,
      narrative: narrative.text,
      narrativeSource: narrative.source,
    });
  } catch (error) {
    console.error("Explore API error:", error);

    res.json({
      query,
      eventType: detectEvent(query).eventType,
      locationQuery: extractLocationQuery(query),
      location: null,
      events: [],
      narrative:
        "GeoVision could not complete the live lookup just now, but the dashboard is still online. Try again in a moment or use a more specific place name.",
      narrativeSource: "fallback",
    });
  }
});

app.post("/api/generate", async (req, res) => {
  const query = req.body?.query?.trim();

  if (!query) {
    res.status(400).json({ error: "A query is required." });
    return;
  }

  try {
    const narrative = await generateNarrative({
      query,
      location: req.body?.locationName
        ? { name: req.body.locationName }
        : null,
      eventType: detectEvent(query).eventType,
      events: req.body?.events || [],
      timeRange: req.body?.timeRange || "24h",
    });

    res.json({
      text: narrative.text,
      source: narrative.source,
    });
  } catch (error) {
    console.error("Narrative API error:", error);
    res.json({
      text:
        "GeoVision could not reach the AI model right now, so it returned a local summary instead.",
      source: "fallback",
    });
  }
});

// ── Weather endpoint (Open-Meteo, no key needed) ──
app.get("/api/weather", async (req, res) => {
  const lat = parseFloat(req.query.lat);
  const lng = parseFloat(req.query.lng);
  if (isNaN(lat) || isNaN(lng)) {
    return res.status(400).json({ error: "lat and lng required" });
  }
  try {
    const url = new URL(`${WEATHER_BASE}/forecast`);
    url.searchParams.set("latitude", lat);
    url.searchParams.set("longitude", lng);
    url.searchParams.set("current", [
      "temperature_2m","relative_humidity_2m","apparent_temperature",
      "weather_code","surface_pressure","wind_speed_10m",
      "wind_direction_10m","precipitation","uv_index","cloud_cover",
    ].join(","));
    url.searchParams.set("daily", [
      "temperature_2m_max","temperature_2m_min","weather_code",
      "precipitation_sum","wind_speed_10m_max",
    ].join(","));
    url.searchParams.set("timezone", "auto");
    url.searchParams.set("forecast_days", "7");

    const weatherRes = await fetch(url);
    const weatherData = await weatherRes.json();

    // Also fetch AQI from Open-Meteo
    const aqiUrl = new URL(`${AIR_QUALITY_BASE}/air-quality`);
    aqiUrl.searchParams.set("latitude", lat);
    aqiUrl.searchParams.set("longitude", lng);
    aqiUrl.searchParams.set("current", "european_aqi,us_aqi,pm10,pm2_5,nitrogen_dioxide,ozone");
    aqiUrl.searchParams.set("timezone", "auto");

    const aqiRes = await fetch(aqiUrl);
    const aqiData = await aqiRes.json();

    res.json({ weather: weatherData, aqi: aqiData });
  } catch (err) {
    console.error("Weather endpoint error:", err);
    res.status(500).json({ error: "Weather data unavailable" });
  }
});

// ── Flood endpoint (Open-Meteo, no key needed) ──
app.get("/api/flood", async (req, res) => {
  const lat = parseFloat(req.query.lat);
  const lng = parseFloat(req.query.lng);
  if (isNaN(lat) || isNaN(lng)) {
    return res.status(400).json({ error: "lat and lng required" });
  }
  try {
    const url = new URL(`${FLOOD_BASE}/flood`);
    url.searchParams.set("latitude", lat);
    url.searchParams.set("longitude", lng);
    url.searchParams.set("daily", "river_discharge");
    url.searchParams.set("forecast_days", "7");
    const r = await fetch(url);
    const data = await r.json();
    res.json(data);
  } catch (err) {
    console.error("Flood endpoint error:", err);
    res.status(500).json({ error: "Flood data unavailable" });
  }
});

app.listen(PORT, () => {
  console.log(`GeoVision backend running at http://localhost:${PORT}`);
});

function extractLocationQuery(query) {
  const cleaned = query.replace(/\s+/g, " ").trim();
  const prepositionMatch = cleaned.match(
    /\b(?:in|near|around|at|across|for|off|on)\s+([a-z0-9\s,.'-]+)$/i
  );

  if (prepositionMatch?.[1]) {
    return sanitizeLocation(prepositionMatch[1]);
  }

  const simplified = cleaned
    .replace(
      /\b(show|find|explore|analyze|track|tell me about|what is|what's|latest|recent|current|active|past|last|today|this|the)\b/gi,
      " "
    )
    .replace(
      /\b(earthquakes?|quakes?|seismic|tremors?|wildfires?|fires?|floods?|flooding|tsunamis?|volcano(?:es)?|eruptions?|climate|snowfall|snow|blizzard|ocean anomalies?|ocean)\b/gi,
      " "
    )
    .replace(/\s+/g, " ")
    .trim();

  return sanitizeLocation(simplified || cleaned);
}

function sanitizeLocation(value) {
  return value.replace(/[?.!]+$/g, "").trim();
}

async function geocodeLocation(locationQuery) {
  if (!locationQuery) return null;

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("q", locationQuery);

  const response = await fetch(url, {
    headers: {
      "User-Agent": "GeoVision/1.0",
      Accept: "application/json",
      "Accept-Language": "en",
    },
  });

  if (!response.ok) {
    throw new Error(`Nominatim geocoding failed with ${response.status}`);
  }

  const data = await response.json();

  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }

  return {
    name: data[0].display_name,
    lat: Number.parseFloat(data[0].lat),
    lng: Number.parseFloat(data[0].lon),
  };
}

async function fetchEventsForQuery(eventType, location, timeRange) {
  switch (eventType) {
    case "earthquake":
      return fetchEarthquakes(location, timeRange);
    case "wildfire":
    case "flood":
    case "snowfall":
    case "tsunami":
    case "volcano":
      return fetchEonetEvents(eventType, location, timeRange);
    default:
      return [];
  }
}

async function fetchEarthquakes(location, timeRange) {
  const startTime = getStartDate(timeRange).toISOString();
  const url = new URL("https://earthquake.usgs.gov/fdsnws/event/1/query");

  url.searchParams.set("format", "geojson");
  url.searchParams.set("latitude", String(location.lat));
  url.searchParams.set("longitude", String(location.lng));
  url.searchParams.set("maxradiuskm", "600");
  url.searchParams.set("orderby", "time");
  url.searchParams.set("starttime", startTime);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`USGS earthquake lookup failed with ${response.status}`);
  }

  const data = await response.json();

  return (data.features || []).map((feature) => ({
    id: feature.id,
    type: "earthquake",
    title: feature.properties?.title || feature.properties?.place || "Earthquake",
    place: feature.properties?.place || "Unknown location",
    magnitude: feature.properties?.mag,
    date: feature.properties?.time
      ? new Date(feature.properties.time).toISOString()
      : new Date().toISOString(),
    lat: feature.geometry?.coordinates?.[1],
    lng: feature.geometry?.coordinates?.[0],
    sourceUrl: feature.properties?.url || null,
  }));
}

async function fetchEonetEvents(eventType, location, timeRange) {
  const category = EONET_CATEGORY_MAP[eventType];
  if (!category) return [];

  const url = new URL("https://eonet.gsfc.nasa.gov/api/v3/events/geojson");
  url.searchParams.set("category", category);
  url.searchParams.set("status", "all");
  url.searchParams.set("limit", "50");
  url.searchParams.set("days", String(TIME_RANGE_TO_DAYS[timeRange] || 1));
  url.searchParams.set("bbox", buildBoundingBox(location, 900));

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`EONET lookup failed with ${response.status}`);
  }

  const data = await response.json();

  return (data.features || [])
    .map((feature) => formatEonetEvent(feature, eventType))
    .filter(Boolean)
    .filter((event) => matchesRequestedEvent(eventType, event));
}

function buildBoundingBox(location, radiusKm) {
  const latDelta = radiusKm / 111;
  const lngDelta =
    radiusKm / Math.max(111 * Math.cos((location.lat * Math.PI) / 180), 0.1);

  const minLat = clamp(location.lat - latDelta, -90, 90);
  const maxLat = clamp(location.lat + latDelta, -90, 90);
  const minLng = clamp(location.lng - lngDelta, -180, 180);
  const maxLng = clamp(location.lng + lngDelta, -180, 180);

  return `${minLng},${maxLat},${maxLng},${minLat}`;
}

function formatEonetEvent(feature, fallbackType) {
  const point = getGeometryPoint(feature.geometry);
  if (!point) return null;

  const properties = feature.properties || {};
  const description = properties.description || "";
  const title = properties.title || "Natural event";
  const eventType = inferEonetEventType(
    properties.categories || [],
    `${title} ${description}`,
    fallbackType
  );

  return {
    id: feature.id || properties.id || `${fallbackType}-${title}`,
    type: eventType,
    title,
    place: title,
    magnitude: properties.magnitudeValue || null,
    date: properties.date || new Date().toISOString(),
    lat: point.lat,
    lng: point.lng,
    sourceUrl: properties.link || null,
    description,
  };
}

function inferEonetEventType(categories, searchableText, fallbackType) {
  const categoryIds = categories.map((category) => category.id);
  const text = searchableText.toLowerCase();

  if (categoryIds.includes("wildfires")) return "wildfire";
  if (categoryIds.includes("volcanoes")) return "volcano";
  if (text.includes("tsunami")) return "tsunami";
  if (text.includes("snow") || text.includes("blizzard")) return "snowfall";
  if (
    text.includes("flood") ||
    text.includes("inundation") ||
    text.includes("overflow")
  ) {
    return "flood";
  }

  return fallbackType;
}

function matchesRequestedEvent(eventType, event) {
  if (eventType === "flood") {
    return event.type === "flood";
  }

  if (eventType === "snowfall") {
    return event.type === "snowfall";
  }

  if (eventType === "tsunami") {
    return event.type === "tsunami";
  }

  return event.type === eventType;
}

function getGeometryPoint(geometry) {
  if (!geometry) return null;

  if (geometry.type === "Point") {
    return {
      lng: geometry.coordinates?.[0],
      lat: geometry.coordinates?.[1],
    };
  }

  const points = getPolygonPoints(geometry);
  if (points.length === 0) return null;

  const totals = points.reduce(
    (accumulator, [lng, lat]) => ({
      lng: accumulator.lng + lng,
      lat: accumulator.lat + lat,
    }),
    { lng: 0, lat: 0 }
  );

  return {
    lng: totals.lng / points.length,
    lat: totals.lat / points.length,
  };
}

function getPolygonPoints(geometry) {
  if (geometry.type === "Polygon") {
    return geometry.coordinates?.[0] || [];
  }

  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates?.[0]?.[0] || [];
  }

  if (geometry.type === "LineString") {
    return geometry.coordinates || [];
  }

  return [];
}

async function generateNarrative({
  query,
  location,
  eventType,
  events,
  timeRange,
}) {
  const fallbackText = buildFallbackNarrative({
    query,
    location,
    eventType,
    events,
    timeRange,
  });

  if (!openai || !aiClientEnabled) {
    return {
      text: fallbackText,
      source: "fallback",
    };
  }

  const eventSummary = events.length
    ? events
        .slice(0, 5)
        .map((event) => {
          const parts = [
            event.place || event.title,
            event.magnitude ? `magnitude ${event.magnitude}` : null,
            new Date(event.date).toLocaleString("en-US", {
              dateStyle: "medium",
              timeStyle: "short",
            }),
          ].filter(Boolean);

          return `- ${parts.join(", ")}`;
        })
        .join("\n")
    : "- No matching live events were returned for the current time window.";

  try {
    const response = await openai.responses.create({
      model: OPENAI_MODEL,
      input: [
        {
          role: "developer",
          content: [
            {
              type: "input_text",
              text:
                "You are GeoVision, an AI geospatial storyteller. Write a concise, factual summary in 2 short paragraphs. Mention the live event signal if present, stay grounded in the supplied data, and avoid inventing facts.",
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `User query: ${query}
Detected event type: ${eventType}
Time range: ${timeRange}
Resolved location: ${location?.name || "Unknown"}
Live events:
${eventSummary}`,
            },
          ],
        },
      ],
      max_output_tokens: 240,
    });

    if (response.output_text?.trim()) {
      return {
        text: response.output_text.trim(),
        source: "openai",
      };
    }
  } catch (error) {
    console.error("OpenAI narrative error:", error);

    if (error?.status === 401 || error?.code === "invalid_api_key") {
      aiClientEnabled = false;
      aiDisabledReason = "invalid_api_key";
    }
  }

  return {
    text: fallbackText,
    source: "fallback",
  };
}

function buildFallbackNarrative({
  query,
  location,
  eventType,
  events,
  timeRange,
}) {
  const place = location?.name || "the requested area";
  const readableRange =
    timeRange === "24h"
      ? "the last 24 hours"
      : timeRange === "7d"
        ? "the last 7 days"
        : "the last 30 days";
  const label = formatEventLabel(eventType);

  if (!location) {
    return `GeoVision could not confidently resolve a place from "${query}". Try including a city, region, or country so the map and live event feeds can lock onto a real location.`;
  }

  if (events.length === 0) {
    return `GeoVision located ${place}, but it did not find matching ${label} events there during ${readableRange}. Try widening the time range or switching to another event type such as earthquakes or wildfires.`;
  }

  const strongestEvent = [...events].sort((left, right) => {
    const leftScore = Number(left.magnitude || 0);
    const rightScore = Number(right.magnitude || 0);
    return rightScore - leftScore;
  })[0];

  const headline = strongestEvent?.place || strongestEvent?.title || place;
  const magnitudeText = strongestEvent?.magnitude
    ? ` The strongest signal in the feed is magnitude ${strongestEvent.magnitude} near ${headline}.`
    : ` The most visible event cluster is centered around ${headline}.`;

  return `GeoVision found ${events.length} ${label} event${events.length === 1 ? "" : "s"} near ${place} during ${readableRange}.${magnitudeText}

This summary is running in local fallback mode, which means the map markers and live data are current, but the narrative was assembled directly from the returned event feed instead of an external AI response.`;
}

function formatEventLabel(eventType) {
  const labels = {
    earthquake: "earthquake",
    wildfire: "wildfire",
    flood: "flood",
    snowfall: "snowfall",
    tsunami: "tsunami",
    volcano: "volcanic",
    climate: "climate-related",
    ocean: "ocean-related",
    general: "natural",
  };

  return labels[eventType] || "natural";
}

function getStartDate(timeRange) {
  const days = TIME_RANGE_TO_DAYS[timeRange] || 1;
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
