"""Connected tools endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Request

from backend.auth_context import get_request_user_id
from backend.config import settings
from backend.services.calendar_service import get_calendar_status
from backend.services.firestore_service import list_connected_tools, upsert_connected_tool
from backend.services.google_tasks_service import get_google_tasks_status

router = APIRouter()


def _merge_tool_state(user_id: str, tool_name: str, runtime_status: dict) -> dict:
    status = runtime_status.get("status", "disconnected")
    existing = next((item for item in list_connected_tools(user_id) if item.get("tool_name") == tool_name), None)
    existing_config = (existing or {}).get("config", {})
    merged_config = {
        **existing_config,
        **runtime_status,
    }
    record = upsert_connected_tool(
        user_id,
        tool_name,
        {
            "status": status if status in {"connected", "configured", "disconnected", "error", "not_configured"} else "disconnected",
            "config": merged_config,
            "last_sync_at": runtime_status.get("last_sync_at"),
            "sync_count": runtime_status.get("synced", runtime_status.get("sync_count", (existing or {}).get("sync_count", 0))),
        },
    )
    return {
        **record,
        "runtime_status": runtime_status,
    }


@router.get("")
async def get_tool_connections(request: Request):
    user_id = get_request_user_id(request)
    tools = {
        "google_calendar": get_calendar_status(user_id),
        "google_tasks": get_google_tasks_status(user_id),
        "telegram": {
            "status": "connected" if settings.telegram_bot_token else "not_configured",
            "webhook_url": settings.telegram_webhook_url,
            "token_configured": bool(settings.telegram_bot_token),
        },
        "ecourts": {
            "status": "configured" if settings.google_workspace_user or settings.default_user_id else "disconnected",
            "message": "eCourts MCP wiring is available through the ADK layer and can be finalized in deployment config.",
        },
    }

    merged = [_merge_tool_state(user_id, tool_name, runtime) for tool_name, runtime in tools.items()]
    return {"tools": merged}


@router.post("/{tool_name}")
async def update_tool_connection(tool_name: str, payload: dict, request: Request):
    record = upsert_connected_tool(get_request_user_id(request), tool_name, payload)
    return {"tool": record}


@router.get("/saved")
async def get_saved_tool_connections(request: Request):
    return {"tools": list_connected_tools(get_request_user_id(request))}
