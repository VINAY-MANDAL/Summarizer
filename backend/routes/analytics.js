// ============================================================
// routes/analytics.js
// GET /api/analytics — Return usage statistics
// ============================================================

const express = require("express");
const router = express.Router();
const { getAnalytics } = require("../utils/analytics");

/**
 * GET /api/analytics
 * Returns aggregated usage data for the dashboard
 */
router.get("/", (req, res) => {
  try {
    const stats = getAnalytics();
    res.json(stats);
  } catch (err) {
    console.error("Analytics error:", err);
    res.status(500).json({ error: "Could not load analytics." });
  }
});

module.exports = router;
