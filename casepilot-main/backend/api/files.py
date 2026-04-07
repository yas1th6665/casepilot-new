"""File management endpoints."""

from __future__ import annotations

from pathlib import Path

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse, RedirectResponse

from backend.services.firestore_service import (
    create_case_file,
    delete_case_file,
    get_case_file_by_id,
    list_case_files,
)
from backend.services.storage_service import delete_stored_file, get_download_target, upload_case_file

router = APIRouter()


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    case_number: str = Form(...),
    category: str = Form("other"),
    uploaded_by: str = Form("Advocate"),
    notes: str = Form(""),
):
    content = await file.read()
    storage = upload_case_file(
        case_number=case_number,
        category=category,
        filename=file.filename,
        content=content,
        content_type=file.content_type,
    )
    file_record = create_case_file(
        {
            "case_number": case_number,
            "filename": file.filename,
            "original_name": file.filename,
            "file_size": len(content),
            "file_type": file.content_type or "application/octet-stream",
            "category": category,
            "uploaded_by": uploaded_by,
            "notes": notes,
            "storage_mode": storage["storage_mode"],
            "gcs_path": storage["gcs_path"],
            "local_path": storage["local_path"],
            "download_url": "",
        }
    )
    return {
        "status": "uploaded",
        "file": file_record,
    }


@router.get("/case/{case_number:path}")
async def get_case_files(case_number: str):
    return {"files": list_case_files(case_number), "case_number": case_number}


@router.post("/link")
async def attach_external_link(payload: dict):
    source_url = (payload.get("source_url") or "").strip()
    case_number = (payload.get("case_number") or "").strip()

    if not source_url:
        raise HTTPException(status_code=400, detail="source_url is required")
    if not case_number:
        raise HTTPException(status_code=400, detail="case_number is required")

    title = (payload.get("title") or "").strip() or "External Court Document"
    category = (payload.get("category") or "orders").strip() or "orders"

    file_record = create_case_file(
        {
            "case_number": case_number,
            "filename": title,
            "original_name": title,
            "file_size": payload.get("file_size", 0),
            "file_type": payload.get("file_type", "external/link"),
            "category": category,
            "uploaded_by": payload.get("uploaded_by", "Advocate"),
            "notes": payload.get("notes", ""),
            "storage_mode": "external",
            "gcs_path": "",
            "local_path": "",
            "download_url": "",
            "source_url": source_url,
            "source_label": payload.get("source_label", "eCourts"),
            "document_type": payload.get("document_type", category),
        }
    )
    return {"status": "attached", "file": file_record}


@router.get("/{file_id}/download")
async def download_file(file_id: str):
    file_record = get_case_file_by_id(file_id)
    if not file_record:
        raise HTTPException(status_code=404, detail="File not found")

    try:
        target = get_download_target(file_record)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    if target["mode"] == "redirect":
        return RedirectResponse(target["url"])

    path = Path(target["path"])
    return FileResponse(path, filename=file_record.get("filename"), media_type=target["media_type"])


@router.delete("/{file_id}")
async def delete_file(file_id: str):
    file_record = get_case_file_by_id(file_id)
    if not file_record:
        raise HTTPException(status_code=404, detail="File not found")

    try:
        delete_stored_file(file_record)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    delete_case_file(file_id)
    return {"status": "deleted", "file_id": file_id}
