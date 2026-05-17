import { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import QueryPanel from "../components/QueryPanel";
import NarrativePanel from "../components/NarrativePanel";
import GlobeBackground from "../components/GlobeBackground";

export default function Dashboard() {
  const [query, setQuery] = useState("");
  const [narrative, setNarrative] = useState("");
  
  const handleSubmit = () => {
    if (!query) return;

    // MOCK AI RESPONSE (we’ll replace later)
    setNarrative(
      `You asked about "${query}". GeoVisionAI analyzes geospatial patterns,
      recent events, and environmental factors related to this topic and
      visualizes them on the globe in real time.`
    );
  };

  return (
    <DashboardLayout
      left={
        <>
          <QueryPanel
            query={query}
            setQuery={setQuery}
            onSubmit={handleSubmit}
          />
          <NarrativePanel narrative={narrative} />
        </>
      }
      right={
        <>
          {/* Globe stays on right */}
          <GlobeBackground />
        </>
      }
    />
  );
}
