/**
 * Normalizes a URL for comparison by stripping tracking params, trailing slashes,
 * protocols, and www prefixes.
 */
function normalizeUrl(url) {
  if (!url || typeof url !== 'string') return '';
  try {
    const parsed = new URL(url.trim());
    let pathname = parsed.pathname.replace(/\/+$/, '');
    let search = '';
    // Preserve YouTube video 'v' param if present
    if (parsed.searchParams.has('v')) {
      search = `?v=${parsed.searchParams.get('v')}`;
    }
    return `${parsed.hostname.replace(/^www\./, '')}${pathname}${search}`.toLowerCase();
  } catch {
    return url.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/+$/, '');
  }
}

/**
 * Normalizes title text by lowercasing and stripping punctuation/whitespace.
 */
function normalizeTitle(title) {
  if (!title || typeof title !== 'string') return '';
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const STOP_WORDS = new Set(['the', 'a', 'an', 'in', 'on', 'at', 'for', 'to', 'of', 'and', 'is', 'are']);

/**
 * Computes deterministic word-level Jaccard similarity between two strings.
 */
function titleSimilarity(titleA, titleB) {
  const normA = normalizeTitle(titleA);
  const normB = normalizeTitle(titleB);

  if (!normA || !normB) return 0;
  if (normA === normB) return 1;

  const wordsA = new Set(normA.split(' ').filter(w => w && !STOP_WORDS.has(w)));
  const wordsB = new Set(normB.split(' ').filter(w => w && !STOP_WORDS.has(w)));

  if (wordsA.size === 0 || wordsB.size === 0) return 0;

  let intersection = 0;
  for (const w of wordsA) {
    if (wordsB.has(w)) {
      intersection++;
    }
  }

  const union = wordsA.size + wordsB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Deduplicates evidence items in the following order:
 * 1. Exact stable ID match when source + id identify the same item.
 * 2. Normalized URL match.
 * 3. Normalized title similarity (default threshold: 0.75).
 *
 * Returns object: { items, inputCount, outputCount, duplicatesRemoved }
 */
export function deduplicateItems(rawItems = [], options = {}) {
  const items = Array.isArray(rawItems) ? rawItems : [];
  const similarityThreshold = options.threshold ?? 0.75;

  const seenIds = new Set();
  const seenUrls = new Set();
  const acceptedItems = [];

  for (const item of items) {
    if (!item) continue;

    // 1. Source + ID check
    const source = item.source || 'unknown';
    const id = item.id ? String(item.id).trim() : '';
    const compoundId = `${source}:${id}`;

    if (id && seenIds.has(compoundId)) {
      continue;
    }

    // 2. Normalized URL check
    const normUrl = normalizeUrl(item.url);
    if (normUrl && seenUrls.has(normUrl)) {
      continue;
    }

    // 3. Title similarity check against accepted items within the SAME source
    const title = item.title || '';
    let isDuplicateTitle = false;
    for (const existing of acceptedItems) {
      if (existing.source === source && titleSimilarity(title, existing.title) >= similarityThreshold) {
        isDuplicateTitle = true;
        break;
      }
    }

    if (isDuplicateTitle) {
      continue;
    }

    // Accept item and record identifiers
    if (id) seenIds.add(compoundId);
    if (normUrl) seenUrls.add(normUrl);
    acceptedItems.push(item);
  }

  const result = {
    items: acceptedItems,
    inputCount: items.length,
    outputCount: acceptedItems.length,
    duplicatesRemoved: items.length - acceptedItems.length
  };

  return result;
}
