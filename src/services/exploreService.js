import { detectEvent, extractLocation } from "../utils/eventDetector";
import {
  fetchDeforestation,
  fetchEarthquakes,
  fetchFloods,
  fetchOceans,
  fetchRainfall,
  fetchSnow,
  fetchWildfires,
} from "../utils/eventService";
import { geocodeLocation } from "../utils/locationService";

export async function exploreQuery({
  query,
  selectedEventType,
  timeRange = "24h",
}) {
  try {
    const response = await fetch("/api/explore", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        selectedEventType,
        timeRange,
      }),
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      console.warn("GeoVision API failed, using browser fallback.", payload);
      return exploreInBrowser({ query, selectedEventType, timeRange });
    }

    return payload;
  } catch (error) {
    console.warn("GeoVision API unavailable, using browser fallback.", error);
    return exploreInBrowser({ query, selectedEventType, timeRange });
  }
}

async function exploreInBrowser({
  query,
  selectedEventType,
  timeRange = "24h",
}) {
  const detected = detectEvent(query);
  const eventType = normalizeEventType(selectedEventType || detected.eventType);
  const locationText = detected.location || extractLocation(query);

  if (!eventType || !locationText) {
    return {
      events: [],
      location: null,
      text: buildLocalText({
        query,
        eventType,
        location: null,
        events: [],
        timeRange,
      }),
    };
  }

  const location = await geocodeLocation(locationText);
  if (!location) {
    return {
      events: [],
      location: null,
      text: buildLocalText({
        query,
        eventType,
        location: null,
        events: [],
        timeRange,
      }),
    };
  }

  const lat = Number(location.lat);
  const lon = Number(location.lon);
  const events = filterEventsByTime(
    await fetchEvents(eventType, lat, lon, location.name),
    timeRange
  );

  return {
    events,
    location,
    center: { lat, lon },
    hasEvents: events.length > 0,
    text: buildLocalText({ query, eventType, location, events, timeRange }),
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

function filterEventsByTime(events, timeRange) {
  const ranges = {
    "24h": 24 * 60 * 60 * 1000,
    "7d": 7 * 24 * 60 * 60 * 1000,
    "30d": 30 * 24 * 60 * 60 * 1000,
  };
  const windowMs = ranges[timeRange];

  return (events || [])
    .filter(
      (event) =>
        event &&
        Number.isFinite(event.lat) &&
        Number.isFinite(event.lon) &&
        Math.abs(event.lat) <= 90 &&
        Math.abs(event.lon) <= 180
    )
    .filter((event) => {
      if (!windowMs) return true;

      const timestamp = Number(event.time || event.date || event.createdAt);
      return !Number.isFinite(timestamp) || timestamp >= Date.now() - windowMs;
    });
}

function buildLocalText({ query, eventType, location, events, timeRange }) {
  const rangeLabel =
    timeRange === "24h"
      ? "the past 24 hours"
      : timeRange === "7d"
        ? "the past 7 days"
        : "the past 30 days";

  if (!location) {
    return `DESCRIPTION:
GeoVision could not trace a clear location from "${query}". Add a city, region, or country name and try again.

IMPACT:
The map needs a resolved place before it can center the view and search nearby event feeds.

PRECAUTIONS:
Use a query like "earthquakes in Japan" or "wildfires in California".`;
  }

  const eventLabel = formatEventType(eventType);
  const eventCount = events.length;

  return `DESCRIPTION:
GeoVision traced your query to ${location.name} and centered the map there. It found ${eventCount} related ${eventLabel} event${eventCount === 1 ? "" : "s"} during ${rangeLabel}.

IMPACT:
The map marker shows the resolved location, and nearby event markers show related activity returned by the live feeds or browser fallback.

PRECAUTIONS:
Use the mapped location as the starting point, check official local alerts for decisions, and widen the time range if no events appear.`;
}

function formatEventType(eventType) {
  const labels = {
    earthquake: "earthquake",
    wildfire: "wildfire",
    flood: "flood",
    rainfall: "rainfall",
    deforestation: "deforestation",
    snow: "snow and ice",
    oceans: "ocean anomaly",
  };

  return labels[eventType] || "natural event";
}
