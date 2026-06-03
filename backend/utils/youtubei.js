const { Innertube } = require("youtubei.js");

async function fetchTranscriptWithYoutubei(videoId) {
  const youtube = await Innertube.create();

  const info = await youtube.getInfo(videoId);

  const transcriptData = await info.getTranscript();

  if (!transcriptData) {
    throw new Error("TRANSCRIPT_NOT_FOUND");
  }

  const transcript = transcriptData.transcript.content.body.initial_segments
    .map(segment => segment.snippet.text)
    .join(" ");

  return transcript;
}

module.exports = {
  fetchTranscriptWithYoutubei,
};