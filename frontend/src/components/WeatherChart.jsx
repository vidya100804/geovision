// src/components/WeatherChart.jsx
import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, Filler,
  Tooltip, Legend,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import { fetchForecast } from "../services/weatherService";

ChartJS.register(
  CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, Filler,
  Tooltip, Legend
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 800, easing: "easeInOutQuart" },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "rgba(2,6,23,0.92)",
      borderColor: "rgba(0,234,255,0.3)",
      borderWidth: 1,
      titleColor: "#00eaff",
      bodyColor: "#ccc",
    },
  },
  scales: {
    x: {
      ticks: { color: "rgba(255,255,255,0.45)", font: { size: 10 } },
      grid: { color: "rgba(255,255,255,0.04)" },
    },
    y: {
      ticks: { color: "rgba(255,255,255,0.45)", font: { size: 10 } },
      grid: { color: "rgba(255,255,255,0.04)" },
    },
  },
};

export default function WeatherChart({ location }) {
  const [forecast, setForecast] = useState(null);
  const [view, setView] = useState("daily"); // "daily" | "hourly"

  useEffect(() => {
    if (!location?.lat || !location?.lng) return;
    fetchForecast(location.lat, location.lng).then(setForecast);
  }, [location]);

  if (!forecast) return (
    <div style={{ height: 140, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.4, fontSize: "0.8rem" }}>
      Loading forecast…
    </div>
  );

  const tabs = [
    { id: "daily", label: "7-Day" },
    { id: "hourly", label: "24h Hourly" },
  ];

  const dailyData = {
    labels: forecast.daily.map(d => {
      const date = new Date(d.date);
      return date.toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" });
    }),
    datasets: [
      {
        label: "Max °C",
        data: forecast.daily.map(d => d.maxTemp),
        borderColor: "#ff4757",
        backgroundColor: "rgba(255,71,87,0.12)",
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
      {
        label: "Min °C",
        data: forecast.daily.map(d => d.minTemp),
        borderColor: "#00eaff",
        backgroundColor: "rgba(0,234,255,0.08)",
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
    ],
  };

  const hourlyData = {
    labels: forecast.hourly.slice(0, 24).map(h => {
      const d = new Date(h.time);
      return d.getHours().toString().padStart(2, "0") + ":00";
    }),
    datasets: [
      {
        label: "Temp °C",
        data: forecast.hourly.slice(0, 24).map(h => h.temperature),
        borderColor: "#ff9f43",
        backgroundColor: "rgba(255,159,67,0.1)",
        fill: true,
        tension: 0.4,
        yAxisID: "y",
        pointRadius: 2,
      },
      {
        label: "Precip %",
        data: forecast.hourly.slice(0, 24).map(h => h.precipProb),
        backgroundColor: "rgba(30,144,255,0.35)",
        borderColor: "rgba(30,144,255,0.7)",
        type: "bar",
        yAxisID: "y1",
      },
    ],
  };

  const hourlyOptions = {
    ...chartOptions,
    scales: {
      ...chartOptions.scales,
      y: { ...chartOptions.scales.y, position: "left" },
      y1: {
        ...chartOptions.scales.y,
        position: "right",
        max: 100,
        grid: { drawOnChartArea: false },
      },
    },
  };

  return (
    <div>
      {/* Tab bar */}
      <div style={{ display: "flex", gap: "0.4rem", marginBottom: "0.6rem" }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setView(t.id)}
            style={{
              padding: "0.3rem 0.75rem",
              borderRadius: 8,
              border: "1px solid",
              borderColor: view === t.id ? "#00eaff" : "rgba(255,255,255,0.1)",
              background: view === t.id ? "rgba(0,234,255,0.12)" : "transparent",
              color: view === t.id ? "#00eaff" : "rgba(255,255,255,0.55)",
              fontSize: "0.72rem",
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
              transition: "all 0.2s",
            }}
          >
            {t.label}
          </button>
        ))}
        <div style={{ display: "flex", marginLeft: "auto", gap: "0.5rem", alignItems: "center" }}>
          {view === "daily" && forecast.daily.map(d => (
            <span key={d.date} title={d.description} style={{ fontSize: "1rem" }}>{d.icon}</span>
          ))}
        </div>
      </div>

      <div style={{ height: 140 }}>
        {view === "daily"
          ? <Line data={dailyData} options={chartOptions} />
          : <Bar data={hourlyData} options={hourlyOptions} />
        }
      </div>
    </div>
  );
}
