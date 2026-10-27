# ASTROMORPH FastAPI backend

This starter API verifies Firebase Authentication ID tokens with the Firebase
Admin SDK. Firebase Authentication remains responsible for signing users in;
the backend verifies each bearer token before returning protected data.

## Run locally

1. Create and activate a Python virtual environment in `backend`.
2. Install dependencies with `pip install -r requirements.txt`.
3. Copy `.env.example` to `.env` and configure Firebase Admin credentials and `GEMINI_API_KEY`.
4. To run the API and frontend together, open a terminal in `frontend` and run
   `npm run dev:all`. This starts FastAPI at `http://localhost:8000` and Vite
   at `http://localhost:5173`; pressing Ctrl+C stops both.

To run only the API from `backend`, use
`python -m uvicorn app.main:app --reload --env-file .env`.

The health check is available at `http://localhost:8000/healthz`, and the
interactive API documentation is at `http://localhost:8000/docs`.

The authenticated `POST /api/analysis/drug-summary` endpoint uses the Gemini
API to generate a research-only drug/condition brief. Keep `GEMINI_API_KEY` in
the backend `.env` only; never expose it through frontend environment variables.
The response is AI-generated and is not a substitute for checking current
primary literature or authoritative prescribing information.

## Configure Firebase Admin

Use one of the following credential options:

- Set `GOOGLE_APPLICATION_CREDENTIALS` to the path of a Firebase service
  account JSON file.
- Set `FIREBASE_SERVICE_ACCOUNT_JSON` to the service account JSON contents.
- Use Application Default Credentials in the deployment environment.

Optionally set `FIREBASE_PROJECT_ID` and provide the comma-separated browser
origins in `FRONTEND_ORIGINS`. Never commit service-account credentials.

In the Firebase Console, enable Email/Password and Google under
Authentication > Sign-in method. Copy the Firebase Web app's API key, auth
domain, project ID, and app ID into the `VITE_FIREBASE_*` variables in
`frontend/.env`. The frontend will attach the Firebase ID token to API requests
when `VITE_API_BASE_URL` is set.

## Authenticate a request

Sign in through Firebase Authentication in the frontend, then send its Firebase
ID token as `Authorization: Bearer <id-token>`. `GET /api/auth/me` verifies the
signature, expiry, and revocation status and returns the authenticated identity.
Missing or invalid credentials receive HTTP 401; unavailable Firebase
configuration receives HTTP 503.

This starter currently implements `/healthz`, `/api/auth/me`, and
`/api/analysis/drug-summary`; the frontend's other research-data routes have
not yet been ported. Keep
`VITE_API_BASE_URL` empty to continue using the existing frontend mock-data
adapter until those routes are implemented.
