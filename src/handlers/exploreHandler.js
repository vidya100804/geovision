import { exploreQuery } from "../services/exploreService";

export default async function exploreHandler(
  query,
  selectedEventType,
  timeRange = "24h"
) {
  try {
    return await exploreQuery({ query, selectedEventType, timeRange });
  } catch (error) {
    console.error("Explore API unavailable:", error);
    return {
      events: [],
      location: null,
      text: "DESCRIPTION:\nGeoVision could not reach the API server.\n\nIMPACT:\nThe dashboard is loaded, but live event lookup needs the backend to be running.\n\nPRECAUTIONS:\nStart the backend with npm run dev:server, then try the search again.",
    };
  }
}
