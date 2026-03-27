import { useState, useCallback } from 'react';

/**
 * useSocket (Ported to Supabase Edge Function / SSE)
 * Replaces the original Socket.io hook with a streaming fetch implementation.
 * Maintains the same API to minimize changes to App.jsx.
 */
export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(true); // Always true for HTTP-based edge functions
  const [errorStatus, setErrorStatus] = useState(null);

  // Supabase Project Specific URL
  const SUPABASE_FUNC_URL = "https://stskaknjtybtabmsfbtr.supabase.co/functions/v1/labx-query";

  const sendQuery = useCallback(async (query, handlers) => {
    try {
      const response = await fetch(SUPABASE_FUNC_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Note: Standard Supabase functions don't strictly require an anon key if not using RLS, 
          // but if enabled, you would add 'apikey': '...' here.
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error(`Server Error: ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // Keep the last incomplete line

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const event = JSON.parse(line.slice(6));
              
              switch (event.type) {
                case 'status':
                  handlers.onQueryAcknowledged(event.data);
                  break;
                case 'sources':
                  handlers.onSources(event.data);
                  break;
                case 'chunk':
                  handlers.onAnswerChunk(event.data);
                  break;
                case 'done':
                  handlers.onAnswerDone();
                  break;
                default:
                  break;
              }
            } catch (e) {
              console.error("Failed to parse SSE line:", line, e);
            }
          }
        }
      }

    } catch (err) {
      console.error("Edge Function Fetch Error:", err);
      setErrorStatus("Failed to reach AI service.");
      handlers.onError("Communication error with LabX service.");
      handlers.onAnswerDone();
    }
  }, []);

  // bindEvents is no longer needed for Socket.io listeners, 
  // so we keep it as a no-op to avoid breaking App.jsx.
  const bindEvents = useCallback(() => {}, []);

  return { isConnected, errorStatus, sendQuery, bindEvents };
};
