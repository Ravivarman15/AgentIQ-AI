"""
AGENTIQ AI - Visualization Service
==================================
Handles dashboard layout and visualization metadata.
Converted from DashboardAgent.
"""

from typing import Dict, Any
from app.state import AgentState


class VisualizationService:
    """
    AGENTIQ AI Visualization Service — Dashboard Layout.
    """
    
    def __init__(self, llm):
        self.llm = llm

    def run(self, state: AgentState) -> Dict[str, Any]:
        print("--- RUNNING VISUALIZATION SERVICE ---")
        
        # Logic to decide layout based on ML results and EDA
        layout = {
            "sections": [
                {"type": "stats", "title": "Key Statistics", "data": state.get("eda_insights", [])},
                {"type": "charts", "title": "Data Visualization", "charts": state.get("eda_charts", [])},
                {"type": "ml_metrics", "title": "Model Performance", "results": state.get("ml_results", {})}
            ]
        }
        
        new_logs = state.get("logs", [])
        new_logs.append({"agent": "visualization", "message": "Dashboard schema generated."})
        
        completed = state.get("completed_steps", [])
        completed.append("dashboard")
        
        return {
            "dashboard_layout": layout,
            "logs": new_logs,
            "completed_steps": completed
        }


# Alias
DashboardService = VisualizationService
