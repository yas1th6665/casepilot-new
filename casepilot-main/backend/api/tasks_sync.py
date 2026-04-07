"""Google Tasks sync endpoints."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, Request

from backend.auth_context import get_request_user_id
from backend.config import settings
from backend.services.firestore_service import get_task_by_id, list_overdue_tasks, list_pending_tasks, update_task
from backend.services.google_tasks_service import GoogleTasksConfigError, create_google_task, get_google_tasks_status

router = APIRouter()


@router.post("/sync-task/{task_id}")
async def sync_task(task_id: str, request: Request):
    user_id = get_request_user_id(request)
    task = get_task_by_id(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    try:
        result = create_google_task(
            title=task["title"],
            notes=task.get("description", ""),
            due_date=task.get("due_date", ""),
            case_number=task.get("case_number", ""),
            user_id=user_id,
        )
    except GoogleTasksConfigError as exc:
        return {"status": "not_configured", "message": str(exc), "task_id": task_id}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    update_task(
        task_id,
        {
            "google_tasks_synced": True,
            "google_task_id": result["task_id"],
            "google_task_link": result.get("task_link", ""),
        },
    )
    return result


@router.post("/sync-all")
async def sync_all_tasks(request: Request):
    user_id = get_request_user_id(request)
    tasks = {task["id"]: task for task in [*list_pending_tasks(), *list_overdue_tasks()]}.values()
    try:
        results = []
        for task in tasks:
            if task.get("google_tasks_synced"):
                continue
            result = create_google_task(
                title=task["title"],
                notes=task.get("description", ""),
                due_date=task.get("due_date", ""),
                case_number=task.get("case_number", ""),
                user_id=user_id,
            )
            update_task(
                task["id"],
                {
                    "google_tasks_synced": True,
                    "google_task_id": result["task_id"],
                    "google_task_link": result.get("task_link", ""),
                },
            )
            results.append({"task_id": task["id"], **result})
    except GoogleTasksConfigError as exc:
        return {"status": "not_configured", "message": str(exc), "synced": 0}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    return {"status": "success", "synced": len(results), "details": results}


@router.get("/status")
async def tasks_status(request: Request):
    return get_google_tasks_status(get_request_user_id(request))
