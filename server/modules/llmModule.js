const Groq = require('groq-sdk');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

let groq = null;
try {
  groq = new Groq({
    apiKey: process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your_groq_api_key_here' 
      ? process.env.GROQ_API_KEY 
      : 'dummy',
  });
} catch (e) {
  console.warn("Groq API key missing or invalid format. LLM will not work.");
}

/**
 * LLM Module
 * Streams the response from Groq using llama-3.3-70b-versatile or similar model.
 * 
 * @param {string} query The user's query
 * @param {Array} sources Scraped content/snippets from web search (if any)
 * @param {object} socket Socket.io instance for streaming
 */
async function streamAnswer(query, sources, socket) {
  try {
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
      socket.emit('answer_chunk', "⚠️ **Error:** Groq API Key is missing. Please configure your `.env` file.");
      socket.emit('answer_done');
      return;
    }

    if (!groq) {
      groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    }

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
        socket.emit('answer_chunk', content);
      }
    }
    
    socket.emit('answer_done');

  } catch (error) {
    console.error("LLM Stream Error:", error);
    socket.emit('answer_chunk', "\n\n⚠️ **Error:** Failed to generate response from the LLM.");
    socket.emit('answer_done');
  }
}

module.exports = { streamAnswer };
