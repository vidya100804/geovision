export default function handler(_req, res) {
  res.status(200).json({
    status: "ok",
    aiConfigured: Boolean(process.env.OPENROUTER_API_KEY),
  });
}
