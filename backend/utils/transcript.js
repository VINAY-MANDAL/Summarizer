const { YoutubeTranscript } = require("youtube-transcript");
const { fetchTranscriptWithYoutubei } = require("./youtubei");

function extractVideoId(url) {
  try {
    const urlObj = new URL(url);

    if (urlObj.hostname.includes("youtube.com")) {
      // Standard: ?v=VIDEO_ID
      if (urlObj.searchParams.get("v")) {
        return urlObj.searchParams.get("v");
      }

      // Live/Shorts/Embed: /live/ID or /shorts/ID or /embed/ID
      const pathMatch = urlObj.pathname.match(
        /\/(live|shorts|embed|v)\/([a-zA-Z0-9_-]{11})/
      );
      if (pathMatch) return pathMatch[2];
    }

    // youtu.be/VIDEO_ID
    if (urlObj.hostname === "youtu.be") {
      const id = urlObj.pathname.slice(1).split("/")[0];
      if (id.length === 11) return id;
    }

  } catch {
    const match = url.match(
      /(?:v=|youtu\.be\/|\/live\/|\/shorts\/|\/embed\/)([a-zA-Z0-9_-]{11})/
    );
    return match ? match[1] : null;
  }

  return null;
}

async function fetchTranscript(videoId) {
  try {
    let transcriptItems;

    try {
      transcriptItems = await YoutubeTranscript.fetchTranscript(
        videoId,
        { lang: "en" }
      );
    } catch (err) {
      console.log("Primary transcript fetch failed, trying without lang:", err?.message);

      try {
        transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
      } catch (err2) {
        console.log("youtube-transcript failed, trying youtubei.js:", err2?.message);

        try {
          return await fetchTranscriptWithYoutubei(videoId);
        } catch (err3) {
          console.error("youtubei.js failed:", err3?.message);
          throw err3;
        }
      }
    }

    if (!transcriptItems || transcriptItems.length === 0) {
      console.log("No transcript items found, trying youtubei.js");
      return await fetchTranscriptWithYoutubei(videoId);
    }

    return transcriptItems.map(item => item.text).join(" ");

  } catch (err) {
    console.error("===== TRANSCRIPT ERROR =====");
    console.error(err);
    console.error("Message:", err?.message);
    console.error("Stack:", err?.stack);
    console.error("===========================");

    if (err.message === "TRANSCRIPT_NOT_FOUND") {
      throw err;
    }

    if (err.message?.includes("disabled") || err.message?.includes("No transcripts")) {
      throw new Error("TRANSCRIPT_DISABLED");
    }

    throw new Error("TRANSCRIPT_FETCH_FAILED");
  }
}

function estimateTokens(text) {
  return Math.ceil(text.split(/\s+/).length / 0.75);
}

module.exports = {
  extractVideoId,
  fetchTranscript,
  estimateTokens,
};