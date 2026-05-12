
import { generateNarration } from "../src/services/aiNarration.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ text: "" });
  }

  try {
    const text = await generateNarration(req.body);
    res.status(200).json({ text });
  } catch (err) {
    console.error("AI narration failed:", err);
    res.status(200).json({
      text: "DESCRIPTION:\nAI narration is currently using fallback mode.\n\nIMPACT:\nThe map can still display live event data when available.\n\nPRECAUTIONS:\nCheck the AI API key if generated narration is required.",
    });
  }
}
