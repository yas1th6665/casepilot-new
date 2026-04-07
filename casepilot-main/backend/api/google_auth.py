"""Google OAuth endpoints for user-linked Calendar and Tasks connections."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import HTMLResponse

from backend.auth_context import get_request_user_id
from backend.config import settings
from backend.services.google_oauth_service import (
    GoogleOAuthConfigError,
    build_google_auth_url,
    clear_google_connection,
    exchange_code_for_token,
)

router = APIRouter()


@router.get("/{tool_name}/start")
async def start_google_auth(tool_name: str, request: Request):
    try:
        return {
            "tool_name": tool_name,
            "auth_url": build_google_auth_url(tool_name, get_request_user_id(request)),
        }
    except GoogleOAuthConfigError as exc:
        return {"status": "not_configured", "message": str(exc), "tool_name": tool_name}


@router.get("/callback", response_class=HTMLResponse)
async def google_auth_callback(code: str, state: str):
    try:
        result = exchange_code_for_token(state, code)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    tool_name = result["tool_name"]
    account_email = result.get("account_email", "")
    return HTMLResponse(
        f"""
        <html>
          <body style="font-family: sans-serif; padding: 24px;">
            <h2>Google connection complete</h2>
            <p>{tool_name} is now linked to {account_email or 'your Google account'}.</p>
            <script>
              window.opener && window.opener.postMessage({{
                type: "casepilot-google-connected",
                toolName: "{tool_name}",
                accountEmail: "{account_email}",
              }}, "*");
              window.close();
            </script>
          </body>
        </html>
        """
    )


@router.post("/{tool_name}/disconnect")
async def disconnect_google_auth(tool_name: str, request: Request):
    if tool_name not in {"google_calendar", "google_tasks"}:
        raise HTTPException(status_code=404, detail="Unsupported Google tool")
    record = clear_google_connection(tool_name, get_request_user_id(request))
    return {"tool": record}
