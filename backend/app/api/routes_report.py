"""
AGENTIQ AI — Report Download Routes
Handles downloading generated reports (PDF/PPTX).
"""

import os
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse

from app.api.deps import get_current_user
from app.models.user_model import User as DBUser
from app.config.settings import REPORTS_DIR

router = APIRouter(tags=["Reports"])


@router.get("/download/{file_type}")
async def download_report(file_type: str, task_id: str):
    """Download generated reports (pdf or pptx)."""
    report_base = REPORTS_DIR
    if not os.path.exists(report_base):
        raise HTTPException(status_code=404, detail="Reports directory not found")

    found_path = None
    filename = "report.pdf" if file_type == "pdf" else "deck.pptx"

    for user_dir in os.listdir(report_base):
        potential_path = os.path.join(report_base, user_dir, task_id, filename)
        if os.path.exists(potential_path):
            found_path = potential_path
            break

    if not found_path:
        raise HTTPException(status_code=404, detail=f"{file_type.upper()} report not found for this task.")

    media_type = "application/pdf" if file_type == "pdf" else "application/vnd.openxmlformats-officedocument.presentationml.presentation"

    return FileResponse(
        path=found_path,
        filename=f"AgentIQ_Report_{task_id}.{file_type}",
        media_type=media_type
    )
