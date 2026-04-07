# eCourts India API & MCP Integration Guide for CasePilot

## 1. What is eCourts India?

India's **largest AI-powered legal intelligence platform** — containing:
- **284.7 million+** case records
- **1.1 billion** orders & judgments
- **2.9 million** lawyer profiles
- Real-time cause lists from the **Supreme Court, all 25 High Courts, and 28,000+ district courts** across all 37 states and UTs

> [!IMPORTANT]
> This is a **third-party commercial API** that aggregates publicly available data from the official eCourts judiciary portal (`ecourts.gov.in`). It is NOT run by the government.

---

## 2. Connection Details

| Property | Value |
|----------|-------|
| **MCP Server URL** | `https://mcp.ecourtsindia.com/mcp?token=YOUR_API_KEY` |
| **REST API Docs** | `https://ecourtsindia.com/api/docs` |
| **Authentication** | Bearer token (API key from signup) |
| **Response Format** | JSON, wrapped in `{ "data": {...}, "meta": {...} }` |
| **Free Credits on Signup** | ₹200 credits + 30 free API calls |
| **Compatible With** | Claude Desktop, Cursor, VS Code, Windsurf, Google ADK (via `McpToolset`) |

---

## 3. Complete Tool Inventory (22 Tools)

### 🆓 FREE Tools (6 tools — no credits consumed)

These are **always free** and do NOT consume any credits:

#### Court Structure Tools (4)

| Tool | Description | Parameters |
|------|-------------|------------|
| `get_states` | Get all 37 Indian states/UTs with their codes | None |
| `get_districts` | Get districts within a state | `stateCode` (e.g., `"TS"` for Telangana) |
| `get_complexes` | Get court complexes within a district | `stateCode`, `districtCode` |
| `get_courts` | Get individual courts within a complex | `stateCode`, `districtCode`, `complexCode` |

**Navigation hierarchy**: `get_states` → `get_districts` → `get_complexes` → `get_courts`

#### Lookup Tools (2)

| Tool | Description | Parameters |
|------|-------------|------------|
| `lookup_enum` | Get valid codes for any filter field (case types, statuses, etc.) | `enumName` (e.g., `"CaseTypeEnum"`, `"CaseStatusEnum"`) |
| `fetch_live_enums` | Fetch live/dynamic enum values from the platform | None |

> [!TIP]
> **Always call `lookup_enum(CaseTypeEnum)` BEFORE using `search_cases`**. Using generic strings like `"CIVIL"` or `"WRIT"` as filters will return **zero results with no error** — a silent failure. You need the specific codes like `WP_C`, `CS`, `OS`, etc.

---

### 💰 PAID Tools (Partner Tier — consume credits)

#### Case Tools (10)

| Tool | Description | Key Parameters |
|------|-------------|----------------|
| `search_cases` | Search across 264M+ cases (District, High Court, Tribunals, Supreme Court) | `query`, `advocates`, `petitioners`, `respondents`, `litigants`, `judges`, `courtCodes`, `caseTypes`, `caseStatuses`, `filingDateFrom`, `filingDateTo`, `page`, `pageSize` |
| `search_and_get_first_case` | Search + auto-fetch full details for top result (1 call) | Same as `search_cases` |
| `get_case_details` | Full case: parties, advocates, hearings, orders, acts | `cnr` (16-character CNR number) |
| `get_case_with_latest_order` | Case details + latest order AI analysis in ONE call | `cnr` |
| `get_case_brief` | AI-summarized brief of a case's current status | `cnr` |
| `search_and_brief_top_cases` | Search + AI briefing for multiple top matches | Same as `search_cases` |
| `batch_get_case_details` | Fetch details for multiple cases at once | Array of `cnr` values |
| `refresh_case` | Force re-scrape of case data from official eCourts | `cnr` |
| `bulk_refresh_cases` | Bulk re-scrape multiple cases | Array of `cnr` values |
| `monitor_portfolio` | Set up tracking/alerts for a collection of cases | Array of `cnr` values |

#### Order Tools (3)

| Tool | Description | Key Parameters |
|------|-------------|----------------|
| `get_order_document` | Get the raw PDF/text of a specific court order | `cnr`, `orderFilename` |
| `get_order_ai_analysis` | **Deep 7-level AI analysis** of any order — summary, statutes cited, judge insights | `cnr`, `orderFilename` |
| `get_order_markdown` | Clean, searchable markdown text of the order | `cnr`, `orderFilename` |

#### Cause List Tools (3)

| Tool | Description | Key Parameters |
|------|-------------|----------------|
| `search_causelist` | Search court schedules by date, court, judge, advocate | `date`, `courtCode`, `judge`, `advocate` |
| `get_available_causelist_dates` | Check which dates have uploaded cause list data | `stateCode` |
| `get_court_docket` | Full judge/court schedule for a specific day | `courtCode`, `date` |

---

## 4. Key Concepts

### CNR (Case Number Record)
- A **unique 16-character identifier** for every case in the Indian judiciary
- Format example: `DLCT010000012024`
- This is the **primary key** for fetching case details
- Search results return CNRs in `data.results[].cnr`

### Response Wrapper
Every API response is wrapped — always access `response.data`:
```json
{
  "data": { ...actual payload... },
  "meta": { "request_id": "UUID" }
}
```

### AI Order Analysis Field Paths
```
Executive summary:
  aiAnalysis.intelligent_insights_analytics
    .order_significance_and_impact_assessment
    .ai_generated_executive_summary

Plain-language summary (for litigants):
  aiAnalysis.intelligent_insights_analytics
    .order_significance_and_impact_assessment
    .plain_language_summary_for_litigants_outcome_focused

Judge names:
  aiAnalysis.foundational_metadata.core_case_identifiers.judge_names[]

Statutes cited:
  aiAnalysis.deep_legal_substance_context
    .core_legal_content_analysis.statutes_cited_and_applied[]
```

### Common Case Type Codes (137 total)

| Code | Description |
|------|-------------|
| `WP_C` | Writ Petition (Civil) |
| `WP_CRL` | Writ Petition (Criminal) |
| `CS` | Civil Suit |
| `OS` | Original Suit |
| `BA` | Bail Application |
| `ABA` | Anticipatory Bail Application |
| `CRL_A` | Criminal Appeal |
| `CA` | Civil Appeal |
| `FA` | First Appeal |
| `SLP_C` | Special Leave Petition (Civil) |
| `ARB_PET` | Arbitration Petition |
| `PIL` | Public Interest Litigation |

### Telangana / Hyderabad Court Codes (relevant to CasePilot)

| Code | Court |
|------|-------|
| `TS` | State of Telangana |
| — | Navigate via `get_states("TS")` → `get_districts` → `get_courts` for district courts |

### High Court Codes

| Code | Court |
|------|-------|
| `SCIN01` | Supreme Court of India |
| `APHC01` | High Court, Andhra Pradesh |
| `DLHC01` | High Court, Delhi |
| `HCBM01` | Bombay High Court |
| `KAHC01` | High Court of Karnataka |
| `KLHC01` | High Court of Kerala |
| `HCMA01` | Madras High Court |

> [!NOTE]
> The Telangana High Court code needs to be discovered via `get_states` → `get_districts`. eCourts India was built before the AP/TS bifurcation so some legacy codes may apply.

---

## 5. Recommended Workflow for AI Agents

```
Step 1: lookup_enum(CaseTypeEnum)          → get valid case type codes
Step 2: search_cases(filters)              → returns results[].cnr
Step 3: get_case_details(cnr)              → full case incl. orders list
Step 4: get_order_ai_analysis(cnr, file)   → AI summary of specific order
  — OR —
Step 3+4: get_case_with_latest_order(cnr)  → case + latest AI summary in ONE call

For cause lists:
Step 1: get_available_causelist_dates(state) → confirm dates exist
Step 2: search_causelist(date, filters)      → listed cases
```

---

## 6. How to Connect FREE Resources to CasePilot

### What You Can Do RIGHT NOW (Free)

Even without spending any credits, you can integrate the **6 free tools** to add real value:

#### Option A: Connect via MCP in Google ADK

```python
# In casepilot_agent/agent.py or a new sub-agent
from google.adk.tools.mcp_tool import McpToolset, SseServerParams

# Connect to eCourts MCP server
ecourts_tools, exit_stack = await McpToolset.from_server(
    connection_params=SseServerParams(
        url="https://mcp.ecourtsindia.com/mcp?token=YOUR_API_KEY"
    )
)

# Add these tools to your agent
root_agent = Agent(
    name="casepilot",
    model="gemini-2.5-flash",
    tools=[
        *existing_tools,
        *ecourts_tools  # All 22 tools become available
    ]
)
```

#### Option B: Call FREE REST Endpoints Directly (No MCP needed)

You can call the free endpoints via simple HTTP requests — no credits consumed:

```python
import requests

API_KEY = "your_api_key_here"
BASE_URL = "https://api.ecourtsindia.com"  # REST base
HEADERS = {"Authorization": f"Bearer {API_KEY}"}

# 1. Get all states
states = requests.get(f"{BASE_URL}/api/court-structure/states", headers=HEADERS)

# 2. Get districts in Telangana
districts = requests.get(f"{BASE_URL}/api/court-structure/districts?stateCode=TS", headers=HEADERS)

# 3. Get valid case type codes
enums = requests.get(f"{BASE_URL}/api/enums/CaseTypeEnum", headers=HEADERS)
```

#### Option C: Build a Wrapper Tool in Firestore Tools

Add eCourts lookup functions to your existing `firestore_tools.py`:

```python
# In casepilot_agent/tools/firestore_tools.py (or a new ecourts_tools.py)
import requests

ECOURTS_API_KEY = os.getenv("ECOURTS_API_KEY")
ECOURTS_BASE = "https://api.ecourtsindia.com"

def get_indian_courts(state_code: str) -> dict:
    """Get all courts in a given Indian state. FREE - no credits used.

    Args:
        state_code: Two-letter state code (e.g., 'TS' for Telangana, 'DL' for Delhi)
    """
    headers = {"Authorization": f"Bearer {ECOURTS_API_KEY}"}
    resp = requests.get(f"{ECOURTS_BASE}/api/court-structure/districts?stateCode={state_code}", headers=headers)
    return resp.json().get("data", {})


def lookup_case_types() -> dict:
    """Get all valid Indian court case type codes. FREE - no credits used."""
    headers = {"Authorization": f"Bearer {ECOURTS_API_KEY}"}
    resp = requests.get(f"{ECOURTS_BASE}/api/enums/CaseTypeEnum", headers=headers)
    return resp.json().get("data", {})
```

---

## 7. How eCourts Can Supercharge the Legal Research Agent

### Current Limitation
Right now, CasePilot's Legal Research agent can ONLY search:
- Your **local Firestore** case notes (4 notes)
- Your **local Firestore** precedents (5 precedents)

This is a **tiny, static dataset**. A real lawyer needs access to millions of cases and judgments.

### With eCourts Integration

| Capability | Current (Firestore Only) | With eCourts Integration |
|-----------|-------------------------|-------------------------|
| **Case Search** | 5 seeded cases | **264 million+ cases** across all Indian courts |
| **Precedent Lookup** | 5 manually added SC judgments | **Live search** across Supreme Court, all 25 High Courts |
| **Order Analysis** | None — raw notes only | **AI-powered 7-level analysis** of any court order |
| **Cause Lists** | Not available | **Real-time daily hearing schedules** from any court |
| **Court Discovery** | Hardcoded court names | **Dynamic discovery** of 28,000+ courts via hierarchy |
| **Case Monitoring** | Manual only | **Automated alerts** for new orders and hearing dates |

### Proposed Integration Architecture

```
User: "Find Supreme Court judgments on Section 138 NI Act"
                    │
                    ▼
            ┌──────────────────┐
            │  Legal Research   │
            │  Agent            │
            └────────┬─────────┘
                     │
           ┌─────────┼──────────┐
           │                    │
    ┌──────▼──────┐    ┌───────▼────────┐
    │  Firestore   │    │  eCourts MCP   │
    │  (Local DB)  │    │  (264M cases)  │
    │              │    │                │
    │ • 5 cases    │    │ • search_cases │
    │ • 5 prec.    │    │ • get_order_   │
    │ • 4 notes    │    │   ai_analysis  │
    └──────────────┘    └────────────────┘
```

### Specific Use Cases for Your Lawyer

| Lawyer Says | What Happens | eCourts Tool Used |
|-------------|-------------|-------------------|
| "Find recent SC judgments on cheque bounce" | Search eCourts for NI Act 138 cases from Supreme Court | `search_cases(query="NI Act 138", courtCodes=["SCIN01"])` |
| "What does the latest order say in my Sharma case?" | Fetch AI analysis of the most recent order | `get_case_with_latest_order(cnr)` |
| "Is my case listed for hearing tomorrow?" | Check real-time cause list | `search_causelist(date, courtCode)` |
| "Show me all property dispute cases in Warangal district court" | Search district court cases | `search_cases(query="property", courtCodes=["WARANGAL_CODE"])` |
| "Summarize this court order in plain English" | Get AI-generated plain language summary | `get_order_ai_analysis(cnr, orderFile)` |

---

## 8. Pricing Summary

| Plan | Cost | Credits | Best For |
|------|------|---------|----------|
| **Free Signup** | ₹0 | ₹200 credits + 30 calls | Getting started, testing |
| **Pay As You Go** | ₹1,000 – ₹5,000 | Deposit-based (3× base rate) | Light usage, demos |
| **Enterprise Monthly** | ₹10,000/month | 10,000 credits (1× rate) | Regular automated tracking |
| **Enterprise Annual** | ₹1,00,000/year | Best value per credit | High-volume research firms |

> [!NOTE]
> **Free tools (Court Structure + Lookups) are ALWAYS free** regardless of plan. Only Case, Order, and Cause List tools consume credits.

---

## 9. Common Pitfalls to Avoid

| Mistake | What Happens | Fix |
|---------|-------------|-----|
| Using `"CIVIL"` as caseType filter | Zero results, no error | Call `lookup_enum(CaseTypeEnum)` first — use `CS` or `OS` |
| Accessing `response.cases[]` | Undefined / empty | Always use `response.data.results[]` |
| Using CNR-prefixed order filename | Error | Use bare filename from `judgmentOrders[].orderUrl` (e.g., `order-1.pdf`) |
| Not checking cause list availability | Empty results | Call `get_available_causelist_dates` first (data available ~10 days ahead) |

---

## 10. Next Steps — Implementation Roadmap

### Phase 1: Free Integration (No cost)
1. Sign up at `https://ecourtsindia.com/api/docs` — get API key + ₹200 free credits
2. Add `ECOURTS_API_KEY` to your `.env` file
3. Create `casepilot_agent/tools/ecourts_tools.py` with wrapper functions for the 6 free tools
4. Add court hierarchy navigation to your Legal Research agent

### Phase 2: Trial with Free Credits (₹200)
5. Test `search_cases` with your existing case data (e.g., search for "NI Act 138" cases)
6. Try `get_case_with_latest_order` on a known CNR
7. Test `get_order_ai_analysis` on a real court order

### Phase 3: Full MCP Integration
8. Connect eCourts MCP server to your ADK agent using `McpToolset`
9. Update the Legal Research agent to search eCourts when local Firestore has no results
10. Add cause list checking to the Court Tracker agent

---

*Source: [eCourts India](https://ecourtsindia.com) — India's largest AI-powered legal intelligence platform*
