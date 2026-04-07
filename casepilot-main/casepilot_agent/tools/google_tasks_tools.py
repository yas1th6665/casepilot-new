"""Google Tasks tools for the CasePilot agent."""

from __future__ import annotations

from backend.services.google_tasks_service import GoogleTasksConfigError, create_google_task as backend_create_google_task
from .firestore_tools import get_overdue_tasks, get_pending_tasks


def create_google_task(title: str, notes: str = "", due_date: str = "", case_number: str = "") -> dict:
    """Create a Google Task from a CasePilot task."""
    try:
        return backend_create_google_task(
            title=title,
            notes=notes,
            due_date=due_date,
            case_number=case_number,
        )
    except GoogleTasksConfigError as exc:
        return {"status": "not_configured", "message": str(exc)}


def sync_pending_tasks_to_google() -> dict:
    """Sync pending and overdue tasks to Google Tasks."""
    pending = get_pending_tasks().get("tasks", [])
    overdue = get_overdue_tasks().get("overdue_tasks", [])
    all_tasks = {task["id"]: task for task in [*pending, *overdue]}.values()
    results = []
    for task in all_tasks:
        results.append(
            create_google_task(
                title=task["title"],
                notes=task.get("description", ""),
                due_date=task.get("due_date", ""),
                case_number=task.get("case_number", ""),
            )
        )
    return {
        "status": "success" if results else "empty",
        "tasks_synced": len([item for item in results if item.get("status") == "success"]),
        "details": results,
    }
