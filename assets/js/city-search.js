// city-search.js — 市政府公开站关键词检索
import { ARTICLES } from './city-data.js';

/**
 * Normalize query for loose Chinese/English matching.
 */
export function normalizeQuery(q) {
  return String(q || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '');
}

/**
 * Score one article against a normalized query. Higher = better.
 * Returns 0 if no match.
 */
export function scoreArticle(article, nq) {
  if (!nq) return 0;
  const title = String(article.title || '').toLowerCase();
  const summary = String(article.summary || '').toLowerCase();
  const tags = (article.tags || []).map((t) => String(t).toLowerCase());
  const source = String(article.source || '').toLowerCase();
  const hay = `${title} ${summary} ${tags.join(' ')} ${source}`;

  // full query as substring
  if (hay.includes(nq)) {
    let s = 10;
    if (title.includes(nq)) s += 20;
    if (tags.some((t) => t.includes(nq) || nq.includes(t))) s += 12;
    return s;
  }

  // token-ish: split short CJK bigrams + latin words from original
  // For CJK without spaces, also try each tag / keyword hit
  let score = 0;
  for (const t of tags) {
    if (!t) continue;
    if (nq.includes(t) || t.includes(nq)) score += 8;
  }
  // character window for 2+ length queries (e.g. 弘科, 寻人, 周启)
  if (nq.length >= 2) {
    for (let i = 0; i < nq.length - 1; i++) {
      const bi = nq.slice(i, i + 2);
      if (title.includes(bi)) score += 3;
      else if (summary.includes(bi)) score += 1;
    }
  }
  return score;
}

/**
 * Filter and rank ARTICLES by free-text query.
 * @param {string} q
 * @param {{ articles?: typeof ARTICLES }} [opts]
 * @returns {typeof ARTICLES}
 */
export function searchArticles(q, opts = {}) {
  const articles = opts.articles || ARTICLES;
  const nq = normalizeQuery(q);
  if (!nq) return [...articles].sort((a, b) => (a.date < b.date ? 1 : -1));

  return articles
    .map((a) => ({ a, s: scoreArticle(a, nq) }))
    .filter((x) => x.s > 0)
    .sort((x, y) => y.s - x.s || (x.a.date < y.a.date ? 1 : -1))
    .map((x) => x.a);
}

/**
 * Read ?q= from location (browser).
 */
export function queryFromLocation(loc = typeof location !== 'undefined' ? location : null) {
  if (!loc) return '';
  try {
    return new URL(loc.href).searchParams.get('q') || '';
  } catch {
    return '';
  }
}
