// utils/youtubei.js
async function fetchTranscriptWithYoutubei(videoId) {
  const response = await fetch(
    `https://api.supadata.ai/v1/youtube/transcript?videoId=${videoId}&text=true`,
    {
      headers: {
        "x-api-key": process.env.SUPADATA_API_KEY
      }
    }
  );

  if (!response.ok) {
    throw new Error("TRANSCRIPT_NOT_FOUND");
  }

  const data = await response.json();
  
  if (!data.content) {
    throw new Error("TRANSCRIPT_NOT_FOUND");
  }

  return data.content;
}

module.exports = { fetchTranscriptWithYoutubei };