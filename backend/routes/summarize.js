// routes/summarize.js — Fixed: passes full transcript (not chunks array)

const express = require("express");
const router = express.Router();
const { extractVideoId, fetchTranscript, estimateTokens } = require("../utils/transcript");
const { summarizeTranscript } = require("../utils/groqAI");
const { getCached, setCached } = require("../utils/cache");
const { recordSummary } = require("../utils/analytics");

const inFlightRequests = new Set();

router.post("/", async (req, res) => {
  const { url, language = "english" } = req.body;

  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "Please provide a valid YouTube URL." });
  }

  const videoId = extractVideoId(url.trim());
  if (!videoId) {
    return res.status(400).json({ error: "Could not extract video ID. Please use a valid YouTube URL." });
  }

  if (inFlightRequests.has(videoId)) {
    return res.status(429).json({ error: "This video is already being summarized. Please wait." });
  }

  // Cache key includes language so Hindi and English are cached separately
  const cacheKey = `${videoId}_${language}`;
  const cached = getCached(cacheKey);
  if (cached) {
    recordSummary(videoId, true);
    return res.json({ summary: cached.summary, videoId, cached: true });
  }

  inFlightRequests.add(videoId);

  try {
    let transcript;
    try {
      transcript = await fetchTranscript(videoId);
    } catch (err) {
      const messages = {
        TRANSCRIPT_NOT_FOUND: "Transcript not found. This video may not have captions enabled.",
        TRANSCRIPT_DISABLED: "Captions are disabled for this video.",
        TRANSCRIPT_FETCH_FAILED: "Could not fetch video transcript. Please try again.",
      };
      return res.status(404).json({ error: messages[err.message] || messages.TRANSCRIPT_FETCH_FAILED });
    }

    const tokenCount = estimateTokens(transcript);
    console.log(`Video ${videoId}: ~${tokenCount} tokens | Language: ${language}`);

    let summary;
    try {
      summary = await summarizeTranscript(transcript, language);
    } catch (err) {
      if (err.message === "AI_SERVICE_UNAVAILABLE") {
        return res.status(503).json({ error: "AI service is temporarily unavailable. Please try again in a moment." });
      }
      throw err;
    }

    setCached(cacheKey, summary);
    recordSummary(videoId, false);

    return res.json({ summary, videoId, cached: false, tokensEstimated: tokenCount });

  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  } finally {
    inFlightRequests.delete(videoId);
  }
});

module.exports = router;