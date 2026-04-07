"""Daily briefing endpoint."""

from __future__ import annotations

from fastapi import APIRouter

from backend.services.firestore_service import build_daily_brief

router = APIRouter()


@router.get("")
async def get_brief():
    return build_daily_brief()
