"""Research endpoints."""

from __future__ import annotations

from fastapi import APIRouter

from backend.services.firestore_service import create_case_note, list_case_notes, search_case_notes, search_precedents

router = APIRouter()


@router.get("/precedents/{subject}")
async def get_precedents(subject: str):
    return {"precedents": search_precedents(subject)}


@router.get("/notes/{query}")
async def get_notes(query: str):
    return {"notes": search_case_notes(query)}


@router.get("/case/{case_number:path}/notes")
async def get_case_notes(case_number: str):
    return {"notes": list_case_notes(case_number)}


@router.post("/save-note")
async def save_note(payload: dict):
    note = create_case_note(
        {
            "case_number": payload.get("case_number", ""),
            "title": payload.get("title", "Case Note"),
            "content": payload.get("content", ""),
            "note_type": payload.get("note_type", "general"),
            "author": payload.get("author", "Advocate"),
        }
    )
    return {"status": "saved", "note": note}
