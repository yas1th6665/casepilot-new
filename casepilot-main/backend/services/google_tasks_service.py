"""Google Tasks integration helpers with graceful fallback."""

from __future__ import annotations

from pathlib import Path

from backend.config import settings
from backend.services.google_oauth_service import get_user_google_connection, get_user_google_credentials


class GoogleTasksConfigError(RuntimeError):
    """Raised when Google Tasks sync is not configured."""


def _load_google_build():
    from googleapiclient.discovery import build

    return build


def _get_credentials(scopes: list[str]):
    from google.oauth2 import service_account

    credentials_path = settings.google_tasks_credentials_path
    if not credentials_path:
        raise GoogleTasksConfigError("Google Tasks credentials path is not configured.")

    credentials_file = Path(credentials_path)
    if not credentials_file.exists():
        raise GoogleTasksConfigError(f"Credentials file not found: {credentials_file}")

    credentials = service_account.Credentials.from_service_account_file(
        str(credentials_file),
        scopes=scopes,
    )
    if settings.google_workspace_user:
        credentials = credentials.with_subject(settings.google_workspace_user)
    return credentials


def _get_tasks_service(user_id: str | None = None):
    build = _load_google_build()
    credentials = get_user_google_credentials("google_tasks", user_id or settings.default_user_id)
    if credentials is None:
        credentials = _get_credentials(["https://www.googleapis.com/auth/tasks"])
    return build("tasks", "v1", credentials=credentials, cache_discovery=False)


def _get_or_create_casepilot_tasklist(service):
    task_lists = service.tasklists().list().execute()
    for task_list in task_lists.get("items", []):
        if task_list["title"] == "CasePilot":
            return task_list["id"]
    created = service.tasklists().insert(body={"title": "CasePilot"}).execute()
    return created["id"]


def create_google_task(*, title: str, notes: str = "", due_date: str = "", case_number: str = "", user_id: str | None = None) -> dict:
    service = _get_tasks_service(user_id)
    tasklist_id = _get_or_create_casepilot_tasklist(service)

    body = {
        "title": f"[{case_number}] {title}" if case_number else title,
        "notes": notes,
    }
    if due_date:
        body["due"] = f"{due_date}T00:00:00.000Z"

    created = service.tasks().insert(tasklist=tasklist_id, body=body).execute()
    return {
        "status": "success",
        "task_id": created["id"],
        "task_link": created.get("webViewLink", ""),
        "message": f"Google Task created: {title}",
    }


def get_google_tasks_status(user_id: str | None = None) -> dict:
    user_record = get_user_google_connection("google_tasks", user_id or settings.default_user_id)
    config = (user_record or {}).get("config", {})
    if config.get("auth_type") == "user_oauth" and config.get("refresh_token"):
        return {
            "status": "connected",
            "auth_type": "user_oauth",
            "account_email": config.get("account_email", ""),
            "account_name": config.get("account_name", ""),
        }

    configured = bool(settings.google_tasks_credentials_path)
    exists = bool(configured and Path(settings.google_tasks_credentials_path).exists())
    return {
        "status": "configured" if exists else "not_configured",
        "configured": configured,
        "credentials_found": exists,
        "auth_type": "service_account" if exists else "none",
    }
