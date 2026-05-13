// src/utils/normalizeEvent.js
export function normalizeEvent(e, type) {
  if (!e?.geometry?.length) return null;

  const [lon, lat] = e.geometry[0].coordinates;

  if (typeof lat !== "number" || typeof lon !== "number") return null;

  return {
    lat,
    lon,
    type,
    title: e.title || type,
    source: "NASA EONET",
  };
}