// src/services/aiService.js

export async function generateNarrative(query, locationName = "") {
  const res = await fetch("http://localhost:5000/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      locationName,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Backend error:", err);
    throw new Error("AI request failed");
  }

  const data = await res.json();
  return data.text;
}