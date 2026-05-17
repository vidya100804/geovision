# 🌍 GeoVisionAI — Earth Intelligence & Narrative Platform

[![Deploys on Vercel](https://img.shields.io/badge/Vercel-Deployed-success?style=flat&logo=vercel&logoColor=white)](https://geovision-eight.vercel.app)
[![React](https://img.shields.io/badge/React-18.x-61dafb?style=flat&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.x-646cff?style=flat&logo=vite)](https://vite.dev)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9.x-b5e853?style=flat&logo=leaflet)](https://leafletjs.com)

**GeoVisionAI** is a premium, real-time, AI-driven Earth intelligence platform that visualizes live natural events (earthquakes, wildfires, severe weather, and ocean anomalies) on a stunning interactive 3D-feeling glassmorphism map. It allows users to explore any place on Earth and retrieve contextual natural histories, localized weather, air quality metrics, and live hazard feeds.

🚀 **Explore live at:** [geovision-eight.vercel.app](https://geovision-eight.vercel.app)

---

## ✨ Features

- 🌋 **Live Natural Events Feed:** Tracks global events in real-time, including earthquakes (USGS), wildfires, severe storms, flooding, snowfall, and volcanic activity (NASA EONET).
- 🌧️ **5 Premium Interactive Map Layers:**
  - 🗺️ **Dark Mode Base:** Premium dark-themed CartoDB tiles with pulsing event markers.
  - 🛰️ **Satellite Imagery:** High-resolution Esri World Imagery.
  - 🛣️ **Street Map:** Standard OpenStreetMap base.
  - ⛰️ **Terrain map:** Detailed topographical maps (OpenTopoMap).
  - 🌧️ **Live Rain Radar:** Seamless real-time precipitation radar overlay powered by the **RainViewer API** (completely free, zero API key required).
- 🧠 **On-the-Fly NLP Intent Classification:** Uses a custom in-browser TensorFlow.js / heuristic pipeline to instantly classify user query intents (e.g. weather vs. earthquakes) and focus the UI.
- 🌦️ **Deep Weather & Air Quality Panels:** Displays current temperatures, relative humidity, UV index, wind speed/direction, and cloud cover. It also charts European & US Air Quality Index (AQI) levels and active river discharges (flood risk) via Open-Meteo.
- 🗣️ **Geospatial AI Storytelling & TTS:** Generates detailed geospatial narratives about the explored region, complete with a built-in **Text-to-Speech (TTS)** reader to read the narrative aloud.
- 📱 **Exquisite, Ultra-Responsive UI:** High-fidelity glassmorphic dashboard built using Vanilla CSS custom variables, smooth GSAP animations (using a custom high-performance text-splitting engine to bypass premium paid plugins), and an interactive sidebar optimized for mobile touch screens.

---

## 🛠️ Tech Stack

### Frontend (Static & Serverless)
* **Framework:** React 18 (Vite)
* **Mapping:** Leaflet.js & React-Leaflet
* **Animations:** GSAP (GreenSock Animation Platform) + Custom text shims
* **Charts:** Chart.js & React-Chartjs-2
* **Icons:** Material UI Icons
* **Hosting:** Vercel (Automatic Continuous Integration via GitHub pushes)

### Backend (Optional Node API)
* **Framework:** Express.js + CORS
* **AI Engine:** OpenAI Node SDK (for advanced GPT narratives)
* **Hosting:** Ready for Render, Fly.io, or Heroku

---

## 🚀 Quick Start

### 1. Prerequisites
Make sure you have Node.js (v18+) and npm installed.

### 2. Clone the Repository
```bash
git clone https://github.com/vidya100804/geovision.git
cd geovision
```

### 3. Run the Frontend (Serverless App)
The frontend is 100% serverless and queries all APIs (nominatim, USGS, Open-Meteo, RainViewer) directly from the browser!
```bash
cd frontend
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.

### 4. Run the Backend API (Optional)
If you want to run the advanced AI generation service (requires OpenAI keys):
```bash
cd backend
npm install
# Configure your .env file inside backend directory with your OPENAI_API_KEY
npm start
```
The backend server will run on **`http://localhost:5000`**.

---

## 🌎 Cloud Deployment

This repository is optimized for **Vercel** with a zero-configuration pipeline! 

### Automatic GitHub Deployment
1. When you commit and push your changes to the `main` branch:
   ```bash
   git add .
   git commit -m "Your feature update"
   git push origin main
   ```
2. Vercel automatically detects the push, runs the root installation pipeline, builds the React app, and publishes the new version to production in under **30 seconds**!

### Build Process Architecture
The project root uses a custom `vercel.json` and a root `package.json` redirect script:
* **Install Command:** Installs dependencies in the `frontend` folder.
* **Build Command:** Compiles the Vite React application and outputs it directly to the root `dist/` directory, which Vercel serves statically.

---

## 🛡️ License

This project is licensed under the MIT License. Developed with 💙 by Vidya.
