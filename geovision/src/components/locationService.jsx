// src/utils/locationService.js

export async function fetchLocationCoordinates(query) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}`
    );

    const data = await response.json();

    if (!data || data.length === 0) return null;

    return {
      name: data[0].display_name,
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    };
  } catch (error) {
    console.error("Location fetch error:", error);
    return null;
  }
}
