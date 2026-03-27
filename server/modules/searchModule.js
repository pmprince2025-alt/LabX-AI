const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Search Module
 * Uses LangSearch API to fetch recent web results.
 */
async function searchWeb(query) {
  try {
    const apiKey = process.env.LANGSEARCH_API_KEY;
    
    if (!apiKey || apiKey === 'your_langsearch_api_key_here') {
      console.warn("LangSearch API key missing. Returning empty sources.");
      return [];
    }

    const response = await axios.post(
      'https://api.langsearch.com/v1/web-search',
      {
        query: query,
        freshness: 'noLimit',
        summary: true,
        count: 5
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Process results to a standard format needed by UI and LLM
    // Example LangSearch response: data.data.webPages.value array
    const results = response.data?.data?.webPages?.value || [];
    
    return results.map(item => ({
      title: item.name || item.title,
      url: item.url,
      snippet: item.snippet || item.summary || ""
    })).slice(0, 3); // Return top 3 elements

  } catch (error) {
    console.error("LangSearch API Error:", error.message);
    return []; // Return empty on error so the flow can continue
  }
}

module.exports = { searchWeb };
