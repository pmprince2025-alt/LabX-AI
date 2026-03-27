import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { needsSearch } from "./modules/decisionEngine.ts";
import { searchWeb } from "./modules/searchModule.ts";
import { streamAnswer } from "./modules/llmModule.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // 1. Handle Preflight/CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();

    if (!query) {
      return new Response(JSON.stringify({ error: "Query is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Load API Keys from Environment
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY") || "";
    const LANGSEARCH_API_KEY = Deno.env.get("LANGSEARCH_API_KEY") || "";

    // 3. Setup ReadableStream for SSE response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          // Detect search need (Heuristic)
          const isSearchNeeded = needsSearch(query);

          // Emit initial status
          const statusEvent = "data: " + JSON.stringify({ type: 'status', data: { needsSearch: isSearchNeeded } }) + "\n\n";
          controller.enqueue(encoder.encode(statusEvent));

          let sources = [];
          if (isSearchNeeded) {
            // Wait for cosmetic searching state for better UX
            await new Promise(r => setTimeout(r, 1500));
            
            sources = await searchWeb(query, LANGSEARCH_API_KEY);
            
            if (sources && sources.length > 0) {
              const sourceEvent = "data: " + JSON.stringify({ type: 'sources', data: sources }) + "\n\n";
              controller.enqueue(encoder.encode(sourceEvent));
            }
          }

          // Trigger LLM component (it handles the stream closure)
          await streamAnswer(query, sources, controller, GROQ_API_KEY);

        } catch (error) {
          console.error("Internal Function Error:", error);
          const errorEvent = "data: " + JSON.stringify({ type: 'chunk', data: "⚠️ **Error:** An internal server error occurred." }) + "\n\n";
          controller.enqueue(encoder.encode(errorEvent));
          controller.close();
        }
      },
    });

    // 4. Return the stream response
    return new Response(stream, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (error) {
    console.error("Edge Function Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
