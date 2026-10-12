import os

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.auth import get_current_user

app = FastAPI(
    title="ASTROMORPH API",
    description="Backend API with Firebase Authentication.",
    version="0.1.0",
)

origins = [
    origin.strip()
    for origin in os.getenv("FRONTEND_ORIGINS", "http://localhost:5173").split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["Authorization", "Content-Type"],
)


@app.get("/healthz", tags=["health"])
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/auth/me", tags=["authentication"])
def read_current_user(user: dict = Depends(get_current_user)) -> dict:
    return {
        "uid": user["uid"],
        "email": user.get("email"),
        "name": user.get("name"),
        "email_verified": user.get("email_verified", False),
        "picture": user.get("picture"),
    }
