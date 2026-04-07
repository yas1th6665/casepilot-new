"""Google Calendar tools for the CasePilot agent."""

from __future__ import annotations

from backend.services.calendar_service import CalendarConfigError, create_calendar_event as backend_create_calendar_event
from .firestore_tools import get_upcoming_hearings


def create_calendar_event(
    case_number: str,
    hearing_date: str,
    hearing_time: str,
    court_room: str,
    purpose: str,
    court_name: str = "",
) -> dict:
    """Create a Google Calendar event for a court hearing."""
    try:
        return backend_create_calendar_event(
            case_number=case_number,
            hearing_date=hearing_date,
            hearing_time=hearing_time,
            court_room=court_room,
            purpose=purpose,
            court_name=court_name,
        )
    except CalendarConfigError as exc:
        return {"status": "not_configured", "message": str(exc)}


def sync_all_upcoming_hearings() -> dict:
    """Sync all upcoming hearings to Google Calendar."""
    hearings = get_upcoming_hearings().get("hearings", [])
    results = []
    for hearing in hearings:
        results.append(
            create_calendar_event(
                case_number=hearing["case_number"],
                hearing_date=hearing["hearing_date"],
                hearing_time=hearing["hearing_time"],
                court_room=hearing.get("court_room", ""),
                purpose=hearing.get("purpose", ""),
            )
        )
    return {
        "status": "success" if results else "empty",
        "events_created": len([item for item in results if item.get("status") == "success"]),
        "details": results,
    }
