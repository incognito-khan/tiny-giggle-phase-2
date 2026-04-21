import { TINY_AGENT_KNOWLEDGE, TINY_AGENT_ROUTES } from "@/lib/tiny-agent/knowledge";

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "how",
  "i",
  "in",
  "is",
  "it",
  "of",
  "on",
  "or",
  "that",
  "the",
  "to",
  "what",
  "where",
  "who",
  "why",
  "with",
  "you",
  "your",
]);

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s/]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text) {
  return normalize(text)
    .split(" ")
    .filter((token) => token && !STOP_WORDS.has(token));
}

function overlapScore(queryTokens, contentTokens) {
  if (!queryTokens.length || !contentTokens.length) {
    return 0;
  }

  const contentSet = new Set(contentTokens);
  let score = 0;

  for (const token of queryTokens) {
    if (contentSet.has(token)) {
      score += 1;
    }
  }

  return score / Math.sqrt(queryTokens.length * contentSet.size);
}

function rankKnowledge(query, knowledge, limit = 4) {
  const queryTokens = tokenize(query);

  return knowledge
    .map((doc) => {
      const contentTokens = tokenize(`${doc.title} ${doc.body} ${(doc.tags || []).join(" ")}`);
      const score = overlapScore(queryTokens, contentTokens);

      return {
        ...doc,
        score,
      };
    })
    .filter((doc) => doc.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function retrieveKnowledge(query, limit = 4) {
  return rankKnowledge(query, TINY_AGENT_KNOWLEDGE, limit);
}

export function retrieveKnowledgeFromDocs(query, docs, limit = 4) {
  if (!Array.isArray(docs) || docs.length === 0) {
    return [];
  }

  return rankKnowledge(query, docs, limit);
}

export function detectRouteIntent(query) {
  const normalizedQuery = normalize(query);
  const queryTokens = tokenize(normalizedQuery);

  const rankedRoutes = TINY_AGENT_ROUTES.map((route) => {
    const routeTokens = tokenize(`${route.title} ${route.description} ${route.keywords.join(" ")}`);
    const score = overlapScore(queryTokens, routeTokens);

    return {
      ...route,
      score,
    };
  })
    .filter((route) => route.score > 0)
    .sort((a, b) => b.score - a.score);

  if (!rankedRoutes.length) {
    return null;
  }

  const top = rankedRoutes[0];
  const minConfidence = 0.18;

  if (top.score < minConfidence) {
    return null;
  }

  return {
    path: top.path,
    title: top.title,
    reason: `Best match for \"${query}\" based on Tiny Giggle navigation intents.`,
    confidence: Number(top.score.toFixed(3)),
  };
}

export function buildContextBlock(retrievedDocs) {
  if (!retrievedDocs?.length) {
    return "No relevant Tiny Giggle documents were retrieved for this query.";
  }

  return retrievedDocs
    .map((doc) => `- ${doc.title}: ${doc.body}`)
    .join("\n");
}

export function getRouteCatalog() {
  return TINY_AGENT_ROUTES.map((route) => ({
    path: route.path,
    title: route.title,
    description: route.description,
  }));
}
