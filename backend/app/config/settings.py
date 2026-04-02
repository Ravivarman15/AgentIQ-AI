"""
AGENTIQ AI — Centralized Configuration Settings
All environment variables and application constants in one place.
"""

import os
from dotenv import load_dotenv

load_dotenv()


# ═══════════════════════════════════════════════════════════════════════════════
# APPLICATION
# ═══════════════════════════════════════════════════════════════════════════════
APP_TITLE = "AGENTIQ AI — Enterprise Multi-User Platform"
APP_VERSION = "2.0.0"
DEBUG = os.getenv("DEBUG", "false").lower() == "true"

# ═══════════════════════════════════════════════════════════════════════════════
# CORS — Allowed Origins
# ═══════════════════════════════════════════════════════════════════════════════
CORS_ORIGINS = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000,https://*.vercel.app"
).split(",")

# ═══════════════════════════════════════════════════════════════════════════════
# AUTHENTICATION (JWT)
# ═══════════════════════════════════════════════════════════════════════════════
SECRET_KEY = os.getenv("SECRET_KEY", "agentiq_secret_key_change_me_in_prod")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))  # 24h

# ═══════════════════════════════════════════════════════════════════════════════
# SUPABASE / DATABASE
# ═══════════════════════════════════════════════════════════════════════════════
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")
SUPABASE_DB_HOST = os.getenv("SUPABASE_DB_HOST", "")
SUPABASE_DB_PASSWORD = os.getenv("SUPABASE_DB_PASSWORD", "")
SUPABASE_DB_USER = os.getenv("SUPABASE_DB_USER", "postgres")
SUPABASE_DB_PORT = os.getenv("SUPABASE_DB_PORT", "5432")
SUPABASE_DB_NAME = os.getenv("SUPABASE_DB_NAME", "postgres")
DATABASE_URL = os.getenv("DATABASE_URL", "")
SUPABASE_DB_URL = os.getenv("SUPABASE_DB_URL", "")

# ═══════════════════════════════════════════════════════════════════════════════
# HUGGINGFACE / LLM
# ═══════════════════════════════════════════════════════════════════════════════
HUGGINGFACEHUB_API_TOKEN = os.getenv("HUGGINGFACEHUB_API_TOKEN", "")
HF_MODEL_REPO = os.getenv("HF_MODEL_REPO", "meta-llama/Meta-Llama-3-8B-Instruct")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")

# ═══════════════════════════════════════════════════════════════════════════════
# FILE UPLOAD
# ═══════════════════════════════════════════════════════════════════════════════
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
MAX_UPLOAD_SIZE_MB = int(os.getenv("MAX_UPLOAD_SIZE_MB", "100"))
ALLOWED_EXTENSIONS = [".csv", ".xlsx", ".xls", ".json"]

# ═══════════════════════════════════════════════════════════════════════════════
# MODEL / REPORT STORAGE
# ═══════════════════════════════════════════════════════════════════════════════
MODELS_DIR = os.getenv("MODELS_DIR", "models")
REPORTS_DIR = os.getenv("REPORTS_DIR", "reports")
SAMPLE_DATASETS_DIR = os.getenv("SAMPLE_DATASETS_DIR", "sample_datasets")

# ═══════════════════════════════════════════════════════════════════════════════
# ML PIPELINE
# ═══════════════════════════════════════════════════════════════════════════════
SAMPLE_SIZE_MIN = 500
SAMPLE_SIZE_MAX = 2000
SAMPLE_RATIO = 0.1  # 10% of dataset

# ═══════════════════════════════════════════════════════════════════════════════
# RAG PIPELINE
# ═══════════════════════════════════════════════════════════════════════════════
RAG_CHUNK_SIZE = int(os.getenv("RAG_CHUNK_SIZE", "800"))
RAG_CHUNK_OVERLAP = int(os.getenv("RAG_CHUNK_OVERLAP", "80"))

# ═══════════════════════════════════════════════════════════════════════════════
# SERVER
# ═══════════════════════════════════════════════════════════════════════════════
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))
