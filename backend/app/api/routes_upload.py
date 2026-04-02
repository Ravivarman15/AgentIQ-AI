"""
AGENTIQ AI — Upload & Dataset Routes
Handles file upload, dataset management, sample dataset loading.
"""

import os
import shutil
import uuid

from fastapi import APIRouter, UploadFile, File, BackgroundTasks, Depends, HTTPException
from sqlalchemy.orm import Session

from app.models.database import get_db
from app.models.user_model import User as DBUser
from app.models.dataset_model import Dataset as DBDataset
from app.api.deps import get_current_user
from app.utils.data_utils import load_dataframe
from app.utils.helpers import validate_file_extension, get_file_extension, calculate_sample_size
from app.config.settings import SAMPLE_DATASETS_DIR

router = APIRouter(tags=["Upload & Datasets"])


# ═══════════════════════════════════════════════════════════════════════════════
# SAMPLE DATASETS — Code-defined catalog (no DB seeding required)
# ═══════════════════════════════════════════════════════════════════════════════

SAMPLE_DATASETS = [
    {
        "key": "healthcare",
        "name": "Healthcare Dataset",
        "description": "Predict patient health outcomes using clinical indicators.",
        "rows": 1000,
        "columns": 6,
        "category": "Healthcare",
        "icon": "heart",
        "column_names": ["Patient_ID", "Age", "Blood_Pressure", "Cholesterol", "Heart_Rate", "Outcome"],
    },
    {
        "key": "sales_prediction",
        "name": "Sales Prediction Dataset",
        "description": "Predict product sales based on marketing spend.",
        "rows": 800,
        "columns": 5,
        "category": "Business",
        "icon": "trending-up",
        "column_names": ["Marketing_Spend", "Advertising_Budget", "Season", "Region", "Sales"],
    },
    {
        "key": "customer_churn",
        "name": "Customer Churn Dataset",
        "description": "Predict whether a customer will leave a service.",
        "rows": 1000,
        "columns": 6,
        "category": "Marketing",
        "icon": "users",
        "column_names": ["Customer_ID", "Tenure", "Monthly_Charges", "Contract_Type", "Support_Calls", "Churn"],
    },
    {
        "key": "house_price",
        "name": "House Price Dataset",
        "description": "Predict house prices based on property features.",
        "rows": 800,
        "columns": 6,
        "category": "Real Estate",
        "icon": "home",
        "column_names": ["Area", "Bedrooms", "Bathrooms", "Location", "Year_Built", "Price"],
    },
    {
        "key": "student_performance",
        "name": "Student Performance Dataset",
        "description": "Predict student performance based on study behavior.",
        "rows": 600,
        "columns": 5,
        "category": "Education",
        "icon": "graduation-cap",
        "column_names": ["Study_Hours", "Attendance", "Assignments_Completed", "Previous_Score", "Final_Grade"],
    },
]


@router.get("/sample-datasets")
def list_sample_datasets():
    """Return metadata for all built-in sample datasets."""
    return SAMPLE_DATASETS


@router.post("/load-sample/{dataset_key}")
async def load_sample_dataset(
    dataset_key: str,
    background_tasks: BackgroundTasks,
    current_user: DBUser = Depends(get_current_user),
):
    """Load a built-in sample dataset and trigger the full agent pipeline."""
    valid_keys = {ds["key"] for ds in SAMPLE_DATASETS}
    if dataset_key not in valid_keys:
        raise HTTPException(status_code=404, detail=f"Sample dataset '{dataset_key}' not found.")

    csv_path = os.path.join(SAMPLE_DATASETS_DIR, f"{dataset_key}.csv")
    if not os.path.exists(csv_path):
        raise HTTPException(status_code=500, detail=f"Sample dataset file missing: {csv_path}")

    task_id = f"sample_{dataset_key}_{uuid.uuid4().hex[:8]}"

    # Import here to avoid circular imports
    from app.api.pipeline import tasks, run_agents
    tasks[task_id] = {"status": "starting", "logs": []}

    background_tasks.add_task(
        run_agents,
        task_id,
        csv_path,
        csv_path,
        user_id=str(current_user.id),
    )
    return {"task_id": task_id}


@router.post("/upload")
async def upload_file(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not validate_file_extension(file.filename):
        raise HTTPException(status_code=400, detail="Unsupported file format. Please use CSV, Excel, or JSON.")

    ext = get_file_extension(file.filename)
    os.makedirs(f"uploads/{current_user.id}", exist_ok=True)
    file_path = f"uploads/{current_user.id}/{file.filename}"

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        df = load_dataframe(file_path)
        if df.empty:
            raise HTTPException(status_code=400, detail="The uploaded file is empty.")

        sample_size = calculate_sample_size(len(df))
        sample_df = df.sample(n=min(sample_size, len(df)))
        sample_path = file_path.replace(ext, f"_sample{ext}")

        if ext == ".csv":
            sample_df.to_csv(sample_path, index=False)
        elif ext in [".xlsx", ".xls"]:
            sample_df.to_excel(sample_path, index=False)
        elif ext == ".json":
            sample_df.to_json(sample_path)

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to process file: {str(e)}")

    new_dataset = DBDataset(
        name=file.filename,
        file_path=file_path,
        sample_path=sample_path,
        user_id=current_user.id
    )
    db.add(new_dataset)
    db.commit()

    task_id = str(new_dataset.id)

    from app.api.pipeline import tasks, run_agents
    tasks[task_id] = {"status": "starting", "logs": []}

    background_tasks.add_task(run_agents, task_id, file_path, sample_path, user_id=str(current_user.id))
    return {"task_id": task_id}


@router.post("/resume/{dataset_id}")
async def resume_dataset(
    dataset_id: int,
    background_tasks: BackgroundTasks,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    dataset = db.query(DBDataset).filter(DBDataset.id == dataset_id, DBDataset.user_id == current_user.id).first()
    if not dataset and not (db.query(DBDataset).filter(DBDataset.id == dataset_id, DBDataset.is_demo == True).first()):
        raise HTTPException(status_code=404, detail="Dataset not found")

    if not dataset:
        dataset = db.query(DBDataset).filter(DBDataset.id == dataset_id, DBDataset.is_demo == True).first()

    task_id = str(dataset.id)

    from app.api.pipeline import tasks, run_agents
    if task_id not in tasks:
        tasks[task_id] = {"status": "starting", "logs": []}
        background_tasks.add_task(run_agents, task_id, dataset.file_path, dataset.sample_path, user_id=str(current_user.id))

    return {"task_id": task_id}


@router.get("/datasets")
def list_datasets(current_user: DBUser = Depends(get_current_user), db: Session = Depends(get_db)):
    user_datasets = db.query(DBDataset).filter(DBDataset.user_id == current_user.id).all()
    demo_datasets = db.query(DBDataset).filter(DBDataset.is_demo == True).all()
    return {"user_datasets": user_datasets, "demo_datasets": demo_datasets}


@router.delete("/datasets/{dataset_id}")
def delete_dataset(dataset_id: int, current_user: DBUser = Depends(get_current_user), db: Session = Depends(get_db)):
    dataset = db.query(DBDataset).filter(DBDataset.id == dataset_id, DBDataset.user_id == current_user.id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found or unauthorized")

    if os.path.exists(dataset.file_path):
        os.remove(dataset.file_path)
    if dataset.sample_path and os.path.exists(dataset.sample_path):
        os.remove(dataset.sample_path)

    db.delete(dataset)
    db.commit()
    return {"message": "Dataset deleted successfully"}
