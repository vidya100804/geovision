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
  };

  let eventType = null;
  for (const key in EVENT_MAP) {
    if (q.includes(key)) {
      eventType = EVENT_MAP[key];
      break;
    }
  }

  if (!eventType) return { eventType: null, location: null };

  // extract location AFTER "in"
  const match = q.match(/in (.+)$/);
  const location = match ? match[1].trim() : null;

  return { eventType, location };
}