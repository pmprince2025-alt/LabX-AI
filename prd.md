📄 UPDATED PRD — LabX AI Assistant (v2)
🧾 Product Name

LabX AI Assistant

🎯 Product Vision

A transparent AI system that not only answers questions but visually shows its thinking process in real time, combining:

ChatGPT-like intelligence
Perplexity-style sourcing
Jarvis-style interface
🎨 UI SYSTEM (BASED ON YOUR NEW DESIGN)
🧠 Core Design Principle

“Clarity first, effects second”

This version is much closer to a real product because:

clear separation of zones
visible system state
better hierarchy
🧩 1. Overall Layout
LEFT   → Chat Interface (Primary)
RIGHT  → Activity / Thinking Panel (Secondary)
BOTTOM → Sources Panel (Contextual)
BOTTOM BAR → Input Field (Action)
BACKGROUND → Black + Hex Grid (Ambient)

👉 This is now a functional layout, not just aesthetic.

💬 2. Chat Interface (LEFT PANEL)
Structure:
Header: “AI Assistant”
Avatar icon (adds personality)
Chat bubbles:
User messages
AI responses
Behavior:
Messages appear with:
fade + slight slide
AI response:
typed progressively
Improvements vs old version:
Multiple message bubbles → feels alive
Better spacing → readable
Conversational tone visible
⚠️ Critical Insight

Right now:

Chat is still visually weaker than timeline

👉 In a real product:

Chat = PRIMARY
Timeline = SUPPORTING
⚙️ 3. Activity Status Panel (RIGHT)
Purpose (CORE FEATURE 🔥)

This is your main differentiator

Structure:

Each step includes:

Icon (thinking, search, globe, data)
Label text
Progress indicator (line/animation)
Steps:
Thinking…
Searching the web…
Visiting: [website]
Extracting information…
Behavior:
Steps appear sequentially
Active step:
glows
animates
Completed steps:
dim slightly
🔥 What’s GOOD now:
Progress bars → excellent UX signal
Clear pipeline → user understands process
⚠️ What’s still missing:

It still feels like a “log”, not intelligence

👉 Upgrade idea:

Add micro-text:
“Found 3 relevant sources”
“Filtering outdated data”
🔗 4. Sources Panel (BOTTOM RIGHT)
Structure:
Title: “Sources Found”
Card layout (3–4 items)

Each card:

Website name
Domain
Icon/logo
Behavior:
Appears after search step
Hover:
glow
slight lift
Product Thinking:

This is strong because:

You are proving credibility visually

⌨️ 5. Input Bar (BOTTOM LEFT)
Features:
Placeholder: “Ask me anything…”
Send button (glow)
Behavior:
On focus:
border glows
On send:
clears input
triggers timeline
🌌 6. Background System
Design:
Pure black (#000000)
Hexagonal grid (low opacity)
Behavior:
Subtle glow pulses
Does NOT distract from content
🖱️ 7. Cursor System
Current:
glowing trail
Problem:

❗ Not integrated with UI meaningfully

Upgrade Requirement:
Cursor should:
react to buttons
intensify near timeline steps
subtly light hex grid
⚙️ FUNCTIONAL FLOW (UPDATED)
User inputs query
Chat logs user message
Timeline activates:
Thinking → Searching → Visiting → Extracting
Sources appear
AI response types out
System returns to idle
🧠 SYSTEM INTELLIGENCE LAYER
Decision Engine:

AI decides:

search required? (yes/no)
number of sources
relevance filtering
Transparency Layer:

Convert internal actions into:

human-readable steps
NOT raw logs
🎯 UX PRIORITY RULES
Rule 1:

Chat must always be the visual focus

Rule 2:

Timeline must support, not compete

Rule 3:

Effects must guide attention, not steal it