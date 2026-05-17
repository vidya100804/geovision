// src/handlers/exploreHandler.js
import { exploreQuery } from "../services/exploreService";

export async function handleExploreLogic({
  query,
  timeRange,
  setDetectedCoords,
  setEvents,
  setNarrative,
  speakNarrative,
  setLoading,
}) {
  if (!query) return;

  setLoading(true);

  try {
    const result = await exploreQuery({ query, timeRange });

    setDetectedCoords(result.location || null);
    setEvents(result.events || []);
    setNarrative(result.narrative || "");

    if (result.narrative) {
      speakNarrative(result.narrative);
    }
  } catch (error) {
    console.error("Explore error:", error);
    setDetectedCoords(null);
    setEvents([]);
    setNarrative(
      "GeoVision could not complete that request. Try again with a more specific place name or event type."
    );
  } finally {
    setLoading(false);
  }
}
