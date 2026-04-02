"""
LLM narrative generation utilities for AGENTIQ AI reports.
Generates human-readable data storytelling text with rule-based fallbacks.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime


def generate_dataset_narrative(state: Dict[str, Any]) -> str:
    """Generate a human-readable dataset summary narrative."""
    dp = state.get("data_profile", {})
    di = state.get("data_intelligence") or state.get("ml_results", {}).get("data_intelligence", {})
    dataset_name = state.get("dataset_name", "Dataset")

    rows = dp.get("total_rows") or (di.get("dataset_shape", {}).get("rows", "N/A") if di else "N/A")
    cols = dp.get("total_columns") or (di.get("dataset_shape", {}).get("columns", "N/A") if di else "N/A")
    missing_pct = dp.get("missing_percentage", 0)
    dups = dp.get("duplicate_rows", 0)

    ft = di.get("feature_types", {}) if di else {}
    numeric = ft.get("numeric", dp.get("numeric_columns", "N/A"))
    categorical = ft.get("categorical", dp.get("categorical_columns", "N/A"))

    lines = [
        f"The dataset '{dataset_name}' contains {rows} records across {cols} features.",
        f"It includes {numeric} numeric and {categorical} categorical variables.",
    ]

    if missing_pct and float(missing_pct) > 0:
        lines.append(f"Approximately {missing_pct}% of cells contain missing values, which were handled during preprocessing.")
    else:
        lines.append("The dataset has no missing values, indicating strong data completeness.")

    if dups and int(dups) > 0:
        lines.append(f"{dups} duplicate rows were detected.")

    # Class balance
    cb = di.get("class_balance") if di else None
    if cb and cb.get("is_imbalanced"):
        lines.append(
            f"The target variable shows class imbalance — the majority class '{cb['majority_class']}' "
            f"represents {cb['majority_pct']}% of records while '{cb['minority_class']}' represents only {cb['minority_pct']}%."
        )

    return " ".join(lines)


def generate_model_narrative(state: Dict[str, Any]) -> str:
    """Generate a narrative explaining why the best model was selected."""
    ml = state.get("ml_results", {})

    # Use LLM-generated explanation if available
    explanation = ml.get("model_explanation")
    if explanation and len(str(explanation)) > 30:
        return str(explanation)

    # Fallback: rule-based
    model_name = ml.get("best_model_name", "the selected model")
    task_type = ml.get("task_type", "prediction")
    metrics = ml.get("metrics", {})
    leaderboard = ml.get("leaderboard", [])

    lines = [f"{model_name} was selected as the best-performing model for this {task_type} task."]

    if task_type == "classification":
        acc = metrics.get("Accuracy")
        auc = metrics.get("AUC")
        if acc:
            lines.append(f"It achieved an accuracy of {acc}, demonstrating strong predictive capability.")
        if auc:
            lines.append(f"The AUC score of {auc} indicates excellent class separation ability.")
    elif task_type == "regression":
        r2 = metrics.get("R2")
        rmse = metrics.get("RMSE")
        if r2:
            lines.append(f"It achieved an R² of {r2}, explaining {float(r2)*100:.1f}% of the variance in the target variable.")
        if rmse:
            lines.append(f"The RMSE of {rmse} represents the average prediction error magnitude.")

    if len(leaderboard) > 1:
        lines.append(f"It outperformed {len(leaderboard) - 1} other candidate models in the comparison leaderboard.")

    return " ".join(lines)


def generate_conclusion(state: Dict[str, Any]) -> str:
    """Generate a conclusion section for the report."""
    ml = state.get("ml_results", {})
    insights = state.get("eda_insights", [])
    dataset_name = state.get("dataset_name", "the dataset")
    model_name = ml.get("best_model_name", "the model")
    task_type = ml.get("task_type", "analysis")
    features = ml.get("selected_features", [])

    lines = [
        f"This report presents a comprehensive AI-powered analysis of '{dataset_name}'.",
        f"Using {len(features)} carefully selected features, AGENTIQ AI trained and compared "
        f"multiple machine learning models to identify the optimal {task_type} solution.",
        f"The best-performing model, {model_name}, was selected based on rigorous cross-validated evaluation.",
    ]

    # Add a business takeaway
    interpretation = ml.get("business_interpretation", [])
    if interpretation:
        # Take the most meaningful line
        for line in interpretation:
            clean = line.encode('ascii', 'ignore').decode('ascii').strip()
            if len(clean) > 30 and not clean.startswith("Generated"):
                lines.append(clean)
                break

    lines.append(
        "For production deployment, we recommend monitoring model performance over time "
        "and retraining with fresh data periodically to maintain accuracy."
    )

    return " ".join(lines)


def generate_llm_narrative(llm, prompt: str, fallback: str) -> str:
    """Try LLM generation with a fallback."""
    if llm is None:
        return fallback
    try:
        response = llm.invoke(prompt)
        content = response.content if hasattr(response, 'content') else str(response)
        if content and len(content.strip()) > 20:
            return content.strip()
    except Exception:
        pass
    return fallback
