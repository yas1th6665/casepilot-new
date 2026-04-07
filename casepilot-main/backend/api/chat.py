"""WebSocket chat bridge between the dashboard and the ADK agent."""

from __future__ import annotations

import json

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from backend.auth_context import get_websocket_user_id
from backend.services.agent_service import invoke_agent

router = APIRouter()


@router.websocket("/ws/chat")
async def chat_websocket(websocket: WebSocket):
    await websocket.accept()
    session_id = None

    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            user_message = payload.get("message", "").strip()
            if not user_message:
                await websocket.send_json({"type": "error", "message": "Message cannot be empty."})
                continue

            session_id = payload.get("session_id", session_id)
            user_id = get_websocket_user_id(websocket, payload)
            case_context = payload.get("case_context") or {}
            await websocket.send_json({"type": "agent_status", "message": "Thinking..."})

            response = await invoke_agent(
                message=user_message,
                session_id=session_id,
                user_id=user_id,
                case_context=case_context,
            )
            session_id = response["session_id"]

            await websocket.send_json(
                {
                    "type": "agent_response",
                    "session_id": session_id,
                    "message": response["text"],
                    "actions": response.get("actions", []),
                    "case_context": case_context,
                }
            )
    except WebSocketDisconnect:
        return
