"""Task endpoints."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

from backend.services.firestore_service import (
    create_task,
    delete_task,
    list_case_tasks,
    list_overdue_tasks,
    list_pending_tasks,
    update_task_status,
)

router = APIRouter()


@router.get("")
async def get_tasks():
    return {"tasks": list_pending_tasks()}


@router.get("/overdue")
async def get_overdue():
    return {"tasks": list_overdue_tasks()}


@router.get("/case/{case_number:path}")
async def get_case_tasks(case_number: str):
    return {"tasks": list_case_tasks(case_number)}


@router.post("")
async def post_task(payload: dict):
    return create_task(payload)


@router.put("/{task_id}/status")
async def put_task_status(task_id: str, payload: dict):
    try:
        return update_task_status(task_id, payload["status"])
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.delete("/{task_id}")
async def del_task(task_id: str):
    try:
        return delete_task(task_id)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
