/**
 * Sentence Similarity Measurement Service
 * ----------------------------------------
 * TF-IDF + Cosine Similarity dengan lapisan fuzzy matching (typo-tolerant).
 *
 * Alur:
 *  1. Normalisasi teks, tokenisasi, buang stopword Bahasa Indonesia.
 *  2. Setiap token query dipetakan ke kosakata basis pengetahuan. Bila tidak persis
 *     sama, dicoba fuzzy match Levenshtein ternormalisasi sehingga typo yang masih
 *     terbaca ("syrat pndaftaran") tetap dihitung.
 *  3. Bila tidak ada satu pun token yang relevan dengan basis pengetahuan
 *     (mis. "tes", "apaya", "halo min") skor dipaksa 0.
 *  4. TF-IDF + cosine similarity antara query hasil pemetaan dan tiap varian.
 */

const STOPWORDS = new Set([
  'yang', 'dan', 'di', 'ke', 'dari', 'untuk', 'pada', 'dengan', 'ini', 'itu',
  'atau', 'juga', 'saya', 'kamu', 'anda', 'kami', 'mereka', 'apa', 'apakah',
  'bagaimana', 'gimana', 'berapa', 'kapan', 'dimana', 'siapa', 'adalah',
  'akan', 'sudah', 'belum', 'tidak', 'bisa', 'boleh', 'nya', 'nih', 'dong',
  'sih', 'ya', 'kalau', 'jika', 'kah', 'lah', 'pun', 'saja', 'aja', 'deh',
  'tolong', 'mohon', 'min', 'kak', 'pak', 'bu', 'ka', 'gak', 'ga', 'nggak',
  'mau', 'ingin', 'ada',
]);

/** Ambang kemiripan token untuk dianggap typo dari kata yang sama. */
const FUZZY_THRESHOLD = 0.78;
/** Panjang minimum token agar boleh di-fuzzy-match (hindari "tes" ~ "tas"). */
const FUZZY_MIN_LEN = 4;
/** Di bawah ini dianggap benar-benar tidak relevan (0%). */
const NOISE_FLOOR = 0.08;

function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(text) {
  return normalize(text)
    .split(' ')
    .filter((tok) => tok.length > 1 && !STOPWORDS.has(tok));
}

function levenshtein(a, b) {
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

function tokenSimilarity(a, b) {
  const max = Math.max(a.length, b.length);
  if (!max) return 0;
  return 1 - levenshtein(a, b) / max;
}

/** Cari padanan token di kosakata KB (persis, imbuhan, atau typo). */
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
      // kata dasar yang sama dengan imbuhan (mis. "daftar" vs "pendaftaran")
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

function buildIdf(tokenizedDocs) {
  const idf = {};
  const N = tokenizedDocs.length || 1;
  const vocab = new Set();
  tokenizedDocs.forEach((doc) => doc.forEach((tok) => vocab.add(tok)));
  vocab.forEach((term) => {
    const docCount = tokenizedDocs.filter((doc) => doc.includes(term)).length;
    idf[term] = Math.log((N + 1) / (docCount + 1)) + 1; // smoothed idf
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

function cosineSimilarity(vecA, vecB) {
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
 * Cari varian pertanyaan basis pengetahuan yang paling mirip.
 * @param {string} userQuestion
 * @param {Array<{variant_id:number, knowledge_id:number, teks_pertanyaan:string, jawaban:string, kategori:string}>} variants
 * @returns {{bestMatch:object|null, score:number, ranked:Array, matchedTerms:string[], unknownTerms:string[]}}
 */
function findBestMatch(userQuestion, variants) {
  const empty = { bestMatch: null, score: 0, ranked: [], matchedTerms: [], unknownTerms: [] };
  if (!Array.isArray(variants) || variants.length === 0) return empty;

  const corpusTokens = variants.map((v) => tokenize(`${v.teks_pertanyaan} ${v.kategori || ''}`));
  const vocab = Array.from(new Set(corpusTokens.flat()));

  const rawQuery = tokenize(userQuestion);
  const matchedTerms = [];
  const unknownTerms = [];
  rawQuery.forEach((token) => {
    const resolved = resolveToken(token, vocab);
    if (resolved) matchedTerms.push(resolved);
    else unknownTerms.push(token);
  });

  // Tidak ada kaitan sama sekali dengan basis pengetahuan → 0%.
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
  const bestMatch = score > 0 && top ? top.variant : null;

  return {
    bestMatch,
    score,
    ranked: ranked.slice(0, 5),
    matchedTerms,
    unknownTerms,
  };
}

module.exports = {
  findBestMatch,
  cosineSimilarity,
  tokenize,
  normalize,
  levenshtein,
  tokenSimilarity,
  STOPWORDS,
};
