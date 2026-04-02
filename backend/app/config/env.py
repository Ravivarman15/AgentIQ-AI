"""
AGENTIQ AI — Environment Validation
Validates required environment variables at startup.
"""

import sys
from app.config.settings import (
    SECRET_KEY, SUPABASE_URL, SUPABASE_ANON_KEY,
    HUGGINGFACEHUB_API_TOKEN, SUPABASE_DB_HOST, SUPABASE_DB_PASSWORD,
    SUPABASE_DB_URL, DATABASE_URL
)


def validate_environment():
    """
    Validate critical environment variables.
    Warnings for non-critical, errors for critical.
    """
    warnings = []
    errors = []

    # JWT Secret
    if SECRET_KEY == "agentiq_secret_key_change_me_in_prod":
        warnings.append("SECRET_KEY is using default value. Set a strong key for production.")

    # HuggingFace
    if not HUGGINGFACEHUB_API_TOKEN:
        errors.append("HUGGINGFACEHUB_API_TOKEN is required for LLM & embedding operations.")

    # Database — at least one connection method must be configured
    has_components = bool(SUPABASE_DB_HOST and SUPABASE_DB_PASSWORD)
    has_full_url = bool(SUPABASE_DB_URL)
    has_legacy_url = bool(DATABASE_URL)

    if not (has_components or has_full_url or has_legacy_url):
        warnings.append(
            "No database connection configured. Falling back to SQLite. "
            "Set SUPABASE_DB_HOST + SUPABASE_DB_PASSWORD, or SUPABASE_DB_URL, "
            "or DATABASE_URL for production."
        )

    # Print results
    for w in warnings:
        print(f"⚠️  ENV WARNING: {w}")

    for e in errors:
        print(f"❌ ENV ERROR: {e}")

    if errors:
        print(f"\n🛑 {len(errors)} critical environment variable(s) missing.")
        print("   The app will start but some features may not work.\n")

    if not warnings and not errors:
        print("✅ Environment validation passed.")

    return {"warnings": warnings, "errors": errors}
