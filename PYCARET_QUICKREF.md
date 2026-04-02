# 🎯 AGENTIQ AI — PyCaret Quick Reference

## Installation

```bash
cd backend
pip install -r requirements.txt
```

## Key Files

| File | Purpose |
|------|---------|
| `app/utils/pycaret_utils.py` | Task detection, industry detection, config management |
| `app/agents/pycaret_ml_agent.py` | PyCaret-powered ML agent (AutoML) |
| `app/agents/pycaret_eda_agent.py` | PyCaret-powered EDA agent |
| `app/state.py` | State management with PyCaret metadata |
| `app/main.py` | FastAPI integration with PyCaret agents |

---

## Task Detection Rules

```python
# Automatic detection based on target column

# CLASSIFICATION
- Categorical target (object/category dtype)
- Numeric target with < 20 unique values
- Unique ratio < 5%

# REGRESSION  
- Numeric target with many unique values
- Unique ratio > 5%

# CLUSTERING
- No target column specified
- Unsupervised learning

# TIME SERIES
- DateTime target column
- Column name contains 'date' or 'time'

# ANOMALY
- Explicitly triggered or special keywords
```

---

## Industry Detection Keywords

```python
HEALTHCARE = ['patient', 'diagnosis', 'health', 'clinical', 'medical', 
              'disease', 'treatment', 'hospital', 'bmi', 'blood']

FINANCE = ['transaction', 'revenue', 'fraud', 'risk', 'payment', 
           'credit', 'debit', 'account', 'balance', 'loan']

RETAIL = ['customer', 'sales', 'inventory', 'product', 'price', 
          'purchase', 'order', 'stock', 'category', 'sentiment']

MANUFACTURING = ['production', 'quality', 'defect', 'machine', 
                 'maintenance', 'downtime', 'efficiency']
```

---

## PyCaret Setup Configuration

### Classification/Regression

```python
{
    'session_id': 42,
    'verbose': False,
    'normalize': True,
    'transformation': True,
    'ignore_low_variance': True,
    'remove_multicollinearity': True,
    'multicollinearity_threshold': 0.9,
    'fix_imbalance': True,  # Classification only
    'remove_outliers': False,  # True in full mode
    'outliers_threshold': 0.05,
}
```

### Clustering

```python
{
    'session_id': 42,
    'verbose': False,
    'normalize': True,
    'transformation': True,
    'ignore_low_variance': True,
    'remove_outliers': False,  # True in full mode
}
```

---

## Agent Workflow

### EDA Agent

```
1. Load dataset
2. Detect industry (Healthcare/Finance/Retail/etc.)
3. Detect task type (Classification/Regression/etc.)
4. Generate data profile
   - Row/column counts
   - Data types
   - Missing values
   - Duplicates
5. Statistical analysis
   - Numeric summaries
   - Correlations
   - Categorical distributions
6. Generate insights (natural language)
7. Create chart metadata
8. Generate suggested questions
9. Return comprehensive EDA results
```

### ML Agent

```
1. Load dataset
2. Detect task type
3. Route to PyCaret module
   - classification
   - regression
   - clustering
   - anomaly
   - time_series
4. Setup PyCaret environment
5. Compare models (top 2-3)
6. Select best model
7. Extract metrics
8. Get feature importance
9. Save model
10. Return ML results
```

---

## API Endpoints

### Upload Dataset

```http
POST /upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

Response:
{
  "task_id": "123"
}
```

### Check Status

```http
GET /status/{task_id}

Response:
{
  "status": "completed",
  "eda_insights": [...],
  "ml_results": {...},
  "industry": "Healthcare",
  ...
}
```

### Chat with RAG

```http
POST /chat
{
  "task_id": "123",
  "query": "What are the key risk factors?"
}

Response:
{
  "response": "Based on the analysis..."
}
```

### Make Prediction

```http
POST /predict
{
  "task_id": "123",
  "input_data": {"Age": 45, "BMI": 28.5},
  "use_auto_target": true
}

Response:
{
  "prediction": "High Risk",
  "confidence": 87.5,
  "target_column": "Outcome"
}
```

---

## Code Examples

### Using PyCaret ML Agent

```python
from app.agents.pycaret_ml_agent import PyCaretMLAgent
from app.utils.llm_factory import get_llm

llm = get_llm()
ml_agent = PyCaretMLAgent(llm)

state = {
    "file_path": "data/healthcare.csv",
    "sample_mode": True,
    "user_id": "user123",
    "dataset_name": "patient_data",
    "logs": [],
    "completed_steps": []
}

results = ml_agent.run(state)

print(results['ml_results']['best_model_name'])
print(results['ml_results']['metrics'])
```

### Using PyCaret EDA Agent

```python
from app.agents.pycaret_eda_agent import PyCaretEDAAgent

eda_agent = PyCaretEDAAgent(llm)

results = eda_agent.run(state)

print(results['industry'])
print(results['eda_insights'])
print(results['suggested_questions'])
```

### Manual Task Detection

```python
from app.utils.pycaret_utils import detect_ml_task, detect_industry
import pandas as pd

df = pd.read_csv("data.csv")

task_type, target_col = detect_ml_task(df)
industry = detect_industry(df)

print(f"Task: {task_type}, Target: {target_col}, Industry: {industry}")
```

---

## Metrics by Task Type

### Classification

- **Accuracy**: Overall correctness
- **AUC**: Area under ROC curve
- **Recall**: True positive rate
- **Precision**: Positive predictive value
- **F1**: Harmonic mean of precision and recall
- **Kappa**: Agreement measure

### Regression

- **MAE**: Mean Absolute Error
- **MSE**: Mean Squared Error
- **RMSE**: Root Mean Squared Error
- **R2**: Coefficient of determination
- **RMSLE**: Root Mean Squared Log Error
- **MAPE**: Mean Absolute Percentage Error

### Clustering

- **Silhouette**: Cluster separation measure
- **Calinski-Harabasz**: Variance ratio
- **Davies-Bouldin**: Cluster similarity

---

## Logging Format

```python
{
  "agent": "pycaret_ml",
  "message": "✅ PyCaret AutoML Complete (FAST mode) | Task: classification | Best Model: Random Forest",
  "details": {
    "Accuracy": 0.8542,
    "AUC": 0.9123
  }
}
```

---

## Error Handling

### PyCaret Execution Error

```python
try:
    results = self._run_classification(df, target_col, sample_mode)
except Exception as e:
    print(f"⚠️ PyCaret execution error: {str(e)}")
    results = self._fallback_analysis(df, target_col)
    results['error'] = str(e)
```

### Fallback to Sklearn

If PyCaret fails, the system automatically falls back to scikit-learn:

```python
model = RandomForestClassifier(n_estimators=50, random_state=42)
model.fit(X_train, y_train)
```

---

## Performance Tips

1. **Use Sample Mode** for quick validation (default)
2. **Enable Full Mode** only for production models
3. **Cache models** to avoid retraining
4. **Limit model comparison** to top 2-3 models in sample mode
5. **Use turbo mode** in PyCaret's compare_models()

---

## Debugging

### Enable Verbose Mode

```python
config = get_pycaret_setup_config('classification', sample_mode=False)
config['verbose'] = True
setup(data=df, target='Outcome', **config)
```

### Check PyCaret Version

```python
import pycaret
print(pycaret.__version__)
```

### View Model Comparison

```python
from pycaret.classification import compare_models, pull

best = compare_models(n_select=1)
comparison_df = pull()
print(comparison_df)
```

---

## Common Issues

| Issue | Solution |
|-------|----------|
| Import error | `pip install pycaret` |
| Task detection wrong | Check target column type |
| No numeric features | Add feature engineering |
| Model training slow | Enable sample mode |
| Memory error | Reduce dataset size |

---

## Testing

```bash
# Run backend
cd backend
python -m app.main

# Test upload
curl -X POST http://localhost:8000/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@sample_data.csv"

# Check status
curl http://localhost:8000/status/123
```

---

## Environment Variables

```bash
# .env file
DATABASE_URL=sqlite:///./agentiq.db
HF_TOKEN=your_huggingface_token
SECRET_KEY=your_secret_key
```

---

## Quick Commands

```bash
# Install dependencies
pip install -r requirements.txt

# Run server
uvicorn app.main:app --reload

# Run with specific port
uvicorn app.main:app --host 0.0.0.0 --port 8000

# Check PyCaret installation
python -c "import pycaret; print(pycaret.__version__)"
```

---

**AGENTIQ AI** — Powered by PyCaret AutoML 🚀
