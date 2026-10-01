import express from 'express';
import { fetchRedditPosts } from '../services/reddit.js';
import { fetchYouTubeVideos } from '../services/youtube.js';
import { deduplicateItems } from '../services/dedupe.js';
import { analyzeNicheData } from '../services/claude.js';

const router = express.Router();

/**
 * POST /api/analyze
 * Phase 3 full intelligence pipeline:
 * 1. Validates input niche
 * 2. Harvests data from Reddit & YouTube concurrently (Phase 2)
 * 3. Normalizes and deduplicates evidence (Phase 2)
 * 4. Passes evidence to Claude intelligence synthesis layer (Phase 3)
 * 5. Returns structured report with live vs fixture source health metadata
 */
router.post('/', async (req, res) => {
  const { niche, allowFallback = true, limit = 10, skipClaude = false } = req.body || {};

  if (!niche || typeof niche !== 'string' || !niche.trim()) {
    return res.status(400).json({ error: 'Niche query is required' });
  }

  const cleanNiche = niche.trim();

  try {
    // Execute data harvesting in parallel with error isolation (Phase 2)
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

    // Deduplicate (Phase 2)
    const dedupeResult = deduplicateItems(rawEvidence);
    const evidence = dedupeResult.items;

    // Determine if fixture evidence was used
    const isFixtureEvidence = redditData.status === 'fallback' || youtubeData.status === 'fallback' ||
      evidence.some(item => item.sourceType === 'fixture');

    // If both sources failed completely and have no items, return structured error
    if (!redditData.success && !youtubeData.success && evidence.length === 0) {
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
        },
        report: null
      });
    }

    // Execute Claude intelligence synthesis if requested / key available (Phase 3)
    let claudeAnalysis = null;
    if (!skipClaude) {
      claudeAnalysis = await analyzeNicheData(cleanNiche, evidence, {
        isFixtureEvidence,
        allowFallback
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
      evidence,
      metrics: {
        rawCount: dedupeResult.inputCount,
        deduplicatedCount: dedupeResult.outputCount,
        duplicatesRemoved: dedupeResult.duplicatesRemoved
      },
      analysis: claudeAnalysis ? {
        success: claudeAnalysis.success,
        status: claudeAnalysis.status,
        message: claudeAnalysis.message || null,
        isFixtureEvidence
      } : null,
      report: claudeAnalysis?.report || null
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Unexpected server error in analysis route',
      message: err.message
    });
  }
});

export default router;
