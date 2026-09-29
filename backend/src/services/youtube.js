import { google } from 'googleapis';
import { getFixtureEvidence } from '../fixtures/mockData.js';

const DEFAULT_LIMIT = 10;

/**
 * Searches YouTube Data API v3 for video discussions related to a niche topic.
 * Returns normalized evidence array and status metadata.
 */
export async function fetchYouTubeVideos(niche, options = {}) {
  const { limit = DEFAULT_LIMIT, allowFallback = true } = options;

  const apiKey = process.env.YOUTUBE_API_KEY;

  // Check API key presence without leaking value
  if (!apiKey) {
    if (allowFallback) {
      const fixtureItems = getFixtureEvidence(niche)
        .filter(item => item.source === 'youtube')
        .slice(0, limit);
      return {
        success: true,
        source: 'youtube',
        status: 'fallback',
        message: 'YouTube API key not configured; using labeled demo fixtures',
        items: fixtureItems,
        count: fixtureItems.length
      };
    }
    return {
      success: false,
      source: 'youtube',
      status: 'missing_credentials',
      message: 'YOUTUBE_API_KEY is missing',
      items: [],
      count: 0
    };
  }

  try {
    const youtube = google.youtube({
      version: 'v3',
      auth: apiKey
    });

    const searchRes = await youtube.search.list({
      part: ['snippet'],
      q: niche,
      type: ['video'],
      maxResults: limit,
      relevanceLanguage: 'en'
    });

    const searchItems = searchRes.data.items || [];

    const items = searchItems.map(item => {
      const videoId = item.id?.videoId || `yt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const snippet = item.snippet || {};

      return {
        source: 'youtube',
        sourceType: 'live',
        id: videoId,
        title: snippet.title ? snippet.title.trim() : '',
        text: snippet.description ? snippet.description.trim() : '',
        url: `https://www.youtube.com/watch?v=${videoId}`,
        channel: snippet.channelTitle || 'unknown',
        publishedAt: snippet.publishedAt || new Date().toISOString()
      };
    });

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
        message: `YouTube live search error (${err.message || 'unknown'}); used demo fixtures`,
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
