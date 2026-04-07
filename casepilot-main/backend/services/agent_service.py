"""Programmatic ADK agent invocation for dashboard chat."""

from __future__ import annotations

import uuid
from typing import Any

from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types

from backend.config import settings
from casepilot_agent.agent import root_agent

session_service = InMemorySessionService()
runner = Runner(
    app_name="casepilot-dashboard",
    agent=root_agent,
    session_service=session_service,
    auto_create_session=True,
)


def _extract_text(event: Any) -> str:
    content = getattr(event, "content", None)
    if not content or not getattr(content, "parts", None):
        return ""
    texts = [part.text for part in content.parts if getattr(part, "text", None)]
    return "\n".join(texts).strip()


def _build_contextual_message(message: str, case_context: dict[str, Any] | None = None) -> str:
    if not case_context or not case_context.get("case_number"):
        return message

    case_number = case_context.get("case_number", "")
    case_title = case_context.get("case_title", "")
    court_name = case_context.get("court_name", "")

    context_lines = [
        "Case workspace context:",
        f"- Case number: {case_number}",
    ]
    if case_title:
        context_lines.append(f"- Case title: {case_title}")
    if court_name:
        context_lines.append(f"- Court: {court_name}")
    context_lines.append("")
    context_lines.append("Use this case as the primary context unless the user clearly asks about a different matter.")
    context_lines.append("")
    context_lines.append(f"User request: {message}")
    return "\n".join(context_lines)


async def invoke_agent(
    message: str,
    session_id: str | None = None,
    user_id: str | None = None,
    case_context: dict[str, Any] | None = None,
) -> dict[str, Any]:
    session_id = session_id or str(uuid.uuid4())
    user_id = user_id or settings.default_user_id

    final_text = ""
    actions: list[dict[str, Any]] = []
    outbound_message = _build_contextual_message(message, case_context)

    async for event in runner.run_async(
        user_id=user_id,
        session_id=session_id,
        new_message=types.UserContent(parts=[types.Part(text=outbound_message)]),
    ):
        text = _extract_text(event)
        if text:
            final_text = text

        for func_call in event.get_function_calls():
            actions.append(
                {
                    "type": "tool_call",
                    "tool_name": func_call.name,
                    "arguments": dict(func_call.args or {}),
                }
            )

    return {
        "session_id": session_id,
        "text": final_text or "I’m connected, but I couldn’t format a reply yet.",
        "actions": actions,
    }
