"""Telegram webhook receiver."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

from backend.config import settings
from backend.telegram_bot.handlers import process_telegram_update

router = APIRouter()


@router.post("/telegram")
async def telegram_webhook(payload: dict):
    try:
        return await process_telegram_update(payload)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.get("/telegram")
async def telegram_status():
    return {
        "status": "ready" if settings.telegram_bot_token else "not_configured",
        "webhook_url": settings.telegram_webhook_url,
        "token_configured": bool(settings.telegram_bot_token),
    }
