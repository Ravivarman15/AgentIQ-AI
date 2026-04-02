"""
AGENTIQ AI — Application Entry Point
Production-ready FastAPI application factory.
Added /api global prefix for blueprint compliance.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config.settings import APP_TITLE, APP_VERSION, CORS_ORIGINS
from app.config.env import validate_environment
from app.models.database import init_db

# Route modules
from app.api.routes_auth import router as auth_router
from app.api.routes_upload import router as upload_router
from app.api.routes_ml import router as ml_router
from app.api.routes_rag import router as rag_router
from app.api.routes_report import router as report_router
from app.api.routes_status import router as status_router


# ═══════════════════════════════════════════════════════════════════════════════
# APP FACTORY
# ═══════════════════════════════════════════════════════════════════════════════

def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""

    # Validate environment
    validate_environment()

    # Initialize database
    init_db()

    # Create app
    application = FastAPI(
        title=APP_TITLE,
        version=APP_VERSION,
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # CORS middleware
    application.add_middleware(
        CORSMiddleware,
        allow_origins=CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Health check (root)
    @application.get("/")
    def home():
        return {
            "message": "Welcome to AGENTIQ AI Backend Engine",
            "status": "online",
            "version": APP_VERSION
        }

    # Register routers (no prefix — frontend calls bare paths like /datasets)
    application.include_router(auth_router)
    application.include_router(upload_router)
    application.include_router(ml_router)
    application.include_router(rag_router)
    application.include_router(report_router)
    application.include_router(status_router)

    return application


# Create the app instance (used by uvicorn)
app = create_app()


if __name__ == "__main__":
    import uvicorn
    from app.config.settings import HOST, PORT
    uvicorn.run("app.main:app", host=HOST, port=PORT, reload=True)
