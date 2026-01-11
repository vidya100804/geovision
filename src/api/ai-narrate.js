import { generateNarration } from "../src/services/aiNarration.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ text: "Method not allowed" });
  }

  try {
    const text = await generateNarration(req.body);
    res.status(200).json({ text });
  } catch (err) {
    console.error("AI narration error:", err);
    res.status(500).json({ text: "AI narration failed." });
  }
}
