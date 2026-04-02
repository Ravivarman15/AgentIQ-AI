"""
AGENTIQ AI — Agent Pipeline
Initializes services, builds LangGraph workflow, and runs the pipeline.
Now uses the modular 'services/' architecture for production readiness.
"""

from app.state import AgentState
from app.services.orchestrator import OrchestratorService
from app.services.data_processing import DataProcessingService
from app.services.ml_pipeline import MLPipelineService
from app.services.rag_pipeline import RAGPipelineService
from app.services.visualization import VisualizationService
from app.services.report_generator import ReportGeneratorService
from app.utils.llm_factory import get_llm
from langgraph.graph import StateGraph, END

# ═══════════════════════════════════════════════════════════════════════════════
# SERVICE INITIALIZATION
# ═══════════════════════════════════════════════════════════════════════════════

llm = get_llm()
eda_service = DataProcessingService(llm)
ml_service = MLPipelineService(llm)
rag_service = RAGPipelineService(llm)
viz_service = VisualizationService(llm)
repr_service = ReportGeneratorService(llm)
orch = OrchestratorService(llm)

# ═══════════════════════════════════════════════════════════════════════════════
# LANGGRAPH WORKFLOW
# ═══════════════════════════════════════════════════════════════════════════════

workflow = StateGraph(AgentState)

# Add Nodes (mapping agent names to service methods)
workflow.add_node("eda_agent", eda_service.run)
workflow.add_node("ml_agent", ml_service.run)
workflow.add_node("rag_agent", rag_service.run)
workflow.add_node("dashboard_agent", viz_service.run)
workflow.add_node("report_agent", repr_service.run)

# Set Entry Point
workflow.set_entry_point("eda_agent")


# Logic to decide next step
def route_next(state):
    return orch.decide_next_step(state)["next_agent"]


# Add Conditional Edges
workflow.add_conditional_edges(
    "eda_agent",
    route_next,
    {"ml_agent": "ml_agent", "end": END}
)

workflow.add_conditional_edges(
    "ml_agent",
    route_next,
    {"rag_agent": "rag_agent", "end": END}
)

workflow.add_conditional_edges(
    "rag_agent",
    route_next,
    {"dashboard_agent": "dashboard_agent", "end": END}
)

workflow.add_conditional_edges(
    "dashboard_agent",
    route_next,
    {"report_agent": "report_agent", "end": END}
)

workflow.add_edge("report_agent", END)

app_graph = workflow.compile()

# ═══════════════════════════════════════════════════════════════════════════════
# TASK STATE (in-memory per-process)
# ═══════════════════════════════════════════════════════════════════════════════

tasks = {}


# ═══════════════════════════════════════════════════════════════════════════════
# PIPELINE RUNNER
# ═══════════════════════════════════════════════════════════════════════════════

async def run_agents(
    task_id: str, file_path: str, sample_path: str, user_id: str = "default",
    full_mode: bool = False,
    manual_target_col: str = None,
    manual_features: list = None,
    auto_feature_mode: bool = True
):
    initial_state = {
        "file_path": file_path,
        "sample_path": sample_path,
        "sample_mode": not full_mode,
        "dataset_name": task_id,
        "user_id": user_id,
        "logs": [{"agent": "system", "message": f"AGENTIQ AI initialized in {'FULL' if full_mode else 'FAST VALIDATION'} mode."}],
        "completed_steps": [],
        "eda_insights": [
            "Initializing deep audit of dataset topology...",
            "Preparing multi-dimensional feature extraction...",
            "Awaiting swarm activation for pattern recognition."
        ],
        "col_descriptions": [],
        "suggested_questions": [],
        "eda_charts": [],
        "ml_results": {},
        "next_agent": "eda_agent",
        "manual_target_col": manual_target_col,
        "manual_features": manual_features,
        "auto_feature_mode": auto_feature_mode,
    }

    # Execute the graph step-by-step
    current_state = initial_state
    async for event in app_graph.astream(initial_state, {"configurable": {"thread_id": task_id}}):
        for node_name, output in event.items():
            print(f"--- Finished Step: {node_name} ---")
            current_state.update(output)
            tasks[task_id] = {**current_state, "status": "running"}

    tasks[task_id]["status"] = "completed"
