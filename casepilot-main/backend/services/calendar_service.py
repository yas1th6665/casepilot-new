"""Google Calendar integration helpers with graceful fallback."""

from __future__ import annotations

from datetime import datetime, timedelta
from pathlib import Path

from backend.config import settings
from backend.services.google_oauth_service import get_user_google_connection, get_user_google_credentials


class CalendarConfigError(RuntimeError):
    """Raised when calendar sync is not configured."""


def _load_google_build():
    from googleapiclient.discovery import build

    return build


def _get_credentials(scopes: list[str]):
    from google.oauth2 import service_account

    credentials_path = settings.google_calendar_credentials_path
    if not credentials_path:
        raise CalendarConfigError("Google Calendar credentials path is not configured.")

    credentials_file = Path(credentials_path)
    if not credentials_file.exists():
        raise CalendarConfigError(f"Credentials file not found: {credentials_file}")

    credentials = service_account.Credentials.from_service_account_file(
        str(credentials_file),
        scopes=scopes,
    )
    if settings.google_workspace_user:
        credentials = credentials.with_subject(settings.google_workspace_user)
    return credentials


def _get_calendar_service(user_id: str | None = None):
    build = _load_google_build()
    credentials = get_user_google_credentials("google_calendar", user_id or settings.default_user_id)
    if credentials is None:
        credentials = _get_credentials(["https://www.googleapis.com/auth/calendar"])
    return build("calendar", "v3", credentials=credentials, cache_discovery=False)


def create_calendar_event(
    *,
    case_number: str,
    hearing_date: str,
    hearing_time: str,
    court_room: str,
    purpose: str,
    court_name: str = "",
    user_id: str | None = None,
) -> dict:
    service = _get_calendar_service(user_id)

    start = datetime.fromisoformat(f"{hearing_date}T{hearing_time}:00")
    end = start + timedelta(hours=1)

    event = {
        "summary": f"Court Hearing — {case_number}",
        "description": (
            f"Case: {case_number}\n"
            f"Purpose: {purpose}\n"
            f"Court: {court_name}\n"
            f"Court Room: {court_room}\n\n"
            "--- Managed by CasePilot ---"
        ),
        "location": ", ".join(part for part in [court_room, court_name] if part),
        "start": {"dateTime": start.isoformat(), "timeZone": settings.timezone},
        "end": {"dateTime": end.isoformat(), "timeZone": settings.timezone},
        "reminders": {
            "useDefault": False,
            "overrides": [
                {"method": "popup", "minutes": 60},
                {"method": "popup", "minutes": 1440},
            ],
        },
        "colorId": "11",
    }

    created = service.events().insert(calendarId="primary", body=event).execute()
    return {
        "status": "success",
        "event_id": created["id"],
        "event_link": created.get("htmlLink", ""),
        "message": f"Calendar event created for {case_number} on {hearing_date} at {hearing_time}",
    }


def get_calendar_status(user_id: str | None = None) -> dict:
    user_record = get_user_google_connection("google_calendar", user_id or settings.default_user_id)
    config = (user_record or {}).get("config", {})
    if config.get("auth_type") == "user_oauth" and config.get("refresh_token"):
        return {
            "status": "connected",
            "auth_type": "user_oauth",
            "account_email": config.get("account_email", ""),
            "account_name": config.get("account_name", ""),
        }

    configured = bool(settings.google_calendar_credentials_path)
    exists = bool(configured and Path(settings.google_calendar_credentials_path).exists())
    return {
        "status": "configured" if exists else "not_configured",
        "configured": configured,
        "credentials_found": exists,
        "auth_type": "service_account" if exists else "none",
    }
