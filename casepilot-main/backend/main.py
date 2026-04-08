"""CasePilot Backend API."""

from __future__ import annotations

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from backend.config import settings  # must be first — sets GOOGLE_APPLICATION_CREDENTIALS
from backend.api import (
    brief,
    calendar_sync,
    cases,
    chat,
    files,
    google_auth,
    hearings,
    research,
    tasks,
    tasks_sync,
    telegram_webhook,
    tool_connections,
    user_settings,
)

app = FastAPI(title=settings.app_name, version=settings.app_version)

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.cors_origins),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cases.router, prefix="/api/cases", tags=["Cases"])
app.include_router(hearings.router, prefix="/api/hearings", tags=["Hearings"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["Tasks"])
app.include_router(research.router, prefix="/api/research", tags=["Research"])
app.include_router(files.router, prefix="/api/files", tags=["Files"])
app.include_router(calendar_sync.router, prefix="/api/calendar", tags=["Calendar"])
app.include_router(tasks_sync.router, prefix="/api/google-tasks", tags=["Google Tasks"])
app.include_router(google_auth.router, prefix="/api/google-auth", tags=["Google Auth"])
app.include_router(brief.router, prefix="/api/brief", tags=["Daily Brief"])
app.include_router(tool_connections.router, prefix="/api/connections", tags=["Connections"])
app.include_router(user_settings.router, prefix="/api/settings", tags=["Settings"])
app.include_router(chat.router, tags=["Chat"])
app.include_router(telegram_webhook.router, prefix="/webhook", tags=["Telegram"])


@app.get("/health")
async def health():
    return {"status": "ok", "service": "casepilot-api"}


# Serve the built React frontend — must come AFTER all API routes.
_frontend_dist = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
if os.path.isdir(_frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(_frontend_dist, "assets")), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str = ""):  # noqa: ARG001
        index = os.path.join(_frontend_dist, "index.html")
        return FileResponse(index)
