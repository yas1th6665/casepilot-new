"""Google Calendar sync endpoints."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, Request

from backend.auth_context import get_request_user_id
from backend.config import settings
from backend.services.calendar_service import CalendarConfigError, create_calendar_event, get_calendar_status
from backend.services.firestore_service import get_hearing_by_id, list_upcoming_hearings, update_hearing

router = APIRouter()


@router.post("/sync-hearing/{hearing_id}")
async def sync_hearing(hearing_id: str, request: Request):
    user_id = get_request_user_id(request)
    hearing = get_hearing_by_id(hearing_id)
    if not hearing:
        raise HTTPException(status_code=404, detail="Hearing not found")

    try:
        result = create_calendar_event(
            case_number=hearing["case_number"],
            hearing_date=hearing["hearing_date"],
            hearing_time=hearing["hearing_time"],
            court_room=hearing.get("court_room", ""),
            purpose=hearing.get("purpose", ""),
            court_name=hearing.get("court_name", ""),
            user_id=user_id,
        )
    except CalendarConfigError as exc:
        return {"status": "not_configured", "message": str(exc), "hearing_id": hearing_id}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    update_hearing(
        hearing_id,
        {
            "calendar_synced": True,
            "calendar_event_id": result["event_id"],
            "calendar_event_link": result.get("event_link", ""),
        },
    )
    return result


@router.post("/sync-all")
async def sync_all_hearings(request: Request):
    user_id = get_request_user_id(request)
    try:
        results = []
        for hearing in list_upcoming_hearings():
            if hearing.get("calendar_synced"):
                continue
            result = create_calendar_event(
                case_number=hearing["case_number"],
                hearing_date=hearing["hearing_date"],
                hearing_time=hearing["hearing_time"],
                court_room=hearing.get("court_room", ""),
                purpose=hearing.get("purpose", ""),
                court_name=hearing.get("court_name", ""),
                user_id=user_id,
            )
            update_hearing(
                hearing["id"],
                {
                    "calendar_synced": True,
                    "calendar_event_id": result["event_id"],
                    "calendar_event_link": result.get("event_link", ""),
                },
            )
            results.append({"hearing_id": hearing["id"], **result})
    except CalendarConfigError as exc:
        return {"status": "not_configured", "message": str(exc), "synced": 0}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    return {"status": "success", "synced": len(results), "details": results}


@router.get("/status")
async def calendar_status(request: Request):
    return get_calendar_status(get_request_user_id(request))
