import { useState, useCallback } from 'react';

/**
 * useSocket (Ported to Supabase Edge Function / SSE)
 * Replaces the original Socket.io hook with a streaming fetch implementation.
 * Maintains the same API to minimize changes to App.jsx.
 */
export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(true); // Always true for HTTP-based edge functions
  const [errorStatus, setErrorStatus] = useState(null);

  // Supabase Configuration
  const SUPABASE_FUNC_URL = "https://stskaknjtybtabmsfbtr.supabase.co/functions/v1/labx-query";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0c2tha25qdHlidGFibXNmYnRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2MjIzNjAsImV4cCI6MjA5MDE5ODM2MH0.jxV2fnF6eOtCSczCfq2TxRUsZF6OBO7_Oj2tMD45mx8";

  const sendQuery = useCallback(async (query, handlers) => {
    try {
      const response = await fetch(SUPABASE_FUNC_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
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
