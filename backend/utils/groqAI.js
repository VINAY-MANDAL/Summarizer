// utils/groqAI.js — Optimized: 1 API call per video, no chunking waste

const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = "llama-3.3-70b-versatile";

// llama3-8b-8192 has 8192 token context window
// We keep ~5000 tokens for transcript, ~800 for output, rest for prompt overhead
const MAX_TRANSCRIPT_WORDS = 3500; // ~4600 tokens — safe limit

/**
 * Truncate transcript smartly — keep beginning + end (most important parts)
 */
function smartTruncate(text, maxWords) {
  const words = text.split(/\s+/);
  if (words.length <= maxWords) return { text, truncated: false };

  // Keep first 70% from start, last 30% from end — captures intro + conclusion
  const keepStart = Math.floor(maxWords * 0.7);
  const keepEnd = maxWords - keepStart;
  const truncated =
    words.slice(0, keepStart).join(" ") +
    " [...] " +
    words.slice(-keepEnd).join(" ");

  return { text: truncated, truncated: true };
}

/**
 * Single API call summarization — handles any length video.
 * NO chunking loop = no 80x API calls.
 */
async function summarizeTranscript(transcript) {
  const { text: safeTranscript, truncated } = smartTruncate(transcript, MAX_TRANSCRIPT_WORDS);

  const prompt = `Summarize this YouTube video transcript clearly and completely.

Format your response EXACTLY like this:
## Overview
[2-3 sentences describing what this video is about]

## Key Points
- [point 1]
- [point 2]
- [point 3]
- [point 4]
- [point 5]

## Conclusion
[1-2 sentences wrapping up the main message]

${truncated ? "Note: Transcript was long, summarize what is provided.\n\n" : ""}Transcript:
${safeTranscript}`;

  const attempt = async () => {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 800,
      temperature: 0.3,
    });
    return completion.choices[0]?.message?.content || "";
  };

  try {
    return await attempt();
  } catch (err) {
    console.error("Groq attempt 1 failed:", err.message);
    await new Promise((r) => setTimeout(r, 2500));
    try {
      return await attempt();
    } catch (err2) {
      console.error("Groq attempt 2 failed:", err2.message);
      throw new Error("AI_SERVICE_UNAVAILABLE");
    }
  }
}

module.exports = { summarizeTranscript };
