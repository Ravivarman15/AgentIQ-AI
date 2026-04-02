"""
AGENTIQ AI — Database Connection & Session Management
Supports Supabase PostgreSQL with SQLite fallback.
"""

import os
from urllib.parse import quote_plus
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

Base = declarative_base()


# ═══════════════════════════════════════════════════════════════════════════════
# DATABASE CONNECTION — Supabase PostgreSQL
# ═══════════════════════════════════════════════════════════════════════════════

def _build_database_url():
    """Build database URL, handling special characters in passwords."""

    # Option 1: Individual Supabase components (most reliable)
    supabase_host = os.getenv("SUPABASE_DB_HOST")
    supabase_password = os.getenv("SUPABASE_DB_PASSWORD")
    supabase_user = os.getenv("SUPABASE_DB_USER", "postgres")
    supabase_port = os.getenv("SUPABASE_DB_PORT", "5432")
    supabase_name = os.getenv("SUPABASE_DB_NAME", "postgres")

    if supabase_host and supabase_password:
        encoded_password = quote_plus(supabase_password)
        return f"postgresql://{supabase_user}:{encoded_password}@{supabase_host}:{supabase_port}/{supabase_name}?sslmode=require"

    # Option 2: Full connection string
    db_url = os.getenv("SUPABASE_DB_URL")
    if db_url:
        if "sslmode" not in db_url:
            separator = "&" if "?" in db_url else "?"
            db_url += f"{separator}sslmode=require"
        return db_url

    # Option 3: Legacy fallback
    return os.getenv("DATABASE_URL", "sqlite:///./agentiq.db")


DATABASE_URL = _build_database_url()

# Configure engine based on database type
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
elif DATABASE_URL.startswith("postgresql"):
    # Force IPv4 connections — Render free tier doesn't support IPv6
    # which causes "Network is unreachable" errors with Supabase direct connections
    connect_args = {"options": "-c statement_timeout=30000"}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,
    pool_recycle=300,
    pool_size=5,
    max_overflow=10,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    """
    Initialize database tables.
    For Supabase PostgreSQL: Tables are created via supabase_migration.sql,
    so this is a safety net.
    """
    # Import models to register them with Base.metadata
    from app.models.user_model import User  # noqa: F401
    from app.models.dataset_model import Dataset  # noqa: F401

    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Database connection verified")
    except Exception as e:
        print(f"⚠️ Database init warning: {e}")
        print("   The app will still start — tables should already exist via supabase_migration.sql")
        print("   Requests requiring DB access will retry the connection automatically (pool_pre_ping=True)")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
