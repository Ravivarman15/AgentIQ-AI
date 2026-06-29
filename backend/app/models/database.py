"""
AGENTIQ AI — Database Connection & Session Management
Local SQLite database — zero external dependencies.
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from app.config.settings import SQLITE_DB_PATH

Base = declarative_base()


# ═══════════════════════════════════════════════════════════════════════════════
# DATABASE CONNECTION — Local SQLite
# ═══════════════════════════════════════════════════════════════════════════════

DATABASE_URL = f"sqlite:///./{SQLITE_DB_PATH}"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    pool_pre_ping=True,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    """
    Initialize database tables.
    SQLite tables are auto-created by SQLAlchemy.
    """
    # Import models to register them with Base.metadata
    from app.models.user_model import User  # noqa: F401
    from app.models.dataset_model import Dataset  # noqa: F401

    try:
        Base.metadata.create_all(bind=engine)
        print(f"✅ SQLite database ready: {SQLITE_DB_PATH}")
    except Exception as e:
        print(f"⚠️ Database init warning: {e}")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
