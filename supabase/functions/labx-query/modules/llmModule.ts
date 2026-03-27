import Groq from "npm:groq-sdk";

/**
 * LLM Module (Deno)
 * Streams the response from Groq using llama-3.3-70b-versatile.
 * 
 * @param {string} query The user's query
 * @param {Array} sources Scraped content/snippets
 * @param {ReadableStreamDefaultController} controller ReadableStream controller
 */
export async function streamAnswer(query: string, sources: any[], controller: ReadableStreamDefaultController, apiKey: string) {
  try {
    if (!apiKey) {
      const errorMsg = "data: " + JSON.stringify({ type: 'chunk', data: "⚠️ **Error:** Groq API Key is missing. Please configure your secrets." }) + "\n\n";
      controller.enqueue(new TextEncoder().encode(errorMsg));
      controller.close();
      return;
    }

    const groq = new Groq({ apiKey });

    const messages = [];
    
    // System Prompt
    let systemPrompt = `You are LabX, an advanced explainable AI assistant. You answer queries clearly, concisely, and with a slightly technical, highly capable tone. Use Markdown for formatting.`;
    
    if (sources && sources.length > 0) {
      systemPrompt += `\n\nYou MUST base your answer on the provided search results if they are relevant.\n\n### Search Results Context:\n`;
      sources.forEach((s, idx) => {
        systemPrompt += `[Source ${idx+1}] Title: ${s.title}\nURL: ${s.url}\nSnippet: ${s.snippet}\n\n`;
      });
      systemPrompt += `Always accurately cite information using the source number like [1] or simply mention the source.`;
    }

    messages.push({ role: 'system', content: systemPrompt });
    messages.push({ role: 'user', content: query });

    const stream = await groq.chat.completions.create({
      messages: messages,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.5,
      max_tokens: 1024,
      top_p: 1,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        // Correctly encode as an SSE event for easy client-side parsing
        const msg = "data: " + JSON.stringify({ type: 'chunk', data: content }) + "\n\n";
        controller.enqueue(new TextEncoder().encode(msg));
      }
    }
    
    const doneMsg = "data: " + JSON.stringify({ type: 'done' }) + "\n\n";
    controller.enqueue(new TextEncoder().encode(doneMsg));
    controller.close();

  } catch (error) {
    console.error("LLM Stream Error:", error);
    const errorMsg = "data: " + JSON.stringify({ type: 'chunk', data: "\n\n⚠️ **Error:** Failed to generate response from the LLM." }) + "\n\n";
    controller.enqueue(new TextEncoder().encode(errorMsg));
    controller.close();
  }
}
