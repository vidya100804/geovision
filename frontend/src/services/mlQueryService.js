// src/services/mlQueryService.js
// TF.js Universal Sentence Encoder for semantic query classification
// Falls back to keyword regex if USE fails to load

import { detectEventType } from "../utils/eventDetector";

let useModel = null;
let modelLoading = false;
let modelReady = false;

// Anchor phrases representing each intent category
const INTENT_ANCHORS = {
  earthquake: [
    "earthquake tremor seismic activity",
    "ground shaking richter magnitude",
    "tectonic plate movement",
    "aftershocks fault line rupture",
  ],
  wildfire: [
    "wildfire forest fire burning",
    "fire spreading smoke flames",
    "bushfire active fire emergency",
  ],
  flood: [
    "flood flooding river overflow",
    "inundation waterlogged area storm surge",
    "flash flood heavy rain disaster",
  ],
  volcano: [
    "volcano eruption lava flow",
    "volcanic ash cloud magma eruption",
    "pyroclastic flow volcanic activity",
  ],
  tsunami: [
    "tsunami tidal wave ocean wave",
    "submarine earthquake sea wave disaster",
  ],
  weather: [
    "weather temperature rain wind humidity",
    "current weather conditions forecast",
    "climate temperature today sunny cloudy",
  ],
  hurricane: [
    "hurricane cyclone typhoon tropical storm",
    "category storm wind speed tropical",
    "named storm atlantic pacific",
  ],
  drought: [
    "drought dry conditions water scarcity",
    "heatwave extreme heat temperature record",
    "water shortage rainfall deficit",
    "hot weather high temperature scorching heat",
    "heat warning temperature above normal",
    "summer heatwave heat dome",
  ],
  snowfall: [
    "snow blizzard snowstorm winter storm",
    "ice storm snowfall accumulation",
    "whiteout conditions winter weather",
  ],
  ocean: [
    "ocean sea marine conditions",
    "sea surface temperature marine heatwave",
    "coral bleaching ocean anomaly current",
  ],
  airquality: [
    "air quality pollution AQI index",
    "smog particulate matter PM2.5",
    "air pollution health risk breathing",
  ],
};

export async function initMLModel() {
  if (modelReady || modelLoading) return modelReady;
  modelLoading = true;
  try {
    const tf = await import("@tensorflow/tfjs");
    await tf.ready();
    const use = await import("@tensorflow-models/universal-sentence-encoder");
    useModel = await use.load();
    modelReady = true;
    console.log("[GeoVision ML] Universal Sentence Encoder loaded ✓");
  } catch (err) {
    console.warn("[GeoVision ML] USE failed to load, using keyword fallback:", err.message);
    modelReady = false;
  }
  modelLoading = false;
  return modelReady;
}

function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB) + 1e-8);
}

export async function classifyQuery(queryText) {
  // Try ML classification first
  if (useModel && modelReady) {
    try {
      const allTexts = [queryText, ...Object.values(INTENT_ANCHORS).flat()];
      const embeddings = await useModel.embed(allTexts);
      const embArr = await embeddings.array();
      embeddings.dispose();

      const queryEmb = embArr[0];
      let anchorIdx = 1;
      const scores = {};

      for (const [intent, anchors] of Object.entries(INTENT_ANCHORS)) {
        let maxSim = 0;
        for (let i = 0; i < anchors.length; i++) {
          const sim = cosineSimilarity(queryEmb, embArr[anchorIdx++]);
          maxSim = Math.max(maxSim, sim);
        }
        scores[intent] = maxSim;
      }

      const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
      const [topIntent, topScore] = sorted[0];
      const confidence = Math.round(topScore * 100);

      console.log(`[GeoVision ML] Query: "${queryText}" → ${topIntent} (${confidence}%)`);

      return {
        intent: topIntent,
        confidence,
        method: "tensorflow-use",
        allScores: Object.fromEntries(sorted.map(([k, v]) => [k, Math.round(v * 100)])),
        suggestedEventType: topIntent,
      };
    } catch (err) {
      console.warn("[GeoVision ML] Inference error, falling back:", err.message);
    }
  }

  // Keyword fallback
  const keywordResult = detectEventType(queryText);
  return {
    intent: keywordResult,
    confidence: 75,
    method: "keyword-fallback",
    suggestedEventType: keywordResult,
  };
}

export function isModelReady() {
  return modelReady;
}
