import express from 'express';
import { fetchRedditPosts } from '../services/reddit.js';
import { fetchYouTubeVideos } from '../services/youtube.js';
import { deduplicateItems } from '../services/dedupe.js';

const router = express.Router();

/**
 * POST /api/analyze
 * Minimal Phase 2 integration:
 * - Validates input niche
 * - Harvests data from Reddit & YouTube concurrently
 * - Normalizes and combines evidence
 * - Deduplicates evidence (ID, URL, Title similarity)
 * - Returns structured response with source health metadata
 */
router.post('/', async (req, res) => {
  const { niche, allowFallback = true, limit = 10 } = req.body || {};

  if (!niche || typeof niche !== 'string' || !niche.trim()) {
    return res.status(400).json({ error: 'Niche query is required' });
  }

  const cleanNiche = niche.trim();

  try {
    // Execute data harvesting in parallel with error isolation
    const [redditRes, youtubeRes] = await Promise.allSettled([
      fetchRedditPosts(cleanNiche, { limit, allowFallback }),
      fetchYouTubeVideos(cleanNiche, { limit, allowFallback })
    ]);

    const redditData = redditRes.status === 'fulfilled'
      ? redditRes.value
      : { success: false, source: 'reddit', status: 'error', message: redditRes.reason?.message || 'Execution error', items: [], count: 0 };

    const youtubeData = youtubeRes.status === 'fulfilled'
      ? youtubeRes.value
      : { success: false, source: 'youtube', status: 'error', message: youtubeRes.reason?.message || 'Execution error', items: [], count: 0 };

    // Aggregate evidence items
    const rawEvidence = [
      ...(Array.isArray(redditData.items) ? redditData.items : []),
      ...(Array.isArray(youtubeData.items) ? youtubeData.items : [])
    ];

    // Deduplicate
    const dedupeResult = deduplicateItems(rawEvidence);

    // If both sources failed completely and have no items, return structured error
    if (!redditData.success && !youtubeData.success && dedupeResult.items.length === 0) {
      return res.status(502).json({
        error: 'Both Reddit and YouTube evidence collection failed',
        niche: cleanNiche,
        sources: {
          reddit: {
            success: false,
            status: redditData.status,
            message: redditData.message,
            count: 0
          },
          youtube: {
            success: false,
            status: youtubeData.status,
            message: youtubeData.message,
            count: 0
          }
        },
        evidence: [],
        metrics: {
          rawCount: 0,
          deduplicatedCount: 0,
          duplicatesRemoved: 0
        }
      });
    }

    return res.json({
      niche: cleanNiche,
      sources: {
        reddit: {
          success: redditData.success,
          status: redditData.status,
          message: redditData.message || null,
          count: redditData.count || 0
        },
        youtube: {
          success: youtubeData.success,
          status: youtubeData.status,
          message: youtubeData.message || null,
          count: youtubeData.count || 0
        }
      },
      evidence: dedupeResult.items,
      metrics: {
        rawCount: dedupeResult.inputCount,
        deduplicatedCount: dedupeResult.outputCount,
        duplicatesRemoved: dedupeResult.duplicatesRemoved
      }
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Unexpected server error in analysis route',
      message: err.message
    });
  }
});

export default router;
