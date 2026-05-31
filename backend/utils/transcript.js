const { YoutubeTranscript } = require("youtube-transcript");

function extractVideoId(url) {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes("youtube.com")) {
      return urlObj.searchParams.get("v") || urlObj.pathname.split("/").pop();
    }
    if (urlObj.hostname === "youtu.be") {
      return urlObj.pathname.slice(1);
    }
  } catch {
    const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  }
  return null;
}

async function fetchTranscript(videoId) {
  try {
    let transcriptItems;
    try {
      transcriptItems = await YoutubeTranscript.fetchTranscript(videoId, { lang: "en" });
    } catch {
      transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
    }
    if (!transcriptItems || transcriptItems.length === 0) throw new Error("TRANSCRIPT_NOT_FOUND");
    return transcriptItems.map((item) => item.text).join(" ");
  } catch (err) {
    if (err.message === "TRANSCRIPT_NOT_FOUND") throw err;
    if (err.message?.includes("disabled") || err.message?.includes("No transcripts")) {
      throw new Error("TRANSCRIPT_DISABLED");
    }
    console.error("Transcript error:", err.message);
    throw new Error("TRANSCRIPT_FETCH_FAILED");
  }
}

function estimateTokens(text) {
  return Math.ceil(text.split(/\s+/).length / 0.75);
}

module.exports = { extractVideoId, fetchTranscript, estimateTokens };