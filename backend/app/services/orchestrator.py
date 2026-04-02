"""
AGENTIQ AI - Orchestrator Service
=================================
Handles agent routing and decision logic.
Converted from Orchestrator agent.
"""

from typing import Dict, Any
from app.state import AgentState

class OrchestratorService:
    """
    AGENTIQ AI Orchestrator — Decision Logic for LangGraph.
    """
    def __init__(self, model):
        self.model = model

    def decide_next_step(self, state: AgentState) -> Dict[str, Any]:
        """
        Logic to decide the next agent to execute based on the current state.
        """
        completed = state.get("completed_steps", [])
        
        if "eda" not in completed:
            return {"next_agent": "eda_agent"}
        
        if "ml" not in completed:
            return {"next_agent": "ml_agent"}
        
        if "rag" not in completed:
            return {"next_agent": "rag_agent"}
            
        if "dashboard" not in completed:
            return {"next_agent": "dashboard_agent"}
            
        if "report" not in completed:
            return {"next_agent": "report_agent"}
            
        return {"next_agent": "end"}

    def route_by_decision(self, state: AgentState):
        """
        Conditional routing logic for LangGraph.
        """
        return state["next_agent"]


# Alias
OrchService = OrchestratorService
