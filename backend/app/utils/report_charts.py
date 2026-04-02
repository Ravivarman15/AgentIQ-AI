"""
Chart generation utilities for AGENTIQ AI reports.
Generates matplotlib chart images for embedding in PDF and PPT reports.
"""

import os
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend
import matplotlib.pyplot as plt
import matplotlib.colors as mcolors
import numpy as np
from typing import Dict, Any, List, Optional


# ── Color palette ──
COLORS = {
    'primary': '#3b82f6',
    'dark': '#1e293b',
    'accent': '#10b981',
    'purple': '#8b5cf6',
    'amber': '#f59e0b',
    'rose': '#f43f5e',
    'cyan': '#06b6d4',
    'bg': '#0f172a',
    'card': '#1e293b',
    'text': '#e2e8f0',
    'muted': '#94a3b8',
}

CHART_PALETTE = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#f43f5e', '#06b6d4', '#ec4899', '#14b8a6']


def _setup_dark_style(fig, ax):
    """Apply consistent dark styling to a chart."""
    fig.patch.set_facecolor(COLORS['bg'])
    ax.set_facecolor(COLORS['card'])
    ax.tick_params(colors=COLORS['muted'], labelsize=9)
    ax.xaxis.label.set_color(COLORS['text'])
    ax.yaxis.label.set_color(COLORS['text'])
    ax.title.set_color(COLORS['text'])
    for spine in ax.spines.values():
        spine.set_color(COLORS['muted'])
        spine.set_linewidth(0.5)


def generate_feature_importance_chart(feature_importance: Dict[str, float], save_path: str, top_n: int = 10):
    """Generate a horizontal bar chart for feature importance."""
    if not feature_importance:
        return False

    sorted_features = sorted(feature_importance.items(), key=lambda x: abs(x[1]), reverse=True)[:top_n]
    sorted_features.reverse()  # Reverse for horizontal bar (top at top)

    names = [f[0] for f in sorted_features]
    values = [abs(f[1]) for f in sorted_features]

    fig, ax = plt.subplots(figsize=(8, max(4, len(names) * 0.5)))
    _setup_dark_style(fig, ax)

    bars = ax.barh(names, values, color=CHART_PALETTE[:len(names)], height=0.6, edgecolor='none')

    # Add value labels
    for bar, val in zip(bars, values):
        ax.text(bar.get_width() + max(values) * 0.02, bar.get_y() + bar.get_height() / 2,
                f'{val:.4f}', va='center', fontsize=8, color=COLORS['text'])

    ax.set_xlabel('Importance Score', fontsize=10, fontweight='bold')
    ax.set_title('Top Feature Importance', fontsize=14, fontweight='bold', pad=15)
    ax.set_xlim(0, max(values) * 1.15)

    plt.tight_layout()
    fig.savefig(save_path, dpi=150, bbox_inches='tight', facecolor=fig.get_facecolor())
    plt.close(fig)
    return True


def generate_leaderboard_chart(leaderboard: List[Dict], save_path: str, task_type: str = 'classification'):
    """Generate a bar chart comparing model performance."""
    if not leaderboard:
        return False

    metric_key = 'Accuracy' if task_type == 'classification' else 'R2'
    models = []
    scores = []
    for entry in leaderboard[:6]:
        name = entry.get('Model', 'Unknown')
        score = entry.get(metric_key, 0)
        if isinstance(score, (int, float)):
            models.append(name[:20])
            scores.append(float(score))

    if not models:
        return False

    fig, ax = plt.subplots(figsize=(8, 4.5))
    _setup_dark_style(fig, ax)

    colors = [COLORS['accent'] if s == max(scores) else COLORS['primary'] for s in scores]
    bars = ax.bar(range(len(models)), scores, color=colors, width=0.6, edgecolor='none')

    # Add value labels on bars
    for bar, val in zip(bars, scores):
        ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + max(scores) * 0.02,
                f'{val:.4f}', ha='center', va='bottom', fontsize=9, color=COLORS['text'], fontweight='bold')

    ax.set_xticks(range(len(models)))
    ax.set_xticklabels(models, rotation=25, ha='right', fontsize=9)
    ax.set_ylabel(metric_key, fontsize=10, fontweight='bold')
    ax.set_title(f'Model Comparison — {metric_key}', fontsize=14, fontweight='bold', pad=15)

    if scores:
        ax.set_ylim(0, max(scores) * 1.15)

    plt.tight_layout()
    fig.savefig(save_path, dpi=150, bbox_inches='tight', facecolor=fig.get_facecolor())
    plt.close(fig)
    return True


def generate_target_distribution_chart(data_intelligence: Dict, save_path: str):
    """Generate target class distribution (for classification) or histogram."""
    cb = data_intelligence.get('class_balance')
    if not cb or not cb.get('distribution'):
        return False

    dist = cb['distribution']
    labels = list(dist.keys())[:10]
    values = [dist[k] for k in labels]

    fig, ax = plt.subplots(figsize=(7, 4.5))
    _setup_dark_style(fig, ax)

    colors = CHART_PALETTE[:len(labels)]
    wedges, texts, autotexts = ax.pie(
        values, labels=labels, autopct='%1.1f%%',
        colors=colors, startangle=90,
        textprops={'color': COLORS['text'], 'fontsize': 10}
    )
    for at in autotexts:
        at.set_fontweight('bold')

    ax.set_title('Target Class Distribution', fontsize=14, fontweight='bold', color=COLORS['text'], pad=15)

    plt.tight_layout()
    fig.savefig(save_path, dpi=150, bbox_inches='tight', facecolor=fig.get_facecolor())
    plt.close(fig)
    return True


def generate_all_charts(report_dir: str, state: Dict[str, Any]) -> Dict[str, str]:
    """Generate all chart images and return a dict of {chart_name: file_path}."""
    charts_dir = os.path.join(report_dir, "charts")
    os.makedirs(charts_dir, exist_ok=True)

    ml_results = state.get("ml_results", {})
    data_intelligence = state.get("data_intelligence") or ml_results.get("data_intelligence", {})
    chart_paths = {}

    # 1. Feature importance
    fi = ml_results.get("feature_importance", {})
    if fi:
        path = os.path.join(charts_dir, "feature_importance.png")
        if generate_feature_importance_chart(fi, path):
            chart_paths["feature_importance"] = path

    # 2. Model leaderboard
    lb = ml_results.get("leaderboard", [])
    task_type = ml_results.get("task_type", "classification")
    if lb:
        path = os.path.join(charts_dir, "model_comparison.png")
        if generate_leaderboard_chart(lb, path, task_type):
            chart_paths["model_comparison"] = path

    # 3. Target distribution
    if data_intelligence:
        path = os.path.join(charts_dir, "target_distribution.png")
        if generate_target_distribution_chart(data_intelligence, path):
            chart_paths["target_distribution"] = path

    return chart_paths
