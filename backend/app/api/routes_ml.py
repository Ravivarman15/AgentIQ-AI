"""
AGENTIQ AI — ML Routes
Handles predictions, columns, feature selection, and rerunning ML pipeline.
"""

import os
import numpy as np
import pandas as pd
from typing import Optional, List

from fastapi import APIRouter, BackgroundTasks, Depends
from pydantic import BaseModel

from app.api.deps import get_current_user
from app.models.user_model import User as DBUser
from app.utils.data_utils import load_dataframe
from app.utils.pycaret_utils import validate_python_version, clean_dataset_for_training, detect_irrelevant_columns

router = APIRouter(tags=["ML Pipeline"])


# ═══════════════════════════════════════════════════════════════════════════════
# SCHEMAS
# ═══════════════════════════════════════════════════════════════════════════════

class PredictionRequest(BaseModel):
    task_id: str
    input_data: dict
    target_column: Optional[str] = None
    use_auto_target: bool = True


class FeatureSelectionRequest(BaseModel):
    task_id: str
    target_column: Optional[str] = None
    features: Optional[List[str]] = None
    auto_mode: bool = True


# ═══════════════════════════════════════════════════════════════════════════════
# ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════════

@router.post("/predict")
async def predict(request: PredictionRequest, current_user: DBUser = Depends(get_current_user)):
    """
    Make predictions on new data using the trained ML model.
    Loads the saved model + pipeline instead of retraining.
    """
    from app.api.pipeline import tasks
    state = tasks.get(request.task_id)
    if not state:
        return {"error": "Task not found. Please upload a dataset and train a model first."}

    ml_results = state.get("ml_results", {})
    model_dir = state.get("model_dir")
    model_path = state.get("best_model_path")

    if not model_dir:
        user_id = state.get("user_id", "default")
        dataset_name = state.get("dataset_name", request.task_id)
        model_dir = f"models/{user_id}/{dataset_name}"

    if not model_path:
        model_path = f"{model_dir}/best_model.pkl"

    pipeline_info_path = f"{model_dir}/pipeline_info.pkl"

    import joblib

    # Load pipeline info
    pipeline_info = None
    if os.path.exists(pipeline_info_path):
        try:
            pipeline_info = joblib.load(pipeline_info_path)
        except Exception as e:
            print(f"⚠️ Failed to load pipeline info: {e}")

    # Determine target column
    if request.target_column:
        target_column = request.target_column
        target_suggestion = f"Using user-selected target: '{target_column}'"
    elif pipeline_info and pipeline_info.get("target_column"):
        target_column = pipeline_info["target_column"]
        target_suggestion = f"Using trained target: '{target_column}'"
    elif ml_results.get("target_column"):
        target_column = ml_results["target_column"]
        target_suggestion = f"Using target from ML results: '{target_column}'"
    else:
        target_column = None
        target_suggestion = "No target column identified"

    task_type = ml_results.get("task_type", pipeline_info.get("task_type", "classification") if pipeline_info else "classification")

    # --- Strategy 1: Load PyCaret saved pipeline ---
    pycaret_loaded = False
    try:
        pycaret_model_path = model_path.replace('.pkl', '') if model_path.endswith('.pkl') else model_path

        if task_type == 'classification' and os.path.exists(pycaret_model_path + '.pkl'):
            from pycaret.classification import load_model as load_clf_model, predict_model
            loaded_model = load_clf_model(pycaret_model_path)

            input_df = pd.DataFrame([request.input_data])
            prediction_df = predict_model(loaded_model, data=input_df)

            pred_col = 'prediction_label' if 'prediction_label' in prediction_df.columns else prediction_df.columns[-1]
            prediction_value = prediction_df[pred_col].iloc[0]

            confidence = None
            if 'prediction_score' in prediction_df.columns:
                confidence = float(prediction_df['prediction_score'].iloc[0]) * 100

            pycaret_loaded = True

            return {
                "prediction": prediction_value if not isinstance(prediction_value, (float, int)) else (float(prediction_value) if isinstance(prediction_value, float) else int(prediction_value)),
                "confidence": confidence,
                "target_column": target_column,
                "target_suggestion": target_suggestion,
                "model_type": task_type,
                "engine": "PyCaret AutoML Pipeline"
            }

        elif task_type == 'regression' and os.path.exists(pycaret_model_path + '.pkl'):
            from pycaret.regression import load_model as load_reg_model, predict_model
            loaded_model = load_reg_model(pycaret_model_path)

            input_df = pd.DataFrame([request.input_data])
            prediction_df = predict_model(loaded_model, data=input_df)

            pred_col = 'prediction_label' if 'prediction_label' in prediction_df.columns else prediction_df.columns[-1]
            prediction_value = float(prediction_df[pred_col].iloc[0])

            pycaret_loaded = True

            return {
                "prediction": round(prediction_value, 4),
                "confidence": None,
                "target_column": target_column,
                "target_suggestion": target_suggestion,
                "model_type": task_type,
                "engine": "PyCaret AutoML Pipeline"
            }
    except Exception as e:
        print(f"⚠️ PyCaret model load failed, using fallback: {e}")
        pycaret_loaded = False

    # --- Strategy 2: Load joblib model directly ---
    if not pycaret_loaded and os.path.exists(model_path):
        try:
            model = joblib.load(model_path)

            input_df = pd.DataFrame([request.input_data])

            if pipeline_info and pipeline_info.get("feature_order"):
                feature_order = pipeline_info["feature_order"]
                for col in feature_order:
                    if col not in input_df.columns:
                        input_df[col] = pipeline_info.get("numeric_medians", {}).get(col, 0)
                input_df = input_df[feature_order]

            input_df = input_df.fillna(0)

            prediction = model.predict(input_df)[0]

            confidence = None
            if hasattr(model, 'predict_proba'):
                try:
                    probabilities = model.predict_proba(input_df)[0]
                    confidence = float(max(probabilities)) * 100
                except:
                    pass

            prediction_label = float(prediction) if isinstance(prediction, (int, float, np.integer, np.floating)) else str(prediction)

            return {
                "prediction": prediction_label,
                "confidence": confidence,
                "target_column": target_column,
                "target_suggestion": target_suggestion,
                "model_type": task_type,
                "engine": "Saved Model (joblib)"
            }
        except Exception as e:
            print(f"⚠️ Joblib model load failed: {e}")

    # --- Strategy 3: Retrain on-the-fly (last resort) ---
    file_path = state.get("active_path", state.get("file_path"))
    if not file_path:
        return {"error": "No model found and no dataset available for retraining."}

    try:
        df = load_dataframe(file_path)

        if not target_column or target_column not in df.columns:
            target_column = df.columns[-1]
            target_suggestion = f"Auto-detected target: '{target_column}' (last column)"

        X = df.drop(columns=[target_column]).select_dtypes(include=['number'])
        y = df[target_column]

        if X.empty:
            return {"error": "No numeric features available for prediction"}

        from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor

        if y.nunique() < 20 or y.dtype == 'object':
            if y.dtype == 'object':
                y_encoded = pd.factorize(y)[0]
                class_mapping = {idx: val for idx, val in enumerate(df[target_column].unique())}
            else:
                y_encoded = y
                class_mapping = None
            model = RandomForestClassifier(n_estimators=50, random_state=42, n_jobs=-1)
        else:
            y_encoded = y
            class_mapping = None
            model = RandomForestRegressor(n_estimators=50, random_state=42, n_jobs=-1)

        X = X.fillna(X.mean())
        model.fit(X, y_encoded)

        input_df = pd.DataFrame([request.input_data])
        for col in X.columns:
            if col not in input_df.columns:
                input_df[col] = X[col].median()
        input_df = input_df[X.columns]
        input_df = input_df.fillna(X.mean())

        prediction = model.predict(input_df)[0]

        if class_mapping:
            prediction_label = class_mapping.get(int(prediction), str(prediction))
        else:
            prediction_label = float(prediction)

        confidence = None
        if hasattr(model, 'predict_proba'):
            probabilities = model.predict_proba(input_df)[0]
            confidence = float(max(probabilities)) * 100

        return {
            "prediction": prediction_label,
            "confidence": confidence,
            "target_column": target_column,
            "target_suggestion": target_suggestion,
            "model_type": "classification" if class_mapping is not None else "regression",
            "engine": "On-the-fly sklearn (no saved model found)"
        }
    except Exception as e:
        return {"error": f"Prediction failed: {str(e)}"}


@router.get("/columns/{task_id}")
async def get_columns(task_id: str, current_user: DBUser = Depends(get_current_user)):
    """
    Get list of columns from dataset for manual target selection.
    Returns per-column stats for dynamic input rendering.
    """
    from app.api.pipeline import tasks
    state = tasks.get(task_id)
    if not state:
        return {"error": "Task not found"}

    file_path = state.get("active_path", state["file_path"])
    df = load_dataframe(file_path)

    target_col = state.get("ml_results", {}).get("target_column", df.columns[-1])
    irrelevant = detect_irrelevant_columns(df, target_col)
    irrelevant_names = [item["column"] for item in irrelevant["columns_to_remove"]]

    all_numeric = list(df.select_dtypes(include=['number']).columns)
    all_categorical = list(df.select_dtypes(include=['object', 'category']).columns)

    prediction_features = [c for c in all_numeric if c not in irrelevant_names and c != target_col]
    categorical_features = [c for c in all_categorical if c not in irrelevant_names and c != target_col]
    all_prediction_features = prediction_features + categorical_features

    column_stats = {}
    for col in all_prediction_features:
        stat = {"name": col}
        if pd.api.types.is_numeric_dtype(df[col]):
            stat["type"] = "numeric"
            stat["min"] = round(float(df[col].min()), 2) if not df[col].isnull().all() else 0
            stat["max"] = round(float(df[col].max()), 2) if not df[col].isnull().all() else 100
            stat["mean"] = round(float(df[col].mean()), 2) if not df[col].isnull().all() else 0
            stat["std"] = round(float(df[col].std()), 2) if not df[col].isnull().all() else 0
            stat["median"] = round(float(df[col].median()), 2) if not df[col].isnull().all() else 0
            col_range = stat["max"] - stat["min"]
            if col_range <= 1:
                stat["step"] = 0.01
            elif col_range <= 100:
                stat["step"] = 0.1
            else:
                stat["step"] = 1
            if df[col].dropna().apply(lambda x: x == int(x)).all() if len(df[col].dropna()) > 0 else False:
                stat["is_integer"] = True
                stat["step"] = 1
                stat["min"] = int(stat["min"])
                stat["max"] = int(stat["max"])
                stat["mean"] = int(stat["mean"])
                stat["median"] = int(stat["median"])
            else:
                stat["is_integer"] = False
        else:
            stat["type"] = "categorical"
            unique_vals = df[col].dropna().unique().tolist()
            stat["unique_values"] = [str(v) for v in unique_vals[:50]]
            stat["num_unique"] = int(df[col].nunique())

        column_stats[col] = stat

    return {
        "columns": list(df.columns),
        "numeric_columns": all_numeric,
        "categorical_columns": all_categorical,
        "prediction_features": prediction_features,
        "categorical_features": categorical_features,
        "all_prediction_features": all_prediction_features,
        "column_stats": column_stats,
        "recommended_target": target_col,
        "irrelevant_columns": irrelevant["columns_to_remove"],
        "recommended_features": [c for c in df.columns if c not in irrelevant_names and c != target_col],
        "total_rows": len(df),
        "total_columns": len(df.columns),
    }


@router.post("/feature-selection")
async def set_feature_selection(
    request: FeatureSelectionRequest,
    background_tasks: BackgroundTasks,
    current_user: DBUser = Depends(get_current_user)
):
    """
    Set manual feature and target selection, then re-run ML pipeline.
    """
    from app.api.pipeline import tasks, run_agents
    state = tasks.get(request.task_id)
    if not state:
        return {"error": "Task not found. Please upload a dataset first."}

    file_path = state.get("file_path")
    sample_path = state.get("sample_path")

    if not file_path:
        return {"error": "No dataset found for this task."}

    df = load_dataframe(state.get("active_path", file_path))

    if request.target_column and request.target_column not in df.columns:
        return {
            "error": f"Target column '{request.target_column}' not found.",
            "available_columns": list(df.columns)
        }

    if request.features and not request.auto_mode:
        invalid = [f for f in request.features if f not in df.columns]
        if invalid:
            return {
                "error": f"Invalid features: {invalid}",
                "available_columns": list(df.columns)
            }

    preview = clean_dataset_for_training(
        df=df,
        target_col=request.target_column,
        manual_features=request.features,
        auto_mode=request.auto_mode
    )

    if "error" in preview:
        return preview

    if "ml" in state.get("completed_steps", []):
        state["completed_steps"].remove("ml")

    tasks[request.task_id]["status"] = "re-running"

    background_tasks.add_task(
        run_agents,
        request.task_id,
        file_path,
        sample_path,
        user_id=str(current_user.id),
        manual_target_col=request.target_column,
        manual_features=request.features,
        auto_feature_mode=request.auto_mode
    )

    return {
        "message": f"Feature selection updated. Re-running ML pipeline.",
        "mode": "auto" if request.auto_mode else "manual",
        "target_column": preview.get("target_col"),
        "features_selected": len(preview.get("features", [])),
        "cleaning_preview": preview.get("cleaning_report", []),
    }


@router.post("/rerun_full")
async def rerun_full(task_id: str, background_tasks: BackgroundTasks, current_user: DBUser = Depends(get_current_user)):
    from app.api.pipeline import tasks, run_agents
    state = tasks.get(task_id)
    if not state:
        return {"error": "Task not found"}

    background_tasks.add_task(run_agents, task_id, state["file_path"], state["sample_path"], user_id=str(current_user.id), full_mode=True)
    return {"message": "Full dataset execution started."}
