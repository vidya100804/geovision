import fetch from "node-fetch";

export async function generateNarration({ eventType, location, eventCount }) {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error(" OPENROUTER_API_KEY is missing");
  }

  // src/services/aiNarration.js

const prompt = `
Explain ${eventType}s in ${location}.

Return the answer in EXACTLY this format:

DESCRIPTION:
(why they occur + recent events)

IMPACT:
(impacts on people and environment)

PRECAUTIONS:
(safety precautions)

Rules:
- No markdown
- No bullet symbols
- Plain text only
`;


  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5173",
        "X-Title": "GeoVisionAI",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4,
      }),
    }
  );

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "No narration generated.";
}
