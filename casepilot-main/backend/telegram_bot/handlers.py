"""Webhook handlers and message formatting for the Telegram bot."""

from __future__ import annotations

import json
from urllib import error, request

from backend.config import settings
from backend.services.agent_service import invoke_agent
from backend.services.firestore_service import (
    build_daily_brief,
    get_case_by_number,
    list_active_cases,
    list_pending_tasks,
    list_upcoming_hearings,
)


def _extract_message(payload: dict) -> dict | None:
    return payload.get("message") or payload.get("edited_message")


def _message_text(message: dict | None) -> str:
    return (message or {}).get("text", "").strip()


def _chat_id(message: dict | None) -> int | None:
    return (message or {}).get("chat", {}).get("id")


def _from_user(message: dict | None) -> dict:
    return (message or {}).get("from", {}) or {}


def _telegram_api_url(method: str) -> str:
    return f"https://api.telegram.org/bot{settings.telegram_bot_token}/{method}"


def _send_message(chat_id: int, text: str) -> dict:
    if not settings.telegram_bot_token:
      return {"status": "not_configured", "chat_id": chat_id, "text": text}

    payload = json.dumps(
        {
            "chat_id": chat_id,
            "text": text,
            "disable_web_page_preview": True,
        }
    ).encode("utf-8")

    req = request.Request(
        _telegram_api_url("sendMessage"),
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with request.urlopen(req, timeout=15) as response:
            return json.loads(response.read().decode("utf-8"))
    except error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Telegram API error: {exc.code} {body}") from exc
    except error.URLError as exc:
        raise RuntimeError(f"Telegram API unreachable: {exc.reason}") from exc


def _help_text() -> str:
    return "\n".join(
        [
            "CasePilot Telegram commands:",
            "/briefing - daily dashboard summary",
            "/hearings - next scheduled hearings",
            "/tasks - pending and overdue tasks",
            "/case <case number> - case snapshot",
            "/start - show this help",
            "",
            "You can also send plain language requests like:",
            '"Create a task for WP/1234/2024"',
        ]
    )


def _format_briefing() -> str:
    brief = build_daily_brief()
    stats = brief.get("stats", {})
    lines = [
        f"CasePilot Daily Brief for {brief.get('date', 'today')}",
        f"Active cases: {stats.get('active_cases', 0)}",
        f"Hearings today: {stats.get('hearings_today', 0)}",
        f"Pending tasks: {stats.get('pending_tasks', 0)}",
        f"Overdue tasks: {stats.get('overdue_tasks', 0)}",
        "",
        "Today's hearings:",
    ]

    todays_hearings = brief.get("todays_hearings", [])
    if todays_hearings:
        for hearing in todays_hearings[:5]:
            lines.append(
                f"- {hearing.get('hearing_time', '--')} | {hearing.get('case_number', 'Unknown')} | {hearing.get('purpose', 'Hearing')}"
            )
    else:
        lines.append("- No hearings listed for today.")

    return "\n".join(lines)


def _format_hearings() -> str:
    hearings = list_upcoming_hearings()
    lines = ["Upcoming hearings:"]
    if not hearings:
        lines.append("- No scheduled hearings found.")
        return "\n".join(lines)

    for hearing in hearings[:8]:
        lines.append(
            f"- {hearing.get('hearing_date', '--')} {hearing.get('hearing_time', '--')} | {hearing.get('case_number', 'Unknown')} | {hearing.get('purpose', 'Hearing')}"
        )
    return "\n".join(lines)


def _format_tasks() -> str:
    tasks = list_pending_tasks()
    overdue = [task for task in tasks if task.get("status") != "completed" and task.get("due_date")]

    lines = ["Pending tasks:"]
    if not tasks:
        lines.append("- No pending tasks found.")
        return "\n".join(lines)

    for task in tasks[:8]:
        lines.append(
            f"- {task.get('title', 'Untitled')} | {task.get('case_number', 'Unknown')} | due {task.get('due_date', '--')} | {task.get('priority', 'normal')}"
        )

    overdue_count = sum(1 for task in overdue if task.get("due_date", "9999-99-99") < build_daily_brief().get("date", "9999-99-99"))
    lines.extend(["", f"Overdue count: {overdue_count}"])
    return "\n".join(lines)


def _find_case(case_query: str) -> dict | None:
    case_query = case_query.strip()
    if not case_query:
        return None

    exact = get_case_by_number(case_query)
    if exact:
        return exact

    lowered = case_query.lower()
    for case in list_active_cases():
        if lowered in str(case.get("case_number", "")).lower() or lowered in str(case.get("case_title", "")).lower():
            return case
    return None


def _format_case(case_query: str) -> str:
    case = _find_case(case_query)
    if not case:
        return f'No case found for "{case_query}". Try the exact case number, for example /case WP/1234/2024.'

    return "\n".join(
        [
            f"{case.get('case_number', 'Unknown case')}",
            case.get("case_title", "No title"),
            f"Court: {case.get('court_name', '-')}",
            f"Client: {case.get('client_name', '-')}",
            f"Status: {case.get('status', '-')}",
            f"Priority: {case.get('priority', '-')}",
            f"Filed: {case.get('filing_date', '-')}",
        ]
    )


async def _route_command(text: str, chat_id: int, telegram_user: dict) -> str:
    if text.startswith("/start"):
        return _help_text()

    if text.startswith("/briefing"):
        return _format_briefing()

    if text.startswith("/hearings"):
        return _format_hearings()

    if text.startswith("/tasks"):
        return _format_tasks()

    if text.startswith("/case"):
        _, _, case_query = text.partition(" ")
        if not case_query.strip():
            return 'Use "/case <case number>" to get a case snapshot.'
        return _format_case(case_query)

    user_id = f"{settings.telegram_default_prefix}-{chat_id}"
    agent_reply = await invoke_agent(
        text,
        session_id=f"telegram-{chat_id}",
        user_id=user_id,
    )
    return agent_reply.get("text") or "I could not generate a Telegram reply yet."


async def process_telegram_update(payload: dict) -> dict:
    message = _extract_message(payload)
    if not message:
        return {"status": "ignored", "reason": "No message payload found."}

    chat_id = _chat_id(message)
    if chat_id is None:
        return {"status": "ignored", "reason": "No chat id found."}

    text = _message_text(message)
    if not text:
        reply = "I can help with /briefing, /hearings, /tasks, /case, or free-text case commands."
    else:
        reply = await _route_command(text, chat_id, _from_user(message))

    delivery = _send_message(chat_id, reply)
    return {
        "status": "processed",
        "chat_id": chat_id,
        "received_text": text,
        "reply": reply,
        "delivery": delivery,
    }
