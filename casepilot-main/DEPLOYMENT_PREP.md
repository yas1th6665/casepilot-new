# CasePilot Deployment Prep

This project is prepared for deployment, but this repo has not been deployed from this workspace.

## What Is Ready

- `Dockerfile.backend` builds the FastAPI backend
- `Dockerfile.frontend` builds the React frontend and serves it with Nginx
- `docker-compose.yml` runs both services locally in containers
- `.env.example` lists the environment variables you need without using local secrets

## Before Deployment

1. Copy `.env.example` to `.env` and fill in real values.
2. Make sure the Google service account has Firestore, Vertex AI, and Storage access.
3. Configure a real `GCS_BUCKET_NAME`.
4. Configure Telegram with `TELEGRAM_BOT_TOKEN`.
5. Build both apps locally to confirm there are no regressions.

## Local Container Check

Backend:

```bash
docker build -f Dockerfile.backend -t casepilot-backend .
docker run --env-file .env -p 8000:8000 casepilot-backend
```

Frontend:

```bash
docker build -f Dockerfile.frontend -t casepilot-frontend .
docker run -p 3000:80 casepilot-frontend
```

Compose:

```bash
docker compose up --build
```

## Cloud Run Steps

Backend:

```bash
gcloud builds submit --tag gcr.io/YOUR_PROJECT/casepilot-backend -f Dockerfile.backend .
gcloud run deploy casepilot-backend \
  --image gcr.io/YOUR_PROJECT/casepilot-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

Frontend:

```bash
gcloud builds submit --tag gcr.io/YOUR_PROJECT/casepilot-frontend -f Dockerfile.frontend .
gcloud run deploy casepilot-frontend \
  --image gcr.io/YOUR_PROJECT/casepilot-frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## Post-Deploy Checklist

1. Set `VITE_API_URL` to the deployed backend URL before building the frontend image.
2. Set Telegram webhook to `https://YOUR_BACKEND_URL/webhook/telegram`.
3. Verify `/health`, `/api/brief`, `/api/connections`, and `/webhook/telegram`.
4. Test one full workflow:
   - dashboard loads
   - case detail loads
   - file upload works
   - Telegram `/briefing` works
   - calendar/tasks status cards render correctly

## Demo Readiness

- Frontend build passes
- Backend imports pass
- Phases 1 to 6 are implemented
- Phase 7 packaging artifacts are now in place
- Actual deployment and live webhook configuration are still intentionally pending
