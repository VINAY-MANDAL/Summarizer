// ============================================================
// routes/feedback.js
// POST /api/feedback — Store user thumbs up/down feedback
// ============================================================

const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const FEEDBACK_FILE = path.join(__dirname, "../data/feedback.json");

// Load existing feedback or return empty array
function loadFeedback() {
  try {
    if (fs.existsSync(FEEDBACK_FILE)) {
      return JSON.parse(fs.readFileSync(FEEDBACK_FILE, "utf8"));
    }
  } catch {}
  return [];
}

// Save feedback to file
function saveFeedback(data) {
  fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(data, null, 2));
}

/**
 * POST /api/feedback
 * Body: { videoId, rating: "up"|"down", comment?: string }
 */
router.post("/", (req, res) => {
  const { videoId, rating, comment } = req.body;

  if (!videoId || !["up", "down"].includes(rating)) {
    return res.status(400).json({ error: "Invalid feedback data." });
  }

  const feedback = loadFeedback();
  feedback.push({
    videoId,
    rating,
    comment: comment?.slice(0, 500) || "", // Max 500 chars for safety
    timestamp: new Date().toISOString(),
    ip: req.ip, // For basic abuse tracking (not shown publicly)
  });

  saveFeedback(feedback);

  return res.json({ success: true, message: "Thank you for your feedback!" });
});

/**
 * GET /api/feedback/stats
 * Returns aggregated feedback stats
 */
router.get("/stats", (req, res) => {
  const feedback = loadFeedback();
  const thumbsUp = feedback.filter((f) => f.rating === "up").length;
  const thumbsDown = feedback.filter((f) => f.rating === "down").length;

  res.json({
    total: feedback.length,
    thumbsUp,
    thumbsDown,
    positiveRate:
      feedback.length > 0
        ? ((thumbsUp / feedback.length) * 100).toFixed(1) + "%"
        : "0%",
  });
});

module.exports = router;
