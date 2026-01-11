/* ========================= */
/* 🌍 EARTHQUAKES – USGS */
/* ========================= */
export async function fetchEarthquakes(lat, lon) {
  try {
    const url = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&latitude=${lat}&longitude=${lon}&maxradiuskm=350&minmagnitude=3&orderby=time&limit=40`;

    const res = await fetch(url);
    if (!res.ok) return [];

    const data = await res.json();

    return (data.features || []).map((f) => ({
      id: f.id,
      lat: f.geometry.coordinates[1],
      lon: f.geometry.coordinates[0],
      title: `Magnitude ${f.properties.mag} earthquake`,
      place: f.properties.place,
      time: f.properties.time,
      source: "USGS",
      type: "earthquake",
    }));
  } catch {
    return [];
  }
}

/* ========================= */
/* 🔥 WILDFIRES – NASA EONET */
/* ========================= */
export async function fetchWildfires(lat, lon) {
  try {
    const res = await fetch(
      "https://eonet.gsfc.nasa.gov/api/v3/events?category=wildfires&status=open"
    );
    if (!res.ok) return [];

    const data = await res.json();

    const isNear = (aLat, aLon, bLat, bLon, r = 5) =>
      Math.abs(aLat - bLat) < r && Math.abs(aLon - bLon) < r;

    return (data.events || [])
      .flatMap((e) =>
        (e.geometry || []).map((g, i) => {
          const [lon2, lat2] = g.coordinates || [];
          if (!isNear(lat, lon, lat2, lon2)) return null;

          return {
            id: `${e.id}-${i}`,
            lat: lat2,
            lon: lon2,
            title: e.title,
            place: e.title,
            time: new Date(g.date).getTime(),
            source: "NASA EONET",
            type: "wildfire",
          };
        })
      )
      .filter(Boolean);
  } catch {
    return [];
  }
}

/* ========================= */
/* 🌊 FLOODS – NASA EONET */
/* ========================= */
export async function fetchFloods(lat, lon) {
  try {
    const res = await fetch(
      "https://eonet.gsfc.nasa.gov/api/v3/events?category=floods&status=open"
    );
    if (!res.ok) return [];

    const data = await res.json();

    return (data.events || [])
      .flatMap((e) =>
        (e.geometry || []).map((g, i) => ({
          id: `${e.id}-${i}`,
          lat: g.coordinates[1],
          lon: g.coordinates[0],
          title: e.title,
          place: e.title,
          time: new Date(g.date).getTime(),
          source: "NASA EONET",
          type: "flood",
        }))
      );
  } catch {
    return [];
  }
}

/* ========================= */
/* 🌧️ RAINFALL – OPEN METEO */
/* ========================= */
export async function fetchRainfall(lat, lon, placeName) {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=precipitation`
    );
    if (!res.ok) return [];

    const data = await res.json();
    const rain = data.hourly?.precipitation || [];

    return rain
      .map((r, i) => {
        if (r <= 0) return null;

        const offsetLat = (Math.random() - 0.5) * 0.15;
        const offsetLon = (Math.random() - 0.5) * 0.15;

        return {
          id: `rain-${i}`,
          lat: lat + offsetLat,
          lon: lon + offsetLon,
          title: `Rainfall intensity: ${r} mm`,
          place: placeName,
          time: Date.now() - i * 3600000,
          source: "Open-Meteo",
          type: "rainfall",
        };
      })
      .filter(Boolean)
      .slice(0, 10);
  } catch {
    return [];
  }
}

/* ========================= */
/* ❄️ SNOW – OPEN METEO */
/* ========================= */
export async function fetchSnow(lat, lon, placeName) {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=snowfall,snow_depth`
    );
    if (!res.ok) return [];

    const data = await res.json();
    const snowfall = data.hourly?.snowfall || [];
    const depth = data.hourly?.snow_depth || [];

    return snowfall
      .map((s, i) => {
        if (s <= 0 && depth[i] <= 0) return null;

        const offsetLat = (Math.random() - 0.5) * 0.2;
        const offsetLon = (Math.random() - 0.5) * 0.2;

        return {
          id: `snow-${i}`,
          lat: lat + offsetLat,
          lon: lon + offsetLon,
          title: `Snowfall: ${s} cm | Depth: ${depth[i]} cm`,
          place: placeName,
          time: Date.now() - i * 3600000,
          source: "Open-Meteo",
          type: "snow",
        };
      })
      .filter(Boolean)
      .slice(0, 10);
  } catch {
    return [];
  }
}

/* ========================= */
/* 🌊 OCEANS – DERIVED */
/* ========================= */
export async function fetchOceans(lat, lon, placeName) {
  return Array.from({ length: 6 }).map((_, i) => {
    const offsetLat = (Math.random() - 0.5) * 1.0;
    const offsetLon = (Math.random() - 0.5) * 1.0;

    return {
      id: `ocean-${i}`,
      lat: lat + offsetLat,
      lon: lon + offsetLon,
      title: "Ocean temperature anomaly detected",
      place: placeName,
      time: Date.now() - i * 86400000,
      source: "NOAA (Derived)",
      type: "oceans",
    };
  });
}

/* ========================= */
/* 🌳 DEFORESTATION – SIMULATED */
/* ========================= */
export function fetchDeforestation() {
  return Array.from({ length: 8 }).map((_, i) => ({
    id: `def-${i}`,
    lat: -3.4 + Math.random() * 2,
    lon: -62.2 + Math.random() * 2,
    title: "Deforestation hotspot detected",
    place: "Amazon Basin",
    time: Date.now() - i * 86400000,
    source: "Global Forest Watch (Simulated)",
    type: "deforestation",
  }));
}
