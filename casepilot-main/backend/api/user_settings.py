"""User settings endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Request

from backend.auth_context import get_request_user_id
from backend.config import settings
from backend.services.firestore_service import get_user_settings, upsert_user_settings

router = APIRouter()


def _default_settings() -> dict:
    return {
        "user_id": settings.default_user_id,
        "display_name": "Advocate Satyanarayana",
        "theme": "light",
        "compact_mode": False,
        "notification_prefs": {
            "telegram_enabled": bool(settings.telegram_bot_token),
            "calendar_auto_sync": False,
            "daily_brief_time": "08:30",
        },
    }


@router.get("")
async def get_settings(request: Request):
    user_id = get_request_user_id(request)
    current = get_user_settings(user_id)
    if current:
        return current
    created = upsert_user_settings(user_id, {**_default_settings(), "user_id": user_id})
    return created


@router.put("")
async def update_settings(payload: dict, request: Request):
    user_id = get_request_user_id(request)
    current = get_user_settings(user_id) or {**_default_settings(), "user_id": user_id}
    merged = {
        **current,
        **payload,
        "notification_prefs": {
            **current.get("notification_prefs", {}),
            **payload.get("notification_prefs", {}),
        },
    }
    return upsert_user_settings(user_id, merged)
