import { exploreNaturalEvents } from "../src/services/exploreApi.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ text: "Method not allowed." });
  }

  try {
    const result = await exploreNaturalEvents(req.body || {});
    return res.status(200).json(result);
  } catch (error) {
    console.error("Explore API failed:", error);
    return res.status(200).json({
      events: [],
      location: null,
      text: "DESCRIPTION:\nGeoVision could not complete the live lookup right now.\n\nIMPACT:\nThe dashboard is online, but the event feed request failed.\n\nPRECAUTIONS:\nTry again in a moment or search for a more specific location.",
    });
  }
}
