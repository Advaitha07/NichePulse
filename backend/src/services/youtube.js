import yts from 'yt-search';
import { getFixtureEvidence } from '../fixtures/mockData.js';

const DEFAULT_LIMIT = 10;

/**
 * Searches public YouTube results using yt-search.
 * No YouTube API key is required.
 * Falls back to labeled demo fixtures if the search fails.
 */
export async function fetchYouTubeVideos(niche, options = {}) {
  const { limit = DEFAULT_LIMIT, allowFallback = true } = options;

  try {
    const results = await yts(niche);

    const videos = (results.videos || []).slice(0, limit);

    const items = videos.map(video => ({
      source: 'youtube',
      sourceType: 'live',
      id: video.videoId,
      title: video.title?.trim() || '',
      text: video.description?.trim() || '',
      url: video.url,
      channel: video.author?.name || 'unknown',
      publishedAt: video.uploadDate || video.ago || ''
    }));

    return {
      success: true,
      source: 'youtube',
      status: 'live',
      items,
      count: items.length
    };
  } catch (err) {
    if (allowFallback) {
      const fixtureItems = getFixtureEvidence(niche)
        .filter(item => item.source === 'youtube')
        .slice(0, limit);

      return {
        success: true,
        source: 'youtube',
        status: 'fallback',
        message: `YouTube public search error (${err.message || 'unknown'}); used demo fixtures`,
        items: fixtureItems,
        count: fixtureItems.length
      };
    }

    return {
      success: false,
      source: 'youtube',
      status: 'error',
      message: err.message || 'Error executing YouTube search',
      items: [],
      count: 0
    };
  }
}