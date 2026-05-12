import process from "node:process";

export async function generateNarration({ eventType, location, eventCount }) {
  if (!process.env.OPENROUTER_API_KEY) {
    return buildFallbackNarration({ eventType, location, eventCount });
  }

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

  try {
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
          model: process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.4,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`OpenRouter request failed with ${response.status}`);
    }

    const data = await response.json();
    return (
      data.choices?.[0]?.message?.content ||
      buildFallbackNarration({ eventType, location, eventCount })
    );
  } catch (error) {
    console.error("AI narration failed:", error.message);
    return buildFallbackNarration({ eventType, location, eventCount });
  }
}

export function buildFallbackNarration({ eventType, location, eventCount = 0 }) {
  const label = formatEventType(eventType);
  const place = location || "the selected area";
  const countText =
    eventCount > 0
      ? `${eventCount} live ${label} signal${eventCount === 1 ? "" : "s"}`
      : `no matching live ${label} signals`;

  return `DESCRIPTION:
GeoVision checked live feeds for ${label} activity near ${place} and found ${countText}. This local summary is used when the AI provider is not configured or cannot be reached.

IMPACT:
Events in this category can affect travel, infrastructure, public safety, and nearby ecosystems. Use the map markers and detected event list as the most current signal in the app.

PRECAUTIONS:
Check official local alerts, avoid high-risk areas, keep emergency contacts ready, and refresh the query if conditions are changing quickly.`;
}

function formatEventType(eventType) {
  const labels = {
    earthquake: "earthquake",
    wildfire: "wildfire",
    flood: "flood",
    rainfall: "rainfall",
    deforestation: "deforestation",
    oceans: "ocean anomaly",
    snow: "snow and ice",
  };

  return labels[eventType] || "natural event";
}
