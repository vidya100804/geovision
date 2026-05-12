import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { exploreNaturalEvents } from "../services/exploreApi.js";
import { generateNarration } from "../services/aiNarration.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, ".env") });

const app = express();
const PORT = Number(process.env.PORT || 5000);

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    aiConfigured: Boolean(process.env.OPENROUTER_API_KEY),
    model: process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini",
  });
});

app.post("/api/explore", async (req, res) => {
  try {
    const result = await exploreNaturalEvents(req.body || {});
    res.json(result);
  } catch (error) {
    console.error("Explore API failed:", error);
    res.json({
      events: [],
      location: null,
      text: "DESCRIPTION:\nGeoVision could not complete the live lookup right now.\n\nIMPACT:\nThe dashboard is online, but the event feed request failed.\n\nPRECAUTIONS:\nTry again in a moment or search for a more specific location.",
    });
  }
});

app.post("/api/ai-narrate", async (req, res) => {
  try {
    const text = await generateNarration(req.body || {});
    res.json({ text });
  } catch (error) {
    console.error("AI narration failed:", error.message);
    res.json({
      text: "DESCRIPTION:\nAI narration failed.\n\nIMPACT:\nThe map can still display events when live data is available.\n\nPRECAUTIONS:\nCheck the API key and try again.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`GeoVision backend running at http://localhost:${PORT}`);
});
