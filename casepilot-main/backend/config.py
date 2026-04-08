"""Environment configuration for the CasePilot backend."""

from __future__ import annotations

import base64
import os
import tempfile
from dataclasses import dataclass
from dotenv import load_dotenv

load_dotenv()

# Decode GOOGLE_CREDENTIALS_JSON and write to a temp file so that
# google.auth.default() can find Application Default Credentials.
_creds_b64 = os.getenv("GOOGLE_CREDENTIALS_JSON", "")
if _creds_b64 and not os.getenv("GOOGLE_APPLICATION_CREDENTIALS"):
    try:
        _creds_json = base64.b64decode(_creds_b64).decode()
        _tmp = tempfile.NamedTemporaryFile(
            mode="w", suffix=".json", delete=False, prefix="casepilot_gsa_"
        )
        _tmp.write(_creds_json)
        _tmp.close()
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = _tmp.name
    except Exception as _e:
        print(f"[config] Warning: could not decode GOOGLE_CREDENTIALS_JSON: {_e}")


@dataclass(frozen=True)
class Settings:
    app_name: str = "CasePilot API"
    app_version: str = "2.0.0"
    cors_origins: tuple[str, ...] = ("*",)
    default_user_id: str = os.getenv("CASEPILOT_DEFAULT_USER_ID", "dashboard-user")
    google_calendar_credentials_path: str = os.getenv(
        "GOOGLE_CALENDAR_CREDENTIALS_PATH",
        os.getenv("GOOGLE_APPLICATION_CREDENTIALS", ""),
    )
    google_tasks_credentials_path: str = os.getenv(
        "GOOGLE_TASKS_CREDENTIALS_PATH",
        os.getenv("GOOGLE_APPLICATION_CREDENTIALS", ""),
    )
    google_workspace_user: str = os.getenv("GOOGLE_WORKSPACE_USER", "")
    timezone: str = os.getenv("CASEPILOT_TIMEZONE", "Asia/Kolkata")
    gcs_bucket_name: str = os.getenv("GCS_BUCKET_NAME", "")
    local_upload_dir: str = os.getenv("CASEPILOT_LOCAL_UPLOAD_DIR", ".casepilot_uploads")
    backend_url: str = os.getenv("BACKEND_URL", "http://127.0.0.1:8000")
    telegram_bot_token: str = os.getenv("TELEGRAM_BOT_TOKEN", "")
    telegram_webhook_url: str = os.getenv("TELEGRAM_WEBHOOK_URL", "")
    telegram_default_prefix: str = os.getenv("CASEPILOT_TELEGRAM_USER_PREFIX", "telegram-user")
    google_oauth_client_id: str = os.getenv("GOOGLE_OAUTH_CLIENT_ID", "")
    google_oauth_client_secret: str = os.getenv("GOOGLE_OAUTH_CLIENT_SECRET", "")
    google_oauth_redirect_uri: str = os.getenv("GOOGLE_OAUTH_REDIRECT_URI", "http://127.0.0.1:8000/api/google-auth/callback")


settings = Settings()
