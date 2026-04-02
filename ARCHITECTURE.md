# 🏗️ AGENTIQ AI — PyCaret Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AGENTIQ AI ARCHITECTURE                              │
│                    (PyCaret-Powered AutoML Platform)                         │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND LAYER                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  Next.js + TypeScript + Tailwind CSS + Framer Motion                        │
│                                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   Upload     │  │  Dashboard   │  │   RAG Chat   │  │  Predictions │   │
│  │   Component  │  │  Visualizer  │  │  Interface   │  │   Panel      │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ REST API (FastAPI)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              BACKEND LAYER                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                          FastAPI Server (main.py)                            │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │                    API ENDPOINTS                                    │    │
│  │  • POST /upload      • GET /status/{id}    • POST /chat           │    │
│  │  • POST /predict     • POST /rerun_full    • GET /datasets        │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│                                    ▼                                         │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │                    LANGGRAPH WORKFLOW                               │    │
│  │                     (Orchestration Layer)                           │    │
│  │                                                                     │    │
│  │    ┌──────┐    ┌──────┐    ┌──────┐    ┌──────┐    ┌──────┐     │    │
│  │    │ EDA  │───▶│  ML  │───▶│ RAG  │───▶│ DASH │───▶│REPORT│     │    │
│  │    │Agent │    │Agent │    │Agent │    │Agent │    │Agent │     │    │
│  │    └──────┘    └──────┘    └──────┘    └──────┘    └──────┘     │    │
│  │        │           │           │           │           │          │    │
│  │        ▼           ▼           ▼           ▼           ▼          │    │
│  │    PyCaret    PyCaret    ChromaDB   Plotly     ReportLab         │    │
│  │      EDA       AutoML      RAG      Metadata    PDF/PPT          │    │
│  └────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          PYCARET AUTOML LAYER                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │                    TASK DETECTION ENGINE                            │    │
│  │                   (pycaret_utils.py)                                │    │
│  │                                                                     │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │    │
│  │  │ Analyze      │  │ Check        │  │ Detect       │            │    │
│  │  │ Target       │─▶│ Data Types   │─▶│ Task Type    │            │    │
│  │  │ Column       │  │ & Patterns   │  │              │            │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘            │    │
│  │                                              │                     │    │
│  │                          ┌───────────────────┼───────────────┐    │    │
│  │                          ▼                   ▼               ▼    │    │
│  │                  Classification      Regression      Clustering   │    │
│  │                  Anomaly Detection   Time Series                  │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│                                    ▼                                         │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │                  INDUSTRY DETECTION ENGINE                          │    │
│  │                   (pycaret_utils.py)                                │    │
│  │                                                                     │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐          │    │
│  │  │Healthcare│  │ Finance  │  │  Retail  │  │Manufact. │          │    │
│  │  │ Keywords │  │ Keywords │  │ Keywords │  │ Keywords │          │    │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘          │    │
│  │       │              │              │              │               │    │
│  │       └──────────────┴──────────────┴──────────────┘               │    │
│  │                          │                                          │    │
│  │                          ▼                                          │    │
│  │              Domain-Specific Insights                              │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│                                    ▼                                         │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │                    PYCARET EDA AGENT                                │    │
│  │                (pycaret_eda_agent.py)                               │    │
│  │                                                                     │    │
│  │  1. Data Profiling      ─▶  Rows, Columns, Types, Missing         │    │
│  │  2. Statistical Analysis ─▶  Mean, Median, Std, Correlations      │    │
│  │  3. Distribution Analysis ─▶ Histograms, Value Counts            │    │
│  │  4. Insight Generation   ─▶  Natural Language Insights            │    │
│  │  5. Chart Metadata       ─▶  Area, Pie, Line, Bar, Heatmap        │    │
│  │  6. Question Generation  ─▶  Suggested RAG Questions              │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│                                    ▼                                         │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │                    PYCARET ML AGENT                                 │    │
│  │                 (pycaret_ml_agent.py)                               │    │
│  │                                                                     │    │
│  │  ┌─────────────────────────────────────────────────────────┐      │    │
│  │  │              PYCARET SETUP                               │      │    │
│  │  │  • Normalize features                                    │      │    │
│  │  │  • Transform distributions                               │      │    │
│  │  │  • Remove low variance                                   │      │    │
│  │  │  • Handle multicollinearity                              │      │    │
│  │  │  • Fix class imbalance                                   │      │    │
│  │  │  • Remove outliers (full mode)                           │      │    │
│  │  └─────────────────────────────────────────────────────────┘      │    │
│  │                          │                                          │    │
│  │                          ▼                                          │    │
│  │  ┌─────────────────────────────────────────────────────────┐      │    │
│  │  │           COMPARE MODELS (10+ Algorithms)                │      │    │
│  │  │                                                          │      │    │
│  │  │  Classification:                 Regression:             │      │    │
│  │  │  • Random Forest                 • Random Forest         │      │    │
│  │  │  • Gradient Boosting             • Gradient Boosting     │      │    │
│  │  │  • XGBoost                       • XGBoost               │      │    │
│  │  │  • LightGBM                      • LightGBM              │      │    │
│  │  │  • CatBoost                      • Linear Regression     │      │    │
│  │  │  • Logistic Regression           • Ridge/Lasso           │      │    │
│  │  │  • SVM                           • SVR                   │      │    │
│  │  │  • KNN                           • KNN                   │      │    │
│  │  │  • Naive Bayes                   • Decision Tree         │      │    │
│  │  │  • Decision Tree                 • Extra Trees           │      │    │
│  │  └─────────────────────────────────────────────────────────┘      │    │
│  │                          │                                          │    │
│  │                          ▼                                          │    │
│  │  ┌─────────────────────────────────────────────────────────┐      │    │
│  │  │           SELECT BEST MODEL                              │      │    │
│  │  │  • Based on Accuracy/R²/Silhouette                       │      │    │
│  │  │  • Extract metrics                                       │      │    │
│  │  │  • Get feature importance                                │      │    │
│  │  │  • Save model (.pkl)                                     │      │    │
│  │  └─────────────────────────────────────────────────────────┘      │    │
│  └────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          STORAGE & PERSISTENCE                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   SQLite/    │  │   ChromaDB   │  │    Models    │  │   Reports    │   │
│  │    MySQL     │  │   (Vector    │  │   (.pkl)     │  │  (PDF/PPT)   │   │
│  │  (Metadata)  │  │    Store)    │  │              │  │              │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                                              │
│  User Data       RAG Embeddings    Trained Models    Generated Reports      │
│  Datasets        Document Chunks   Feature Importance  Visualizations        │
│  Auth Tokens     Query Cache       Preprocessing      Insights              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          DATA FLOW EXAMPLE                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. User uploads healthcare.csv                                             │
│                │                                                             │
│                ▼                                                             │
│  2. System detects: Task=Classification, Industry=Healthcare                │
│                │                                                             │
│                ▼                                                             │
│  3. PyCaret EDA Agent runs:                                                 │
│     • Profiles data (768 rows, 9 columns)                                   │
│     • Finds correlations (Glucose ↔ Outcome: 0.47)                          │
│     • Generates insights ("Patient risk factors identified")                │
│     • Creates chart metadata                                                │
│                │                                                             │
│                ▼                                                             │
│  4. PyCaret ML Agent runs:                                                  │
│     • Setup: normalize=True, fix_imbalance=True                             │
│     • Compares 10 models                                                    │
│     • Selects: Random Forest (85.4% accuracy)                               │
│     • Extracts feature importance (Glucose: 0.34, BMI: 0.23)                │
│     • Saves model to models/user123/healthcare/best_model.pkl               │
│                │                                                             │
│                ▼                                                             │
│  5. RAG Agent indexes data for Q&A                                          │
│                │                                                             │
│                ▼                                                             │
│  6. Dashboard Agent creates visualization layout                            │
│                │                                                             │
│                ▼                                                             │
│  7. Report Agent generates PDF/PPT                                          │
│                │                                                             │
│                ▼                                                             │
│  8. Frontend displays results with industry-specific insights               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          KEY COMPONENTS                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  🎯 Task Detection:     Automatic ML task type identification               │
│  🏭 Industry Detection: Domain-specific analysis and insights               │
│  📊 PyCaret EDA:        Comprehensive exploratory data analysis             │
│  🤖 PyCaret ML:         Automated model selection and training              │
│  💬 RAG System:         Natural language Q&A about data                     │
│  📈 Dashboards:         Interactive visualizations                          │
│  📄 Reports:            PDF/PPT generation                                  │
│  🔒 Auth:               JWT-based user authentication                       │
│  💾 Storage:            SQLite/MySQL + ChromaDB + File system               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          TECHNOLOGY STACK                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Frontend:   Next.js, TypeScript, Tailwind CSS, Framer Motion, Recharts    │
│  Backend:    FastAPI, Python 3.12+                                          │
│  AutoML:     PyCaret (Primary), Scikit-learn (Fallback)                     │
│  Agents:     LangGraph, LangChain                                           │
│  LLM:        HuggingFace (Mistral, Llama)                                   │
│  RAG:        ChromaDB, Sentence Transformers                                │
│  Database:   SQLite/MySQL, SQLAlchemy                                       │
│  Auth:       JWT, OAuth2, Passlib                                           │
│  Viz:        Plotly, Matplotlib, Recharts                                   │
│  Reports:    ReportLab (PDF), python-pptx (PPT)                             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

                        AGENTIQ AI — Powered by PyCaret 🚀
```
