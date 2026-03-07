from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text

from app.config import settings
from app.database import engine, Base
from app.models import models  # noqa: F401 — registers models with Base.metadata
from app.api import dashboard, insights, knowledge_graph, upload, study_planner, ask, memory, metrics, review
from app.api import settings as settings_api


_MIGRATION_TABLES = ("knowledge_nodes", "knowledge_edges", "review_logs", "upload_records")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables & enable pgvector
    async with engine.begin() as conn:
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        await conn.run_sync(Base.metadata.create_all)
        # Migration: add user_id columns if missing (for existing databases)
        for table in _MIGRATION_TABLES:
            await conn.execute(text(
                "DO $$ BEGIN "
                f'ALTER TABLE "{table}" ADD COLUMN user_id VARCHAR(128); '
                "EXCEPTION WHEN duplicate_column THEN NULL; "
                "END $$;"
            ))
            await conn.execute(text(
                f'CREATE INDEX IF NOT EXISTS "ix_{table}_user_id" ON "{table}"(user_id)'
            ))
    yield
    # Shutdown
    await engine.dispose()


app = FastAPI(
    title="Neuroweave API",
    description="AI-powered adaptive learning backend",
    version="1.0.0",
    lifespan=lifespan,
    docs_url=None if settings.environment == "production" else "/docs",
    redoc_url=None,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)


@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catch unhandled exceptions and return a generic error — never leak stack traces."""
    import logging
    logging.getLogger("neuroweave").error("Unhandled error on %s: %s", request.url.path, exc, exc_info=True)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})

# Register routes
app.include_router(dashboard.router)
app.include_router(insights.router)
app.include_router(knowledge_graph.router)
app.include_router(upload.router)
app.include_router(study_planner.router)
app.include_router(ask.router)
app.include_router(memory.router)
app.include_router(metrics.router)
app.include_router(review.router)
app.include_router(settings_api.router)


@app.get("/health")
async def health():
    return {"status": "ok"}
