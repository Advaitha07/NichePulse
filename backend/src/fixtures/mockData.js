/**
 * Mock fixture dataset for reliable hackathon demo behavior
 * when external platform credentials are absent or rate-limited.
 *
 * All items are explicitly marked with sourceType: 'fixture'.
 */

export const FIXTURE_EVIDENCE = [
  {
    source: 'reddit',
    sourceType: 'fixture',
    id: 'reddit_fix_001',
    title: 'The real problem with sustainable fashion brands in 2026',
    text: 'Most small sustainable fashion startups struggle with fabric certifications and deadstock consistency. Customers say they want sustainable clothes but return rates are high due to sizing inconsistency.',
    url: 'https://reddit.com/r/sustainability/comments/mock001',
    author: 'eco_founder_99',
    score: 142,
    comments: 38,
    createdAt: '2026-02-15T10:30:00.000Z'
  },
  {
    source: 'reddit',
    sourceType: 'fixture',
    id: 'reddit_fix_002',
    title: 'Are consumers actually paying more for recycled textiles?',
    text: 'Did a survey of 300 active shoppers. Price sensitivity is dominating right now. If a sustainable jacket is more than 15% higher than fast-fashion equivalent, conversion drops off a cliff.',
    url: 'https://reddit.com/r/entrepreneur/comments/mock002',
    author: 'market_scout',
    score: 89,
    comments: 54,
    createdAt: '2026-03-01T14:15:00.000Z'
  },
  {
    source: 'youtube',
    sourceType: 'fixture',
    id: 'youtube_fix_001',
    title: 'How Sustainable Clothing Startups Scale in 2026: Supply Chain Truths',
    text: 'Deep dive into eco-manufacturing, circular fashion resale models, and why localized micro-factories are beating global mass production.',
    url: 'https://www.youtube.com/watch?v=mockyt001',
    channel: 'Apparel Insights',
    publishedAt: '2026-01-20T18:00:00.000Z',
    viewCount: '24500'
  },
  {
    source: 'youtube',
    sourceType: 'fixture',
    id: 'youtube_fix_002',
    title: 'Why 90% of Eco-Friendly Fashion Brands Fail (And What Works)',
    text: 'Case study analysis examining consumer trust, greenwashing fatigue, and verified transparent supply chains.',
    url: 'https://www.youtube.com/watch?v=mockyt002',
    channel: 'Modern Retailer Lab',
    publishedAt: '2026-02-10T12:00:00.000Z',
    viewCount: '58100'
  }
];

export function getFixtureEvidence(niche) {
  const query = (niche || '').toLowerCase().trim();
  const keywords = query.split(/\s+/).filter(Boolean);

  const matched = FIXTURE_EVIDENCE.filter(item => {
    const textTarget = `${item.title} ${item.text}`.toLowerCase();
    if (query && textTarget.includes(query)) return true;
    return keywords.some(k => k.length > 2 && textTarget.includes(k));
  });

  return (matched.length > 0 ? matched : FIXTURE_EVIDENCE).map(item => ({ ...item }));
}
