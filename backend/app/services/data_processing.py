"""
PyCaret-Powered EDA Service for AGENTIQ AI
==========================================
Handles exploratory data analysis, industry detection, and visualization metadata.
Converted from PyCaretEDAAgent.
"""

import pandas as pd
import numpy as np
from typing import Dict, Any, List
from app.state import AgentState
from app.utils.data_utils import load_dataframe
from app.utils.pycaret_utils import (
    detect_industry,
    detect_ml_task,
    generate_suggested_questions,
    detect_irrelevant_columns,
)


class DataProcessingService:
    """
    AGENTIQ AI Data Processing Service — Senior-Level EDA.
    """
    
    def __init__(self, llm):
        self.llm = llm
        
    def run(self, state: AgentState) -> Dict[str, Any]:
        print("=" * 70)
        print("  📊 AGENTIQ AI — Senior-Level EDA Service Starting")
        print("=" * 70)
        
        file_path = state.get("active_path", state["file_path"])
        df = load_dataframe(file_path)
        sample_mode = state.get("sample_mode", True)
        
        # Step 1: Industry Detection
        industry = detect_industry(df)
        print(f"  ✓ Detected Industry: {industry}")
        
        # Step 2: Task Detection
        task_type, target_col = detect_ml_task(df)
        print(f"  ✓ Detected Task: {task_type}")
        if target_col:
            print(f"  ✓ Target Column: {target_col}")
        
        # Step 3: Detect Irrelevant Columns
        irrelevant = detect_irrelevant_columns(df, target_col)
        if irrelevant["columns_to_remove"]:
            print(f"  ⚠️ Detected {len(irrelevant['columns_to_remove'])} irrelevant columns")
            for item in irrelevant["columns_to_remove"]:
                print(f"    • {item['column']}: {item['reason']}")
        
        # Step 4: Basic Data Profiling
        profile = self._generate_data_profile(df)
        
        # Step 5: Statistical Analysis
        stats = self._generate_statistical_insights(df, target_col)
        
        # Step 6: Generate Insights
        insights = self._generate_insights(df, industry, task_type, target_col, stats, irrelevant)
        
        # Step 7: Create Visualization Metadata
        charts = self._generate_enhanced_charts(df, target_col, task_type)
        
        # Step 8: Generate Column Descriptions for RAG
        col_descriptions = self._generate_column_descriptions(df, profile)
        
        # Step 9: Generate Suggested Questions
        questions = generate_suggested_questions(industry, df, target_col)
        
        # Step 10: Update Logs
        new_logs = state.get("logs", [])
        mode_str = "FAST (Sample)" if sample_mode else "FULL"
        new_logs.append({
            "agent": "data_processing",
            "message": f"✅ EDA Service Complete ({mode_str} mode) | Industry: {industry} | Task: {task_type}",
            "details": {
                "rows": len(df),
                "columns": len(df.columns),
                "missing_percentage": round(df.isnull().sum().sum() / df.size * 100, 2) if df.size > 0 else 0,
                "irrelevant_columns_flagged": len(irrelevant["columns_to_remove"]),
            }
        })
        
        completed = state.get("completed_steps", [])
        completed.append("eda")
        
        # Count chart categories for validation
        bivariate_count = sum(1 for c in charts if c.get("category") == "bivariate")
        multivariate_count = sum(1 for c in charts if c.get("category") == "multivariate")
        print(f"\n  ✅ EDA Complete — {len(charts)} total charts")
        print("=" * 70)
        
        # Step 11: Compute Data Health Score
        health = self._compute_health_score(df, stats)
        
        return {
            "eda_insights": insights,
            "col_descriptions": col_descriptions,
            "eda_charts": charts,
            "logs": new_logs,
            "completed_steps": completed,
            "df_preview": df.head(10).to_json(),
            "industry": industry,
            "suggested_questions": questions,
            "data_profile": profile,
            "statistical_summary": stats,
            "irrelevant_columns": irrelevant["columns_to_remove"],
            "data_health_score": health["score"],
            "data_health_breakdown": health["breakdown"],
        }
    
    def _generate_data_profile(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Generate comprehensive data profile"""
        numeric_cols = df.select_dtypes(include=['number']).columns.tolist()
        categorical_cols = df.select_dtypes(include=['object', 'category']).columns.tolist()
        datetime_cols = df.select_dtypes(include=['datetime64']).columns.tolist()
        
        return {
            "total_rows": len(df),
            "total_columns": len(df.columns),
            "numeric_columns": len(numeric_cols),
            "categorical_columns": len(categorical_cols),
            "datetime_columns": len(datetime_cols),
            "memory_usage_mb": round(df.memory_usage(deep=True).sum() / 1024**2, 2),
            "missing_cells": int(df.isnull().sum().sum()),
            "missing_percentage": round(df.isnull().sum().sum() / df.size * 100, 2) if df.size > 0 else 0,
            "duplicate_rows": int(df.duplicated().sum()),
            "columns": list(df.columns),
            "dtypes": df.dtypes.astype(str).to_dict(),
            "missing_by_column": df.isnull().sum().to_dict()
        }
    
    def _generate_statistical_insights(self, df: pd.DataFrame, target_col: str = None) -> Dict[str, Any]:
        """Generate comprehensive statistical insights"""
        stats = {}
        numeric_cols = df.select_dtypes(include=['number']).columns
        if len(numeric_cols) > 0:
            desc = df[numeric_cols].describe()
            stats['numeric_summary'] = desc.to_dict()
            try:
                stats['skewness'] = df[numeric_cols].skew().to_dict()
                stats['kurtosis'] = df[numeric_cols].kurtosis().to_dict()
            except: pass
            if len(numeric_cols) > 1:
                corr_matrix = df[numeric_cols].corr()
                corr_pairs = []
                for i in range(len(corr_matrix.columns)):
                    for j in range(i+1, len(corr_matrix.columns)):
                        corr_pairs.append({
                            'feature1': corr_matrix.columns[i],
                            'feature2': corr_matrix.columns[j],
                            'correlation': round(corr_matrix.iloc[i, j], 3)
                        })
                corr_pairs.sort(key=lambda x: abs(x['correlation']), reverse=True)
                stats['top_correlations'] = corr_pairs[:10]
                stats['correlation_matrix'] = {
                    col: {col2: round(corr_matrix.loc[col, col2], 3) for col2 in corr_matrix.columns}
                    for col in corr_matrix.columns
                }
        
        categorical_cols = df.select_dtypes(include=['object', 'category']).columns
        if len(categorical_cols) > 0:
            cat_stats = {}
            for col in categorical_cols[:5]:
                cat_stats[col] = {
                    'unique_values': int(df[col].nunique()),
                    'top_value': str(df[col].mode()[0]) if len(df[col].mode()) > 0 else None,
                    'top_value_count': int(df[col].value_counts().iloc[0]) if len(df[col]) > 0 else 0
                }
            stats['categorical_summary'] = cat_stats
        
        if target_col and target_col in df.columns:
            target_stats = {'column': target_col, 'dtype': str(df[target_col].dtype),
                           'unique_values': int(df[target_col].nunique()), 'missing_count': int(df[target_col].isnull().sum())}
            if pd.api.types.is_numeric_dtype(df[target_col]):
                target_stats.update({'mean': float(df[target_col].mean()), 'median': float(df[target_col].median()),
                                    'std': float(df[target_col].std()), 'min': float(df[target_col].min()), 'max': float(df[target_col].max())})
            else:
                target_stats['value_counts'] = df[target_col].value_counts().head(10).to_dict()
            stats['target_analysis'] = target_stats
        
        if len(numeric_cols) > 0:
            outlier_info = {}
            for col in numeric_cols[:10]:
                Q1, Q3 = df[col].quantile(0.25), df[col].quantile(0.75)
                IQR = Q3 - Q1
                lower, upper = Q1 - 1.5 * IQR, Q3 + 1.5 * IQR
                outlier_count = int(((df[col] < lower) | (df[col] > upper)).sum())
                if outlier_count > 0:
                    outlier_info[col] = {'count': outlier_count, 'percentage': round(outlier_count / len(df) * 100, 2),
                                        'lower_bound': round(float(lower), 4), 'upper_bound': round(float(upper), 4)}
            if outlier_info: stats['outliers'] = outlier_info
        return stats
    
    def _generate_insights(self, df: pd.DataFrame, industry: str, task_type: str, 
                          target_col: str, stats: Dict[str, Any],
                          irrelevant: Dict[str, Any] = None) -> List[str]:
        """Generate natural language insights"""
        insights = []
        completeness = 100 - (df.isnull().sum().sum() / df.size * 100) if df.size > 0 else 100
        insights.append(f"Dataset contains {len(df):,} records across {len(df.columns)} features with {completeness:.1f}% completeness.")
        if df.duplicated().sum() > 0:
            insights.append(f"Found {df.duplicated().sum()} duplicate rows ({df.duplicated().sum()/len(df)*100:.1f}%).")
        if irrelevant and irrelevant.get("columns_to_remove"):
            removed = irrelevant["columns_to_remove"]
            insights.append(f"Detected {len(removed)} irrelevant columns excluded from ML: {', '.join([r['column'] for r in removed[:5]])}")
        
        numeric_cols = df.select_dtypes(include=['number']).columns
        if len(numeric_cols) > 0:
            if 'top_correlations' in stats and stats['top_correlations']:
                top_corr = stats['top_correlations'][0]
                insights.append(f"Strongest correlation: {top_corr['feature1']} \u2194 {top_corr['feature2']} (r = {top_corr['correlation']:.2f}).")
            if 'outliers' in stats and stats['outliers']:
                total_outliers = sum(v['count'] for v in stats['outliers'].values())
                worst_col = max(stats['outliers'].items(), key=lambda x: x[1]['count'])
                insights.append(f"Detected {total_outliers} outliers. Most affected: {worst_col[0]} ({worst_col[1]['percentage']}%).")
        
        if target_col and 'target_analysis' in stats:
            target_stats = stats['target_analysis']
            if pd.api.types.is_numeric_dtype(df[target_col]):
                insights.append(f"Target '{target_col}': Mean = {target_stats.get('mean', 0):.2f}, Range: {target_stats.get('min', 0):.2f} \u2014 {target_stats.get('max', 0):.2f}.")
            else:
                insights.append(f"Target '{target_col}' has {target_stats['unique_values']} classes (Classification).")
        
        industry_msg = {"Healthcare": "Focus on patient outcomes.", "Finance": "Emphasis on risk/fraud.", "Retail": "Analysis of sales patterns.", "Manufacturing": "Quality/efficiency focus."}
        if industry in industry_msg: insights.append(industry_msg[industry])
        return insights
    
    def _compute_health_score(self, df: pd.DataFrame, stats: Dict[str, Any]) -> Dict[str, Any]:
        """Compute Data Health Score"""
        breakdown = {}
        missing_pct = (df.isnull().sum().sum() / df.size * 100) if df.size > 0 else 0
        missing_score = 30 if missing_pct == 0 else 22 if missing_pct < 5 else 8 if missing_pct < 30 else 3
        breakdown["missing_values"] = {"score": missing_score, "max": 30, "detail": f"{missing_pct:.1f}% missing"}
        
        dup_pct = (df.duplicated().sum() / len(df) * 100) if len(df) > 0 else 0
        dup_score = 20 if dup_pct == 0 else 12 if dup_pct < 5 else 3
        breakdown["duplicates"] = {"score": dup_score, "max": 20, "detail": f"{dup_pct:.1f}% duplicates"}
        
        outlier_cols = len(stats.get("outliers", {}))
        numeric_count = len(df.select_dtypes(include=['number']).columns)
        outlier_ratio = (outlier_cols / numeric_count) if numeric_count > 0 else 0
        outlier_score = 25 if outlier_ratio == 0 else 17 if outlier_ratio < 0.4 else 5
        breakdown["outliers"] = {"score": outlier_score, "max": 25, "detail": f"{outlier_cols}/{numeric_count} with outliers"}
        
        total_cols = len(df.columns)
        feature_score = 25 if total_cols >= 3 and numeric_count >= 1 else 10
        breakdown["feature_balance"] = {"score": feature_score, "max": 25, "detail": f"{total_cols} features"}
        
        return {"score": missing_score + dup_score + outlier_score + feature_score, "breakdown": breakdown}
    
    def _generate_enhanced_charts(self, df: pd.DataFrame, target_col: str, task_type: str) -> List[Dict[str, Any]]:
        """Generate chart metadata"""
        charts = []
        numeric_cols = [c for c in df.select_dtypes(include=['number']).columns if not self._is_likely_id(df, c)]
        categorical_cols = df.select_dtypes(include=['object', 'category']).columns.tolist()
        
        # Univariate
        for col in numeric_cols[:2]:
            vc = df[col].dropna().value_counts().sort_index().head(20)
            charts.append({"type": "area", "category": "univariate", "title": f"{col} Distribution", "data": {str(k): int(v) for k, v in vc.items()}, "color": "#3b82f6"})
        
        # Bivariate (min 2)
        if len(numeric_cols) >= 2:
            corr = round(float(df[numeric_cols[0]].corr(df[numeric_cols[1]])), 3)
            charts.append({"type": "scatter", "category": "bivariate", "title": f"{numeric_cols[0]} vs {numeric_cols[1]}", "data": {"x": df[numeric_cols[0]].head(100).tolist(), "y": df[numeric_cols[1]].head(100).tolist()}, "color": "#10b981"})
            
            corr_cols = numeric_cols[:6]
            corr_m = df[corr_cols].corr().to_dict()
            charts.append({"type": "heatmap", "category": "bivariate", "title": "Correlation Heatmap", "data": corr_m, "color": "#f59e0b"})
        
        # Multivariate (min 2)
        if len(numeric_cols) >= 3:
            charts.append({"type": "pairplot", "category": "multivariate", "title": "Pairwise Relationships", "data": {}, "color": "#10b981"})
            charts.append({"type": "bar", "category": "multivariate", "title": "Normalized Means", "data": {c: round(float(df[c].mean()), 2) for c in numeric_cols[:6]}, "color": "#a855f7"})
            
        return charts
    
    def _is_likely_id(self, df: pd.DataFrame, col: str) -> bool:
        col_lower = col.lower()
        if any(w in col_lower for w in ['id', 'uuid', 'code', 'key']): return True
        if pd.api.types.is_numeric_dtype(df[col]):
            if (df[col].nunique() / len(df)) > 0.95 and len(df) > 20: return True
        return False
    
    def _generate_column_descriptions(self, df: pd.DataFrame, profile: Dict[str, Any]) -> List[str]:
        descriptions = []
        for col in df.columns:
            dtype = str(df[col].dtype)
            unique = df[col].nunique()
            desc = f"Column '{col}': Type={dtype}, Unique={unique}"
            if pd.api.types.is_numeric_dtype(df[col]):
                desc += f", Mean={df[col].mean():.2f}"
            descriptions.append(desc)
        return descriptions


# Alias
EDAService = DataProcessingService
