"""
AGENTIQ AI — Status & System Routes
Handles task status polling, dataset information, and system checks.
"""

import os
import pandas as pd
from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import get_current_user
from app.models.user_model import User as DBUser
from app.utils.data_utils import load_dataframe
from app.utils.pycaret_utils import validate_python_version, detect_irrelevant_columns

router = APIRouter(tags=["Status & System"])


@router.get("/status/{task_id}")
async def get_status(task_id: str):
    """Get the current processing status and logs for a specific task."""
    from app.api.pipeline import tasks
    return tasks.get(task_id, {"status": "not_found"})


@router.get("/python-check")
def python_check():
    """Check if Python version is compatible with PyCaret."""
    return validate_python_version()


@router.get("/dataset-info/{task_id}")
async def get_dataset_info(task_id: str, current_user: DBUser = Depends(get_current_user)):
    """
    Get comprehensive dataset information including:
    - Column list with types
    - Detected irrelevant columns
    - Recommended features
    - Data quality summary
    """
    from app.api.pipeline import tasks
    state = tasks.get(task_id)
    if not state:
        return {"error": "Task not found"}

    file_path = state.get("active_path", state.get("file_path"))
    if not file_path or not os.path.exists(file_path):
        return {"error": "Dataset file not found"}

    df = load_dataframe(file_path)

    irrelevant = detect_irrelevant_columns(df)
    irrelevant_names = [item["column"] for item in irrelevant["columns_to_remove"]]

    column_info = []
    for col in df.columns:
        info = {
            "name": col,
            "dtype": str(df[col].dtype),
            "unique_values": int(df[col].nunique()),
            "missing": int(df[col].isnull().sum()),
            "missing_pct": round(df[col].isnull().sum() / len(df) * 100, 2) if len(df) > 0 else 0,
            "is_irrelevant": col in irrelevant_names,
        }

        for item in irrelevant["columns_to_remove"]:
            if item["column"] == col:
                info["removal_reason"] = item["reason"]
                break

        if pd.api.types.is_numeric_dtype(df[col]):
            info["mean"] = round(float(df[col].mean()), 4) if not df[col].isnull().all() else 0
            info["std"] = round(float(df[col].std()), 4) if not df[col].isnull().all() else 0
            info["min"] = round(float(df[col].min()), 4) if not df[col].isnull().all() else 0
            info["max"] = round(float(df[col].max()), 4) if not df[col].isnull().all() else 0

        column_info.append(info)

    return {
        "total_rows": len(df),
        "total_columns": len(df.columns),
        "columns": column_info,
        "irrelevant_columns": irrelevant["columns_to_remove"],
        "recommended_features": irrelevant["columns_to_keep"],
        "recommended_target": df.columns[-1],
        "missing_total": int(df.isnull().sum().sum()),
        "duplicate_rows": int(df.duplicated().sum()),
        "python_compatibility": validate_python_version(),
    }
