const { YoutubeTranscript } = require("youtube-transcript");
const { fetchTranscriptWithYtDlp } = require("./ytdlp");

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
    } catch (err) {
      console.log("Primary transcript fetch failed, trying fallback without lang:", err?.message);
      try {
        transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
      } catch (err2) {
        console.log("YouTube transcript API failed, trying yt-dlp fallback:", err2?.message);
        return await fetchTranscriptWithYtDlp(`https://www.youtube.com/watch?v=${videoId}`);
      }
    }

    if (!transcriptItems || transcriptItems.length === 0) {
      console.log("No transcript items found, using yt-dlp fallback");
      return await fetchTranscriptWithYtDlp(`https://www.youtube.com/watch?v=${videoId}`);
    }

    return transcriptItems.map((item) => item.text).join(" ");
  } catch (err) {
    console.error("=====Transcipt error=====");
    console.error(err);
    console.error("Message:", err?.message);
    console.error("stack:", err?.stack);
    console.error("==============");

    if (err.message === "TRANSCRIPT_NOT_FOUND") {
      throw err;
    }
    if (
      err.message?.includes("disabled") ||
      err.message?.includes("No transcripts")
    ) {
      throw new Error("TRANSCRIPT_DISABLED");
    }
    throw new Error("TRANSCRIPT_FETCH_FAILED");
  }
}


function estimateTokens(text) {
  return Math.ceil(text.split(/\s+/).length / 0.75);
}

module.exports = { extractVideoId, fetchTranscript, estimateTokens };