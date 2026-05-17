// src/utils/eventDetector.js
export function detectEvent(query) {
  if (!query) return { eventType: null, location: null };

  const q = query.toLowerCase();

  const EVENT_MAP = {
    earthquake: "earthquake",
    earthquakes: "earthquake",
    wildfire: "wildfire",
    fire: "wildfire",
    flood: "flood",
    floods: "flood",
    rain: "rainfall",
    rainfall: "rainfall",
    snow: "snow",
    snowfall: "snow",
    ice: "snow",
    blizzard: "snow",
    deforestation: "deforestation",
    forest: "deforestation",
    ocean: "oceans",
    oceans: "oceans",
    tsunami: "oceans",
  };

  let eventType = null;
  for (const key in EVENT_MAP) {
    if (q.includes(key)) {
      eventType = EVENT_MAP[key];
      break;
    }
  }

  const location = extractLocation(q, EVENT_MAP);

  return { eventType, location };
}

export function extractLocation(query) {
  if (!query) return null;

  const q = query.toLowerCase().replace(/\s+/g, " ").trim();
  const prepositionMatch = q.match(
    /\b(?:in|near|around|at|across|for|off|on)\s+([a-z0-9\s,.'-]+)$/i
  );

  if (prepositionMatch?.[1]) {
    return cleanLocation(prepositionMatch[1]);
  }

  const wordsToRemove = [
    "show",
    "find",
    "explore",
    "analyze",
    "track",
    "latest",
    "recent",
    "current",
    "active",
    "today",
    "past",
    "last",
    "earthquake",
    "earthquakes",
    "wildfire",
    "wildfires",
    "fire",
    "flood",
    "floods",
    "rain",
    "rainfall",
    "snow",
    "snowfall",
    "ice",
    "blizzard",
    "deforestation",
    "forest",
    "ocean",
    "oceans",
    "tsunami",
  ];

  const location = wordsToRemove
    .reduce(
      (text, word) => text.replace(new RegExp(`\\b${word}\\b`, "gi"), " "),
      q
    )
    .replace(/\s+/g, " ")
    .trim();

  return cleanLocation(location);
}

function cleanLocation(location) {
  return location?.replace(/[?.!]+$/g, "").trim() || null;
}
