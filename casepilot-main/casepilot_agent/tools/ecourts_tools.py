"""eCourts India API tools for CasePilot.

Connects to ecourtsindia.com API to provide real-time access to
264 million+ Indian court cases, orders, cause lists, and court structure.

FREE tools (no credits): get_all_states, get_districts_in_state,
    get_court_complexes, get_courts_in_complex, lookup_case_type_codes
PAID tools (consume credits): search_ecourts_cases, get_ecourts_case_details,
    get_ecourts_order_analysis
"""

import os
import requests
from dotenv import load_dotenv

load_dotenv()

ECOURTS_API_KEY = os.getenv("ECOURTS_API_KEY", "")
ECOURTS_BASE_URL = "https://webapi.ecourtsindia.com"
ECOURTS_MCP_URL = f"https://mcp.ecourtsindia.com/mcp?token={ECOURTS_API_KEY}"


def _get_headers() -> dict:
    """Build authorization headers for eCourts API."""
    return {
        "Authorization": f"Bearer {ECOURTS_API_KEY}",
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    }


def _api_call(endpoint: str, params: dict = None) -> dict:
    """Make a GET request to the eCourts REST API.

    Args:
        endpoint: API path (e.g., '/api/court-structure/states')
        params: Query parameters
    """
    if not ECOURTS_API_KEY or ECOURTS_API_KEY == "YOUR_API_KEY_HERE":
        return {
            "error": "eCourts API key not configured. "
                     "Please add your API key to the .env file. "
                     "Sign up at https://ecourtsindia.com/api to get a free key."
        }

    try:
        url = f"{ECOURTS_BASE_URL}{endpoint}"
        resp = requests.get(url, headers=_get_headers(), params=params, timeout=30)
        resp.raise_for_status()
        return resp.json()
    except requests.exceptions.HTTPError as e:
        return {"error": f"API error: {e.response.status_code} - {e.response.text}"}
    except requests.exceptions.ConnectionError:
        return {"error": "Cannot connect to eCourts API. Check your internet connection."}
    except requests.exceptions.Timeout:
        return {"error": "eCourts API request timed out. Please try again."}
    except Exception as e:
        return {"error": f"Unexpected error: {str(e)}"}


def _api_post(endpoint: str, payload: dict = None) -> dict:
    """Make a POST request to the eCourts REST API.

    Args:
        endpoint: API path
        payload: JSON body
    """
    if not ECOURTS_API_KEY or ECOURTS_API_KEY == "YOUR_API_KEY_HERE":
        return {
            "error": "eCourts API key not configured. "
                     "Please add your API key to the .env file."
        }

    try:
        url = f"{ECOURTS_BASE_URL}{endpoint}"
        resp = requests.post(url, headers=_get_headers(), json=payload, timeout=30)
        resp.raise_for_status()
        return resp.json()
    except requests.exceptions.HTTPError as e:
        return {"error": f"API error: {e.response.status_code} - {e.response.text}"}
    except requests.exceptions.ConnectionError:
        return {"error": "Cannot connect to eCourts API. Check your internet connection."}
    except requests.exceptions.Timeout:
        return {"error": "eCourts API request timed out. Please try again."}
    except Exception as e:
        return {"error": f"Unexpected error: {str(e)}"}


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# FREE TOOLS — No credits consumed
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


def get_all_states() -> dict:
    """Get all Indian states and Union Territories with their court codes.
    FREE — does not consume any API credits.

    Returns a list of states like:
    [{"code": "TS", "name": "Telangana"}, {"code": "DL", "name": "Delhi"}, ...]

    Use this as the first step to navigate the court hierarchy.
    Flow: get_all_states → get_districts_in_state → get_court_complexes → get_courts_in_complex
    """
    result = _api_call("/api/court-structure/states")
    if "error" in result:
        return result
    return {"states": result.get("data", result), "source": "eCourts India (FREE)"}


def get_districts_in_state(state_code: str) -> dict:
    """Get all districts within an Indian state.
    FREE — does not consume any API credits.

    Args:
        state_code: Two-letter state code (e.g., 'TS' for Telangana,
                    'DL' for Delhi, 'MH' for Maharashtra).
                    Use get_all_states() first to find the correct code.
    """
    result = _api_call("/api/court-structure/districts", {"stateCode": state_code})
    if "error" in result:
        return result
    return {
        "state_code": state_code,
        "districts": result.get("data", result),
        "source": "eCourts India (FREE)"
    }


def get_court_complexes(state_code: str, district_code: str) -> dict:
    """Get all court complexes within a district.
    FREE — does not consume any API credits.

    Args:
        state_code: Two-letter state code (e.g., 'TS')
        district_code: District code from get_districts_in_state()
    """
    result = _api_call("/api/court-structure/complexes", {
        "stateCode": state_code,
        "districtCode": district_code
    })
    if "error" in result:
        return result
    return {
        "state_code": state_code,
        "district_code": district_code,
        "complexes": result.get("data", result),
        "source": "eCourts India (FREE)"
    }


def get_courts_in_complex(state_code: str, district_code: str, complex_code: str) -> dict:
    """Get individual courts within a court complex.
    FREE — does not consume any API credits.

    Args:
        state_code: Two-letter state code (e.g., 'TS')
        district_code: District code
        complex_code: Complex code from get_court_complexes()
    """
    result = _api_call("/api/court-structure/courts", {
        "stateCode": state_code,
        "districtCode": district_code,
        "complexCode": complex_code
    })
    if "error" in result:
        return result
    return {
        "state_code": state_code,
        "district_code": district_code,
        "complex_code": complex_code,
        "courts": result.get("data", result),
        "source": "eCourts India (FREE)"
    }


def lookup_case_type_codes(enum_name: str = "CaseTypeEnum") -> dict:
    """Look up valid codes for search filters. MUST call this before using
    search_ecourts_cases to get correct case type codes.
    FREE — does not consume any API credits.

    Args:
        enum_name: The enum to look up. Options:
            - 'CaseTypeEnum' → case types like WP_C, CS, OS, BA
            - 'CaseStatusEnum' → status codes like DISPOSED, PENDING
            - 'CourtTypeEnum' → court type codes

    IMPORTANT: Never use plain English words like "CIVIL" or "WRIT" as
    case type filters. Always use the codes returned by this function
    (e.g., 'WP_C' for Writ Petition, 'CS' for Civil Suit).
    Using wrong codes returns zero results with NO error — a silent failure.
    """
    result = _api_call(f"/api/enums/{enum_name}")
    if "error" in result:
        return result
    return {
        "enum_name": enum_name,
        "values": result.get("data", result),
        "source": "eCourts India (FREE)",
        "tip": "Use these exact codes as filter values in search_ecourts_cases"
    }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PAID TOOLS — Consume API credits
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


def search_ecourts_cases(
    query: str,
    court_codes: str = "",
    case_types: str = "",
    case_statuses: str = "",
    advocates: str = "",
    petitioners: str = "",
    respondents: str = "",
    judges: str = "",
    filing_date_from: str = "",
    filing_date_to: str = "",
    page: int = 1,
    page_size: int = 5
) -> dict:
    """Search across 264 million+ Indian court cases from eCourts India.
    PAID — consumes API credits.

    Use this to find real court cases, precedents, and judgments from:
    - Supreme Court of India
    - All 25 High Courts
    - 28,000+ District Courts
    - Tribunals

    Args:
        query: Natural language search (e.g., 'Section 138 NI Act cheque bounce')
        court_codes: Comma-separated court codes (e.g., 'SCIN01' for Supreme Court,
                     'DLHC01' for Delhi HC). Leave empty to search all courts.
        case_types: Comma-separated case type codes (e.g., 'WP_C,CS').
                    IMPORTANT: Use codes from lookup_case_type_codes(), not plain English.
        case_statuses: Comma-separated status codes (e.g., 'DISPOSED,PENDING')
        advocates: Advocate name to filter by
        petitioners: Petitioner name to filter by
        respondents: Respondent name to filter by
        judges: Judge name to filter by
        filing_date_from: Start date in YYYY-MM-DD format
        filing_date_to: End date in YYYY-MM-DD format
        page: Page number (default: 1)
        page_size: Results per page (default: 5, max: 20)

    Returns cases with CNR (Case Number Record) — use CNR with
    get_ecourts_case_details() or get_ecourts_order_analysis() next.
    """
    params = {"query": query, "page": page, "pageSize": page_size}

    # Add optional filters (only if provided)
    if court_codes:
        params["courtCodes"] = court_codes
    if case_types:
        params["caseTypes"] = case_types
    if case_statuses:
        params["caseStatuses"] = case_statuses
    if advocates:
        params["advocates"] = advocates
    if petitioners:
        params["petitioners"] = petitioners
    if respondents:
        params["respondents"] = respondents
    if judges:
        params["judges"] = judges
    if filing_date_from:
        params["filingDateFrom"] = filing_date_from
    if filing_date_to:
        params["filingDateTo"] = filing_date_to

    result = _api_call("/api/cases/search", params)
    if "error" in result:
        return result

    data = result.get("data", {})
    cases = data.get("results", [])

    # Format results for easy reading
    formatted = []
    for case in cases:
        formatted.append({
            "cnr": case.get("cnr", ""),
            "case_number": case.get("caseNumber", ""),
            "case_title": case.get("caseTitle", ""),
            "court": case.get("courtName", ""),
            "case_type": case.get("caseType", ""),
            "status": case.get("caseStatus", ""),
            "filing_date": case.get("filingDate", ""),
            "judges": case.get("judges", []),
        })

    return {
        "cases": formatted,
        "total_results": data.get("totalResults", len(formatted)),
        "page": page,
        "source": "eCourts India (264M+ cases)",
        "tip": "Use the 'cnr' value with get_ecourts_case_details() to see full case info"
    }


def get_ecourts_case_details(cnr: str) -> dict:
    """Get full details of a specific court case by its CNR number.
    PAID — consumes API credits.

    The CNR (Case Number Record) is a unique 16-character identifier for
    every case in the Indian judiciary (e.g., 'DLCT010000012024').
    Get CNR values from search_ecourts_cases() results.

    Args:
        cnr: The 16-character CNR number of the case

    Returns full case details including:
    - Parties (petitioners, respondents)
    - Advocates
    - All hearing dates
    - List of orders/judgments
    - Acts and sections involved
    - Current case status
    """
    result = _api_call(f"/api/cases/{cnr}")
    if "error" in result:
        return result

    data = result.get("data", result)
    return {
        "case": data,
        "source": "eCourts India",
        "tip": "Use order filenames with get_ecourts_order_analysis() for AI analysis"
    }


def get_ecourts_case_with_latest_order(cnr: str) -> dict:
    """Get case details AND AI analysis of the latest order in ONE call.
    PAID — consumes API credits. Saves credits vs. two separate calls.

    Args:
        cnr: The 16-character CNR number of the case

    Returns:
    - Full case details (parties, advocates, hearings, status)
    - AI analysis of the most recent order including:
        • Executive summary
        • Plain language summary for litigants
        • Statutes cited and applied
        • Judge names and key observations
    """
    result = _api_call(f"/api/cases/{cnr}/with-latest-order")
    if "error" in result:
        return result

    data = result.get("data", result)
    return {"case_with_order": data, "source": "eCourts India"}


def get_ecourts_order_analysis(cnr: str, order_filename: str) -> dict:
    """Get deep AI-powered analysis of a specific court order or judgment.
    PAID — consumes API credits.

    This provides a comprehensive 7-level AI analysis:
    1. Executive summary of the order
    2. Plain language summary (understandable by non-lawyers)
    3. Statutes cited and applied
    4. Key legal principles discussed
    5. Judge observations and reasoning
    6. Impact assessment
    7. Connected case references

    Args:
        cnr: The 16-character CNR number of the case
        order_filename: The filename of the specific order
                       (get from case details → judgmentOrders[].orderUrl)
                       Use the BARE filename only (e.g., 'order-1.pdf'),
                       NOT the full URL.
    """
    result = _api_call(f"/api/orders/{cnr}/{order_filename}/ai-analysis")
    if "error" in result:
        return result

    data = result.get("data", result)

    # Extract key fields from the AI analysis for easier reading
    ai = data.get("aiAnalysis", {})
    insights = ai.get("intelligent_insights_analytics", {})
    significance = insights.get("order_significance_and_impact_assessment", {})

    return {
        "executive_summary": significance.get("ai_generated_executive_summary", ""),
        "plain_language_summary": significance.get(
            "plain_language_summary_for_litigants_outcome_focused", ""
        ),
        "statutes_cited": ai.get("deep_legal_substance_context", {}).get(
            "core_legal_content_analysis", {}
        ).get("statutes_cited_and_applied", []),
        "judge_names": ai.get("foundational_metadata", {}).get(
            "core_case_identifiers", {}
        ).get("judge_names", []),
        "full_analysis": data,
        "source": "eCourts India AI Analysis"
    }


def search_ecourts_causelist(
    date: str,
    court_code: str = "",
    advocate: str = "",
    judge: str = ""
) -> dict:
    """Search court cause lists (daily hearing schedules).
    PAID — consumes API credits.

    Use this to check if a case is listed for hearing on a specific date,
    or to see a lawyer's schedule for the day.

    Args:
        date: Date to check in YYYY-MM-DD format
        court_code: Court code to filter by (optional)
        advocate: Advocate name to filter by (optional)
        judge: Judge name to filter by (optional)
    """
    params = {"date": date}
    if court_code:
        params["courtCode"] = court_code
    if advocate:
        params["advocate"] = advocate
    if judge:
        params["judge"] = judge

    result = _api_call("/api/causelists/search", params)
    if "error" in result:
        return result

    return {
        "causelist": result.get("data", result),
        "date": date,
        "source": "eCourts India"
    }
