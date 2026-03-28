/**
 * Decision Engine
 * Determines if a query requires a web search or can be answered directly.
 * Uses a broad ruleset to capture real-time, factual, and world-knowledge queries.
 */

// Time-sensitive signals — always search
const realtimeKeywords = [
  'latest', 'news', 'today', 'current', 'currently', 'weather', 'price of',
  'stock', 'recent', 'recently', 'who won', 'update', 'how much is', 'now',
  'live', 'score', 'trending', 'breaking', 'just happened', 'this week',
  'this month', 'this year', '2025', '2026', 'right now', 'at the moment',
];

// Factual/world-knowledge signals — search to give accurate, grounded answers
const factualKeywords = [
  'who is', 'who are', 'who was', 'who were',
  'what is', 'what are', 'what was', 'what were',
  'where is', 'where are', 'where was',
  'when is', 'when was', 'when did',
  'how does', 'how do', 'how did', 'how many', 'how much',
  'why is', 'why are', 'why did', 'why does',
  'tell me about', 'explain', 'describe',
  'history of', 'biography', 'founder', 'ceo', 'president',
  'capital of', 'population of', 'currency of',
  'definition of', 'meaning of', 'difference between',
  'versus', ' vs ', 'compare',
  'recipe', 'how to make', 'how to cook', 'tutorial',
  'best way to', 'steps to', 'guide to',
];

// Pure-reasoning / code queries that don't need web search
const noSearchKeywords = [
  'write a code', 'generate code', 'write code', 'debug this', 'fix this code',
  'refactor', 'write a function', 'write a program', 'write a script',
  'calculate', 'solve', 'what is 2+2', 'math problem',
  'translate', 'summarize this:', // followed by pasted content
];

function needsSearch(query) {
  const lowerQuery = query.toLowerCase();

  // Short-circuit: never search for pure code/math tasks
  if (noSearchKeywords.some(kw => lowerQuery.includes(kw))) {
    return false;
  }

  // Always search for real-time/time-sensitive queries
  if (realtimeKeywords.some(kw => lowerQuery.includes(kw))) {
    return true;
  }

  // Search for factual/world-knowledge queries
  if (factualKeywords.some(kw => lowerQuery.includes(kw))) {
    return true;
  }

  // If the query ends with a '?' it is likely a factual question
  if (lowerQuery.trim().endsWith('?')) {
    return true;
  }

  // Default: skip search for very short or conversational queries
  return false;
}

module.exports = { needsSearch };
