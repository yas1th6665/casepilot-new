"""Hearing endpoints."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

from backend.services.firestore_service import (
    create_hearing,
    list_case_hearings,
    list_upcoming_hearings,
    update_hearing,
)

router = APIRouter()


@router.get("")
async def get_hearings():
    return {"hearings": list_upcoming_hearings()}


@router.get("/case/{case_number:path}")
async def get_case_hearings(case_number: str):
    return {"hearings": list_case_hearings(case_number)}


@router.post("")
async def post_hearing(payload: dict):
    return create_hearing(payload)


@router.put("/{hearing_id}")
async def put_hearing(hearing_id: str, payload: dict):
    try:
        return update_hearing(hearing_id, payload)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
