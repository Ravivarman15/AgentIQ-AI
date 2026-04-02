# 🚀 AGENTIQ AI — PyCaret AutoML Integration Guide (v2.0)

## Overview

**AGENTIQ AI** uses **PyCaret** as its primary AutoML engine, enhanced with **senior-level intelligent feature engineering** and **production-grade safeguards**. This integration provides:

- ✅ **Automatic task detection** (Classification, Regression, Clustering, Anomaly Detection, Time Series)
- ✅ **Intelligent Feature Selection** — ID column detection, near-zero variance removal, correlation filtering, mutual information ranking, tree-based importance
- ✅ **Manual Feature/Target Control** — Users can manually select features and target columns
- ✅ **Automated EDA** with bivariate & multivariate chart guarantees
- ✅ **Model comparison** with full leaderboard (always populated, top 5 models)
- ✅ **Production safeguards** — never removes ALL features, cross-validation, overfitting protection
- ✅ **Industry-specific insights** (Healthcare, Finance, Retail, Manufacturing, Education)
- ✅ **Professional reporting** — PDF/PPTX/TXT with dataset summary, leaderboard, business interpretation
- ✅ **Python version validation** for PyCaret compatibility
- ✅ **Explainability** through feature importance, selection reports, and business interpretation

---

## 🎯 Core Components

### 1. **PyCaret Utility Functions** (`pycaret_utils.py`)

Located at: `backend/app/utils/pycaret_utils.py`

**Key Functions:**

| Function | Description |
|---|---|
| `validate_python_version()` | Checks Python version compatibility with PyCaret (3.9-3.11 recommended) |
| `detect_ml_task(df, target_col)` | Automatically detects ML task type |
| `detect_industry(df)` | Identifies industry domain from column names |
| `detect_irrelevant_columns(df, target_col)` | Flags ID-like, constant, near-zero variance, high-cardinality columns |
| `advanced_feature_selection(df, target_col)` | Multi-stage selection: correlation → tree importance → mutual information |
| `clean_dataset_for_training(df, target_col, manual_features, auto_mode)` | Full cleaning pipeline orchestrator |
| `get_pycaret_setup_config(task_type, sample_mode)` | Returns optimized PyCaret config with normalization, transformation, outlier removal |
| `format_pycaret_metrics(metrics_df, task_type)` | Formats model comparison results per task type |
| `format_leaderboard(comparison_df, task_type, top_n)` | Creates ranked model leaderboard |
| `get_industry_insights(industry, metrics, task_type)` | Generates domain-specific business insights |
| `generate_suggested_questions(industry, df, target_col)` | Creates intelligent follow-up questions |

### 2. **Intelligent Feature Selection Pipeline**

```
Raw Dataset
    │
    ▼
┌─────────────────────────────────────┐
│  Step 1: Irrelevant Column Detection │
│  - ID column pattern matching        │
│  - Constant column removal           │
│  - Near-zero variance detection      │
│  - High-cardinality identifier check │
│  - Monotonic sequence detection      │
│  ⚠️ Float columns preserved          │
└─────────┬───────────────────────────┘
          │
          ▼
┌─────────────────────────────────────┐
│  Step 2: Correlation Filtering       │
│  - Removes features with r > 0.95   │
│  - Keeps the one more correlated    │
│    with target                       │
└─────────┬───────────────────────────┘
          │
          ▼
┌─────────────────────────────────────┐
│  Step 3: Tree-Based Importance       │
│  - Random Forest feature importance  │
│  - Removes below 10th percentile     │
│  ⚠️ SAFEGUARD: Never removes ALL    │
└─────────┬───────────────────────────┘
          │
          ▼
┌─────────────────────────────────────┐
│  Step 4: Mutual Information Ranking  │
│  - MI scoring with target            │
│  - Removes zero-MI features          │
│  ⚠️ SAFEGUARD: Never removes ALL    │
└─────────┬───────────────────────────┘
          │
          ▼
┌─────────────────────────────────────┐
│  FINAL SAFEGUARD:                    │
│  If 0 features remain → revert to   │
│  original feature set                │
└─────────────────────────────────────┘
```

### 3. **PyCaret ML Agent** (`pycaret_ml_agent.py`)

Located at: `backend/app/agents/pycaret_ml_agent.py`

**Features:**

- Python version pre-validation
- Intelligent feature cleaning as first step
- Routes to appropriate PyCaret module:
  - `pycaret.classification` for classification tasks
  - `pycaret.regression` for regression tasks
  - `pycaret.clustering` for clustering tasks
  - `pycaret.anomaly` for anomaly detection
  - `pycaret.time_series` for time series forecasting
- Full model leaderboard (always populated, top 5)
- Cross-validation (3-fold sample, 5-fold full)
- Overfitting protection via PyCaret settings
- Feature importance extraction
- Business interpretation generation
- Robust fallback with multiple sklearn models (RF + GBM)
- Manual feature/target selection support from state

**Output Structure:**

```python
ml_results = {
    "task_type": "classification",
    "target_column": "target",
    "best_model_name": "Random Forest",
    "metrics": {"Accuracy": 0.95, "AUC": 0.97, "F1": 0.95},
    "feature_importance": {"feature_a": 0.35, "feature_b": 0.28},
    "leaderboard": [{"rank": 1, "Model": "RF", "Accuracy": 0.95}, ...],
    "industry_insights": ["Insight 1", "Insight 2"],
    "business_interpretation": ["The model achieves..."],
    "removed_columns": [{"column": "id", "reason": "ID-like pattern"}],
    "selected_features": ["age", "income", "score"],
    "feature_selection_report": ["🎯 3 → 2 features retained"]
}
```

### 4. **PyCaret EDA Agent** (`pycaret_eda_agent.py`)

Located at: `backend/app/agents/pycaret_eda_agent.py`

**Features:**

- Flags irrelevant columns during EDA
- Guaranteed ≥2 bivariate charts (scatter, heatmap, boxplot, stats table)
- Guaranteed ≥2 multivariate charts (pairplot, feature importance, PCA, correlation matrix)
- Charts adapt to data type (numeric vs. categorical)
- ID columns excluded from charts
- Outlier detection via IQR method
- Skewness/kurtosis statistics
- Enhanced data profiling with correlation analysis

### 5. **Report Agent** (`visual_agents.py`)

**Professional Output Sections:**

1. Dataset Summary (rows, columns, types, missing, duplicates)
2. Removed Columns (with reasons)
3. Selected Features
4. Key Insights (EDA)
5. Model Details & Leaderboard
6. Performance Metrics
7. Feature Selection Report
8. Business Interpretation

Formats: PDF (reportlab), PPTX (python-pptx), TXT (fallback)

---

## 🔌 API Endpoints

### New Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/python-check` | GET | Check Python version PyCaret compatibility |
| `/feature-selection` | POST | Set manual feature/target selection and re-run ML |
| `/dataset-info/{task_id}` | GET | Get comprehensive dataset info with cleaning preview |
| `/columns/{task_id}` | GET | Enhanced — now shows irrelevant columns and recommendations |

### Feature Selection Request

```json
POST /feature-selection
{
    "task_id": "abc123",
    "target_column": "price",
    "features": ["bedrooms", "sqft", "location"],
    "auto_mode": false
}
```

**Response:**
```json
{
    "message": "Feature selection updated. Re-running ML pipeline.",
    "mode": "manual",
    "target_column": "price",
    "features_selected": 3,
    "cleaning_preview": ["📌 Using user-specified target column: 'price'"]
}
```

### Dataset Info Response

```json
GET /dataset-info/{task_id}
{
    "total_rows": 5000,
    "total_columns": 15,
    "columns": [
        {"name": "id", "dtype": "int64", "unique_values": 5000, "missing": 0, "is_irrelevant": true, "removal_reason": "ID-like pattern"},
        {"name": "age", "dtype": "int64", "unique_values": 62, "missing": 0, "is_irrelevant": false, "mean": 38.5, "std": 12.3}
    ],
    "irrelevant_columns": [{"column": "id", "reason": "ID-like pattern"}],
    "recommended_features": ["age", "income", "score"],
    "recommended_target": "target",
    "python_compatibility": {"compatible": true, "version": "3.11.0"}
}
```

---

## ⚙️ State Schema

The `AgentState` now includes these feature selection fields:

```python
class AgentState(TypedDict):
    # ... existing fields ...
    
    # Intelligent Feature Selection (NEW)
    irrelevant_columns: Optional[List[Dict[str, str]]]  # Auto-detected irrelevant columns
    manual_target_col: Optional[str]                     # User-specified target column
    manual_features: Optional[List[str]]                 # User-specified feature list
    auto_feature_mode: Optional[bool]                    # True = auto, False = manual
```

---

## 🛡️ Production Safeguards

1. **Never removes ALL features** — if MI or tree importance would remove every feature, the step is skipped
2. **Fall-back to original features** — if all selection steps combined leave 0 features, reverts to originals
3. **Float columns preserved** — continuous numeric features (income, temperature) are never flagged as IDs
4. **Integer-only ID detection** — only integer-typed columns with high uniqueness are flagged as identifiers
5. **Cross-validation** — prevents overfitting with 3-fold (sample) or 5-fold (full) CV
6. **Multiple fallback models** — if PyCaret fails, uses sklearn RF + GBM with proper evaluation
7. **Python version validation** — warns if running incompatible Python version

---

## 🧪 Self-Validation

Run the test suite:

```bash
cd backend
$env:PYTHONPATH="."; python test_upgrade.py
```

Tests cover:
1. Python version validation
2. ID column detection
3. Advanced feature selection
4. Full cleaning pipeline (auto mode)
5. Manual feature selection
6. ML task detection
7. Leaderboard formatting
8. Industry detection
9. State schema verification
10. Agent import validation

---

## 📋 Upgrade Summary (v2.0)

| Area | Before | After |
|---|---|---|
| Feature Selection | None — all columns used | 5-stage intelligent pipeline |
| Manual Control | No | Full target + feature selection API |
| Leaderboard | Sometimes empty | Always populated (top 5 models) |
| ID Detection | None | Pattern + cardinality + monotonic detection |
| Reports | Basic metrics only | 8-section professional reports |
| Safeguards | None | 7 production safeguards |
| Python Check | None | Version validation endpoint |
| EDA Charts | 3-4 basic | ≥4 guaranteed (bivariate + multivariate) |
| Fallback | Single sklearn model | Multiple models with CV scoring |

---

*Generated by AGENTIQ AI — Advanced AutoML Engine v2.0*
