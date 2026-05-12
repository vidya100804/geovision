// src/utils/eventService.js

export async function fetchEarthquakes(location) {
  if (!location) return [];

  const { lat, lng } = location;

  const url = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&latitude=${lat}&longitude=${lng}&maxradiuskm=500`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    return data.features.map((f) => ({
      id: f.id,
      type: "earthquake",
      magnitude: f.properties.mag,
      place: f.properties.place,
      date: new Date(f.properties.time),
      lat: f.geometry.coordinates[1],
      lng: f.geometry.coordinates[0],
    }));
  } catch (err) {
    console.error("Earthquake fetch error:", err);
    return [];
  }
}


export function filterEventsByTime(events, range) {
  if (!events || !events.length) return [];

  const now = Date.now();
  let diff = 0;

  if (range === "24h") diff = 24 * 60 * 60 * 1000;
  if (range === "7d") diff = 7 * 24 * 60 * 60 * 1000;
  if (range === "30d") diff = 30 * 24 * 60 * 60 * 1000;

  return events.filter(
    (e) => now - new Date(e.date).getTime() <= diff
  );
}
