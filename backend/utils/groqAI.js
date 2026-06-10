// utils/groqAI.js — Optimized: 1 API call per video, no chunking waste

const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = "llama-3.3-70b-versatile";

const MAX_TRANSCRIPT_WORDS = 3500;

function smartTruncate(text, maxWords) {
  const words = text.split(/\s+/);
  if (words.length <= maxWords) return { text, truncated: false };

  const keepStart = Math.floor(maxWords * 0.7);
  const keepEnd = maxWords - keepStart;
  const truncated =
    words.slice(0, keepStart).join(" ") +
    " [...] " +
    words.slice(-keepEnd).join(" ");

  return { text: truncated, truncated: true };
}

async function summarizeTranscript(transcript, language = "english") {
  const { text: safeTranscript, truncated } = smartTruncate(transcript, MAX_TRANSCRIPT_WORDS);

  const isHindi = language === "hindi";

  const prompt = isHindi
    ? `Niche diye gaye YouTube video transcript ka summary Hindi mein likho.

Apna jawab BILKUL is format mein do:
## Overview
[2-3 sentences mein batao yeh video kis baare mein hai]

## Key Points
- [point 1]
- [point 2]
- [point 3]
- [point 4]
- [point 5]

## Conclusion
[1-2 sentences mein main message wrap up karo]

${truncated ? "Note: Transcript lamba tha, jo diya gaya hai uska summary karo.\n\n" : ""}Transcript:
${safeTranscript}`
    : `Summarize this YouTube video transcript clearly and completely.

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