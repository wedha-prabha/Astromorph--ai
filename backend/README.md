# ASTROMORPH FastAPI backend

This starter API verifies Firebase Authentication ID tokens with the Firebase
Admin SDK. Firebase Authentication remains responsible for signing users in;
the backend verifies each bearer token before returning protected data.

## Run locally

1. Create and activate a Python virtual environment in `backend`.
2. Install dependencies with `pip install -r requirements.txt`.
3. Copy `.env.example` to `.env` and configure Firebase Admin credentials.
4. Start the API with `uvicorn app.main:app --reload --env-file .env`.

The health check is available at `http://localhost:8000/healthz`, and the
interactive API documentation is at `http://localhost:8000/docs`.

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

This starter currently implements only `/healthz` and `/api/auth/me`; the
frontend's research-data routes have not yet been ported. Keep
`VITE_API_BASE_URL` empty to continue using the existing frontend mock-data
adapter until those routes are implemented.
