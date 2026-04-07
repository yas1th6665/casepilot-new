# CasePilot: Detailed Project Report

---

## 1. Project Overview

**CasePilot** is a sophisticated, AI-powered multi-agent legal case management assistant specifically designed for **Indian lawyers**. It streamlines the day-to-day operations of a law office by automating case tracking, hearing schedules, task management, and legal research through a natural language interface.

Built using the **Google Agent Development Kit (ADK)** and powered by the **Gemini 2.5 Flash** model, CasePilot acts as a virtual legal clerk and researcher that understands the nuances of the Indian legal system. The project follows a **Track 1 + Track 2** architecture — combining ADK-native function tools with a standalone **Model Context Protocol (MCP) server**. Furthermore, it is integrated with the **eCourts India MCP**, providing real-time access to the nation's largest legal database.

---

## 2. Problem Statement

### The Challenge Facing Indian Lawyers

Indian lawyers — especially solo practitioners, junior advocates, and small-firm teams — face a unique set of operational challenges that directly impact case outcomes and client satisfaction:

| # | Pain Point | Real-World Impact |
|---|-----------|-------------------|
| 1 | **Manual case tracking across dozens of matters** | Critical hearing dates are missed, resulting in adjournments, cost orders, and client dissatisfaction. |
| 2 | **No centralized hearing calendar** | Lawyers rely on personal diaries, loose papers, or memory to track court dates across multiple courts (District, High Court, Tribunals). |
| 3 | **Unstructured task delegation** | Work assigned verbally to juniors and paralegals gets lost. Deadlines for filing written arguments, counter-affidavits, or RTI responses are missed. |
| 4 | **Scattered legal research** | Relevant Supreme Court and High Court precedents are buried in physical law books, disconnected notes, or unorganized digital files. Finding the right citation at the right time is often a race against the clock. |
| 5 | **No morning briefing mechanism** | Lawyers start their day without a clear picture of today's hearings, overdue tasks, or urgent deadlines — leading to reactive rather than proactive practice management. |
| 6 | **Language and process barriers with technology** | Many existing legal-tech tools require complex interfaces, forms, or specialized training. Indian lawyers need solutions they can interact with in **plain, conversational English**. |

### CasePilot's Solution

CasePilot directly addresses every one of these pain points by providing:

- A **conversational AI interface** — no forms, no menus, just natural language.
- A **centralized, cloud-synced database** (Firestore) for all case data, hearings, tasks, and research.
- **Intelligent sub-agents** that specialize in court tracking, legal research, and task management.
- **Automated urgency detection** — the system highlights what's critical TODAY without being asked.
- **Extensibility via MCP** — any AI-powered application can connect to CasePilot's data layer.
- **Real-time eCourts Integration** — Instant access to 264 million+ cases and AI-powered order analysis.

---

## 3. Core Objectives

| Objective | Description |
|-----------|-------------|
| **Centralized Case Management** | Provide a single source of truth for all active cases, hearings, and legal documents. |
| **Automated Scheduling** | Automatically track court hearing dates and alert the legal team about upcoming commitments. |
| **Efficient Task Delegation** | Simplify work assignment to juniors and paralegals with automated tracking and reminders. |
| **Intelligent Legal Research** | Enable quick lookup of case notes and real-time search of 264M+ Indian court cases via eCourts. |
| **Seamless Interaction** | Allow lawyers to interact with their entire practice data using simple, conversational English. |
| **Cross-Platform Extensibility** | Expose all functionality via MCP and integrate external legal APIs for a complete ecosystem. |

---

## 4. Key Features & How They Help Lawyers

### 📅 Court Schedule Tracking

| Capability | Description | Benefit to Lawyer |
|-----------|-------------|-------------------|
| Automated Calendaring | Monitors hearing dates, times, and courtroom numbers for all active cases. | **Never miss a hearing.** The lawyer can ask "What hearings do I have this week?" and get a complete answer in seconds. |
| Smart Urgency Alerts | Hearings scheduled for **TODAY** are marked as 🔴 URGENT; **TOMORROW** hearings as 🟡 UPCOMING. | **Instant situational awareness.** Critical hearings are surfaced automatically — no need to check a diary. |
| Hearing History | Keeps a record of past hearings and their outcomes (e.g., "Documents accepted, next date 02-04-2026"). | **Complete audit trail.** Useful for client reporting and preparing for the next hearing. |

### 🌅 Daily Briefing

| Capability | Description | Benefit to Lawyer |
|-----------|-------------|-------------------|
| Morning Overview | Provides a concise summary of the day's court appearances, tasks due today, and overdue tasks. | **Start the day prepared.** A single command like "Good morning" gives the lawyer their entire day's agenda. |
| Upcoming Preview | Shows the next 3 upcoming hearings beyond today. | **Plan ahead.** Lawyers can see what's coming in the next few days and prepare accordingly. |
| Overdue Alerts | Automatically surfaces tasks that have passed their deadline. | **Catch missed deadlines immediately** before they escalate. |

### ⚖️ Legal Research & Case Notes

| Capability | Description | Benefit to Lawyer |
|-----------|-------------|-------------------|
| Precedent Lookup | Integrated search for landmark judgments (Supreme Court/High Court) with full citations and key principles. | **Find relevant law instantly.** Instead of flipping through law books, the lawyer asks "Any Supreme Court judgments on Section 138 NI Act?" and gets cited results. |
| Case Note Search | Keyword-based search across internal case notes, site visit reports, meeting minutes, and research documents. | **Never lose internal research.** Notes from site visits, client meetings, and junior research are all searchable. |
| eCourts India Search | Real-time search across 264M+ cases in District, High Court, and Supreme Court. | **Live Legal Intelligence.** Access the entire history of any case in India, including the latest orders and judgments. |
| AI Order Analysis | Deep 7-level AI analysis of court orders: executive summary, statutes cited, and judge insights. | **Summarize 50-page orders in seconds.** Get the gist of any complex court order without reading the whole document. |
| Citation Management | Ensures all legal references follow standard Indian legal formatting (e.g., "(2020) 5 SCC 1"). | **Court-ready citations.** References can be directly used in legal arguments and written submissions. |

### ✅ Task Management

| Capability | Description | Benefit to Lawyer |
|-----------|-------------|-------------------|
| Work Assignment | Create tasks through natural language (e.g., "Assign Anil to draft the injunction by March 31"). | **Effortless delegation.** No forms, no apps — just tell CasePilot what needs to be done. |
| Priority-Based Tracking | Tasks are grouped by urgency: 🔴 Urgent → 🟠 High → 🟡 Normal → ⚪ Low. | **Focus on what matters most.** The lawyer always sees the most critical tasks first. |
| Status Updates | Update task progress from "pending" → "in_progress" → "completed". | **Track work across the team.** Know exactly where each task stands. |
| Overdue Reminders | Automatically surfaces tasks past their due date. | **Accountability.** Missed deadlines don't slip through the cracks. |

### 📁 Case Information Management

| Capability | Description | Benefit to Lawyer |
|-----------|-------------|-------------------|
| Detailed Profiles | Stores comprehensive case data: case numbers, parties, judge names, opponent lawyers, filing dates, court type, and internal notes. | **Everything in one place.** Before heading to court, the lawyer can pull up the complete case file instantly. |
| Searchable Database | Look up case details by name, case number, or client name. | **Instant access.** No more digging through physical files or spreadsheets. |
| Active Case Overview | List all active cases sorted by priority. | **Portfolio view.** See the entire practice at a glance with priority ordering. |

### ✨ Premium Chat Experience

| Capability | Description | Benefit to Lawyer |
|-----------|-------------|-------------------|
| Resizable Chat Panel | Drag-to-resize chat window with smart snap points (320px to 800px). | **Customizable workspace.** Expand for deep research, collapse for quick updates. |
| Glassmorphism UI | Modern translucent design with background blurs and subtle gradients. | **Eye-catching & professional.** High-end aesthetic that keeps the lawyer engaged. |
| Contextual Visibility | Chat automatically appears on Dashboard/Research but hides on pure management pages. | **Focused workflow.** AI assistance is there when you need it, and out of the way when you don't. |
| Auto-Scroll & Avatars | Messages auto-scroll to the bottom, with clear AI and User identity avatars. | **Natural conversation flow.** Easily track long legal reasoning sessions. |

### 📚 Interactive Help & Guide

| Capability | Description | Benefit to Lawyer |
|-----------|-------------|-------------------|
| Platform Tour | Interactive guide explaining Court Tracking, Legal Research, and Tasks. | **Rapid onboarding.** New users can understand the app in under 2 minutes. |
| Pro Tips | Natural language command examples for common lawyer workflows. | **Master the AI.** Learn how to get the most out of the conversational interface. |
| Visible Shortcut | Persistent "How to use CasePilot?" link in the sidebar. | **Support at your fingertips.** Never get stuck while managing a case. |

---

## 5. Technical Architecture

### 5.1 Multi-Agent System (MAS)

CasePilot uses a **hierarchical agent structure** powered by Google ADK. Each agent is specialized for a specific legal domain, ensuring expert-level handling of every query type:

```
                        ┌─────────────────────┐
                        │   ROOT AGENT        │
                        │   (CasePilot)       │
                        │   gemini-2.5-flash  │
                        └────────┬────────────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
          ┌─────────▼──┐  ┌─────▼──────┐  ┌──▼───────────┐
          │  Court      │  │  Legal     │  │  Task        │
          │  Tracker    │  │  Research  │  │  Manager     │
          │  Agent      │  │  Agent     │  │  Agent       │
          └─────────────┘  └─────┬──────┘  └──────────────┘
                                 │
                        ┌────────▼───────┐
                        │  eCourts India  │
                        │  MCP Server    │
                        │  (22+ Tools)   │
                        └────────────────┘
```

#### Root Agent — `casepilot`
- **Role**: Primary interface that routes user queries to the appropriate sub-agent or handles general overview tasks directly.
- **Direct Tools**: `get_daily_brief()`, `get_case_details()`, `get_all_active_cases()`
- **Routing Logic**:
  - Hearing/schedule/court questions → delegates to `court_tracker`
  - Precedents/case notes/legal research/eCourts/case search → delegates to `legal_research`
  - Tasks/assignments/deadlines → delegates to `task_manager`
  - "Good morning" / daily brief / overview → handles directly

#### Court Tracker Agent — `court_tracker`
- **Role**: Manages all hearing schedules, court dates, and courtroom information.
- **Tools Used**: `get_upcoming_hearings()`, `get_case_details()`, `get_all_active_cases()`
- **Special Behavior**: Marks TODAY hearings as 🔴 URGENT and TOMORROW as 🟡 UPCOMING. Displays dates in DD-MM-YYYY format.

#### Legal Research Agent — `legal_research`
- **Role**: Searches through internal case notes and finds relevant Supreme Court/High Court precedents. Also connects to eCourts India for national case search.
- **Tools Used**: `search_case_notes()`, `search_precedents()`, `get_case_details()`, plus **22 eCourts MCP tools**.
- **Special Behavior**: Always cites full case citation (e.g., "(2020) 5 SCC 1"), mentions court and year, and focuses exclusively on Indian law. Distinguishes between results from Local DB and eCourts India.

#### Task Manager Agent — `task_manager`
- **Role**: Creates, tracks, and updates office tasks and work assignments.
- **Tools Used**: `get_pending_tasks()`, `get_overdue_tasks()`, `create_task()`, `update_task_status()`
- **Special Behavior**: Shows overdue tasks FIRST, groups by priority (🔴 → 🟠 → 🟡 → ⚪), and confirms all details before creating a new task.

### 5.2 MCP Server (Track 2)

CasePilot includes a standalone **MCP (Model Context Protocol) server** that exposes the Firestore database as standardized MCP tools. This allows **any MCP-compatible AI agent or application** to access CasePilot's data — not just the ADK agent.

**Server Name**: `casepilot-mcp-server`

**Exposed MCP Tools**:

| Tool Name | Description | Input Schema |
|-----------|-------------|-------------|
| `get_upcoming_hearings` | Get all upcoming scheduled court hearings sorted by date. | No required inputs. |
| `get_case_details` | Get case details by case number or client name. | `search_term` (string, required) |
| `get_pending_tasks` | Get all pending/in-progress tasks sorted by priority. | No required inputs. |
| `create_task` | Create a new task/assignment for a legal case. | `case_number`, `title`, `assigned_to`, `due_date` (required); `priority` (optional). |
| `search_precedents` | Search Indian legal precedents by subject area. | `subject_area` (string, required): property, criminal, contract, constitutional, or family. |
| `get_daily_brief` | Get complete daily briefing: today's hearings, overdue tasks, urgent items. | No required inputs. |

**Transport**: stdio (standard input/output) — the server communicates over standard I/O streams, making it easy to integrate with any MCP client.

### 5.3 External MCP Integration: eCourts India

CasePilot now integrates with the **eCourts India MCP**, the nation's largest legal intelligence platform. This connection bridges the gap between deep local data and massive public legal records.

**Connection Endpoint**: `https://mcp.ecourtsindia.com/mcp?token=...`

**Key eCourts Tools (Selected from 22 Available)**:

| Category | Tools | Utility |
|----------|-------|---------|
| **Case Intelligence** | `search_cases`, `get_case_details` | Search 264M+ cases across all Indian courts. |
| **AI Order Analysis** | `get_order_ai_analysis` | Deep 7-level AI analysis of any court order/judgment. |
| **Combined Search** | `get_case_with_latest_order` | Fetch case details + AI order analysis in a single call. |
| **Court Discovery** | `get_states`, `get_courts`, `get_districts` | **FREE tools** to navigate the hierarchy of 28,000+ courts. |
| **Case Type Enums** | `lookup_enum("CaseTypeEnum")` | Find valid codes like `WP_C`, `CS`, `BA` for accurate searching. |

**Why this matters**: CasePilot is no longer limited to a local database. It can now act as a gateway to the entire Indian judiciary, performing real-time research and monitoring.

### 5.3 Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **AI Model** | [Gemini 2.5 Flash](https://deepmind.google/technologies/gemini/) (via Vertex AI) | Powers all agent reasoning, natural language understanding, and response generation. |
| **Agent Framework** | [Google ADK](https://github.com/google/adk) (Agent Development Kit) v1.0+ | Provides the multi-agent hierarchy, tool binding, and conversation management. |
| **Database** | [Google Cloud Firestore](https://firebase.google.com/docs/firestore) v2.16+ | NoSQL cloud database for real-time data storage and querying. |
| **Integration Protocol** | [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) v1.0+ | Standardized protocol for both internal tool exposure and external legal API integration. |
| **External Legal API**| [eCourts India API](https://ecourtsindia.com) | Access to 264M+ cases, orders, and AI-powered judgments. |
| **Cloud Platform** | Google Cloud Platform (project: `casepilot-yashu`, region: `us-central1`) | Hosting, authentication, and Firestore backend. |
| **Language** | Python 3.11+ | Core application language. |
| **Frontend Framework**| React 18 + Vite | Modern, fast reactive user interface. |
| **Styling** | Tailwind CSS + Glassmorphism | Custom design tokens for a premium legal-tech aesthetic. |
| **Containerization** | Docker (python:3.11-slim) | Production deployment via `adk web --port 8080`. |
| **Environment Management** | python-dotenv | Loads configuration from `.env` file. |
| **Web Server** | Uvicorn v0.29+ | ASGI server for serving the ADK web interface. |

### 5.4 UI/UX Architecture

CasePilot isn't just a database; it's a **premium workplace**. The interface uses modern design principles to reduce cognitive load:

1.  **Attention-Grabbing Sidebar**: A "How to use CasePilot?" section is placed prominently above the active case list to guide new users.
2.  **Snap-Point Resizing**: The chat panel uses an intelligent snapping mechanism (320, 440, 560, 680, 800 pixels) allowing the lawyer to balance screen space between the data table and the AI conversation.
3.  **Visual DNA**: 
    - **Palette**: Deep "Courtroom Blue" (#24286f) combined with "Legal Brass" (#a97a2b) for a sense of authority.
    - **Materials**: Use of `backdrop-blur` and translucent cards to create a layered, modern depth.
    - **Feedback**: Animated pinging dots in the "LIVE" status indicator and bouncing-dot thinking indicators.

---

## 6. Data Model

CasePilot organizes information into **five primary Firestore collections**:

```
Firestore Database (casepilot-yashu)
│
├── 📂 cases              — Metadata about legal proceedings
│   ├── case_number        (string)     e.g., "CS/234/2024"
│   ├── case_title         (string)     e.g., "Sharma vs. Municipal Corporation"
│   ├── court_name         (string)     e.g., "District Court Warangal"
│   ├── court_type         (string)     district | high_court
│   ├── case_type          (string)     property | criminal | corporate | family
│   ├── client_name        (string)     e.g., "Rajesh Sharma"
│   ├── opponent_name      (string)     e.g., "Municipal Corporation"
│   ├── opponent_lawyer    (string)     e.g., "Adv. P. Kumar"
│   ├── judge_name         (string)     e.g., "Hon. Justice K. Venkatesh"
│   ├── status             (string)     active | closed
│   ├── filing_date        (string)     YYYY-MM-DD
│   ├── priority           (string)     urgent | high | normal | low
│   ├── notes              (string)     Internal case summary
│   ├── created_at         (timestamp)
│   └── updated_at         (timestamp)
│
├── 📂 hearings            — Specific court dates and their outcomes
│   ├── case_number        (string)
│   ├── hearing_date       (string)     YYYY-MM-DD
│   ├── hearing_time       (string)     HH:MM
│   ├── court_room         (string)     e.g., "Court Room 5"
│   ├── purpose            (string)     e.g., "Arguments on interim injunction"
│   ├── status             (string)     scheduled | completed
│   ├── outcome            (string)     For completed hearings
│   ├── notes              (string)
│   └── created_at         (timestamp)
│
├── 📂 tasks               — Internal office work assignments
│   ├── case_number        (string)
│   ├── title              (string)
│   ├── description        (string)
│   ├── assigned_to        (string)     "self" | "Junior - Anil" | "Paralegal - Meena"
│   ├── due_date           (string)     YYYY-MM-DD
│   ├── priority           (string)     urgent | high | normal | low
│   ├── status             (string)     pending | in_progress | completed
│   ├── task_type          (string)     drafting | research | filing | client_communication | court_visit
│   ├── created_at         (timestamp)
│   └── completed_at       (timestamp)
│
├── 📂 case_notes          — Internal observations, research, and meeting minutes
│   ├── case_number        (string)
│   ├── note_type          (string)     observation | research | client_meeting
│   ├── title              (string)
│   ├── content            (string)     Full text of the note
│   ├── author             (string)     e.g., "Advocate Satyanarayana"
│   └── created_at         (timestamp)
│
└── 📂 precedents          — Library of relevant legal judgments
    ├── case_citation      (string)     e.g., "(2020) 5 SCC 1"
    ├── case_name          (string)     e.g., "Indore Development Authority vs. Manoharlal"
    ├── court              (string)     e.g., "Supreme Court of India"
    ├── year               (integer)
    ├── subject_area       (string)     property | criminal | family
    ├── summary            (string)     Detailed judgment summary
    ├── key_principles     (string)     Comma-separated key legal principles
    └── created_at         (timestamp)
```

---

## 7. Seed Data — What's Pre-Loaded in the Application

The application comes with a comprehensive seed dataset (`seed_data.py`) that populates Firestore with realistic Indian legal data for demonstration and testing purposes. Below is a complete inventory of all seeded data.

### 7.1 Cases (5 cases)

| # | Case Number | Title | Court | Type | Client | Priority |
|---|------------|-------|-------|------|--------|----------|
| 1 | CS/234/2024 | Sharma vs. Municipal Corporation — Property Dispute | District Court Warangal | Property | Rajesh Sharma | 🟠 High |
| 2 | CRL/567/2023 | State vs. Anand Kumar — Cheque Bounce (NI Act 138) | Metropolitan Magistrate Court Hyderabad | Criminal | Anand Kumar | 🟡 Normal |
| 3 | WP/1234/2024 | Lakshmi Devi vs. Revenue Dept — Land Acquisition Compensation | High Court of Telangana, Hyderabad | Property | Lakshmi Devi | 🔴 Urgent |
| 4 | OS/89/2025 | ABC Enterprises vs. XYZ Ltd — Contract Breach | Commercial Court Hyderabad | Corporate | ABC Enterprises | 🟠 High |
| 5 | MC/45/2024 | Priya vs. Suresh — Maintenance and Custody | Family Court Warangal | Family | Priya Devi | 🟡 Normal |

**Coverage**: The seed data covers **5 different case types** (property, criminal, corporate, family) across **4 different courts** (District Court, Metropolitan Magistrate Court, High Court, Commercial Court) in **2 cities** (Warangal, Hyderabad), representing the diverse case portfolio of a typical Indian lawyer.

### 7.2 Hearings (6 hearings)

| # | Case Number | Date | Time | Court Room | Purpose | Status |
|---|------------|------|------|-----------|---------|--------|
| 1 | CS/234/2024 | 02-04-2026 | 10:30 | Court Room 5 | Arguments on interim injunction application | Scheduled |
| 2 | CRL/567/2023 | 03-04-2026 | 11:00 | Court Room 12 | Cross examination of complainant witness | Scheduled |
| 3 | WP/1234/2024 | 01-04-2026 | 10:00 | Court Room 3 | Final arguments on compensation amount | Scheduled |
| 4 | OS/89/2025 | 05-04-2026 | 14:00 | Court Room 8 | Mediation session — first attempt | Scheduled |
| 5 | MC/45/2024 | 04-04-2026 | 11:30 | Court Room 2 | Recording of evidence — client's testimony | Scheduled |
| 6 | CS/234/2024 | 25-03-2026 | 10:30 | Court Room 5 | Document submission | ✅ Completed |

**Note**: The seed data includes **5 scheduled (upcoming) hearings** spread across consecutive days and **1 completed hearing** with an outcome record, simulating a realistic week in a lawyer's calendar.

### 7.3 Tasks (5 tasks)

| # | Case | Task | Assigned To | Due Date | Priority | Status | Type |
|---|------|------|-------------|----------|----------|--------|------|
| 1 | CS/234/2024 | Draft interim injunction application with supporting documents | Junior — Anil | 31-03-2026 | 🔴 Urgent | Pending | Drafting |
| 2 | CS/234/2024 | Collect property survey report from client Rajesh Sharma | Self | 31-03-2026 | 🟠 High | Pending | Client Communication |
| 3 | CRL/567/2023 | Prepare cross-examination questions for complainant | Self | 02-04-2026 | 🟠 High | In Progress | Research |
| 4 | WP/1234/2024 | File written arguments compilation with court registry | Paralegal — Meena | 01-04-2026 | 🔴 Urgent | Pending | Filing |
| 5 | OS/89/2025 | Review mediation proposal sent by opponent's counsel | Self | 03-04-2026 | 🟡 Normal | Pending | Research |

**Coverage**: Tasks demonstrate **4 different task types** (drafting, client_communication, research, filing), **3 team members** (Self, Junior — Anil, Paralegal — Meena), and a mix of statuses showing both pending and in-progress work.

### 7.4 Case Notes (4 notes)

| # | Case Number | Type | Title | Author |
|---|------------|------|-------|--------|
| 1 | CS/234/2024 | Observation | Site Visit Findings — March 20, 2026 | Advocate Satyanarayana |
| 2 | CS/234/2024 | Research | Applicable Sections and Limitation Analysis | Junior — Anil |
| 3 | WP/1234/2024 | Client Meeting | Client Meeting — Compensation Discussion | Advocate Satyanarayana |
| 4 | CRL/567/2023 | Research | Jurisdiction Analysis — Cheque Bounce Case | Junior — Anil |

**Details of each note**:
- **Site Visit Findings**: Documents a physical visit to the disputed property. Records that the municipal wall encroaches 3 feet into client's land. Includes mention of photographic evidence (20 photos) and neighbor testimony confirming boundary markers were moved during 2019 road widening.
- **Limitation Analysis**: Legal research on applicable sections — Section 5 of Limitation Act, Section 6 of Specific Relief Act, and potential defenses under Municipal Corporations Act. Identifies RTI as a source for municipal records.
- **Compensation Discussion**: Records client demands (Rs. 50 lakhs for 2 acres), government offer (Rs. 15 lakhs total), and market rate analysis (Rs. 30-35 lakhs/acre). References Section 26 of Right to Fair Compensation Act 2013 and estimates total claim at Rs. 60-70 lakhs including 100% solatium.
- **Jurisdiction Analysis**: Identifies a critical jurisdictional challenge in the cheque bounce case based on the Supreme Court judgment in *Dashrath Rupsingh Rathod vs. State of Maharashtra*. Notes that the cheque was dishonored at SBI Secunderabad but the complaint was filed in Hyderabad — a strong preliminary objection.

### 7.5 Precedents (5 precedents)

| # | Citation | Case Name | Court | Year | Subject | Key Principles |
|---|---------|-----------|-------|------|---------|---------------|
| 1 | (2020) 5 SCC 1 | Indore Development Authority vs. Manoharlal | Supreme Court | 2020 | Property | Fair market value, 100% solatium, retrospective application of 2013 Act |
| 2 | (2019) 3 SCC 244 | Vidyadharan vs. State of Kerala | Supreme Court | 2019 | Property | Adverse possession, 30-year period against government, hostile possession |
| 3 | (2014) 9 SCC 737 | Dashrath Rupsingh Rathod vs. State of Maharashtra | Supreme Court | 2014 | Criminal | NI Act Section 138, jurisdiction at place of dishonor |
| 4 | (2016) 2 SCC 176 | Shrimant Shamrao Suryavanshi vs. Pralhad Bhairoba Suryavanshi | Supreme Court | 2016 | Property | Partition, co-sharer rights, inherent right to partition |
| 5 | (2018) 9 SCC 261 | K. Bhagirathi Bai vs. Kalawati | Supreme Court | 2018 | Family | Section 125 CrPC, maintenance quantum, standard of living |

**Coverage**: Precedents cover **3 subject areas** (property, criminal, family) and are drawn exclusively from the **Supreme Court of India**, spanning years 2014–2020. Each is directly relevant to at least one seeded case, enabling realistic legal research queries.

---

## 8. Project File Structure

```
casepilot-main/
│
├── .adk/                              # ADK artifacts directory
│   └── artifacts/                     # Generated artifacts from agent runs
│
├── casepilot_agent/                   # Core ADK agent package
│   ├── __init__.py                    # Package initializer
│   ├── agent.py                       # Root agent definition (routing + direct tools)
│   │
│   ├── sub_agents/                    # Specialized sub-agents
│   │   ├── __init__.py
│   │   ├── court_tracker.py           # Hearing schedule management agent
│   │   ├── legal_research.py          # Case notes + precedent search agent
│   │   └── task_manager.py            # Task creation, tracking, and status agent
│   │
│   └── tools/                         # Firestore-backed function tools
│       ├── __init__.py
│       └── firestore_tools.py         # All 8 Firestore tool functions
│
├── mcp_server/                        # Standalone MCP server (Track 2)
│   ├── __init__.py
│   └── server.py                      # MCP tool definitions + handlers (6 tools)
│
├── .env                               # Environment configuration (Vertex AI, GCP project)
├── .gitignore                         # Git ignore rules
├── .dockerignore                      # Docker ignore rules
├── Dockerfile                         # Production container (python:3.11-slim, port 8080)
├── requirements.txt                   # Python dependencies
├── seed_data.py                       # Firestore seed script (5 collections, 25 records)
├── casepilot-yashu-*.json             # GCP service account key
├── PROJECT_REPORT.md                  # This report
└── venv/                              # Python virtual environment
```

---

## 9. Function Tool Inventory

CasePilot provides **8 Firestore-backed function tools** used across the ADK agents:

| # | Function | Used By | Description |
|---|---------|---------|-------------|
| 1 | `get_daily_brief()` | Root Agent, MCP Server | Returns today's hearings, overdue tasks, tasks due today, and the next 3 upcoming hearings. |
| 2 | `get_case_details(search_term)` | Root Agent, Court Tracker, Legal Research, MCP Server | Searches cases by case number, client name, or case title. |
| 3 | `get_all_active_cases()` | Root Agent, Court Tracker | Returns all active cases sorted by priority (urgent → high → normal → low). |
| 4 | `get_upcoming_hearings()` | Court Tracker, MCP Server | Returns all scheduled hearings from today onward, sorted by date. |
| 5 | `search_case_notes(search_term)` | Legal Research | Keyword search across case note content and titles. |
| 6 | `search_precedents(subject_area)` | Legal Research, MCP Server | Filters legal precedents by subject area (property, criminal, family, etc.). |
| 7 | `get_pending_tasks()` | Task Manager, MCP Server | Returns all pending/in-progress tasks sorted by priority, then due date. |
| 8 | `get_overdue_tasks()` | Task Manager | Returns tasks past their due date that are not marked as completed. |
| 9 | `create_task(...)` | Task Manager, MCP Server | Creates a new task with case number, title, assignee, due date, priority, and type. |
| 10 | `update_task_status(task_id, new_status)` | Task Manager | Updates a task's status (pending → in_progress → completed). Automatically timestamps completion. |

---

## 10. Sample Use Cases

| User Says | What Happens | Agent/Tool Triggered |
|-----------|-------------|---------------------|
| *"Good morning, what's on today?"* | Returns today's hearings, overdue tasks, and upcoming hearings. | Root Agent → `get_daily_brief()` |
| *"Tell me about the Sharma property case."* | Searches cases by "Sharma" and returns full case profile. | Root Agent → `get_case_details("Sharma")` |
| *"Show all my cases."* | Lists all active cases sorted by priority. | Root Agent → `get_all_active_cases()` |
| *"What hearings do I have this week?"* | Returns all upcoming scheduled hearings sorted by date. | Court Tracker → `get_upcoming_hearings()` |
| *"Find Supreme Court judgments on Section 138 of the NI Act."* | Searches precedent database for criminal subject area. | Legal Research → `search_precedents("criminal")` |
| *"What research do we have on the property encroachment?"* | Keyword search across case notes for "encroachment". | Legal Research → `search_case_notes("encroachment")` |
| *"Show overdue tasks."* | Returns all tasks past their due date. | Task Manager → `get_overdue_tasks()` |
| *"Assign Meena to file the written arguments by Friday."* | Creates a new task assigned to "Paralegal — Meena" with due date. | Task Manager → `create_task(...)` |
| *"Mark the injunction drafting task as completed."* | Updates task status to "completed" and timestamps it. | Task Manager → `update_task_status(...)` |
| *"Find recent judgments on Section 138 NI Act in Delhi."* | Search eCourts for real cases and order summaries. | Legal Research → `ecourts_search_cases(...)` |
| *"Summarize the latest order in CNR DLCT010000012024."* | Fetches AI analysis of the specific order from eCourts. | Legal Research → `ecourts_get_order_ai_analysis(...)` |
| *"Show me all court complexes in Telangana."* | Navigates eCourts hierarchy using free tools. | Legal Research → `ecourts_get_complexes(...)` |
| *"How do I use this application?"* | (Clicks Sidebar Link) Opens the interactive Help & Platform Tour. | Frontend → `HelpSection` component |

---

## 11. How to Run

### Prerequisites
- Python 3.11+
- Google Cloud project with Firestore enabled
- GCP Service Account key (JSON)
- Gemini API access via Vertex AI

### Setup & Launch
```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Set up environment
#    Ensure .env has correct values for:
#    - GOOGLE_CLOUD_PROJECT
#    - GOOGLE_APPLICATION_CREDENTIALS
#    - GOOGLE_CLOUD_LOCATION

# 3. Seed the database (first time only)
python seed_data.py

# 4. Run the ADK web interface
adk web .

# 5. (Optional) Run the MCP server standalone
python -m mcp_server.server
```

### Docker Deployment
```bash
docker build -t casepilot .
docker run -p 8080:8080 casepilot
```

---

## 12. Future Roadmap

| Feature | Description | Impact |
|---------|-------------|--------|
| **Document OCR** | Automatically extract hearing dates, parties, and case details from PDF court orders and filings. | Eliminates manual data entry from physical court documents. |
| **Regional Language Support** | Support for interaction in Hindi, Telugu, Tamil, and other Indian languages. | Makes CasePilot accessible to lawyers who are more comfortable in regional languages. |
| **Multi-Lawyer Shared Workspace** | Collaborative features for larger law firms with role-based access. | Enables firm-wide adoption with partner, associate, and paralegal views. |
| **WhatsApp/Telegram Integration** | Receive daily briefings and respond to queries through mobile messaging. | Court-side access — lawyers can check schedules and update tasks from their phone at court. |
| **Calendar Integration** | Sync with Google Calendar, Outlook, and other calendar apps. | Hearings show up alongside personal appointments. |
| **Client Portal** | Secure interface for clients to check case status and upcoming dates. | Reduces "status update" calls and improves client satisfaction. |

---

## 13. Summary

CasePilot transforms a lawyer's phone or laptop into an **intelligent legal clerk** that:

1. **Knows every case** — all parties, courts, judges, and filing dates.
2. **Tracks every hearing** — with urgency alerts and courtroom details.
3. **Manages every task** — from assignment to completion, across the team.
4. **Searches legal research** — local case notes, national precedents, and real-time eCourts records.
5. **Briefs every morning** — a single command surfaces everything that matters today.
6. **Analyzes court orders** — AI-powered deep-dive into any judgment in the Indian judiciary.

All of this through **simple, conversational English** — no forms, no menus, no training required. CasePilot is designed to fit naturally into the way Indian lawyers already work, providing AI-powered efficiency without disrupting established workflows.

---

*Built with Google ADK, Gemini 2.5 Flash, Cloud Firestore, and Model Context Protocol.*
