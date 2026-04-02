import pandas as pd
import os

def load_dataframe(file_path: str) -> pd.DataFrame:
    """
    Unified dataframe loader for CSV, Excel, and JSON.
    """
    ext = os.path.splitext(file_path)[1].lower()
    if ext == ".csv":
        return pd.read_csv(file_path)
    elif ext in [".xlsx", ".xls"]:
        return pd.read_excel(file_path)
    elif ext == ".json":
        return pd.read_json(file_path)
    else:
        raise ValueError(f"Unsupported file format: {ext}")
