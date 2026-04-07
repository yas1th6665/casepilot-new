"""Storage helpers for case files.

Uses GCS when configured, otherwise falls back to local workspace storage for demo use.
"""

from __future__ import annotations

from pathlib import Path
import mimetypes
import os

from backend.config import settings


class StorageConfigError(RuntimeError):
    """Raised when storage is not configured properly."""


def _safe_case_number(case_number: str) -> str:
    return case_number.replace("/", "_").replace("\\", "_").replace(" ", "_")


def _local_root() -> Path:
    return Path(settings.local_upload_dir).resolve()


def _ensure_local_parent(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)


def _load_storage_client():
    from google.cloud import storage

    return storage.Client()


def storage_mode() -> str:
    return "gcs" if settings.gcs_bucket_name else "local"


def upload_case_file(
    *,
    case_number: str,
    category: str,
    filename: str,
    content: bytes,
    content_type: str | None = None,
) -> dict:
    safe_case = _safe_case_number(case_number)
    safe_category = (category or "other").strip().lower().replace(" ", "_")
    object_path = f"cases/{safe_case}/{safe_category}/{filename}"

    if settings.gcs_bucket_name:
        client = _load_storage_client()
        bucket = client.bucket(settings.gcs_bucket_name)
        blob = bucket.blob(object_path)
        blob.upload_from_string(content, content_type=content_type or "application/octet-stream")
        return {
            "storage_mode": "gcs",
            "gcs_path": object_path,
            "local_path": "",
        }

    local_path = _local_root() / object_path
    _ensure_local_parent(local_path)
    local_path.write_bytes(content)
    return {
        "storage_mode": "local",
        "gcs_path": "",
        "local_path": str(local_path),
    }


def delete_stored_file(file_record: dict) -> None:
    if file_record.get("storage_mode") == "gcs" and settings.gcs_bucket_name and file_record.get("gcs_path"):
        client = _load_storage_client()
        bucket = client.bucket(settings.gcs_bucket_name)
        bucket.blob(file_record["gcs_path"]).delete()
        return

    local_path = file_record.get("local_path")
    if local_path:
        path = Path(local_path)
        if path.exists():
            path.unlink()


def get_download_target(file_record: dict) -> dict:
    source_url = file_record.get("source_url")
    if source_url:
        return {"mode": "redirect", "url": source_url}

    if file_record.get("storage_mode") == "gcs" and settings.gcs_bucket_name and file_record.get("gcs_path"):
        client = _load_storage_client()
        bucket = client.bucket(settings.gcs_bucket_name)
        blob = bucket.blob(file_record["gcs_path"])
        signed_url = blob.generate_signed_url(version="v4", expiration=900, method="GET")
        return {"mode": "redirect", "url": signed_url}

    local_path = file_record.get("local_path")
    if not local_path:
        raise StorageConfigError("No download target available for this file.")

    path = Path(local_path)
    if not path.exists():
        raise FileNotFoundError(f"Local file not found: {path}")

    media_type = file_record.get("file_type") or mimetypes.guess_type(path.name)[0] or "application/octet-stream"
    return {"mode": "local", "path": str(path), "media_type": media_type}
