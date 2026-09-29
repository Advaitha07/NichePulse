import snoowrap from 'snoowrap';
import { getFixtureEvidence } from '../fixtures/mockData.js';

const DEFAULT_LIMIT = 10;

/**
 * Searches Reddit for public discussions related to a niche topic.
 * Returns normalized evidence array and status metadata.
 */
export async function fetchRedditPosts(niche, options = {}) {
  const { limit = DEFAULT_LIMIT, allowFallback = true } = options;

  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  const userAgent = process.env.REDDIT_USER_AGENT || 'niche-intel-agent/1.0';

  // Check credentials presence without leaking values
  if (!clientId || !clientSecret) {
    if (allowFallback) {
      const fixtureItems = getFixtureEvidence(niche)
        .filter(item => item.source === 'reddit')
        .slice(0, limit);
      return {
        success: true,
        source: 'reddit',
        status: 'fallback',
        message: 'Reddit credentials not configured; using labeled demo fixtures',
        items: fixtureItems,
        count: fixtureItems.length
      };
    }
    return {
      success: false,
      source: 'reddit',
      status: 'missing_credentials',
      message: 'REDDIT_CLIENT_ID or REDDIT_CLIENT_SECRET is missing',
      items: [],
      count: 0
    };
  }

  try {
    const r = new snoowrap({
      userAgent,
      clientId,
      clientSecret,
      refreshToken: process.env.REDDIT_REFRESH_TOKEN || undefined,
      username: process.env.REDDIT_USERNAME || undefined,
      password: process.env.REDDIT_PASSWORD || undefined
    });

    const searchResults = await r.search({
      query: niche,
      sort: 'relevance',
      time: 'year',
      limit
    });

    const items = searchResults.map(post => ({
      source: 'reddit',
      sourceType: 'live',
      id: post.id || `reddit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: post.title ? post.title.trim() : '',
      text: post.selftext ? post.selftext.trim() : '',
      url: post.permalink ? `https://reddit.com${post.permalink}` : (post.url || ''),
      author: post.author?.name || post.author || 'unknown',
      score: typeof post.score === 'number' ? post.score : 0,
      comments: typeof post.num_comments === 'number' ? post.num_comments : 0,
      createdAt: post.created_utc ? new Date(post.created_utc * 1000).toISOString() : new Date().toISOString()
    }));

    return {
      success: true,
      source: 'reddit',
      status: 'live',
      items,
      count: items.length
    };
  } catch (err) {
    // If live call fails, gracefully degrade or return structured error
    if (allowFallback) {
      const fixtureItems = getFixtureEvidence(niche)
        .filter(item => item.source === 'reddit')
        .slice(0, limit);
      return {
        success: true,
        source: 'reddit',
        status: 'fallback',
        message: `Reddit live search error (${err.message || 'unknown'}); used demo fixtures`,
        items: fixtureItems,
        count: fixtureItems.length
      };
    }
    return {
      success: false,
      source: 'reddit',
      status: 'error',
      message: err.message || 'Error executing Reddit search',
      items: [],
      count: 0
    };
  }
}
