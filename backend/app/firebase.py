import json
import os
from functools import lru_cache
from pathlib import Path
from typing import Any

import firebase_admin
from dotenv import load_dotenv
from firebase_admin import auth, credentials
from google.auth.exceptions import DefaultCredentialsError

load_dotenv(Path(__file__).resolve().parents[1] / ".env", override=False)


class FirebaseConfigurationError(RuntimeError):
    """Raised when Firebase Admin credentials are missing or unusable."""


@lru_cache(maxsize=1)
def _get_firebase_app() -> firebase_admin.App:
    try:
        return firebase_admin.get_app()
    except ValueError:
        pass

    service_account_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
    service_account_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

    try:
        service_account_info = json.loads(service_account_json) if service_account_json else None
        if service_account_info is not None and not isinstance(service_account_info, dict):
            raise ValueError("Firebase service-account JSON must be an object.")
        project_id = os.getenv("FIREBASE_PROJECT_ID") or (
            service_account_info.get("project_id") if service_account_info else None
        )

        if service_account_json:
            credential = credentials.Certificate(service_account_info)
        elif service_account_path:
            credential = credentials.Certificate(service_account_path)
        else:
            credential = credentials.ApplicationDefault()

        options = {"projectId": project_id} if project_id else None
        return firebase_admin.initialize_app(credential, options)
    except (DefaultCredentialsError, OSError, ValueError, json.JSONDecodeError) as exc:
        raise FirebaseConfigurationError(
            "Firebase Admin could not load credentials. Set "
            "GOOGLE_APPLICATION_CREDENTIALS, FIREBASE_SERVICE_ACCOUNT_JSON, "
            "or configure Application Default Credentials."
        ) from exc


def verify_id_token(token: str) -> dict[str, Any]:
    return auth.verify_id_token(token, app=_get_firebase_app(), check_revoked=True)
