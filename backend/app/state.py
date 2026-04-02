from typing import Annotated, TypedDict, List, Dict, Any, Optional
from langgraph.graph import StateGraph, END

class AgentState(TypedDict):
    # Dataset information
    file_path: str
    sample_path: Optional[str]  # Path to the stratified/random sample
    active_path: Optional[str]  # Currently active path for processing
    dataset_name: str
    user_id: str  # For data isolation and persistent storage
    df_preview: str 
    sample_mode: bool  # TRUE by default for fast validation
    
    # Industry context
    industry: Optional[str]
    
    # Agent progress/logs
    logs: List[Dict[str, Any]]
    
    # Insights & Metadata
    eda_insights: List[str]
    col_descriptions: List[str]  # Detailed descriptions for RAG
    eda_charts: List[Dict[str, Any]]  # JSON definitions for Plotly/Recharts
    suggested_questions: List[str]  # AI-generated questions for the user
    
    # ML Results (PyCaret-powered)
    ml_type: str  # 'classification', 'regression', 'clustering', 'anomaly', 'time_series'
    ml_results: Dict[str, Any]
    best_model_path: Optional[str]
    model_dir: Optional[str]  # Directory containing model + pipeline_info
    
    # PyCaret-specific metadata
    data_profile: Optional[Dict[str, Any]]  # Comprehensive data profiling
    statistical_summary: Optional[Dict[str, Any]]  # Statistical insights from PyCaret
    
    # Intelligent Feature Selection (NEW)
    irrelevant_columns: Optional[List[Dict[str, str]]]  # Columns flagged as irrelevant
    manual_target_col: Optional[str]  # User-specified target column
    manual_features: Optional[List[str]]  # User-specified feature list
    auto_feature_mode: Optional[bool]  # True = auto, False = manual
    
    # AutoML Intelligence (LLM-powered)
    data_prep_suggestions: Optional[List[str]]  # LLM data preparation recommendations
    model_explanation: Optional[str]  # LLM explanation of why best model was chosen
    data_intelligence: Optional[Dict[str, Any]]  # Comprehensive data intelligence report
    
    # RAG Meta
    vector_db_id: Optional[str]
    rag_status: Optional[str]  # 'ready', 'failed', etc.
    rag_chunks_count: Optional[int]
    
    # Dashboard Config
    dashboard_layout: Dict[str, Any]
    
    # Reports
    pdf_report_path: Optional[str]
    ppt_report_path: Optional[str]
    report_status: Optional[str]  # 'ready' when reports are generated
    
    # Orchestration Control
    next_agent: str
    completed_steps: List[str]
