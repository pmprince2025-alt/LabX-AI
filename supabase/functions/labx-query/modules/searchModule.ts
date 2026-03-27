/**
 * Search Module (Deno)
 * Uses LangSearch API to fetch recent web results.
 */
export async function searchWeb(query: string, apiKey: string) {
  try {
    if (!apiKey) {
      console.warn("LangSearch API key missing. Returning empty sources.");
      return [];
    }

    const response = await fetch('https://api.langsearch.com/v1/web-search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: query,
        freshness: 'noLimit',
        summary: true,
        count: 5
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("LangSearch API error response:", errorText);
      return [];
    }
    
    const result = await response.json();
    
    // Process results to a standard format needed by UI and LLM
    const results = result?.data?.webPages?.value || [];
    
    return results.map((item: any) => ({
      title: item.name || item.title,
      url: item.url,
      snippet: item.snippet || item.summary || ""
    })).slice(0, 3); // Return top 3 elements

  } catch (error) {
    console.error("LangSearch API Error:", error.message);
    return []; // Return empty on error so the flow can continue
  }
}
