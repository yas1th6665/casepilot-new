"""Firestore CRUD helpers shared across the dashboard API."""

from __future__ import annotations

from collections import defaultdict
from datetime import date
from typing import Any

from google.cloud import firestore
from dotenv import load_dotenv

load_dotenv()

db = firestore.Client()

PRIORITY_ORDER = {"urgent": 0, "high": 1, "normal": 2, "low": 3}


def _with_id(doc: firestore.DocumentSnapshot) -> dict[str, Any]:
    data = doc.to_dict() or {}
    data["id"] = doc.id
    return data


def _sort_by_priority(items: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return sorted(
        items,
        key=lambda item: (
            PRIORITY_ORDER.get(item.get("priority", "normal"), 2),
            item.get("due_date", "9999-99-99"),
            item.get("hearing_date", "9999-99-99"),
        ),
    )


def list_active_cases() -> list[dict[str, Any]]:
    cases = [
        _with_id(doc)
        for doc in db.collection("cases").stream()
        if (doc.to_dict() or {}).get("status") == "active"
    ]
    return _sort_by_priority(cases)


def get_case_by_number(case_number: str) -> dict[str, Any] | None:
    for doc in db.collection("cases").stream():
        data = _with_id(doc)
        if data.get("case_number") == case_number:
            return data
    return None


def create_case(payload: dict[str, Any]) -> dict[str, Any]:
    payload = {
        **payload,
        "created_at": firestore.SERVER_TIMESTAMP,
        "updated_at": firestore.SERVER_TIMESTAMP,
    }
    doc_ref = db.collection("cases").add(payload)[1]
    return {"id": doc_ref.id, **payload}


def update_case(case_number: str, payload: dict[str, Any]) -> dict[str, Any]:
    for doc in db.collection("cases").stream():
        data = doc.to_dict() or {}
        if data.get("case_number") == case_number:
            update = {**payload, "updated_at": firestore.SERVER_TIMESTAMP}
            doc.reference.update(update)
            return {"id": doc.id, **data, **payload}
    raise KeyError(f"Case not found: {case_number}")


def list_upcoming_hearings() -> list[dict[str, Any]]:
    today = date.today().isoformat()
    hearings = [
        _with_id(doc)
        for doc in db.collection("hearings").stream()
        if (doc.to_dict() or {}).get("status") == "scheduled"
        and (doc.to_dict() or {}).get("hearing_date", "") >= today
    ]
    return sorted(hearings, key=lambda item: (item.get("hearing_date", ""), item.get("hearing_time", "")))


def list_case_hearings(case_number: str) -> list[dict[str, Any]]:
    hearings = [
        _with_id(doc)
        for doc in db.collection("hearings").stream()
        if (doc.to_dict() or {}).get("case_number") == case_number
    ]
    return sorted(hearings, key=lambda item: (item.get("hearing_date", ""), item.get("hearing_time", "")))


def create_hearing(payload: dict[str, Any]) -> dict[str, Any]:
    payload = {**payload, "created_at": firestore.SERVER_TIMESTAMP}
    doc_ref = db.collection("hearings").add(payload)[1]
    return {"id": doc_ref.id, **payload}


def update_hearing(hearing_id: str, payload: dict[str, Any]) -> dict[str, Any]:
    doc_ref = db.collection("hearings").document(hearing_id)
    snapshot = doc_ref.get()
    if not snapshot.exists:
        raise KeyError(f"Hearing not found: {hearing_id}")
    current = snapshot.to_dict() or {}
    doc_ref.update(payload)
    return {"id": hearing_id, **current, **payload}


def get_hearing_by_id(hearing_id: str) -> dict[str, Any] | None:
    snapshot = db.collection("hearings").document(hearing_id).get()
    if not snapshot.exists:
        return None
    return {"id": snapshot.id, **(snapshot.to_dict() or {})}


def list_pending_tasks() -> list[dict[str, Any]]:
    tasks = [
        _with_id(doc)
        for doc in db.collection("tasks").stream()
        if (doc.to_dict() or {}).get("status") in {"pending", "in_progress"}
    ]
    return _sort_by_priority(tasks)


def list_overdue_tasks() -> list[dict[str, Any]]:
    today = date.today().isoformat()
    tasks = [
        _with_id(doc)
        for doc in db.collection("tasks").stream()
        if (doc.to_dict() or {}).get("status") != "completed"
        and (doc.to_dict() or {}).get("due_date", "9999-99-99") < today
    ]
    return _sort_by_priority(tasks)


def list_case_tasks(case_number: str) -> list[dict[str, Any]]:
    tasks = [
        _with_id(doc)
        for doc in db.collection("tasks").stream()
        if (doc.to_dict() or {}).get("case_number") == case_number
    ]
    return _sort_by_priority(tasks)


def create_task(payload: dict[str, Any]) -> dict[str, Any]:
    payload = {
        **payload,
        "status": payload.get("status", "pending"),
        "created_at": firestore.SERVER_TIMESTAMP,
        "completed_at": payload.get("completed_at"),
    }
    doc_ref = db.collection("tasks").add(payload)[1]
    return {"id": doc_ref.id, **payload}


def update_task_status(task_id: str, new_status: str) -> dict[str, Any]:
    doc_ref = db.collection("tasks").document(task_id)
    snapshot = doc_ref.get()
    if not snapshot.exists:
        raise KeyError(f"Task not found: {task_id}")
    payload: dict[str, Any] = {"status": new_status}
    if new_status == "completed":
        payload["completed_at"] = firestore.SERVER_TIMESTAMP
    doc_ref.update(payload)
    current = snapshot.to_dict() or {}
    return {"id": task_id, **current, **payload}


def update_task(task_id: str, payload: dict[str, Any]) -> dict[str, Any]:
    doc_ref = db.collection("tasks").document(task_id)
    snapshot = doc_ref.get()
    if not snapshot.exists:
        raise KeyError(f"Task not found: {task_id}")
    current = snapshot.to_dict() or {}
    doc_ref.update(payload)
    return {"id": task_id, **current, **payload}


def get_task_by_id(task_id: str) -> dict[str, Any] | None:
    snapshot = db.collection("tasks").document(task_id).get()
    if not snapshot.exists:
        return None
    return {"id": snapshot.id, **(snapshot.to_dict() or {})}


def delete_task(task_id: str) -> dict[str, Any]:
    doc_ref = db.collection("tasks").document(task_id)
    if not doc_ref.get().exists:
        raise KeyError(f"Task not found: {task_id}")
    doc_ref.delete()
    return {"id": task_id, "status": "deleted"}


def search_precedents(subject_area: str) -> list[dict[str, Any]]:
    return [
        _with_id(doc)
        for doc in db.collection("precedents").stream()
        if (doc.to_dict() or {}).get("subject_area") == subject_area
    ]


def search_case_notes(query: str) -> list[dict[str, Any]]:
    search = query.lower()
    return [
        _with_id(doc)
        for doc in db.collection("case_notes").stream()
        if search in (doc.to_dict() or {}).get("title", "").lower()
        or search in (doc.to_dict() or {}).get("content", "").lower()
    ]


def list_case_notes(case_number: str) -> list[dict[str, Any]]:
    notes = [
        _with_id(doc)
        for doc in db.collection("case_notes").stream()
        if (doc.to_dict() or {}).get("case_number") == case_number
    ]
    return sorted(notes, key=lambda item: str(item.get("created_at", "")))


def create_case_note(payload: dict[str, Any]) -> dict[str, Any]:
    doc_payload = {
        **payload,
        "created_at": firestore.SERVER_TIMESTAMP,
    }
    doc_ref = db.collection("case_notes").document()
    doc_ref.set(doc_payload)
    return _with_id(doc_ref.get())


def list_case_files(case_number: str) -> list[dict[str, Any]]:
    files = [
        _with_id(doc)
        for doc in db.collection("case_files").stream()
        if (doc.to_dict() or {}).get("case_number") == case_number
    ]
    return sorted(files, key=lambda item: str(item.get("uploaded_at", "")), reverse=True)


def get_case_file_by_id(file_id: str) -> dict[str, Any] | None:
    snapshot = db.collection("case_files").document(file_id).get()
    if not snapshot.exists:
        return None
    return {"id": snapshot.id, **(snapshot.to_dict() or {})}


def create_case_file(payload: dict[str, Any]) -> dict[str, Any]:
    payload = {
        **payload,
        "uploaded_at": firestore.SERVER_TIMESTAMP,
    }
    doc_ref = db.collection("case_files").document()
    doc_ref.set(payload)
    return {"id": doc_ref.id, **payload}


def update_case_file(file_id: str, payload: dict[str, Any]) -> dict[str, Any]:
    doc_ref = db.collection("case_files").document(file_id)
    snapshot = doc_ref.get()
    if not snapshot.exists:
        raise KeyError(f"Case file not found: {file_id}")
    current = snapshot.to_dict() or {}
    doc_ref.update(payload)
    return {"id": file_id, **current, **payload}


def delete_case_file(file_id: str) -> None:
    db.collection("case_files").document(file_id).delete()


def list_connected_tools(user_id: str) -> list[dict[str, Any]]:
    tools = [
        _with_id(doc)
        for doc in db.collection("connected_tools").stream()
        if (doc.to_dict() or {}).get("user_id") == user_id
    ]
    return sorted(tools, key=lambda item: str(item.get("tool_name", "")))


def get_connected_tool(user_id: str, tool_name: str) -> dict[str, Any] | None:
    for doc in db.collection("connected_tools").stream():
        data = _with_id(doc)
        if data.get("user_id") == user_id and data.get("tool_name") == tool_name:
            return data
    return None


def upsert_connected_tool(user_id: str, tool_name: str, payload: dict[str, Any]) -> dict[str, Any]:
    existing = get_connected_tool(user_id, tool_name)
    data = {
        **payload,
        "user_id": user_id,
        "tool_name": tool_name,
        "updated_at": firestore.SERVER_TIMESTAMP,
    }
    if existing:
        doc_ref = db.collection("connected_tools").document(existing["id"])
        doc_ref.update(data)
        return _with_id(doc_ref.get())

    created = {
        **data,
        "connected_at": firestore.SERVER_TIMESTAMP,
    }
    doc_ref = db.collection("connected_tools").document()
    doc_ref.set(created)
    return _with_id(doc_ref.get())


def get_user_settings(user_id: str) -> dict[str, Any] | None:
    snapshot = db.collection("user_settings").document(user_id).get()
    if not snapshot.exists:
        return None
    return {"id": snapshot.id, **(snapshot.to_dict() or {})}


def upsert_user_settings(user_id: str, payload: dict[str, Any]) -> dict[str, Any]:
    doc_ref = db.collection("user_settings").document(user_id)
    snapshot = doc_ref.get()
    existing = snapshot.to_dict() or {}
    data = {
        **existing,
        **payload,
        "user_id": user_id,
        "updated_at": firestore.SERVER_TIMESTAMP,
    }
    if snapshot.exists:
        doc_ref.update(data)
    else:
        doc_ref.set(data)
    return _with_id(doc_ref.get())


def build_daily_brief() -> dict[str, Any]:
    today = date.today().isoformat()
    active_cases = list_active_cases()
    upcoming_hearings = list_upcoming_hearings()
    pending_tasks = list_pending_tasks()
    overdue_tasks = list_overdue_tasks()

    todays_hearings = [item for item in upcoming_hearings if item.get("hearing_date") == today]
    tasks_due_today = [item for item in pending_tasks if item.get("due_date") == today]

    hearings_by_day: dict[str, int] = defaultdict(int)
    for hearing in upcoming_hearings:
        hearing_date = hearing.get("hearing_date")
        if hearing_date:
            hearings_by_day[hearing_date] += 1

    return {
        "date": today,
        "stats": {
            "active_cases": len(active_cases),
            "hearings_today": len(todays_hearings),
            "overdue_tasks": len(overdue_tasks),
            "pending_tasks": len(pending_tasks),
        },
        "todays_hearings": todays_hearings,
        "tasks_due_today": tasks_due_today,
        "overdue_tasks": overdue_tasks,
        "upcoming_hearings": upcoming_hearings[:7],
        "weekly_hearings": [
            {"date": hearing_date, "count": count}
            for hearing_date, count in sorted(hearings_by_day.items())
        ],
        "active_cases": active_cases,
    }
