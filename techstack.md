📄 LabX AI Assistant — Tech Stack Document
1. System Overview

Frontend (UI) → Backend (Agent Logic) → External Services (LLM + Web Search)

2. Frontend (UI Layer)

Goal:
Real-time UI with smooth animations and clear timeline visualization

Stack:

React
Tailwind CSS
Framer Motion

Responsibilities:

Chat interface (messages, typing effect)
Activity / thinking timeline
Source cards (clickable links)
Cursor glow effect
Input handling

Important Rule:
Frontend should NOT:

Decide when to search
Call multiple APIs directly
All logic must stay in backend
3. Backend (Agent Engine)

Goal:
Control intelligence, decision-making, and system flow

Stack:

Node.js
Express

Responsibilities:

Receive user query
Decide:
Direct answer OR web search
Manage timeline steps
Call APIs (LLM + search)
Process and clean data

Timeline Output Format Example:

[
  "Thinking...",
  "Searching web...",
  "Visiting site...",
  "Extracting data..."
]
4. LLM (AI Brain)

Primary Option:

Groq (fast + free tier)

Alternative:

OpenRouter

Responsibilities:

Generate answers
Summarize web data
Reason over content

Important Rule:

Always clean and limit scraped data before sending to LLM
5. Web Search System

Search:

DuckDuckGo (no API key required)

Scraping:

Node.js: axios + cheerio
OR
Python: requests + BeautifulSoup

Flow:

Search query
Get top 3–5 results
Scrape content
Send to LLM
6. Real-Time Communication

Stack:

WebSockets (Socket.io)

Purpose:

Stream timeline steps
Enable real-time UI updates

Example Flow:
User → Backend
Backend → "Thinking..."
Backend → "Searching..."
Backend → "Visiting..."
Backend → Final Answer

7. Database (Optional for MVP)

Options:

MongoDB
Supabase

Use Cases:

Chat history
User memory
Preferences

Note:
Skip database in initial version

8. Deployment (Free Options)

Frontend:

Vercel

Backend:

Render
OR
Railway
9. End-to-End System Flow
User enters question
Frontend sends request to backend
Backend analyzes query
Backend decides:
Answer directly
OR
Perform web search
If search:
Fetch results
Scrape content
Backend streams timeline:
Thinking
Searching
Visiting
Backend sends data to LLM
LLM generates answer
Backend returns:
Final answer
Sources
Frontend displays everything
10. Build Roadmap

Phase 1:

Chat + LLM working

Phase 2:

Add web search

Phase 3:

Add timeline system

Phase 4:

Add UI animations
11. Key Principles
Keep backend as decision engine
Keep UI clean and readable
Show steps, not raw logs
Start simple, then improve

