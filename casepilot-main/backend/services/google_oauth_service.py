"""User-linked Google OAuth helpers for Calendar and Tasks."""

from __future__ import annotations

import secrets
from datetime import datetime, timedelta, timezone
from urllib.parse import urlencode

import requests
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials

from backend.config import settings
from backend.services.firestore_service import get_connected_tool, upsert_connected_tool

TOKEN_URI = "https://oauth2.googleapis.com/token"
AUTH_URI = "https://accounts.google.com/o/oauth2/v2/auth"
USERINFO_URI = "https://www.googleapis.com/oauth2/v2/userinfo"

SCOPES = {
    "google_calendar": ["https://www.googleapis.com/auth/calendar"],
    "google_tasks": ["https://www.googleapis.com/auth/tasks"],
}

_PENDING_STATES: dict[str, dict] = {}


class GoogleOAuthConfigError(RuntimeError):
    """Raised when Google OAuth configuration is incomplete."""


def _ensure_oauth_config() -> None:
    if not settings.google_oauth_client_id or not settings.google_oauth_client_secret:
        raise GoogleOAuthConfigError("Google OAuth client credentials are not configured.")


def build_google_auth_url(tool_name: str, user_id: str) -> str:
    _ensure_oauth_config()
    if tool_name not in SCOPES:
        raise GoogleOAuthConfigError(f"Unsupported Google tool: {tool_name}")

    state = secrets.token_urlsafe(24)
    _PENDING_STATES[state] = {
        "tool_name": tool_name,
        "user_id": user_id,
        "created_at": datetime.now(timezone.utc),
    }

    query = urlencode(
        {
            "client_id": settings.google_oauth_client_id,
            "redirect_uri": settings.google_oauth_redirect_uri,
            "response_type": "code",
            "scope": " ".join(SCOPES[tool_name]),
            "access_type": "offline",
            "prompt": "consent",
            "include_granted_scopes": "true",
            "state": state,
        }
    )
    return f"{AUTH_URI}?{query}"


def _pop_state(state: str) -> dict:
    payload = _PENDING_STATES.pop(state, None)
    if not payload:
        raise GoogleOAuthConfigError("OAuth state is invalid or expired.")
    return payload


def _fetch_userinfo(access_token: str) -> dict:
    try:
        response = requests.get(USERINFO_URI, headers={"Authorization": f"Bearer {access_token}"}, timeout=20)
        response.raise_for_status()
        return response.json()
    except requests.RequestException:
        return {}


def exchange_code_for_token(state: str, code: str) -> dict:
    _ensure_oauth_config()
    state_payload = _pop_state(state)
    tool_name = state_payload["tool_name"]

    response = requests.post(
        TOKEN_URI,
        data={
            "code": code,
            "client_id": settings.google_oauth_client_id,
            "client_secret": settings.google_oauth_client_secret,
            "redirect_uri": settings.google_oauth_redirect_uri,
            "grant_type": "authorization_code",
        },
        timeout=20,
    )
    response.raise_for_status()
    token_data = response.json()
    userinfo = _fetch_userinfo(token_data["access_token"])

    expires_at = (datetime.now(timezone.utc) + timedelta(seconds=token_data.get("expires_in", 3600))).isoformat()
    record = upsert_connected_tool(
        state_payload["user_id"],
        tool_name,
        {
            "status": "connected",
            "config": {
                "auth_type": "user_oauth",
                "access_token": token_data.get("access_token", ""),
                "refresh_token": token_data.get("refresh_token", ""),
                "expires_at": expires_at,
                "scope": token_data.get("scope", ""),
                "token_type": token_data.get("token_type", "Bearer"),
                "token_uri": TOKEN_URI,
                "account_email": userinfo.get("email", ""),
                "account_name": userinfo.get("name", ""),
                "picture": userinfo.get("picture", ""),
            },
            "sync_count": 0,
            "last_sync_at": None,
        },
    )
    return {
        "tool_name": tool_name,
        "user_id": state_payload["user_id"],
        "account_email": userinfo.get("email", ""),
        "record": record,
    }


def clear_google_connection(tool_name: str, user_id: str) -> dict:
    return upsert_connected_tool(
        user_id,
        tool_name,
        {
            "status": "disconnected",
            "config": {},
            "sync_count": 0,
            "last_sync_at": None,
        },
    )


def get_user_google_credentials(tool_name: str, user_id: str) -> Credentials | None:
    if tool_name not in SCOPES:
        return None

    record = get_connected_tool(user_id, tool_name)
    config = (record or {}).get("config", {})
    if config.get("auth_type") != "user_oauth" or not config.get("refresh_token"):
        return None

    creds = Credentials(
        token=config.get("access_token"),
        refresh_token=config.get("refresh_token"),
        token_uri=config.get("token_uri", TOKEN_URI),
        client_id=settings.google_oauth_client_id,
        client_secret=settings.google_oauth_client_secret,
        scopes=SCOPES[tool_name],
    )
    if creds.expired or not creds.token:
        creds.refresh(Request())
        updated_config = {
            **config,
            "access_token": creds.token or "",
            "expires_at": creds.expiry.isoformat() if creds.expiry else config.get("expires_at", ""),
        }
        upsert_connected_tool(
            user_id,
            tool_name,
            {
                "status": "connected",
                "config": updated_config,
                "last_sync_at": datetime.now(timezone.utc).isoformat(),
                "sync_count": (record or {}).get("sync_count", 0),
            },
        )
    return creds


def get_user_google_connection(tool_name: str, user_id: str) -> dict | None:
    return get_connected_tool(user_id, tool_name)
