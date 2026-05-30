// ============================================================
// utils/transcript.js
// Handles fetching YouTube transcripts and splitting into chunks
// ============================================================

const { YoutubeTranscript } = require("youtube-transcript");

/**
 * Extract YouTube video ID from various URL formats:
 * - https://www.youtube.com/watch?v=VIDEOID
 * - https://youtu.be/VIDEOID
 * - https://youtube.com/shorts/VIDEOID
 */
function extractVideoId(url) {
  try {
    const urlObj = new URL(url);
    // Standard youtube.com/watch?v=...
    if (urlObj.hostname.includes("youtube.com")) {
      return urlObj.searchParams.get("v") || urlObj.pathname.split("/").pop();
    }
    // Short youtu.be/...
    if (urlObj.hostname === "youtu.be") {
      return urlObj.pathname.slice(1);
    }
  } catch {
    // If URL parsing fails, try simple regex
    const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  }
  return null;
}

/**
 * Fetch transcript text for a YouTube video
 * Returns plain text string or throws descriptive error
 */
async function fetchTranscript(videoId) {
  try {
    const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);

    if (!transcriptItems || transcriptItems.length === 0) {
      throw new Error("TRANSCRIPT_NOT_FOUND");
    }

    // Join all transcript segments into one string
    const fullText = transcriptItems.map((item) => item.text).join(" ");
    return fullText;
  } catch (err) {
    // Re-throw with clearer error codes for the route to handle
    if (err.message === "TRANSCRIPT_NOT_FOUND") throw err;
    if (err.message?.includes("disabled")) throw new Error("TRANSCRIPT_DISABLED");
    throw new Error("TRANSCRIPT_FETCH_FAILED");
  }
}

/**
 * Split a long text into chunks of ~maxWords words each.
 * This prevents hitting token limits in the AI model.
 */
function chunkText(text, maxWords = 1500) {
  const words = text.split(/\s+/);
  const chunks = [];

  for (let i = 0; i < words.length; i += maxWords) {
    chunks.push(words.slice(i, i + maxWords).join(" "));
  }

  return chunks;
}

/**
 * Estimate approximate token count (rough: 1 token ≈ 0.75 words)
 */
function estimateTokens(text) {
  return Math.ceil(text.split(/\s+/).length / 0.75);
}

module.exports = { extractVideoId, fetchTranscript, chunkText, estimateTokens };
