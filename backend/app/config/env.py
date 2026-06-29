"""
AGENTIQ AI — Environment Validation
Validates required environment variables at startup.
"""

import sys
from app.config.settings import SECRET_KEY, HUGGINGFACEHUB_API_TOKEN


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
