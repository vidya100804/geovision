export async function generateNarrative(query) {
  const res = await fetch("http://localhost:5000/api/ai-narrate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  

  const data = await res.json();
  return data.text;
}