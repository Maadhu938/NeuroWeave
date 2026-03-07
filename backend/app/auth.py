"""Firebase auth middleware — verifies ID tokens from the frontend."""

import json
import logging

from fastapi import HTTPException, Request
from firebase_admin import auth as firebase_auth, credentials, initialize_app

from app.config import settings

logger = logging.getLogger("neuroweave.auth")

# Initialise Firebase Admin SDK
_firebase_initialised = False


class _DevCredential(credentials.Base):
    """Minimal credential for local development without a service-account file.

    Token verification (verify_id_token) fetches Google’s public keys over
    HTTPS and never touches this credential, so an anonymous placeholder
    is perfectly fine for dev use.
    """

    def get_credential(self):
        from google.auth.credentials import AnonymousCredentials
        return AnonymousCredentials()


def _init_firebase():
    global _firebase_initialised
    if _firebase_initialised:
        return
    if not settings.firebase_project_id:
        logger.warning("FIREBASE_PROJECT_ID not set – auth will reject all requests")
        _firebase_initialised = True
        return

    sa = settings.firebase_service_account.strip()
    if sa and not sa.startswith("#"):
        # Support both file path and inline JSON content
        if sa.startswith("{"):
            cred = credentials.Certificate(json.loads(sa))
        else:
            cred = credentials.Certificate(sa)
    else:
        cred = _DevCredential()

    try:
        initialize_app(cred, {"projectId": settings.firebase_project_id})
        logger.info("Firebase Admin SDK initialised (project: %s)", settings.firebase_project_id)
    except ValueError:
        pass  # Already initialised

    _firebase_initialised = True


def get_current_user(request: Request) -> dict:
    """FastAPI dependency that extracts and verifies the Firebase ID token.
    Returns the decoded token dict with uid, email, etc.
    """
    _init_firebase()

    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(401, "Missing or invalid Authorization header")

    token = auth_header.removeprefix("Bearer ").strip()
    try:
        decoded = firebase_auth.verify_id_token(token)
        return decoded
    except Exception as e:
        logger.error("Token verification failed: %s", e)
        raise HTTPException(401, f"Token verification failed: {e}")
