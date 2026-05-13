export async function fetchWeather(lat, lon) {
  const API_KEY = import.meta.env.VITE_OPENWEATHER_KEY;

  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
  );

  const data = await res.json();

  return {
    snow: data.snow?.["1h"] || 0,
    rain: data.rain?.["1h"] || 0,
    wave: data.weather?.[0]?.description || "",
  };
}