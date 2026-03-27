/**
 * Decision Engine
 * Determines if a query requires a web search or can be answered directly.
 * For MVP, we use a heuristic keyword-based approach to save an LLM call.
 */
const searchKeywords = [
  'latest', 'news', 'today', 'current', 'weather', 'price of', 
  'stock', 'recent', 'who won', 'update', 'how much is', '2026', 'now'
];

function needsSearch(query) {
  const lowerQuery = query.toLowerCase();
  
  // Rule 1: contains time-sensitive or real-time keywords
  if (searchKeywords.some(kw => lowerQuery.includes(kw))) {
    return true;
  }
  
  // Default to direct LLM to save search credits and time
  return false;
}

module.exports = { needsSearch };
