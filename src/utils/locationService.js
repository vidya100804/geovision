// src/utils/locationService.js
export async function geocodeLocation(place) {
  if (!place) return null;

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}`
    );

    const data = await res.json();
    if (!data || data.length === 0) return null;

    return {
      name: data[0].display_name,
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
    };
  } catch {
    return null;
  }
}