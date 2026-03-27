📄 LabX AI Assistant — Design Document
1. System Purpose

LabX is a transparent AI assistant that:

answers user queries
fetches real-time web data
shows its thinking process step-by-step
2. High-Level Architecture
Frontend (React UI)
        ↓
Backend (Agent Engine)
        ↓
---------------------------------
| LLM (Groq / OpenRouter)       |
| Web Search (DuckDuckGo)       |
| Scraper (Cheerio / BS4)       |
---------------------------------
3. Core Design Principles
Transparency over opacity
→ Show steps like “Searching”, not hidden logic
Separation of concerns
→ UI ≠ logic ≠ data fetching
Minimal but scalable
→ Start simple, extend later
4. System Components
4.1 Frontend (UI Layer)

Role:

Display chat
Show timeline steps
Render sources
Handle user input

Key Components:

Chat Panel
Timeline Panel
Sources Panel
Input Bar
4.2 Backend (Agent Engine)

Role:

Central controller
Decision-making system
Core Modules:
1. Query Handler
Receives user input
Preprocesses text
2. Decision Engine

Decides:

IF query needs real-time info → Web Search
ELSE → Direct LLM response
3. Search Module
Sends query to search engine
Returns top results
4. Scraper Module
Extracts readable content from websites
Cleans unnecessary data
5. LLM Module
Combines:
user query
scraped content
Generates final answer
6. Timeline Generator

Converts internal steps into UI-friendly messages:

Example:

[
  "Thinking...",
  "Searching web...",
  "Visiting site...",
  "Extracting information..."
]
5. Data Flow
1. User sends query
2. Backend receives query
3. Decision engine evaluates

4. If search required:
   → Search API
   → Scrape data

5. Backend sends timeline updates (WebSocket)

6. Backend sends data to LLM

7. LLM returns answer

8. Backend returns:
   → answer
   → sources
   → timeline

9. Frontend renders everything
6. Real-Time Communication Design

Technology: WebSockets

Purpose:

Stream steps live
Event Types:
{
  "type": "step",
  "data": "Searching web..."
}
{
  "type": "answer",
  "data": "Final response..."
}
{
  "type": "sources",
  "data": ["site1", "site2"]
}
7. UI Interaction Design
Chat Panel
Displays conversation
AI response uses typing animation
Timeline Panel
Shows steps sequentially
Active step glows
Completed steps fade
Sources Panel
Appears after search
Shows clickable cards
Input Bar
Accepts user query
Triggers system flow
8. Error Handling
Cases:
Search fails
→ fallback to LLM only
Scraping fails
→ skip that source
LLM fails
→ return basic fallback message
9. Performance Considerations
Limit scraped content (avoid overload)
Max 3–5 sources per query
Use streaming for better UX
Keep animations lightweight
10. Security Considerations
Sanitize user input
Avoid executing scraped scripts
Limit API usage
11. Scalability (Future)
Add caching layer
Add database (chat history)
Add multi-agent system
Add voice interface
12. Limitations (MVP)
Not 100% accurate web data
Some sites block scraping
Limited scalability on free tier
13. Build Phases
Phase 1:
Basic chat + LLM
Phase 2:
Add web search
Phase 3:
Add timeline system
Phase 4:
Add UI polish
14. Key Insight (Important)

This product is NOT just:

“Chatbot + search”

It is:

“Explainable AI interface”

That’s your real edge.