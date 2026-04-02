# AGENTIQ AI: PyCaret-Powered Autonomous ML Platform

A production-ready platform for end-to-end intelligent data workflows using **PyCaret AutoML**, LangGraph, LangChain, and HuggingFace.

## ✨ Key Features

- 🤖 **PyCaret AutoML Engine** - Automatic model selection and training
- 🎯 **Intelligent Task Detection** - Auto-detects classification, regression, clustering, anomaly detection, and time series
- 🏭 **Industry-Aware Analysis** - Specialized insights for Healthcare, Finance, Retail, and Manufacturing
- 📊 **Automated EDA** - Comprehensive exploratory data analysis
- 💬 **RAG-Powered Chat** - Ask questions about your data in natural language
- 📈 **Real-time Dashboards** - Interactive visualizations and insights
- 🔒 **Multi-User Support** - Secure authentication and data isolation

## 🏗️ Architecture

- **Backend**: FastAPI, LangGraph, **PyCaret**, ChromaDB, Scikit-learn
- **Frontend**: Next.js, Framer Motion, Tailwind CSS, Lucide
- **Agents**: Orchestrator, **PyCaret EDA**, **PyCaret ML**, RAG, Dashboard, Report
- **AutoML**: **PyCaret** (Primary Engine for all ML tasks)

## 🚀 Getting Started

### Backend Setup
1. `cd backend`
2. `pip install -r requirements.txt`
3. Set your `HUGGINGFACEHUB_API_TOKEN` in `.env`
4. Run: `uvicorn app.main:app --reload`

### Frontend Setup
1. `cd frontend`
2. `npm install`
3. Run: `npm run dev`

### Usage
- Upload a CSV (e.g., `sample_data.csv`)
- Watch the **PyCaret-powered** agent swarm execute tasks in real-time
- Interact with your data via the RAG chat interface
- View automated insights and model performance
- Get predictions from trained models

## 🎯 PyCaret Integration

**AGENTIQ AI** uses **PyCaret** as the primary AutoML engine:

### Automatic Task Detection
- **Classification** - Categorical target prediction
- **Regression** - Continuous value prediction
- **Clustering** - Unsupervised grouping
- **Anomaly Detection** - Outlier identification
- **Time Series** - Temporal forecasting

### Automatic Preprocessing
- Missing value imputation
- Feature encoding and scaling
- Outlier handling
- Multicollinearity removal
- Class imbalance fixing

### Model Selection
- Compares multiple algorithms automatically
- Selects best model based on performance
- Provides feature importance
- Saves models for deployment

## 🏥 Industry Modes

The system automatically detects your industry and adapts its analysis:

- **Healthcare** - Patient outcomes, clinical indicators, risk assessment
- **Finance** - Fraud detection, risk scoring, transaction analysis
- **Retail** - Customer behavior, sales forecasting, inventory optimization
- **Manufacturing** - Quality control, predictive maintenance, defect detection
- **General** - Universal data analysis for any domain

## 📚 Documentation

- **[PyCaret Integration Guide](PYCARET_INTEGRATION.md)** - Comprehensive integration documentation
- **[Quick Reference](PYCARET_QUICKREF.md)** - Developer quick reference guide

## 🔧 Key Components

### PyCaret ML Agent (`pycaret_ml_agent.py`)
- Automatic task type detection
- Model comparison and selection
- Feature importance analysis
- Model persistence

### PyCaret EDA Agent (`pycaret_eda_agent.py`)
- Data profiling and statistics
- Industry detection
- Chart metadata generation
- Insight generation

### Utility Functions (`pycaret_utils.py`)
- Task detection logic
- Industry identification
- Configuration management
- Metric formatting

## 🎨 Sample Output

```json
{
  "ml_type": "classification",
  "best_model_name": "Random Forest Classifier",
  "metrics": {
    "Accuracy": 0.8542,
    "AUC": 0.9123,
    "F1": 0.8491
  },
  "industry": "Healthcare",
  "insights": [
    "🏥 Healthcare Analysis: Patient risk factors identified",
    "📊 Clinical patterns show significant correlations"
  ],
  "pycaret_powered": true
}
```

## 🌟 Why PyCaret?

- ✅ **Speed** - Fast model comparison and selection
- ✅ **Automation** - Minimal manual intervention required
- ✅ **Quality** - Production-ready preprocessing and models
- ✅ **Flexibility** - Supports multiple ML tasks
- ✅ **Explainability** - Built-in feature importance and metrics

## 📊 Supported File Formats

- CSV (`.csv`)
- Excel (`.xlsx`, `.xls`)
- JSON (`.json`)

## 🔐 Security

- JWT-based authentication
- User-specific data isolation
- Secure file storage
- Protected API endpoints

## 🚦 API Endpoints

- `POST /upload` - Upload dataset
- `GET /status/{task_id}` - Check processing status
- `POST /chat` - RAG-powered Q&A
- `POST /predict` - Make predictions
- `POST /rerun_full` - Run full dataset analysis

---

## ☁️ Deployment

### 1. Backend (Render)
- **Runtime**: Python 3.10+
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Environment Variables**:
  - `SUPABASE_DB_URL`: Postgres connection string
  - `HUGGINGFACEHUB_API_TOKEN`: Your API token
  - `SECRET_KEY`: Random string for JWT

### 2. Frontend (Vercel)
- **Framework Preset**: Next.js
- **Environment Variables**:
  - `NEXT_PUBLIC_API_URL`: Your Render backend URL

### 3. Database (Supabase)
- Use the provided `supabase_migration.sql` to initialize your tables.

---

**AGENTIQ AI** — Powered by PyCaret AutoML 🚀

