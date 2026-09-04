// src/utils/similarity.js
// Cerminan sisi-klien dari backend/services/similarity.service.js
// TF-IDF + Cosine Similarity dengan fuzzy matching (typo-tolerant).
// Dipakai untuk pratinjau skor lokal (mis. penguji skor di panel panitia).

export const STOPWORDS = new Set([
  'yang', 'dan', 'di', 'ke', 'dari', 'untuk', 'pada', 'dengan', 'ini', 'itu',
  'atau', 'juga', 'saya', 'kamu', 'anda', 'kami', 'mereka', 'apa', 'apakah',
  'bagaimana', 'gimana', 'berapa', 'kapan', 'dimana', 'siapa', 'adalah',
  'akan', 'sudah', 'belum', 'tidak', 'bisa', 'boleh', 'nya', 'nih', 'dong',
  'sih', 'ya', 'kalau', 'jika', 'kah', 'lah', 'pun', 'saja', 'aja', 'deh',
  'tolong', 'mohon', 'min', 'kak', 'pak', 'bu', 'ka', 'gak', 'ga', 'nggak',
  'mau', 'ingin', 'ada',
]);

const FUZZY_THRESHOLD = 0.78;
const FUZZY_MIN_LEN = 4;
const NOISE_FLOOR = 0.08;

export function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function tokenize(text) {
  return normalize(text)
    .split(' ')
    .filter((tok) => tok.length > 1 && !STOPWORDS.has(tok));
}

export function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    const cur = [i];
    for (let j = 1; j <= b.length; j += 1) {
      cur[j] = Math.min(
        prev[j] + 1,
        cur[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
    prev = cur;
  }
  return prev[b.length];
}

export function tokenSimilarity(a, b) {
  const max = Math.max(a.length, b.length);
  if (!max) return 0;
  return 1 - levenshtein(a, b) / max;
}

function resolveToken(token, vocab) {
  if (vocab.includes(token)) return token;
  let best = null;
  let bestScore = 0;
  vocab.forEach((term) => {
    let score = 0;
    if (
      token.length >= FUZZY_MIN_LEN &&
      term.length >= FUZZY_MIN_LEN &&
      Math.abs(term.length - token.length) <= 3
    ) {
      score = tokenSimilarity(token, term);
      if (score < FUZZY_THRESHOLD && (term.includes(token) || token.includes(term))) {
        score = Math.max(score, 0.85);
      }
    }
    if (score > bestScore) {
      bestScore = score;
      best = term;
    }
  });
  return bestScore >= FUZZY_THRESHOLD ? best : null;
}

function termFrequency(tokens) {
  const tf = {};
  tokens.forEach((tok) => {
    tf[tok] = (tf[tok] || 0) + 1;
  });
  const total = tokens.length || 1;
  Object.keys(tf).forEach((k) => {
    tf[k] /= total;
  });
  return tf;
}

function buildIdf(docs) {
  const idf = {};
  const N = docs.length || 1;
  const vocab = new Set();
  docs.forEach((doc) => doc.forEach((tok) => vocab.add(tok)));
  vocab.forEach((term) => {
    const docCount = docs.filter((doc) => doc.includes(term)).length;
    idf[term] = Math.log((N + 1) / (docCount + 1)) + 1;
  });
  return idf;
}

function tfidfVector(tf, idf) {
  const vec = {};
  Object.keys(tf).forEach((term) => {
    vec[term] = tf[term] * (idf[term] || 0);
  });
  return vec;
}

export function cosineSimilarity(vecA, vecB) {
  const keys = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);
  let dot = 0;
  let normA = 0;
  let normB = 0;
  keys.forEach((k) => {
    const a = vecA[k] || 0;
    const b = vecB[k] || 0;
    dot += a * b;
    normA += a * a;
    normB += b * b;
  });
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * @param {string} userQuestion
 * @param {Array<{teks_pertanyaan:string, kategori?:string}>} variants
 */
export function findBestMatch(userQuestion, variants) {
  const empty = { bestMatch: null, score: 0, ranked: [], matchedTerms: [], unknownTerms: [] };
  if (!Array.isArray(variants) || variants.length === 0) return empty;

  const corpusTokens = variants.map((v) => tokenize(`${v.teks_pertanyaan} ${v.kategori || ''}`));
  const vocab = Array.from(new Set(corpusTokens.flat()));

  const matchedTerms = [];
  const unknownTerms = [];
  tokenize(userQuestion).forEach((token) => {
    const resolved = resolveToken(token, vocab);
    if (resolved) matchedTerms.push(resolved);
    else unknownTerms.push(token);
  });

  if (matchedTerms.length === 0) return { ...empty, unknownTerms };

  const queryTokens = [...matchedTerms, ...unknownTerms];
  const idf = buildIdf([...corpusTokens, queryTokens]);
  const queryVec = tfidfVector(termFrequency(queryTokens), idf);

  const ranked = variants
    .map((variant, i) => ({
      variant,
      score: cosineSimilarity(queryVec, tfidfVector(termFrequency(corpusTokens[i]), idf)),
    }))
    .sort((a, b) => b.score - a.score);

  const top = ranked[0];
  const score = top && top.score >= NOISE_FLOOR ? top.score : 0;

  return {
    bestMatch: score > 0 && top ? top.variant : null,
    score,
    ranked: ranked.slice(0, 5),
    matchedTerms,
    unknownTerms,
  };
}

/** Skor kemiripan (0..1) satu kalimat terhadap satu pertanyaan target. */
export function calculateSimilarity(userInput, targetQuestion) {
  if (!userInput || !targetQuestion) return 0;
  return findBestMatch(userInput, [{ teks_pertanyaan: targetQuestion }]).score;
}
