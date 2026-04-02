"""
AGENTIQ AI — Helper Utilities
Common helper functions used across the application.
"""

import os
from typing import Optional
from app.config.settings import ALLOWED_EXTENSIONS, MAX_UPLOAD_SIZE_MB


def validate_file_extension(filename: str) -> bool:
    """Check if file has an allowed extension."""
    ext = os.path.splitext(filename)[1].lower()
    return ext in ALLOWED_EXTENSIONS


def get_file_extension(filename: str) -> str:
    """Extract file extension (lowercase)."""
    return os.path.splitext(filename)[1].lower()


def calculate_sample_size(total_rows: int, min_size: int = 500, max_size: int = 2000, ratio: float = 0.1) -> int:
    """Calculate optimal sample size for a dataset."""
    return min(max_size, max(min_size, int(total_rows * ratio)))


def safe_float(value, default: float = 0.0) -> float:
    """Safely convert a value to float."""
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def truncate_string(s: str, max_length: int = 100) -> str:
    """Truncate a string with ellipsis if it exceeds max_length."""
    if len(s) <= max_length:
        return s
    return s[:max_length - 3] + "..."


def ensure_directory(path: str) -> str:
    """Ensure a directory exists, creating it if necessary. Returns the path."""
    os.makedirs(path, exist_ok=True)
    return path
