# CasePilot Full-Stack UI Blueprint

> **Purpose**: This is a complete, actionable blueprint for building the CasePilot frontend dashboard, backend API, Telegram bot, and Google integrations. Feed this document into an AI coding assistant (Claude, Codex) in Antigravity IDE to build each module.

---

## Table of Contents

1. [System Architecture Overview](#1-system-architecture-overview)
2. [Technology Stack](#2-technology-stack)
3. [Project File Structure](#3-project-file-structure)
4. [Backend API — FastAPI Server](#4-backend-api--fastapi-server)
5. [Frontend Dashboard — React + Tailwind](#5-frontend-dashboard--react--tailwind)
6. [Per-Case Detail Dashboard](#6-per-case-detail-dashboard)
7. [Case Journey Timeline](#7-case-journey-timeline)
8. [File/Document Management](#8-filedocument-management)
9. [Chat Interface](#9-chat-interface)
10. [Google Calendar Integration](#10-google-calendar-integration)
11. [Google Tasks Integration](#11-google-tasks-integration)
12. [Telegram Bot](#12-telegram-bot)
13. [Tool Connection Manager UI](#13-tool-connection-manager-ui)
14. [Real-Time Sync Architecture](#14-real-time-sync-architecture)
15. [Authentication & Security](#15-authentication--security)
16. [Deployment — Cloud Run](#16-deployment--cloud-run)
17. [Database Schema Additions](#17-database-schema-additions)
18. [API Endpoint Reference](#18-api-endpoint-reference)
19. [Component Specifications](#19-component-specifications)
20. [Implementation Order & Phases](#20-implementation-order--phases)

---

## 1. System Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                        USER INTERFACES                           │
│                                                                  │
│  ┌─────────────────┐  ┌──────────────┐  ┌────────────────────┐  │
│  │  React Dashboard │  │ Telegram Bot │  │  Future: WhatsApp  │  │
│  │  (Web App)       │  │              │  │                    │  │
│  └────────┬─────────┘  └──────┬───────┘  └────────────────────┘  │
│           │                   │                                   │
└───────────┼───────────────────┼───────────────────────────────────┘
            │ REST + WebSocket  │ Webhook
            ▼                   ▼
┌──────────────────────────────────────────────────────────────────┐
│                     FASTAPI BACKEND                               │
│                                                                  │
│  ┌──────────┐  ┌──────────────┐  ┌─────────────────────────┐    │
│  │ REST API │  │ WebSocket    │  │ Telegram Webhook        │    │
│  │ Endpoints│  │ /ws/chat     │  │ /webhook/telegram       │    │
│  └────┬─────┘  └──────┬───────┘  └───────────┬─────────────┘    │
│       │               │                      │                   │
│       ▼               ▼                      ▼                   │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │              ADK Agent Orchestrator                       │    │
│  │  ┌────────────┐ ┌──────────────┐ ┌────────────────┐     │    │
│  │  │ Court      │ │ Legal        │ │ Task Manager   │     │    │
│  │  │ Tracker    │ │ Research     │ │ Agent          │     │    │
│  │  └────────────┘ └──────┬───────┘ └────────────────┘     │    │
│  │                        │                                 │    │
│  │                 ┌──────▼───────┐                         │    │
│  │                 │ eCourts MCP  │                         │    │
│  │                 └──────────────┘                         │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │ Google       │  │ Google       │  │ Google Cloud         │   │
│  │ Calendar API │  │ Tasks API   │  │ Storage (GCS)        │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
│                                                                  │
└──────────────────────────┬───────────────────────────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │  Google Cloud Firestore │
              │  (casepilot-yashu)      │
              │                        │
              │  Collections:          │
              │  - cases               │
              │  - hearings            │
              │  - tasks               │
              │  - case_notes          │
              │  - precedents          │
              │  - case_files (NEW)    │
              │  - case_timeline (NEW) │
              │  - user_settings (NEW) │
              │  - connected_tools(NEW)│
              └────────────────────────┘
```

---

## 2. Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend** | React | 18+ | UI framework |
| **Styling** | Tailwind CSS | 3.4+ | Utility-first CSS |
| **State Management** | Zustand | 4+ | Lightweight global state |
| **Real-time** | Firebase JS SDK | 10+ | Firestore real-time listeners |
| **Charts/Timeline** | Recharts + custom CSS | 2+ | Timeline visualization, charts |
| **Icons** | Lucide React | 0.300+ | Consistent icon set |
| **Routing** | React Router | 6+ | SPA navigation |
| **Build Tool** | Vite | 5+ | Fast dev server and bundling |
| **Backend** | FastAPI | 0.110+ | REST API + WebSocket server |
| **Agent** | Google ADK | 1.0+ | Multi-agent orchestration |
| **AI Model** | Gemini 2.5 Flash | - | LLM backbone |
| **Database** | Cloud Firestore | - | NoSQL real-time database |
| **File Storage** | Google Cloud Storage | - | Document/file uploads |
| **Calendar** | Google Calendar API | v3 | Calendar event sync |
| **Tasks** | Google Tasks API | v1 | Task sync |
| **Telegram** | python-telegram-bot | 20+ | Telegram bot framework |
| **Auth** | Firebase Authentication | - | User auth (Google Sign-In) |
| **Deploy** | Cloud Run | - | Container deployment |

---

## 3. Project File Structure

```
casepilot-main/
│
├── frontend/                          # React dashboard
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   ├── src/
│   │   ├── main.jsx                   # Entry point
│   │   ├── App.jsx                    # Root component with router
│   │   │
│   │   ├── components/                # Shared UI components
│   │   │   ├── Layout.jsx             # Main layout (sidebar + content)
│   │   │   ├── Sidebar.jsx            # Left navigation sidebar
│   │   │   ├── ChatPanel.jsx          # Chat interface panel
│   │   │   ├── ChatMessage.jsx        # Individual message bubble
│   │   │   ├── CaseCard.jsx           # Case summary card
│   │   │   ├── HearingCard.jsx        # Hearing info card
│   │   │   ├── TaskCard.jsx           # Task item card
│   │   │   ├── PriorityBadge.jsx      # Priority indicator (urgent/high/normal/low)
│   │   │   ├── StatusBadge.jsx        # Status chip (active/closed/pending)
│   │   │   ├── TimelineEvent.jsx      # Single timeline entry
│   │   │   ├── FileUploadArea.jsx     # Drag-and-drop file upload
│   │   │   ├── FileCard.jsx           # Uploaded file display card
│   │   │   ├── CalendarSyncButton.jsx # "Sync to Calendar" action button
│   │   │   ├── ToolConnectionCard.jsx # Connected tool status card
│   │   │   ├── SearchBar.jsx          # Global search
│   │   │   ├── LoadingSpinner.jsx     # Loading state
│   │   │   └── EmptyState.jsx         # Empty state placeholder
│   │   │
│   │   ├── pages/                     # Route-level pages
│   │   │   ├── Dashboard.jsx          # Main overview dashboard
│   │   │   ├── CaseList.jsx           # All cases grid/list view
│   │   │   ├── CaseDetail.jsx         # Per-case full dashboard
│   │   │   ├── CaseTimeline.jsx       # Case journey timeline view
│   │   │   ├── Hearings.jsx           # All hearings calendar view
│   │   │   ├── Tasks.jsx              # All tasks board view
│   │   │   ├── Research.jsx           # Legal research interface
│   │   │   ├── Files.jsx              # File manager
│   │   │   ├── Settings.jsx           # User settings
│   │   │   └── ToolConnections.jsx    # Manage connected tools
│   │   │
│   │   ├── stores/                    # Zustand state stores
│   │   │   ├── caseStore.js           # Cases state + Firestore listener
│   │   │   ├── hearingStore.js        # Hearings state + listener
│   │   │   ├── taskStore.js           # Tasks state + listener
│   │   │   ├── chatStore.js           # Chat messages state
│   │   │   ├── fileStore.js           # Uploaded files state
│   │   │   └── settingsStore.js       # User preferences
│   │   │
│   │   ├── hooks/                     # Custom React hooks
│   │   │   ├── useFirestoreListener.js  # Generic Firestore real-time hook
│   │   │   ├── useChat.js             # WebSocket chat hook
│   │   │   ├── useCaseData.js         # Aggregate case data hook
│   │   │   └── useAuth.js             # Firebase auth hook
│   │   │
│   │   ├── services/                  # API client functions
│   │   │   ├── api.js                 # Axios/fetch wrapper for REST API
│   │   │   ├── firebase.js            # Firebase config + initialization
│   │   │   ├── websocket.js           # WebSocket connection manager
│   │   │   └── storage.js             # GCS file upload service
│   │   │
│   │   ├── utils/                     # Utility functions
│   │   │   ├── dateFormat.js          # DD-MM-YYYY formatting
│   │   │   ├── prioritySort.js        # Priority ordering logic
│   │   │   └── constants.js           # Colors, labels, enums
│   │   │
│   │   └── styles/
│   │       └── index.css              # Tailwind imports + custom CSS
│   │
│   ├── tailwind.config.js
│   ├── vite.config.js
│   ├── package.json
│   └── .env                           # VITE_API_URL, VITE_FIREBASE_CONFIG
│
├── backend/                           # FastAPI backend
│   ├── main.py                        # FastAPI app entry point
│   ├── config.py                      # Environment config loader
│   │
│   ├── api/                           # API route modules
│   │   ├── __init__.py
│   │   ├── cases.py                   # /api/cases/* endpoints
│   │   ├── hearings.py                # /api/hearings/* endpoints
│   │   ├── tasks.py                   # /api/tasks/* endpoints
│   │   ├── research.py                # /api/research/* endpoints
│   │   ├── files.py                   # /api/files/* endpoints
│   │   ├── chat.py                    # WebSocket /ws/chat endpoint
│   │   ├── calendar_sync.py           # /api/calendar/* endpoints
│   │   ├── tasks_sync.py              # /api/google-tasks/* endpoints
│   │   └── telegram_webhook.py        # /webhook/telegram endpoint
│   │
│   ├── services/                      # Business logic
│   │   ├── __init__.py
│   │   ├── firestore_service.py       # Firestore CRUD operations
│   │   ├── agent_service.py           # ADK agent invocation wrapper
│   │   ├── calendar_service.py        # Google Calendar API client
│   │   ├── google_tasks_service.py    # Google Tasks API client
│   │   ├── storage_service.py         # GCS upload/download
│   │   ├── telegram_service.py        # Telegram bot logic
│   │   └── timeline_service.py        # Case timeline event tracking
│   │
│   ├── models/                        # Pydantic models
│   │   ├── __init__.py
│   │   ├── case.py
│   │   ├── hearing.py
│   │   ├── task.py
│   │   ├── file.py
│   │   ├── timeline_event.py
│   │   └── chat_message.py
│   │
│   └── requirements.txt
│
├── casepilot_agent/                   # Existing ADK agent (unchanged)
│   ├── __init__.py
│   ├── agent.py
│   ├── sub_agents/
│   │   ├── court_tracker.py
│   │   ├── legal_research.py
│   │   └── task_manager.py
│   └── tools/
│       ├── firestore_tools.py         # Existing tools
│       ├── calendar_tools.py          # NEW: Google Calendar tools
│       └── google_tasks_tools.py      # NEW: Google Tasks tools
│
├── mcp_server/                        # Existing MCP server (unchanged)
│   └── server.py
│
├── telegram_bot/                      # Telegram bot
│   ├── __init__.py
│   ├── bot.py                         # Bot initialization + handlers
│   ├── handlers/
│   │   ├── __init__.py
│   │   ├── start.py                   # /start command
│   │   ├── briefing.py                # /briefing command
│   │   ├── hearings.py                # /hearings command
│   │   ├── tasks.py                   # /tasks command
│   │   ├── case_lookup.py             # /case <number> command
│   │   └── natural_language.py        # Free-text → ADK agent
│   └── utils/
│       ├── formatters.py              # Telegram markdown formatters
│       └── keyboards.py               # Inline keyboard builders
│
├── docker-compose.yml                 # Multi-service orchestration
├── Dockerfile.backend                 # Backend container
├── Dockerfile.frontend                # Frontend container (nginx)
├── Dockerfile.telegram                # Telegram bot container
└── .env                               # All environment variables
```

---

## 4. Backend API — FastAPI Server

### 4.1 Main Application (`backend/main.py`)

```python
"""
CasePilot Backend API
- REST endpoints for dashboard CRUD
- WebSocket endpoint for real-time chat with ADK agent
- Telegram webhook receiver
- Google Calendar and Tasks sync endpoints
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import cases, hearings, tasks, research, files, chat, calendar_sync, tasks_sync, telegram_webhook

app = FastAPI(title="CasePilot API", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# REST Routes
app.include_router(cases.router, prefix="/api/cases", tags=["Cases"])
app.include_router(hearings.router, prefix="/api/hearings", tags=["Hearings"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["Tasks"])
app.include_router(research.router, prefix="/api/research", tags=["Research"])
app.include_router(files.router, prefix="/api/files", tags=["Files"])
app.include_router(calendar_sync.router, prefix="/api/calendar", tags=["Calendar"])
app.include_router(tasks_sync.router, prefix="/api/google-tasks", tags=["Google Tasks"])

# WebSocket
app.include_router(chat.router, tags=["Chat"])

# Telegram Webhook
app.include_router(telegram_webhook.router, prefix="/webhook", tags=["Telegram"])

@app.get("/health")
async def health():
    return {"status": "ok", "service": "casepilot-api"}
```

### 4.2 Chat WebSocket (`backend/api/chat.py`)

```python
"""
WebSocket endpoint for real-time chat between the React dashboard and the ADK agent.

Flow:
1. Frontend connects to ws://host/ws/chat
2. User sends a message (JSON: {"message": "...", "session_id": "..."})
3. Backend invokes the ADK root agent with the message
4. Agent response is streamed back via WebSocket
5. If the agent triggers a Firestore write (new task, hearing update, etc.),
   the frontend picks it up via Firestore real-time listeners — no extra sync needed.
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from services.agent_service import invoke_agent
import json

router = APIRouter()

@router.websocket("/ws/chat")
async def chat_websocket(websocket: WebSocket):
    await websocket.accept()
    session_id = None

    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            user_message = payload.get("message", "")
            session_id = payload.get("session_id", session_id)

            # Invoke the ADK agent
            response = await invoke_agent(
                message=user_message,
                session_id=session_id
            )

            # Send agent response back
            await websocket.send_json({
                "type": "agent_response",
                "message": response["text"],
                "actions": response.get("actions", []),
                # actions might include: calendar_suggest, task_suggest, etc.
            })

    except WebSocketDisconnect:
        pass
```

### 4.3 Agent Service (`backend/services/agent_service.py`)

```python
"""
Wrapper around the ADK agent for programmatic invocation.

This service:
1. Creates/reuses an ADK session per user
2. Sends the user message to the root CasePilot agent
3. Returns the agent's response text + any structured actions

The agent's tools write directly to Firestore, so the frontend
picks up changes via real-time listeners automatically.
"""

from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from casepilot_agent.agent import root_agent

session_service = InMemorySessionService()

runner = Runner(
    agent=root_agent,
    app_name="casepilot",
    session_service=session_service,
)

async def invoke_agent(message: str, session_id: str = None) -> dict:
    """
    Send a message to the CasePilot root agent and return the response.

    Returns:
        {
            "text": "Agent's natural language response",
            "actions": [
                {"type": "calendar_suggest", "hearings": [...]},
                {"type": "task_suggest", "tasks": [...]}
            ]
        }
    """
    # Create or retrieve session
    session = session_service.get_session(
        app_name="casepilot",
        user_id="default_user",
        session_id=session_id
    )
    if not session:
        session = session_service.create_session(
            app_name="casepilot",
            user_id="default_user"
        )

    # Build the user message content
    from google.genai import types
    content = types.Content(
        role="user",
        parts=[types.Part.from_text(message)]
    )

    # Run the agent and collect response
    response_text = ""
    actions = []

    async for event in runner.run_async(
        user_id="default_user",
        session_id=session.id,
        new_message=content
    ):
        if event.is_final_response():
            for part in event.content.parts:
                if part.text:
                    response_text += part.text

    # Post-process: detect if agent mentioned calendar/tasks sync
    if any(kw in response_text.lower() for kw in ["hearing", "court date", "schedule"]):
        actions.append({"type": "calendar_suggest"})
    if any(kw in response_text.lower() for kw in ["task", "overdue", "pending", "assign"]):
        actions.append({"type": "task_suggest"})

    return {
        "text": response_text,
        "actions": actions,
        "session_id": session.id
    }
```

---

## 5. Frontend Dashboard — React + Tailwind

### 5.1 Main Dashboard Layout

The dashboard follows a **three-panel layout**:

```
┌─────────┬────────────────────────────────┬──────────────────┐
│         │                                │                  │
│  SIDE   │       MAIN CONTENT AREA        │   CHAT PANEL     │
│  BAR    │                                │                  │
│         │  (Dashboard / Case Detail /    │   Conversational │
│  - Logo │   Hearings / Tasks / etc.)     │   AI Interface   │
│  - Nav  │                                │                  │
│  - Cases│                                │   [Type here...] │
│         │                                │                  │
└─────────┴────────────────────────────────┴──────────────────┘
   240px          flex-1 (fluid)                 380px
```

### 5.2 Sidebar Component (`Sidebar.jsx`)

```
┌─────────────────┐
│  ⚖️ CasePilot    │  ← Logo + app name
│                 │
│  📊 Dashboard    │  ← Overview (daily brief style)
│  📁 All Cases    │  ← Case list with filters
│  📅 Hearings     │  ← Calendar view of hearings
│  ✅ Tasks        │  ← Task board (Kanban or list)
│  🔍 Research     │  ← Legal research + eCourts
│  📎 Files        │  ← Document manager
│                 │
│  ─────────────  │
│  🔗 Connections  │  ← Manage tool connections
│  ⚙️ Settings     │  ← User preferences
│                 │
│  ─────────────  │
│  ACTIVE CASES   │  ← Quick-access case list
│  🔴 WP/1234/24  │     Color = priority
│  🟠 CS/234/24   │
│  🟠 OS/89/25    │
│  🟡 CRL/567/23  │
│  🟡 MC/45/24    │
│                 │
└─────────────────┘
```

### 5.3 Main Dashboard Page (`Dashboard.jsx`)

This is the landing page — a "morning briefing" view:

```
┌──────────────────────────────────────────────────────────┐
│  Good Morning, Advocate Satyanarayana       April 7, 2026│
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐│
│  │ 5 Active │  │ 2 Today  │  │ 3 Overdue│  │ 5 Pending││
│  │ Cases    │  │ Hearings │  │ Tasks    │  │ Tasks    ││
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘│
│                                                          │
│  TODAY'S HEARINGS                                        │
│  ┌────────────────────────────────────────────────────┐  │
│  │ 🔴 10:30 AM  CS/234/2024 — Sharma vs. Municipal   │  │
│  │    Court Room 5 | Arguments on interim injunction  │  │
│  │    [View Case] [Sync to Calendar]                  │  │
│  ├────────────────────────────────────────────────────┤  │
│  │ 🔴 11:00 AM  CRL/567/2023 — State vs. Anand Kumar │  │
│  │    Court Room 12 | Cross examination               │  │
│  │    [View Case] [Sync to Calendar]                  │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  OVERDUE TASKS                                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │ 🔴 Draft interim injunction — Anil (Due: 31-03)   │  │
│  │ 🔴 File written arguments — Meena (Due: 01-04)    │  │
│  │ 🟠 Collect survey report — Self (Due: 31-03)      │  │
│  │ [Sync All to Google Tasks]                         │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  UPCOMING THIS WEEK                                      │
│  ┌────────────────────────────────────────────────────┐  │
│  │ Timeline: Mon—Tue—Wed—Thu—Fri                      │  │
│  │           |         ●    ●    ●                    │  │
│  │ Shows dots on days with hearings, clickable        │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

---

## 6. Per-Case Detail Dashboard (`CaseDetail.jsx`)

When a user clicks on any case, they see a **full case dashboard** — everything about that one case in a single view.

### 6.1 Layout

```
┌──────────────────────────────────────────────────────────────┐
│  ← Back to Cases                                             │
│                                                              │
│  CS/234/2024 — Sharma vs. Municipal Corporation              │
│  District Court Warangal | Property | 🟠 High Priority       │
│  Status: Active | Filed: 15-01-2024                          │
│                                                              │
│  ┌─────────┬─────────┬──────────┬──────────┬───────────┐    │
│  │Overview │Timeline │Hearings  │Tasks     │Documents  │    │
│  └─────────┴─────────┴──────────┴──────────┴───────────┘    │
│                                                              │
│  [TAB CONTENT AREA — see sections below]                     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 6.2 Overview Tab

```
┌──────────────────────────────────────────────────────────────┐
│  CASE INFORMATION                                            │
│  ┌──────────────────────┬───────────────────────────────┐    │
│  │ Case Number          │ CS/234/2024                   │    │
│  │ Case Title           │ Sharma vs. Municipal Corp.    │    │
│  │ Court                │ District Court Warangal       │    │
│  │ Court Type           │ District                      │    │
│  │ Case Type            │ Property                      │    │
│  │ Judge                │ Hon. Justice K. Venkatesh     │    │
│  │ Client               │ Rajesh Sharma                 │    │
│  │ Opponent             │ Municipal Corporation         │    │
│  │ Opponent Lawyer      │ Adv. P. Kumar                 │    │
│  │ Filing Date          │ 15-01-2024                    │    │
│  │ Priority             │ 🟠 High                       │    │
│  │ Status               │ Active                        │    │
│  └──────────────────────┴───────────────────────────────┘    │
│                                                              │
│  INTERNAL NOTES                                              │
│  Property dispute involving municipal wall encroachment...   │
│                                                              │
│  QUICK STATS                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ 2        │ │ 1        │ │ 2        │ │ 3        │       │
│  │ Hearings │ │ Completed│ │ Pending  │ │ Files    │       │
│  │ Upcoming │ │ Hearing  │ │ Tasks    │ │ Uploaded │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
└──────────────────────────────────────────────────────────────┘
```

### 6.3 Timeline Tab — See Section 7

### 6.4 Hearings Tab (Per-Case)

```
┌──────────────────────────────────────────────────────────────┐
│  UPCOMING HEARINGS                          [+ Add Hearing]  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 📅 02-04-2026 | 10:30 AM | Court Room 5               │  │
│  │ Purpose: Arguments on interim injunction application   │  │
│  │ Status: Scheduled                                      │  │
│  │ [Sync to Calendar]                                     │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  PAST HEARINGS                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 📅 25-03-2026 | 10:30 AM | Court Room 5               │  │
│  │ Purpose: Document submission                           │  │
│  │ Status: ✅ Completed                                    │  │
│  │ Outcome: Documents accepted, next date 02-04-2026      │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### 6.5 Tasks Tab (Per-Case)

```
┌──────────────────────────────────────────────────────────────┐
│  TASKS FOR CS/234/2024                        [+ Add Task]   │
│                                                              │
│  OVERDUE                                                     │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 🔴 Draft interim injunction application                │  │
│  │    Assigned: Junior — Anil | Due: 31-03-2026           │  │
│  │    Status: [Pending ▼]  [Sync to Google Tasks]         │  │
│  └────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 🟠 Collect property survey report                      │  │
│  │    Assigned: Self | Due: 31-03-2026                    │  │
│  │    Status: [Pending ▼]  [Sync to Google Tasks]         │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  IN PROGRESS                                                 │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 🟠 Prepare cross-examination questions                 │  │
│  │    Assigned: Self | Due: 02-04-2026                    │  │
│  │    Status: [In Progress ▼]                             │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### 6.6 Documents Tab (Per-Case)

```
┌──────────────────────────────────────────────────────────────┐
│  CASE DOCUMENTS                                [+ Upload]    │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 📄 Property_Survey_Report.pdf        2.3 MB  Mar 20   │  │
│  │    Category: Evidence | Uploaded by: Advocate          │  │
│  │    [View] [Download] [Delete]                          │  │
│  ├────────────────────────────────────────────────────────┤  │
│  │ 📷 Site_Photos_March2026.zip         15 MB   Mar 20   │  │
│  │    Category: Evidence | Uploaded by: Advocate          │  │
│  │    [View] [Download] [Delete]                          │  │
│  ├────────────────────────────────────────────────────────┤  │
│  │ 📄 Interim_Injunction_Draft_v1.docx  450 KB  Mar 28   │  │
│  │    Category: Drafts | Uploaded by: Junior — Anil       │  │
│  │    [View] [Download] [Delete]                          │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┐   │
│  │  📤 Drag and drop files here, or click to browse     │   │
│  │     Supports: PDF, DOCX, JPG, PNG, ZIP (Max 25MB)   │   │
│  └─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘   │
└──────────────────────────────────────────────────────────────┘
```

---

## 7. Case Journey Timeline (`CaseTimeline.jsx`)

The timeline is a **vertical chronological view** showing every significant event in a case's life.

### 7.1 Visual Design

```
┌──────────────────────────────────────────────────────────────┐
│  CASE JOURNEY — CS/234/2024                                  │
│  Sharma vs. Municipal Corporation                            │
│                                                              │
│     15 Jan 2024                                              │
│        ●─── CASE FILED                                       │
│        │    Filed at District Court Warangal                  │
│        │    Case Type: Property Dispute                       │
│        │                                                     │
│     20 Mar 2026                                              │
│        ●─── SITE VISIT CONDUCTED                             │
│        │    Municipal wall encroaches 3 feet into client's   │
│        │    land. 20 photos taken as evidence.               │
│        │                                                     │
│     25 Mar 2026                                              │
│        ●─── HEARING — Document Submission ✅                  │
│        │    Court Room 5 | Documents accepted                │
│        │    Next date set: 02-04-2026                        │
│        │                                                     │
│     28 Mar 2026                                              │
│        ●─── TASK CREATED — Draft interim injunction          │
│        │    Assigned to: Junior — Anil                       │
│        │    Due: 31-03-2026 | Status: Pending (OVERDUE)      │
│        │                                                     │
│     31 Mar 2026                                              │
│        ●─── TASK OVERDUE — Draft interim injunction 🔴       │
│        │    Junior — Anil has not completed this task         │
│        │                                                     │
│     02 Apr 2026   ← UPCOMING                                │
│        ◯─── HEARING SCHEDULED                                │
│        │    10:30 AM | Court Room 5                          │
│        │    Arguments on interim injunction application      │
│        │                                                     │
│        ▼                                                     │
│     [Future events shown as hollow circles]                  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 7.2 Timeline Event Types

| Event Type | Icon | Color | Source |
|-----------|------|-------|--------|
| `case_filed` | Briefcase | Blue | Auto-generated from `cases.filing_date` |
| `hearing_completed` | Gavel | Green | From `hearings` where `status=completed` |
| `hearing_scheduled` | Calendar | Orange | From `hearings` where `status=scheduled` |
| `task_created` | ClipboardPlus | Gray | From `tasks.created_at` |
| `task_completed` | CheckCircle | Green | From `tasks.completed_at` |
| `task_overdue` | AlertTriangle | Red | Computed: `due_date < today && status != completed` |
| `note_added` | FileText | Purple | From `case_notes.created_at` |
| `file_uploaded` | Upload | Teal | From `case_files.uploaded_at` |
| `research_found` | Search | Indigo | From research activity |
| `ecourts_update` | Globe | Amber | From eCourts search results |

### 7.3 Timeline Data Model

The timeline is **computed dynamically** by aggregating events from multiple Firestore collections filtered by `case_number`. No separate `case_timeline` collection is needed for the basic version. The frontend queries all collections and merges them chronologically.

```javascript
// In useCaseTimeline.js hook
function buildTimeline(caseNumber) {
  const events = [];

  // From cases collection
  const caseData = getCaseByNumber(caseNumber);
  events.push({
    date: caseData.filing_date,
    type: "case_filed",
    title: "Case Filed",
    description: `Filed at ${caseData.court_name}`,
  });

  // From hearings collection
  hearings.filter(h => h.case_number === caseNumber).forEach(h => {
    events.push({
      date: h.hearing_date,
      type: h.status === "completed" ? "hearing_completed" : "hearing_scheduled",
      title: `Hearing — ${h.purpose}`,
      description: h.outcome || `${h.hearing_time} | ${h.court_room}`,
    });
  });

  // From tasks collection
  tasks.filter(t => t.case_number === caseNumber).forEach(t => {
    events.push({
      date: t.created_at,
      type: "task_created",
      title: `Task: ${t.title}`,
      description: `Assigned to ${t.assigned_to} | Due: ${t.due_date}`,
    });
  });

  // From case_notes collection
  notes.filter(n => n.case_number === caseNumber).forEach(n => {
    events.push({
      date: n.created_at,
      type: "note_added",
      title: n.title,
      description: `${n.note_type} by ${n.author}`,
    });
  });

  // From case_files collection (NEW)
  files.filter(f => f.case_number === caseNumber).forEach(f => {
    events.push({
      date: f.uploaded_at,
      type: "file_uploaded",
      title: `File: ${f.filename}`,
      description: `${f.category} | ${f.file_size}`,
    });
  });

  // Sort chronologically
  return events.sort((a, b) => new Date(a.date) - new Date(b.date));
}
```

---

## 8. File/Document Management

### 8.1 Google Cloud Storage Setup

```
GCS Bucket: casepilot-files-{project_id}
├── cases/
│   ├── CS_234_2024/
│   │   ├── evidence/
│   │   │   ├── property_survey_report.pdf
│   │   │   └── site_photos_march2026.zip
│   │   ├── drafts/
│   │   │   └── interim_injunction_v1.docx
│   │   ├── filings/
│   │   └── correspondence/
│   ├── CRL_567_2023/
│   └── ...
```

### 8.2 File Upload Flow

```
1. User drags file onto FileUploadArea component
2. Frontend calls POST /api/files/upload with:
   - file (multipart)
   - case_number
   - category (evidence | drafts | filings | correspondence | other)
3. Backend:
   a. Uploads file to GCS bucket at cases/{case_number}/{category}/{filename}
   b. Creates a document in Firestore `case_files` collection
   c. Returns the file metadata + GCS signed URL
4. Frontend Firestore listener picks up the new document
5. File appears in the case's Documents tab and on the Timeline
```

### 8.3 Firestore `case_files` Collection Schema

```
case_files/
├── id                (auto-generated)
├── case_number       (string)       "CS/234/2024"
├── filename          (string)       "Property_Survey_Report.pdf"
├── original_name     (string)       Original upload name
├── file_size         (number)       Bytes
├── file_type         (string)       "application/pdf"
├── category          (string)       evidence | drafts | filings | correspondence | other
├── gcs_path          (string)       "cases/CS_234_2024/evidence/property_survey_report.pdf"
├── download_url      (string)       Signed URL (refreshed on access)
├── uploaded_by       (string)       "Advocate Satyanarayana"
├── uploaded_at       (timestamp)
└── notes             (string)       Optional description
```

### 8.4 Backend File Endpoint (`backend/api/files.py`)

```python
"""
File management endpoints.
- Upload files to GCS, create Firestore metadata
- Generate signed download URLs
- List files per case
- Delete files
"""

from fastapi import APIRouter, UploadFile, File, Form
from services.storage_service import upload_to_gcs, generate_signed_url, delete_from_gcs
from services.firestore_service import db
from datetime import datetime

router = APIRouter()

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    case_number: str = Form(...),
    category: str = Form("other"),
    uploaded_by: str = Form("Advocate"),
    notes: str = Form("")
):
    # Upload to GCS
    safe_case = case_number.replace("/", "_")
    gcs_path = f"cases/{safe_case}/{category}/{file.filename}"
    file_content = await file.read()
    upload_to_gcs(gcs_path, file_content, file.content_type)

    # Create Firestore record
    doc_ref = db.collection("case_files").document()
    file_data = {
        "case_number": case_number,
        "filename": file.filename,
        "original_name": file.filename,
        "file_size": len(file_content),
        "file_type": file.content_type,
        "category": category,
        "gcs_path": gcs_path,
        "download_url": generate_signed_url(gcs_path),
        "uploaded_by": uploaded_by,
        "uploaded_at": datetime.utcnow(),
        "notes": notes,
    }
    doc_ref.set(file_data)

    return {"id": doc_ref.id, **file_data}

@router.get("/case/{case_number}")
async def list_case_files(case_number: str):
    files = db.collection("case_files") \
        .where("case_number", "==", case_number) \
        .order_by("uploaded_at", direction="DESCENDING") \
        .stream()
    return [{"id": f.id, **f.to_dict()} for f in files]

@router.delete("/{file_id}")
async def delete_file(file_id: str):
    doc = db.collection("case_files").document(file_id).get()
    if doc.exists:
        delete_from_gcs(doc.to_dict()["gcs_path"])
        db.collection("case_files").document(file_id).delete()
    return {"deleted": True}
```

---

## 9. Chat Interface (`ChatPanel.jsx`)

### 9.1 Visual Design

```
┌──────────────────────────────┐
│  ⚖️ CasePilot Assistant       │
│  ─────────────────────────── │
│                              │
│  ┌─ AI ──────────────────┐   │
│  │ Good morning! Here's  │   │
│  │ your daily briefing:  │   │
│  │                       │   │
│  │ You have 2 hearings   │   │
│  │ today and 3 overdue   │   │
│  │ tasks...              │   │
│  │                       │   │
│  │ ┌──────────────────┐  │   │
│  │ │ 📅 Sync hearings │  │   │
│  │ │ to Google Calendar│  │   │
│  │ └──────────────────┘  │   │
│  │ ┌──────────────────┐  │   │
│  │ │ ✅ Sync tasks to  │  │   │
│  │ │ Google Tasks      │  │   │
│  │ └──────────────────┘  │   │
│  └───────────────────────┘   │
│                              │
│       ┌─ User ───────────┐   │
│       │ Show me details  │   │
│       │ of the Sharma    │   │
│       │ case             │   │
│       └──────────────────┘   │
│                              │
│  ┌─ AI ──────────────────┐   │
│  │ Here are the details  │   │
│  │ for CS/234/2024...    │   │
│  │ [View Case →]         │   │
│  └───────────────────────┘   │
│                              │
│  ─────────────────────────── │
│  ┌────────────────────┐ [➤] │
│  │ Type a message...  │      │
│  └────────────────────┘      │
│  🎤                          │
└──────────────────────────────┘
```

### 9.2 Smart Action Buttons

When the agent responds with schedule/task information, the chat shows **inline action buttons** that the user can click:

| Agent Response Contains | Action Button Shown | On Click |
|------------------------|--------------------|---------:|
| Hearing dates | "Sync to Google Calendar" | Calls `POST /api/calendar/sync-hearings` |
| Pending/overdue tasks | "Sync to Google Tasks" | Calls `POST /api/google-tasks/sync-tasks` |
| Case reference | "View Case →" | Navigates to `/cases/{case_number}` |
| eCourts result | "View on eCourts" | Opens external link |
| Research result | "Save to Case Notes" | Calls `POST /api/research/save-note` |

### 9.3 Chat Flow with Calendar/Tasks Suggestion

```
User: "What hearings do I have this week?"

Agent Response:
"You have 3 hearings this week:
1. 🔴 TODAY — CS/234/2024 at 10:30 AM, Court Room 5
2. 🟡 TOMORROW — CRL/567/2023 at 11:00 AM, Court Room 12
3. MC/45/2024 on 04-04-2026 at 11:30 AM, Court Room 2

Would you like me to add these to your Google Calendar?"

[Button: 📅 Yes, sync to Google Calendar]
[Button: ❌ No thanks]

→ User clicks "Yes, sync to Google Calendar"
→ Frontend calls POST /api/calendar/sync-hearings with hearing IDs
→ Agent confirms: "Done! 3 hearings added to your Google Calendar."
```

---

## 10. Google Calendar Integration

### 10.1 ADK Tool (`casepilot_agent/tools/calendar_tools.py`)

```python
"""
Google Calendar tools for the ADK agent.
Uses Google Calendar API v3 via google-api-python-client.

Setup:
1. Enable Google Calendar API in GCP console
2. Create OAuth 2.0 credentials (or use service account for demo)
3. Set GOOGLE_CALENDAR_CREDENTIALS_PATH in .env
"""

from googleapiclient.discovery import build
from google.oauth2 import service_account

SCOPES = ["https://www.googleapis.com/auth/calendar"]

def get_calendar_service():
    """Initialize Google Calendar API client."""
    credentials = service_account.Credentials.from_service_account_file(
        "path/to/service-account.json", scopes=SCOPES
    )
    # For user calendars, delegate to the user
    # credentials = credentials.with_subject("lawyer@example.com")
    return build("calendar", "v3", credentials=credentials)

def create_calendar_event(
    case_number: str,
    hearing_date: str,
    hearing_time: str,
    court_room: str,
    purpose: str,
    court_name: str = ""
) -> dict:
    """
    Create a Google Calendar event for a court hearing.

    Args:
        case_number: The case number (e.g., "CS/234/2024")
        hearing_date: Date in YYYY-MM-DD format
        hearing_time: Time in HH:MM format
        court_room: Court room identifier
        purpose: Purpose of the hearing
        court_name: Name of the court

    Returns:
        dict with event_id and event_link
    """
    service = get_calendar_service()

    # Build event
    start_datetime = f"{hearing_date}T{hearing_time}:00"
    # Assume 1-hour duration for hearings
    hour = int(hearing_time.split(":")[0]) + 1
    end_time = f"{hour:02d}:{hearing_time.split(':')[1]}"
    end_datetime = f"{hearing_date}T{end_time}:00"

    event = {
        "summary": f"Court Hearing — {case_number}",
        "description": (
            f"Case: {case_number}\n"
            f"Purpose: {purpose}\n"
            f"Court: {court_name}\n"
            f"Court Room: {court_room}\n"
            f"\n--- Managed by CasePilot ---"
        ),
        "location": f"{court_room}, {court_name}",
        "start": {
            "dateTime": start_datetime,
            "timeZone": "Asia/Kolkata",
        },
        "end": {
            "dateTime": end_datetime,
            "timeZone": "Asia/Kolkata",
        },
        "reminders": {
            "useDefault": False,
            "overrides": [
                {"method": "popup", "minutes": 60},     # 1 hour before
                {"method": "popup", "minutes": 1440},    # 1 day before
            ],
        },
        "colorId": "11",  # Red for court hearings
    }

    created = service.events().insert(calendarId="primary", body=event).execute()

    return {
        "status": "success",
        "event_id": created["id"],
        "event_link": created.get("htmlLink", ""),
        "message": f"Calendar event created for {case_number} on {hearing_date} at {hearing_time}"
    }


def sync_all_upcoming_hearings() -> dict:
    """
    Sync all upcoming hearings from Firestore to Google Calendar.
    Checks for existing events to avoid duplicates.

    Returns:
        dict with count of events created and list of synced hearings
    """
    from tools.firestore_tools import get_upcoming_hearings

    hearings = get_upcoming_hearings()
    results = []

    for hearing in hearings:
        result = create_calendar_event(
            case_number=hearing["case_number"],
            hearing_date=hearing["hearing_date"],
            hearing_time=hearing["hearing_time"],
            court_room=hearing["court_room"],
            purpose=hearing["purpose"],
        )
        results.append(result)

    return {
        "status": "success",
        "events_created": len(results),
        "details": results,
        "message": f"Successfully synced {len(results)} hearings to Google Calendar"
    }
```

### 10.2 Register Tools with Root Agent

In `casepilot_agent/agent.py`, add the calendar tools:

```python
from tools.calendar_tools import create_calendar_event, sync_all_upcoming_hearings

# Add to root_agent tool list:
tools=[
    get_daily_brief,
    get_case_details,
    get_all_active_cases,
    create_calendar_event,        # NEW
    sync_all_upcoming_hearings,   # NEW
]
```

---

## 11. Google Tasks Integration

### 11.1 ADK Tool (`casepilot_agent/tools/google_tasks_tools.py`)

```python
"""
Google Tasks tools for the ADK agent.
Uses Google Tasks API v1 via google-api-python-client.

Setup:
1. Enable Google Tasks API in GCP console
2. Use same OAuth/service account as Calendar
"""

from googleapiclient.discovery import build
from google.oauth2 import service_account

SCOPES = ["https://www.googleapis.com/auth/tasks"]

def get_tasks_service():
    credentials = service_account.Credentials.from_service_account_file(
        "path/to/service-account.json", scopes=SCOPES
    )
    return build("tasks", "v1", credentials=credentials)

def create_google_task(
    title: str,
    notes: str = "",
    due_date: str = "",
    case_number: str = ""
) -> dict:
    """
    Create a Google Task from a CasePilot task.

    Args:
        title: Task title
        notes: Task description/notes
        due_date: Due date in YYYY-MM-DD format
        case_number: Associated case number

    Returns:
        dict with task_id and status
    """
    service = get_tasks_service()

    # Get or create a "CasePilot" task list
    task_lists = service.tasklists().list().execute()
    casepilot_list = None
    for tl in task_lists.get("items", []):
        if tl["title"] == "CasePilot":
            casepilot_list = tl["id"]
            break

    if not casepilot_list:
        new_list = service.tasklists().insert(body={"title": "CasePilot"}).execute()
        casepilot_list = new_list["id"]

    # Create the task
    task_body = {
        "title": f"[{case_number}] {title}" if case_number else title,
        "notes": notes,
    }
    if due_date:
        task_body["due"] = f"{due_date}T00:00:00.000Z"

    created = service.tasks().insert(tasklist=casepilot_list, body=task_body).execute()

    return {
        "status": "success",
        "task_id": created["id"],
        "message": f"Google Task created: {title}"
    }


def sync_pending_tasks_to_google() -> dict:
    """
    Sync all pending/overdue CasePilot tasks to Google Tasks.

    Returns:
        dict with count and details of synced tasks
    """
    from tools.firestore_tools import get_pending_tasks, get_overdue_tasks

    pending = get_pending_tasks()
    overdue = get_overdue_tasks()
    all_tasks = {t["id"]: t for t in pending + overdue}.values()  # deduplicate

    results = []
    for task in all_tasks:
        result = create_google_task(
            title=task["title"],
            notes=f"Assigned to: {task['assigned_to']}\nPriority: {task['priority']}",
            due_date=task["due_date"],
            case_number=task["case_number"],
        )
        results.append(result)

    return {
        "status": "success",
        "tasks_synced": len(results),
        "message": f"Successfully synced {len(results)} tasks to Google Tasks"
    }
```

---

## 12. Telegram Bot

### 12.1 Bot Architecture

```
Telegram User
     │
     ▼ (sends message)
Telegram API
     │
     ▼ (webhook POST)
FastAPI /webhook/telegram
     │
     ▼ (routes to handler)
telegram_bot/handlers/
     │
     ├── /start → Welcome message + keyboard
     ├── /briefing → get_daily_brief() → formatted response
     ├── /hearings → get_upcoming_hearings() → formatted response
     ├── /tasks → get_pending_tasks() → formatted response
     ├── /case CS/234/2024 → get_case_details() → formatted response
     └── Free text → ADK agent → natural language response
     │
     ▼ (all read/write same Firestore)
Firestore ← → React Dashboard (real-time listeners)
```

### 12.2 Bot Commands

| Command | Description | Response |
|---------|-------------|----------|
| `/start` | Initialize bot | Welcome message + command keyboard |
| `/briefing` | Daily briefing | Today's hearings, overdue tasks, upcoming events |
| `/hearings` | Upcoming hearings | List of scheduled hearings with dates and times |
| `/tasks` | Pending tasks | List of tasks grouped by priority |
| `/overdue` | Overdue tasks only | Tasks past their due date |
| `/case <number>` | Case lookup | Full case details for the specified case |
| `/search <query>` | Search cases | Search by name, client, or case number |
| Free text | Natural language | Routes to ADK agent for conversational response |

### 12.3 Bot Implementation (`telegram_bot/bot.py`)

```python
"""
CasePilot Telegram Bot
- Registered via BotFather as @CasePilotBot
- Uses webhook mode (not polling) for production
- All data comes from the same Firestore as the web dashboard
"""

from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import (
    Application, CommandHandler, MessageHandler,
    CallbackQueryHandler, filters
)
from telegram.constants import ParseMode

# Import handlers
from handlers.start import start_handler
from handlers.briefing import briefing_handler
from handlers.hearings import hearings_handler
from handlers.tasks import tasks_handler
from handlers.case_lookup import case_handler
from handlers.natural_language import nl_handler

BOT_TOKEN = "your-bot-token"

def create_bot():
    app = Application.builder().token(BOT_TOKEN).build()

    # Command handlers
    app.add_handler(CommandHandler("start", start_handler))
    app.add_handler(CommandHandler("briefing", briefing_handler))
    app.add_handler(CommandHandler("hearings", hearings_handler))
    app.add_handler(CommandHandler("tasks", tasks_handler))
    app.add_handler(CommandHandler("overdue", overdue_handler))
    app.add_handler(CommandHandler("case", case_handler))

    # Free text → ADK agent
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, nl_handler))

    return app
```

### 12.4 Example Handler (`telegram_bot/handlers/briefing.py`)

```python
"""
/briefing command handler
Returns the daily brief in Telegram-formatted markdown.
"""

from telegram import Update
from telegram.ext import ContextTypes
from casepilot_agent.tools.firestore_tools import get_daily_brief

async def briefing_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    brief = get_daily_brief()

    # Format for Telegram
    msg = "🌅 *Daily Briefing*\n\n"

    # Today's hearings
    if brief.get("todays_hearings"):
        msg += "📅 *Today's Hearings:*\n"
        for h in brief["todays_hearings"]:
            msg += (
                f"  🔴 `{h['hearing_time']}` — {h['case_number']}\n"
                f"     {h['court_room']} | {h['purpose']}\n\n"
            )
    else:
        msg += "📅 No hearings today\n\n"

    # Overdue tasks
    if brief.get("overdue_tasks"):
        msg += "⚠️ *Overdue Tasks:*\n"
        for t in brief["overdue_tasks"]:
            msg += f"  🔴 {t['title']} (Due: {t['due_date']})\n"
        msg += "\n"

    # Tasks due today
    if brief.get("tasks_due_today"):
        msg += "✅ *Tasks Due Today:*\n"
        for t in brief["tasks_due_today"]:
            msg += f"  📌 {t['title']} — {t['assigned_to']}\n"
        msg += "\n"

    # Upcoming hearings
    if brief.get("upcoming_hearings"):
        msg += "📆 *Upcoming Hearings:*\n"
        for h in brief["upcoming_hearings"][:3]:
            msg += f"  📍 {h['hearing_date']} — {h['case_number']}\n"

    await update.message.reply_text(msg, parse_mode="Markdown")
```

### 12.5 Webhook Integration (`backend/api/telegram_webhook.py`)

```python
"""
Telegram webhook receiver.
FastAPI receives webhook POSTs from Telegram and routes to the bot.
"""

from fastapi import APIRouter, Request
from telegram import Update
from telegram_bot.bot import create_bot

router = APIRouter()
bot_app = create_bot()

@router.post("/telegram")
async def telegram_webhook(request: Request):
    data = await request.json()
    update = Update.de_json(data, bot_app.bot)
    await bot_app.process_update(update)
    return {"ok": True}
```

### 12.6 Telegram-Dashboard Sync

The sync between Telegram and the web dashboard is **automatic** because both read from and write to the same Firestore database. There is no separate sync mechanism needed.

```
Telegram: User sends "/tasks" → reads from Firestore tasks collection
Dashboard: User views Tasks page → real-time listener on same collection
Telegram: User creates task via chat → writes to Firestore
Dashboard: Real-time listener fires → UI updates immediately
Dashboard: User updates task status → writes to Firestore
Telegram: Next /tasks query → reads updated data
```

---

## 13. Tool Connection Manager UI (`ToolConnections.jsx`)

### 13.1 Visual Design

```
┌──────────────────────────────────────────────────────────────┐
│  🔗 Connected Tools                                          │
│  Manage your integrations and data sources                   │
│                                                              │
│  ACTIVE CONNECTIONS                                          │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ ☁️ Google Cloud Firestore          ✅ Connected         │  │
│  │   Primary database for cases, hearings, tasks          │  │
│  │   Last sync: 2 minutes ago                             │  │
│  │   [Configure] [Disconnect]                             │  │
│  ├────────────────────────────────────────────────────────┤  │
│  │ ⚖️ eCourts India MCP               ✅ Connected         │  │
│  │   264M+ cases, AI order analysis                       │  │
│  │   Credits remaining: 450                               │  │
│  │   [Configure] [Disconnect]                             │  │
│  ├────────────────────────────────────────────────────────┤  │
│  │ 📅 Google Calendar                  ✅ Connected         │  │
│  │   Auto-sync hearings to calendar                       │  │
│  │   Synced events: 5                                     │  │
│  │   [Configure] [Disconnect]                             │  │
│  ├────────────────────────────────────────────────────────┤  │
│  │ ✅ Google Tasks                     ✅ Connected         │  │
│  │   Sync pending tasks to Google Tasks                   │  │
│  │   Synced tasks: 3                                      │  │
│  │   [Configure] [Disconnect]                             │  │
│  ├────────────────────────────────────────────────────────┤  │
│  │ 💬 Telegram Bot                     ✅ Connected         │  │
│  │   @CasePilotBot — linked to this account               │  │
│  │   [Configure] [Disconnect]                             │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  AVAILABLE INTEGRATIONS                                      │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 📱 WhatsApp Business       🔜 Coming Soon              │  │
│  │   Receive briefings and updates via WhatsApp           │  │
│  ├────────────────────────────────────────────────────────┤  │
│  │ 📧 Gmail                   [+ Connect]                 │  │
│  │   Send case update emails to clients                   │  │
│  ├────────────────────────────────────────────────────────┤  │
│  │ 📊 Google Sheets           [+ Connect]                 │  │
│  │   Export case data and reports to spreadsheets         │  │
│  ├────────────────────────────────────────────────────────┤  │
│  │ 📄 Google Drive            [+ Connect]                 │  │
│  │   Store and access case documents                      │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### 13.2 Firestore `connected_tools` Collection

```
connected_tools/
├── id                (auto-generated)
├── user_id           (string)       Firebase Auth UID
├── tool_name         (string)       "google_calendar" | "google_tasks" | "ecourts" | "telegram"
├── status            (string)       "connected" | "disconnected" | "error"
├── config            (map)          Tool-specific configuration
│   ├── calendar_id   (string)       For Google Calendar
│   ├── task_list_id  (string)       For Google Tasks
│   ├── ecourts_token (string)       For eCourts MCP
│   └── telegram_chat_id (string)    For Telegram
├── last_sync_at      (timestamp)
├── sync_count        (number)       Number of items synced
├── connected_at      (timestamp)
└── updated_at        (timestamp)
```

---

## 14. Real-Time Sync Architecture

### 14.1 Firestore Real-Time Listeners (Frontend)

```javascript
// hooks/useFirestoreListener.js

import { useEffect } from "react";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase";

/**
 * Generic Firestore real-time listener hook.
 * Subscribes to a collection and updates the Zustand store on changes.
 *
 * Usage:
 *   useFirestoreListener("cases", [where("status", "==", "active")], caseStore.setCases)
 */
export function useFirestoreListener(collectionName, constraints = [], onUpdate) {
  useEffect(() => {
    const q = query(collection(db, collectionName), ...constraints);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      onUpdate(data);
    });

    return () => unsubscribe();
  }, [collectionName]);
}
```

### 14.2 What Updates in Real-Time

| User Action | Firestore Write | Dashboard Update |
|------------|----------------|-----------------|
| Chat: "Create a task for Anil" | Agent writes to `tasks` | Tasks tab updates, timeline updates |
| Chat: "Mark injunction task complete" | Agent writes to `tasks` | Task status changes, case detail updates |
| Telegram: Creates task via bot | Bot writes to `tasks` | Dashboard picks up change instantly |
| Upload file in dashboard | Backend writes to `case_files` | File list updates, timeline shows new event |
| Agent syncs hearing to Calendar | Writes `calendar_synced: true` to hearing | Hearing card shows "Synced" badge |

---

## 15. Authentication & Security

### 15.1 Firebase Authentication

```javascript
// services/firebase.js

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: "casepilot-yashu",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  provider.addScope("https://www.googleapis.com/auth/calendar");
  provider.addScope("https://www.googleapis.com/auth/tasks");
  const result = await signInWithPopup(auth, provider);
  return result.user;
}
```

### 15.2 OAuth Scopes Needed

| Scope | Purpose |
|-------|---------|
| `https://www.googleapis.com/auth/calendar` | Create/read calendar events |
| `https://www.googleapis.com/auth/tasks` | Create/read Google Tasks |
| `https://www.googleapis.com/auth/devstorage.read_write` | GCS file uploads |
| Firebase Auth (default) | User authentication |

---

## 16. Deployment — Cloud Run

### 16.1 Docker Compose (Development)

```yaml
# docker-compose.yml
version: "3.8"

services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "8000:8000"
    env_file: .env
    volumes:
      - ./casepilot_agent:/app/casepilot_agent
      - ./backend:/app/backend

  frontend:
    build:
      context: ./frontend
      dockerfile: ../Dockerfile.frontend
    ports:
      - "3000:80"
    depends_on:
      - backend

  telegram:
    build:
      context: .
      dockerfile: Dockerfile.telegram
    env_file: .env
    depends_on:
      - backend
```

### 16.2 Dockerfile.backend

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ ./backend/
COPY casepilot_agent/ ./casepilot_agent/
COPY mcp_server/ ./mcp_server/

EXPOSE 8000

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 16.3 Dockerfile.frontend

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json .
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

### 16.4 Cloud Run Deployment Commands

```bash
# Build and deploy backend
gcloud builds submit --tag gcr.io/casepilot-yashu/casepilot-backend
gcloud run deploy casepilot-backend \
  --image gcr.io/casepilot-yashu/casepilot-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "GOOGLE_CLOUD_PROJECT=casepilot-yashu"

# Build and deploy frontend
gcloud builds submit --tag gcr.io/casepilot-yashu/casepilot-frontend ./frontend
gcloud run deploy casepilot-frontend \
  --image gcr.io/casepilot-yashu/casepilot-frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

---

## 17. Database Schema Additions

### New Collections (in addition to existing 5)

```
Firestore Database (casepilot-yashu)
│
├── 📂 case_files           — Uploaded documents and files
│   ├── case_number          (string)
│   ├── filename             (string)
│   ├── file_size            (number)
│   ├── file_type            (string)
│   ├── category             (string)     evidence | drafts | filings | correspondence
│   ├── gcs_path             (string)
│   ├── download_url         (string)
│   ├── uploaded_by          (string)
│   ├── uploaded_at          (timestamp)
│   └── notes                (string)
│
├── 📂 connected_tools       — User's connected integrations
│   ├── user_id              (string)
│   ├── tool_name            (string)
│   ├── status               (string)
│   ├── config               (map)
│   ├── last_sync_at         (timestamp)
│   └── connected_at         (timestamp)
│
├── 📂 chat_history          — Conversation logs
│   ├── user_id              (string)
│   ├── session_id           (string)
│   ├── messages             (array)
│   │   ├── role             (string)     user | assistant
│   │   ├── content          (string)
│   │   ├── timestamp        (timestamp)
│   │   └── actions          (array)      Action buttons shown
│   └── created_at           (timestamp)
│
└── 📂 user_settings         — User preferences
    ├── user_id              (string)
    ├── display_name         (string)
    ├── notification_prefs   (map)
    │   ├── telegram_enabled (boolean)
    │   ├── calendar_auto_sync (boolean)
    │   └── daily_brief_time (string)
    ├── theme                (string)     light | dark
    └── updated_at           (timestamp)
```

---

## 18. API Endpoint Reference

### Cases
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cases` | List all active cases |
| GET | `/api/cases/{case_number}` | Get case details |
| POST | `/api/cases` | Create new case |
| PUT | `/api/cases/{case_number}` | Update case |

### Hearings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/hearings` | List all upcoming hearings |
| GET | `/api/hearings/case/{case_number}` | Hearings for a specific case |
| POST | `/api/hearings` | Create new hearing |
| PUT | `/api/hearings/{id}` | Update hearing |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List all pending tasks |
| GET | `/api/tasks/overdue` | List overdue tasks |
| GET | `/api/tasks/case/{case_number}` | Tasks for a specific case |
| POST | `/api/tasks` | Create new task |
| PUT | `/api/tasks/{id}/status` | Update task status |

### Files
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/files/upload` | Upload file to GCS |
| GET | `/api/files/case/{case_number}` | List files for a case |
| GET | `/api/files/{id}/download` | Get signed download URL |
| DELETE | `/api/files/{id}` | Delete file |

### Calendar Sync
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/calendar/sync-hearing/{id}` | Sync single hearing |
| POST | `/api/calendar/sync-all` | Sync all upcoming hearings |
| GET | `/api/calendar/status` | Check sync status |

### Google Tasks Sync
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/google-tasks/sync-task/{id}` | Sync single task |
| POST | `/api/google-tasks/sync-all` | Sync all pending tasks |
| GET | `/api/google-tasks/status` | Check sync status |

### Chat
| Type | Endpoint | Description |
|------|----------|-------------|
| WebSocket | `/ws/chat` | Real-time chat with ADK agent |

### Research
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/research/precedents/{subject}` | Search precedents |
| GET | `/api/research/notes/{query}` | Search case notes |
| POST | `/api/research/save-note` | Save research as case note |

### Telegram
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/webhook/telegram` | Telegram bot webhook receiver |

### Daily Brief
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/brief` | Get daily briefing data |

---

## 19. Component Specifications

### 19.1 Color System

```javascript
// utils/constants.js

export const PRIORITY_COLORS = {
  urgent: { bg: "bg-red-50", border: "border-red-500", text: "text-red-700", dot: "bg-red-500" },
  high:   { bg: "bg-orange-50", border: "border-orange-500", text: "text-orange-700", dot: "bg-orange-500" },
  normal: { bg: "bg-yellow-50", border: "border-yellow-500", text: "text-yellow-700", dot: "bg-yellow-500" },
  low:    { bg: "bg-gray-50", border: "border-gray-300", text: "text-gray-600", dot: "bg-gray-400" },
};

export const STATUS_COLORS = {
  active:    { bg: "bg-green-100", text: "text-green-800" },
  closed:    { bg: "bg-gray-100", text: "text-gray-800" },
  pending:   { bg: "bg-yellow-100", text: "text-yellow-800" },
  in_progress: { bg: "bg-blue-100", text: "text-blue-800" },
  completed: { bg: "bg-green-100", text: "text-green-800" },
  scheduled: { bg: "bg-blue-100", text: "text-blue-800" },
  overdue:   { bg: "bg-red-100", text: "text-red-800" },
};

export const TIMELINE_COLORS = {
  case_filed:        "#3B82F6", // Blue
  hearing_completed: "#10B981", // Green
  hearing_scheduled: "#F59E0B", // Amber
  task_created:      "#6B7280", // Gray
  task_completed:    "#10B981", // Green
  task_overdue:      "#EF4444", // Red
  note_added:        "#8B5CF6", // Purple
  file_uploaded:     "#14B8A6", // Teal
};

export const CASE_TYPE_ICONS = {
  property: "Building2",
  criminal: "Gavel",
  corporate: "Briefcase",
  family: "Users",
};

export const DATE_FORMAT = "DD-MM-YYYY"; // Indian format
```

### 19.2 Key Component Props

```typescript
// Type definitions for reference (use JSDoc in actual code)

interface Case {
  id: string;
  case_number: string;
  case_title: string;
  court_name: string;
  court_type: "district" | "high_court";
  case_type: "property" | "criminal" | "corporate" | "family";
  client_name: string;
  opponent_name: string;
  opponent_lawyer: string;
  judge_name: string;
  status: "active" | "closed";
  filing_date: string;
  priority: "urgent" | "high" | "normal" | "low";
  notes: string;
}

interface Hearing {
  id: string;
  case_number: string;
  hearing_date: string;
  hearing_time: string;
  court_room: string;
  purpose: string;
  status: "scheduled" | "completed";
  outcome?: string;
  calendar_synced?: boolean;
}

interface Task {
  id: string;
  case_number: string;
  title: string;
  description: string;
  assigned_to: string;
  due_date: string;
  priority: "urgent" | "high" | "normal" | "low";
  status: "pending" | "in_progress" | "completed";
  task_type: string;
  google_tasks_synced?: boolean;
}

interface TimelineEvent {
  date: string;
  type: string;
  title: string;
  description: string;
  case_number: string;
  color: string;
  icon: string;
}

interface CaseFile {
  id: string;
  case_number: string;
  filename: string;
  file_size: number;
  file_type: string;
  category: string;
  download_url: string;
  uploaded_by: string;
  uploaded_at: string;
}
```

---

## 20. Implementation Order & Phases

### Phase 1: Core Dashboard (Days 1-2) — PRIORITY

**Goal: Working dashboard with chat that you can demo**

1. Set up React + Vite + Tailwind project in `frontend/`
2. Set up FastAPI project in `backend/`
3. Configure Firebase JS SDK for Firestore real-time listeners
4. Build the Layout component (sidebar + main + chat panel)
5. Build Dashboard page (daily brief view with stat cards)
6. Build CaseList page (all cases as cards)
7. Build ChatPanel with WebSocket connection to backend
8. Connect ADK agent to FastAPI via agent_service.py
9. Test: User chats in dashboard, agent responds, Firestore updates reflect in UI

### Phase 2: Per-Case Dashboard + Timeline (Days 2-3)

**Goal: Deep case view with journey visualization**

1. Build CaseDetail page with tabbed layout
2. Build Overview tab with all case information
3. Build Hearings tab (per-case)
4. Build Tasks tab (per-case)
5. Build CaseTimeline component (vertical timeline)
6. Build the timeline data aggregation hook
7. Test: Click case → see full dashboard with timeline

### Phase 3: Google Calendar + Tasks (Day 3)

**Goal: Smart sync suggestions in chat**

1. Enable Google Calendar API and Tasks API in GCP console
2. Add OAuth scopes to Firebase Auth
3. Build calendar_tools.py (ADK function tools)
4. Build google_tasks_tools.py (ADK function tools)
5. Register new tools with the root agent
6. Add Calendar/Tasks sync buttons in ChatPanel
7. Build CalendarSyncButton and TaskSyncButton components
8. Test: Agent suggests calendar sync → user clicks → events created

### Phase 4: File Management (Day 3-4)

**Goal: Upload and manage case documents**

1. Create GCS bucket
2. Build storage_service.py (upload/download/delete)
3. Build files.py API endpoints
4. Build FileUploadArea component (drag-and-drop)
5. Build FileCard component
6. Build Documents tab in CaseDetail
7. Add file events to timeline
8. Test: Upload file → appears in case documents and timeline

### Phase 5: Telegram Bot (Day 4)

**Goal: Working Telegram bot synced with dashboard**

1. Create bot via BotFather
2. Build telegram_bot/ module with handlers
3. Set up webhook endpoint in FastAPI
4. Implement /briefing, /hearings, /tasks, /case commands
5. Implement free-text → ADK agent routing
6. Set webhook URL after Cloud Run deployment
7. Test: Send /briefing in Telegram → get same data as dashboard

### Phase 6: Tool Connections UI + Polish (Day 4-5)

**Goal: Professional tool management page and final polish**

1. Build ToolConnections page
2. Build connected_tools Firestore collection
3. Add connection status indicators
4. Add Settings page with user preferences
5. Polish all UI components
6. Test full flow end-to-end

### Phase 7: Deployment + Demo Prep (Day 5)

**Goal: Live URL and polished demo**

1. Build Docker containers
2. Deploy to Cloud Run
3. Configure custom domain (optional)
4. Set Telegram webhook to Cloud Run URL
5. Prepare demo script and walkthrough
6. Record backup demo video

---

## Environment Variables (.env)

```bash
# Google Cloud
GOOGLE_CLOUD_PROJECT=casepilot-yashu
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=./casepilot-yashu-key.json

# Gemini / Vertex AI
GOOGLE_GENAI_USE_VERTEXAI=TRUE

# Firebase (Frontend)
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=casepilot-yashu.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=casepilot-yashu
VITE_FIREBASE_STORAGE_BUCKET=casepilot-yashu.appspot.com
VITE_FIREBASE_MESSAGING_ID=your-messaging-id
VITE_FIREBASE_APP_ID=your-app-id

# GCS
GCS_BUCKET_NAME=casepilot-files-casepilot-yashu

# eCourts MCP
ECOURTS_MCP_URL=https://mcp.ecourtsindia.com/mcp?token=your-token

# Telegram
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
TELEGRAM_WEBHOOK_URL=https://casepilot-backend-xxxxx.run.app/webhook/telegram

# Backend
BACKEND_URL=http://localhost:8000
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000/ws/chat
```

---

## Key Design Decisions Summary

1. **React + Tailwind over Next.js**: Simpler, faster for hackathon. No SSR needed since all data comes from Firestore real-time listeners.

2. **FastAPI over Express**: Same language (Python) as ADK agent. Avoids language boundary. Native async/await + WebSocket support.

3. **Firestore real-time listeners over polling**: Dashboard updates instantly when agent modifies data. No extra sync code needed between Telegram and web.

4. **Google APIs directly over community MCP**: More reliable. Uses official `google-api-python-client`. Better for hackathon judges (shows Google ecosystem depth).

5. **Webhook Telegram over polling**: Production-ready. Works with Cloud Run. Lower latency.

6. **GCS over Firebase Storage**: Same underlying service, but GCS gives more control for server-side operations and signed URLs.

7. **Timeline computed dynamically**: No separate collection needed. Aggregates from existing collections. Fewer writes, always up-to-date.

8. **Zustand over Redux**: Minimal boilerplate. Perfect for this project size. Easy Firestore integration.

---

*This blueprint is designed to be fed into an AI coding assistant in Antigravity IDE. Each section is self-contained with enough context for the AI to generate working code. Start with Phase 1 and iterate.*
