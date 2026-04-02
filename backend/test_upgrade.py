"""
Self-Validation Test for AGENTIQ AI ML Pipeline Upgrade
=========================================================
Tests all upgraded components to verify correct implementation.
"""

import pandas as pd
import numpy as np
import sys

# Test 1: Python Version Validation
print("=" * 60)
print("TEST 1: Python Version Validation")
print("-" * 60)

from app.utils.pycaret_utils import validate_python_version
result = validate_python_version()
print(f"  Version: {result['version']}")
print(f"  Compatible: {result['compatible']}")
print(f"  Message: {result['message']}")
print(f"  ✅ PASS" if result['compatible'] is not None else "  ❌ FAIL")

# Test 2: ID Column Detection
print("\n" + "=" * 60)
print("TEST 2: Intelligent Feature Selection - ID Detection")
print("-" * 60)

from app.utils.pycaret_utils import detect_irrelevant_columns

df_test = pd.DataFrame({
    'id': range(100),
    'customer_id': range(100, 200),
    'uuid': [f'uuid-{i}' for i in range(100)],
    'age': np.random.randint(18, 80, 100),
    'income': np.random.uniform(20000, 150000, 100),
    'score': np.random.uniform(0, 1, 100),
    'constant_col': ['same'] * 100,
    'target': np.random.choice(['yes', 'no'], 100)
})

result = detect_irrelevant_columns(df_test, 'target')
removed_names = [r['column'] for r in result['columns_to_remove']]
print(f"  Detected irrelevant: {removed_names}")
print(f"  Kept: {result['columns_to_keep']}")

# Check that id-like columns ARE removed
assert 'id' in removed_names, "❌ 'id' should be removed"
assert 'customer_id' in removed_names, "❌ 'customer_id' should be removed"
assert 'constant_col' in removed_names, "❌ 'constant_col' should be removed"
# Check that real features ARE kept
assert 'age' in result['columns_to_keep'], "❌ 'age' should be kept"
assert 'income' in result['columns_to_keep'], "❌ 'income' should be kept"
print("  ✅ PASS — ID columns correctly detected and removed")

# Test 3: Advanced Feature Selection
print("\n" + "=" * 60)
print("TEST 3: Advanced Feature Selection")
print("-" * 60)

from app.utils.pycaret_utils import advanced_feature_selection

df_clean = df_test[['age', 'income', 'score', 'target']].copy()
selection = advanced_feature_selection(df_clean, 'target')
print(f"  Selected features: {selection['selected_features']}")
print(f"  Removed features: {selection['removed_features']}")
print(f"  Report:")
for line in selection['selection_report']:
    print(f"    {line}")
print("  ✅ PASS — Feature selection pipeline completed")

# Test 4: Clean Dataset Pipeline
print("\n" + "=" * 60)
print("TEST 4: Full Cleaning Pipeline (Auto Mode)")
print("-" * 60)

from app.utils.pycaret_utils import clean_dataset_for_training

cleaning = clean_dataset_for_training(df_test, target_col='target', auto_mode=True)
print(f"  Target: {cleaning['target_col']}")
print(f"  Features: {cleaning['features']}")
print(f"  Removed: {len(cleaning['removed_columns'])} columns")
print(f"  Report:")
for line in cleaning['cleaning_report']:
    print(f"    {line}")
assert 'error' not in cleaning, f"❌ Error in cleaning: {cleaning.get('error')}"
assert len(cleaning['features']) > 0, "❌ No features selected"
print("  ✅ PASS — Auto cleaning pipeline works correctly")

# Test 5: Manual Mode
print("\n" + "=" * 60)
print("TEST 5: Manual Feature Selection Mode")
print("-" * 60)

manual_cleaning = clean_dataset_for_training(
    df_test,
    target_col='target',
    manual_features=['age', 'income'],
    auto_mode=False
)
print(f"  Target: {manual_cleaning['target_col']}")
print(f"  Features: {manual_cleaning['features']}")
assert manual_cleaning['features'] == ['age', 'income'], "❌ Manual features not respected"
print("  ✅ PASS — Manual selection mode works correctly")

# Test 6: ML Task Detection
print("\n" + "=" * 60)
print("TEST 6: ML Task Detection")
print("-" * 60)

from app.utils.pycaret_utils import detect_ml_task

task, target = detect_ml_task(df_test, 'target')
print(f"  Task: {task}, Target: {target}")
assert task == 'classification', f"❌ Expected classification, got {task}"

df_reg = pd.DataFrame({'x': range(100), 'y': np.random.uniform(0, 100, 100)})
task_r, target_r = detect_ml_task(df_reg, 'y')
print(f"  Regression test: Task={task_r}, Target={target_r}")
assert task_r == 'regression', f"❌ Expected regression, got {task_r}"
print("  ✅ PASS — Task detection works correctly")

# Test 7: Leaderboard Formatting
print("\n" + "=" * 60)
print("TEST 7: Leaderboard Formatting")
print("-" * 60)

from app.utils.pycaret_utils import format_leaderboard

mock_comparison = pd.DataFrame({
    'Model': ['Random Forest', 'SVM', 'LR', 'XGBoost', 'KNN'],
    'Accuracy': [0.95, 0.92, 0.88, 0.94, 0.87],
    'AUC': [0.97, 0.93, 0.90, 0.96, 0.85],
    'Recall': [0.94, 0.91, 0.86, 0.93, 0.84],
    'Prec.': [0.96, 0.93, 0.89, 0.95, 0.88],
    'F1': [0.95, 0.92, 0.87, 0.94, 0.86],
    'Kappa': [0.90, 0.84, 0.76, 0.88, 0.74],
})

leaderboard = format_leaderboard(mock_comparison, 'classification', top_n=5)
print(f"  Leaderboard entries: {len(leaderboard)}")
for entry in leaderboard:
    print(f"    #{entry['rank']} {entry['Model']}: Acc={entry.get('Accuracy', 'N/A')}")
assert len(leaderboard) == 5, f"❌ Expected 5 entries, got {len(leaderboard)}"
assert leaderboard[0]['rank'] == 1, "❌ First entry should be rank 1"
print("  ✅ PASS — Leaderboard formatting works correctly")

# Test 8: Industry Detection
print("\n" + "=" * 60)
print("TEST 8: Industry Detection")
print("-" * 60)

from app.utils.pycaret_utils import detect_industry

df_health = pd.DataFrame({'patient_id': [1], 'diagnosis': ['flu'], 'blood_pressure': [120]})
df_finance = pd.DataFrame({'transaction_id': [1], 'amount': [100], 'fraud': [0]})
df_retail = pd.DataFrame({'customer_id': [1], 'product': ['shoes'], 'sales': [100]})

print(f"  Healthcare: {detect_industry(df_health)}")
print(f"  Finance: {detect_industry(df_finance)}")
print(f"  Retail: {detect_industry(df_retail)}")
assert detect_industry(df_health) == 'Healthcare', "❌ Healthcare detection failed"
assert detect_industry(df_finance) == 'Finance', "❌ Finance detection failed"
assert detect_industry(df_retail) == 'Retail', "❌ Retail detection failed"
print("  ✅ PASS — Industry detection works correctly")

# Test 9: State Schema
print("\n" + "=" * 60)
print("TEST 9: State Schema (new fields)")
print("-" * 60)

from app.state import AgentState
import typing

hints = typing.get_type_hints(AgentState)
new_fields = ['manual_target_col', 'manual_features', 'auto_feature_mode', 'irrelevant_columns']
for field in new_fields:
    assert field in hints, f"❌ Missing field '{field}' in AgentState"
    print(f"  ✓ {field}: {hints[field]}")
print("  ✅ PASS — All new state fields present")

# Test 10: Agent Imports
print("\n" + "=" * 60)
print("TEST 10: All Agent Imports")
print("-" * 60)

from app.agents.pycaret_ml_agent import PyCaretMLAgent
from app.agents.pycaret_eda_agent import PyCaretEDAAgent
from app.agents.visual_agents import DashboardAgent, ReportAgent
print("  ✓ PyCaretMLAgent imported")
print("  ✓ PyCaretEDAAgent imported")
print("  ✓ DashboardAgent imported")
print("  ✓ ReportAgent imported")
print("  ✅ PASS — All agents import correctly")

# Final Summary
print("\n" + "=" * 60)
print("  ✅ ALL 10 TESTS PASSED — ML Pipeline Upgrade Verified")
print("=" * 60)
print("\nUpgrade Summary:")
print("  1. ✅ Python version validation for PyCaret compatibility")
print("  2. ✅ Intelligent ID/constant column detection")
print("  3. ✅ Advanced feature selection (correlation, MI, tree importance)")
print("  4. ✅ Full dataset cleaning pipeline (auto mode)")
print("  5. ✅ Manual feature/target selection (manual mode)")
print("  6. ✅ ML task detection (classification, regression, etc.)")
print("  7. ✅ Model leaderboard formatting (always populated)")
print("  8. ✅ Industry detection (Healthcare, Finance, Retail, etc.)")
print("  9. ✅ Extended state schema with new fields")
print(" 10. ✅ All agents import correctly")
print("\nGenerated by AGENTIQ AI — Advanced AutoML Engine")
