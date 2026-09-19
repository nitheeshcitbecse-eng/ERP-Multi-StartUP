import os

from contextlib import asynccontextmanager

from fastapi import FastAPI

from fastapi.middleware.cors import (
    CORSMiddleware,
)

from .database import (
    Base,
    engine,
)

from . import models

from .routes.auth import (
    router as auth_router,
)

from .routes.trainee import (
    router as trainee_router,
)

from .routes.trainer import (
    router as trainer_router,
)

from .routes.admin import (
    router as admin_router,
)

from .routes.attendance import (
    router as attendance_router,
)

from .routes.ai import (
    router as ai_router,
)

from .routes.sync import (
    router as sync_router,
)


@asynccontextmanager
async def lifespan(app: FastAPI):

    async with engine.begin() as conn:

        await conn.run_sync(
            Base.metadata.create_all
        )

    yield

    await engine.dispose()


app = FastAPI(
    title="NCCT Backend API",
    version="1.0.0",
    lifespan=lifespan,
)


# Frontend origins allowed to call the API (comma-separated in .env).
CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    ).split(",")
    if origin.strip()
]


app.add_middleware(
    CORSMiddleware,

    allow_origins=CORS_ORIGINS,

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# =========================
# ROUTES
# =========================

app.include_router(
    auth_router,
    prefix="/api",
)

app.include_router(
    trainee_router,
    prefix="/api",
)

app.include_router(
    trainer_router,
    prefix="/api",
)

app.include_router(
    admin_router,
    prefix="/api",
)

app.include_router(
    attendance_router,
    prefix="/api",
)

app.include_router(
    ai_router,
    prefix="/api",
)

app.include_router(
    sync_router,
    prefix="/api",
)


@app.get("/")
async def root():

    return {
        "message":
            "NCCT Backend is running"
    }


@app.get("/health")
async def health():

    return {
        "status": "ok"
    }