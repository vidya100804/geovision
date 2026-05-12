// src/utils/eventDetector.js

const EVENT_KEYWORDS = {
  earthquake: [
    "earthquake", "quake", "seismic", "tremor", "richter", "aftershock", "fault line", "magnitude",
  ],
  wildfire: [
    "wildfire", "fire", "forest fire", "bushfire", "burning", "flame", "inferno",
  ],
  flood: [
    "flood", "flooding", "inundation", "overflow", "submerged", "flash flood", "river burst",
  ],
  tsunami: [
    "tsunami", "tidal wave",
  ],
  volcano: [
    "volcano", "eruption", "lava", "magma", "ash cloud", "pyroclastic", "caldera",
  ],
  snowfall: [
    "snow", "snowfall", "blizzard", "winter storm", "ice storm", "snowstorm",
  ],
  hurricane: [
    "hurricane", "cyclone", "typhoon", "tropical storm", "named storm",
  ],
  drought: [
    "drought", "heatwave", "heat wave", "dry spell", "water scarcity", "arid",
  ],
  airquality: [
    "air quality", "aqi", "smog", "pollution", "pm2.5", "pm10", "particulate", "nitrogen dioxide", "ozone level",
  ],
  weather: [
    "weather", "temperature", "rain", "humidity", "wind", "forecast", "sunny", "cloudy", "overcast", "precipitation",
    "current conditions", "climate today", "what's the weather", "hot today", "cold today",
  ],
  ocean: [
    "ocean", "marine heatwave", "sea surface", "ocean anomaly", "ocean anomalies", "coral bleaching", "sea level",
  ],
  climate: [
    "climate", "global warming", "temperature rise", "greenhouse", "carbon", "emission",
  ],
};

export function detectEventType(query) {
  if (!query) return "general";

  const text = query.toLowerCase();

  for (const [eventType, keywords] of Object.entries(EVENT_KEYWORDS)) {
    for (const word of keywords) {
      if (text.includes(word)) {
        return eventType;
      }
    }
  }

  return "general";
}
