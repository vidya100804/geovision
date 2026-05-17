// src/services/weatherService.js
// Uses Open-Meteo (https://open-meteo.com) — completely free, no API key needed
// Uses Open-Meteo Air Quality API — also free, no key

const WEATHER_BASE = "https://api.open-meteo.com/v1";
const AIR_QUALITY_BASE = "https://air-quality-api.open-meteo.com/v1";
const FLOOD_BASE = "https://flood-api.open-meteo.com/v1";

const WMO_CODES = {
  0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
  45: "Foggy", 48: "Depositing rime fog",
  51: "Light drizzle", 53: "Moderate drizzle", 55: "Dense drizzle",
  61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
  71: "Slight snow", 73: "Moderate snow", 75: "Heavy snow",
  77: "Snow grains", 80: "Slight showers", 81: "Moderate showers", 82: "Violent showers",
  85: "Slight snow showers", 86: "Heavy snow showers",
  95: "Thunderstorm", 96: "Thunderstorm w/ slight hail", 99: "Thunderstorm w/ heavy hail",
};

export function getWeatherDescription(code) {
  return WMO_CODES[code] || "Unknown";
}

export function getWeatherIcon(code) {
  if (code === 0 || code === 1) return "☀️";
  if (code === 2) return "⛅";
  if (code === 3) return "☁️";
  if (code <= 48) return "🌫️";
  if (code <= 55) return "🌦️";
  if (code <= 65) return "🌧️";
  if (code <= 77) return "❄️";
  if (code <= 82) return "🌨️";
  if (code <= 86) return "🌨️";
  if (code >= 95) return "⛈️";
  return "🌡️";
}

export async function fetchCurrentWeather(lat, lng) {
  try {
    const url = new URL(`${WEATHER_BASE}/forecast`);
    url.searchParams.set("latitude", lat);
    url.searchParams.set("longitude", lng);
    url.searchParams.set("current", [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "weather_code",
      "surface_pressure",
      "wind_speed_10m",
      "wind_direction_10m",
      "precipitation",
      "uv_index",
      "cloud_cover",
      "visibility",
    ].join(","));
    url.searchParams.set("timezone", "auto");
    url.searchParams.set("forecast_days", "1");

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Weather fetch failed: ${res.status}`);
    const data = await res.json();
    const c = data.current;
    return {
      temperature: c.temperature_2m,
      humidity: c.relative_humidity_2m,
      feelsLike: c.apparent_temperature,
      weatherCode: c.weather_code,
      description: getWeatherDescription(c.weather_code),
      icon: getWeatherIcon(c.weather_code),
      pressure: c.surface_pressure,
      windSpeed: c.wind_speed_10m,
      windDir: c.wind_direction_10m,
      precipitation: c.precipitation,
      uvIndex: c.uv_index,
      cloudCover: c.cloud_cover,
      visibility: c.visibility,
      timezone: data.timezone,
      units: {
        temperature: data.current_units?.temperature_2m || "°C",
        windSpeed: data.current_units?.wind_speed_10m || "km/h",
      },
    };
  } catch (err) {
    console.error("fetchCurrentWeather error:", err);
    return null;
  }
}

export async function fetchForecast(lat, lng) {
  try {
    const url = new URL(`${WEATHER_BASE}/forecast`);
    url.searchParams.set("latitude", lat);
    url.searchParams.set("longitude", lng);
    url.searchParams.set("hourly", [
      "temperature_2m",
      "precipitation_probability",
      "precipitation",
      "weather_code",
      "wind_speed_10m",
    ].join(","));
    url.searchParams.set("daily", [
      "temperature_2m_max",
      "temperature_2m_min",
      "weather_code",
      "precipitation_sum",
      "wind_speed_10m_max",
    ].join(","));
    url.searchParams.set("timezone", "auto");
    url.searchParams.set("forecast_days", "7");

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Forecast fetch failed: ${res.status}`);
    const data = await res.json();

    const daily = data.daily || {};
    const dailyForecast = (daily.time || []).map((date, i) => ({
      date,
      maxTemp: daily.temperature_2m_max?.[i],
      minTemp: daily.temperature_2m_min?.[i],
      weatherCode: daily.weather_code?.[i],
      icon: getWeatherIcon(daily.weather_code?.[i]),
      description: getWeatherDescription(daily.weather_code?.[i]),
      precipitation: daily.precipitation_sum?.[i],
      windSpeed: daily.wind_speed_10m_max?.[i],
    }));

    const hourly = data.hourly || {};
    // Return next 24 hours only
    const hourlyForecast = (hourly.time || []).slice(0, 24).map((time, i) => ({
      time,
      temperature: hourly.temperature_2m?.[i],
      precipProb: hourly.precipitation_probability?.[i],
      precipitation: hourly.precipitation?.[i],
      weatherCode: hourly.weather_code?.[i],
      windSpeed: hourly.wind_speed_10m?.[i],
    }));

    return { daily: dailyForecast, hourly: hourlyForecast };
  } catch (err) {
    console.error("fetchForecast error:", err);
    return null;
  }
}

export async function fetchAirQuality(lat, lng) {
  try {
    const url = new URL(`${AIR_QUALITY_BASE}/air-quality`);
    url.searchParams.set("latitude", lat);
    url.searchParams.set("longitude", lng);
    url.searchParams.set("current", [
      "european_aqi",
      "us_aqi",
      "pm10",
      "pm2_5",
      "carbon_monoxide",
      "nitrogen_dioxide",
      "ozone",
      "dust",
    ].join(","));
    url.searchParams.set("timezone", "auto");

    const res = await fetch(url);
    if (!res.ok) throw new Error(`AQI fetch failed: ${res.status}`);
    const data = await res.json();
    const c = data.current || {};
    const aqi = c.us_aqi ?? c.european_aqi ?? 0;

    let aqiLevel = "Good";
    let aqiColor = "#00e676";
    if (aqi > 50) { aqiLevel = "Moderate"; aqiColor = "#ffee58"; }
    if (aqi > 100) { aqiLevel = "Unhealthy for Sensitive"; aqiColor = "#ffa726"; }
    if (aqi > 150) { aqiLevel = "Unhealthy"; aqiColor = "#ef5350"; }
    if (aqi > 200) { aqiLevel = "Very Unhealthy"; aqiColor = "#ab47bc"; }
    if (aqi > 300) { aqiLevel = "Hazardous"; aqiColor = "#b71c1c"; }

    return {
      aqi,
      aqiLevel,
      aqiColor,
      europeanAqi: c.european_aqi,
      pm10: c.pm10,
      pm25: c.pm2_5,
      co: c.carbon_monoxide,
      no2: c.nitrogen_dioxide,
      ozone: c.ozone,
      dust: c.dust,
    };
  } catch (err) {
    console.error("fetchAirQuality error:", err);
    return null;
  }
}

export async function fetchFloodRisk(lat, lng) {
  try {
    const url = new URL(`${FLOOD_BASE}/flood`);
    url.searchParams.set("latitude", lat);
    url.searchParams.set("longitude", lng);
    url.searchParams.set("daily", "river_discharge");
    url.searchParams.set("forecast_days", "7");

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Flood fetch failed: ${res.status}`);
    const data = await res.json();

    const daily = data.daily || {};
    const discharges = daily.river_discharge || [];
    const maxDischarge = Math.max(...discharges.filter(Boolean));
    const avgDischarge = discharges.reduce((a, b) => a + (b || 0), 0) / (discharges.length || 1);

    let floodRisk = "Low";
    let floodColor = "#00e676";
    if (maxDischarge > 500) { floodRisk = "Moderate"; floodColor = "#ffee58"; }
    if (maxDischarge > 1500) { floodRisk = "High"; floodColor = "#ffa726"; }
    if (maxDischarge > 3000) { floodRisk = "Extreme"; floodColor = "#ef5350"; }

    return {
      floodRisk,
      floodColor,
      maxDischarge,
      avgDischarge,
      forecast: (daily.time || []).map((date, i) => ({
        date,
        discharge: discharges[i] ?? 0,
      })),
    };
  } catch (err) {
    console.error("fetchFloodRisk error:", err);
    return null;
  }
}

export async function fetchGlobalStats() {
  try {
    // Global earthquake count in last 24h
    const eqUrl = new URL("https://earthquake.usgs.gov/fdsnws/event/1/count");
    eqUrl.searchParams.set("format", "geojson");
    eqUrl.searchParams.set("starttime", new Date(Date.now() - 86400000).toISOString());
    eqUrl.searchParams.set("minmagnitude", "2.5");

    // Active wildfires globally from NASA EONET
    const fireUrl = new URL("https://eonet.gsfc.nasa.gov/api/v3/events");
    fireUrl.searchParams.set("category", "wildfires");
    fireUrl.searchParams.set("status", "open");
    fireUrl.searchParams.set("limit", "1");

    const [eqRes, fireRes] = await Promise.allSettled([
      fetch(eqUrl),
      fetch(fireUrl),
    ]);

    let earthquakeCount = 0;
    let wildfireCount = 0;

    if (eqRes.status === "fulfilled" && eqRes.value.ok) {
      const data = await eqRes.value.json();
      earthquakeCount = data.count || 0;
    }
    if (fireRes.status === "fulfilled" && fireRes.value.ok) {
      const data = await fireRes.value.json();
      wildfireCount = data.total || 0;
    }

    return { earthquakeCount, wildfireCount };
  } catch (err) {
    console.error("fetchGlobalStats error:", err);
    return { earthquakeCount: 0, wildfireCount: 0 };
  }
}
