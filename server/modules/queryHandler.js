const { needsSearch } = require('./decisionEngine');
const { searchWeb } = require('./searchModule');
const { streamAnswer } = require('./llmModule');

/**
 * Query Handler
 * Coordinates the flow of a single user query.
 */
async function handleQuery(socket, query) {
  try {
    const isSearchNeeded = needsSearch(query);

    // Let UI know if search is needed so it can trigger the cosmetic timeline correctly
    socket.emit('query_acknowledged', { needsSearch: isSearchNeeded });

    let sources = [];
    if (isSearchNeeded) {
      // Small artificial delay to allow the "Searching" UI animation to run
      await new Promise(r => setTimeout(r, 2000));
      
      sources = await searchWeb(query);
      
      if (sources && sources.length > 0) {
        socket.emit('sources', sources);
      }
    } else {
      // Artificial delay for "Thinking" UI
      await new Promise(r => setTimeout(r, 800));
    }

    // Pass everything to the LLM to stream the response
    await streamAnswer(query, sources, socket);

  } catch (error) {
    console.error("Query Handler Error:", error);
    socket.emit('error', 'An internal error occurred while processing your request.');
    socket.emit('answer_done');
  }
}

module.exports = { handleQuery };
