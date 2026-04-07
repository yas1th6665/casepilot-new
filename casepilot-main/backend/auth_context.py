"""Helpers for resolving the active app user from requests."""

from __future__ import annotations

from fastapi import Request, WebSocket

from backend.config import settings


def _sanitize(value: str | None) -> str:
    if not value:
        return ""
    return value.strip()


def resolve_user_id(raw_user_id: str | None = None, raw_email: str | None = None) -> str:
    user_id = _sanitize(raw_user_id)
    email = _sanitize(raw_email)
    if user_id:
        return user_id
    if email:
        return email.lower()
    return settings.default_user_id


def get_request_user_id(request: Request) -> str:
    return resolve_user_id(
        request.headers.get("X-CasePilot-User-Id"),
        request.headers.get("X-CasePilot-User-Email"),
    )


def get_websocket_user_id(websocket: WebSocket, payload: dict) -> str:
    return resolve_user_id(
        payload.get("user_id") or websocket.headers.get("X-CasePilot-User-Id"),
        payload.get("user_email") or websocket.headers.get("X-CasePilot-User-Email"),
    )
