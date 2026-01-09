import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { generateNarration } from "../services/aiNarration.js";

dotenv.config(); // ✅ LOAD .env FIRST

const app = express();

app.use(cors());
app.use(express.json());

app.post("/api/ai-narrate", async (req, res) => {
  try {
    console.log("ROUTE HIT");
    console.log(" BODY:", req.body);
    //console.log(" API KEY:", process.env.OPENROUTER_API_KEY);

    const text = await generateNarration(req.body);
    res.json({ text });
  } catch (err) {
    console.error("AI narration failed:", err.message);
    res.status(500).json({ text: "AI narration failed." });
  }
});

app.listen(5000, () => {
  console.log("Backend running at http://localhost:5000");
});
