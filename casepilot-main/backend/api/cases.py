"""Case endpoints."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

from backend.services.firestore_service import create_case, get_case_by_number, list_active_cases, update_case

router = APIRouter()


@router.get("")
async def get_cases():
    return {"cases": list_active_cases()}


@router.get("/{case_number:path}")
async def get_case(case_number: str):
    case = get_case_by_number(case_number)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case


@router.post("")
async def post_case(payload: dict):
    return create_case(payload)


@router.put("/{case_number:path}")
async def put_case(case_number: str, payload: dict):
    try:
        return update_case(case_number, payload)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
