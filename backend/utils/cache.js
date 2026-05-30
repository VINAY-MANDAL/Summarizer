// ============================================================
// utils/cache.js
// Simple in-memory cache to avoid re-summarizing same videos
// ============================================================
// In production, consider replacing with Redis for persistence.
// This cache resets when the server restarts.

const cache = new Map(); // videoId → { summary, timestamp, videoId }

// Cache entries expire after 24 hours (in milliseconds)
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Retrieve a cached summary by video ID.
 * Returns null if not found or expired.
 */
function getCached(videoId) {
  const entry = cache.get(videoId);
  if (!entry) return null;

  const isExpired = Date.now() - entry.timestamp > CACHE_TTL_MS;
  if (isExpired) {
    cache.delete(videoId); // Clean up expired entry
    return null;
  }

  return entry;
}

/**
 * Store a summary in cache.
 */
function setCached(videoId, summary) {
  cache.set(videoId, {
    summary,
    videoId,
    timestamp: Date.now(),
    cached: true,
  });
}

/**
 * Return stats about the cache (used in analytics).
 */
function getCacheStats() {
  return {
    size: cache.size,
    entries: Array.from(cache.entries()).map(([id, val]) => ({
      videoId: id,
      cachedAt: new Date(val.timestamp).toISOString(),
    })),
  };
}

module.exports = { getCached, setCached, getCacheStats };
