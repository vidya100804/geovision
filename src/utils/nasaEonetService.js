export async function fetchEonetEvents(categoryId) {
  try {
    const res = await fetch(
      `https://eonet.gsfc.nasa.gov/api/v2.1/events?category=${categoryId}&status=open&limit=50`
    );

    if (!res.ok) return [];

    const data = await res.json();

    return (data.events || [])
      .map(event => {
        const geo = event.geometries?.[0];
        if (!geo || !geo.coordinates) return null;

        const [lon, lat] = geo.coordinates;

        //  HARD FILTER — THIS FIXES THE VERTICAL LINE
        if (
          typeof lat !== "number" ||
          typeof lon !== "number" ||
          Math.abs(lat) > 90 ||
          Math.abs(lon) > 180 ||
          (lat === 0 && lon === 0)
        ) {
          return null;
        }

        return {
          id: event.id,
          title: event.title,
          lat,
          lon,
          date: geo.date,
          source: "NASA EONET",
        };
      })
      .filter(Boolean);
  } catch (err) {
    console.error("EONET fetch failed", err);
    return [];
  }
}