// ============================================================
// utils/analytics.js
// Tracks usage metrics stored in memory + JSON file
// ============================================================

const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "../data/analytics.json");

// Default analytics structure
function defaultData() {
  return {
    totalSummaries: 0,
    apiCallCount: 0,
    cacheHits: 0,
    videoFrequency: {}, // videoId → count
    recentRequests: [],  // last 50 requests
  };
}

// Load from file or create fresh
function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    }
  } catch {}
  return defaultData();
}

// Persist to file
function saveData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Analytics save failed:", err.message);
  }
}

/**
 * Record a new summary event.
 * @param {string} videoId
 * @param {boolean} fromCache - true if served from cache
 */
function recordSummary(videoId, fromCache = false) {
  const data = loadData();

  data.totalSummaries++;
  if (!fromCache) data.apiCallCount++;
  else data.cacheHits++;

  // Track per-video frequency
  data.videoFrequency[videoId] = (data.videoFrequency[videoId] || 0) + 1;

  // Keep a rolling log of last 50 requests
  data.recentRequests.unshift({
    videoId,
    fromCache,
    timestamp: new Date().toISOString(),
  });
  if (data.recentRequests.length > 50) data.recentRequests.pop();

  saveData(data);
}

/**
 * Get analytics summary for the dashboard.
 */
function getAnalytics() {
  const data = loadData();

  // Find top 5 most summarized videos
  const topVideos = Object.entries(data.videoFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([videoId, count]) => ({ videoId, count }));

  return {
    totalSummaries: data.totalSummaries,
    apiCallCount: data.apiCallCount,
    cacheHits: data.cacheHits,
    cacheHitRate:
      data.totalSummaries > 0
        ? ((data.cacheHits / data.totalSummaries) * 100).toFixed(1) + "%"
        : "0%",
    topVideos,
    recentRequests: data.recentRequests.slice(0, 10),
  };
}

module.exports = { recordSummary, getAnalytics };
