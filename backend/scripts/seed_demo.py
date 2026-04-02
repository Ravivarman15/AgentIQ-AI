import pandas as pd
import os
from app.models.database import SessionLocal, init_db
from app.models.dataset_model import Dataset

def create_demo_datasets():
    init_db()
    db = SessionLocal()
    os.makedirs("demo_data", exist_ok=True)
    
    # 1. Healthcare
    healthcare_data = {
        "Patient_ID": range(1001, 2001),
        "Age": [25, 34, 45, 56, 67, 21, 38, 42, 55, 61] * 100,
        "BMI": [22.5, 27.1, 30.2, 24.8, 32.1, 21.0, 28.5, 29.4, 25.6, 31.0] * 100,
        "Blood_Pressure": [120, 130, 140, 115, 150, 110, 125, 135, 118, 145] * 100,
        "Cholesterol": [180, 210, 240, 190, 260, 170, 200, 220, 185, 250] * 100,
        "Outcome": ["Healthy", "Risk", "Disease", "Healthy", "Disease", "Healthy", "Risk", "Risk", "Healthy", "Disease"] * 100
    }
    pd.DataFrame(healthcare_data).to_csv("demo_data/healthcare_demo.csv", index=False)
    
    # 2. Finance
    finance_data = {
        "Transaction_ID": range(5001, 6001),
        "Amount": [10.5, 150.0, 3000.0, 50.0, 12.0, 450.0, 20.0, 15.0, 5000.0, 100.0] * 100,
        "Location": ["NYC", "London", "Online", "Paris", "NYC", "Online", "Tokyo", "NYC", "Unknown", "London"] * 100,
        "Time_of_Day": [14, 15, 3, 10, 12, 1, 9, 22, 2, 11] * 100,
        "Merchant_Category": ["Food", "Retail", "Transfer", "Food", "Transport", "Electronics", "Retail", "Food", "Transfer", "Retail"] * 100,
        "Is_Fraud": ["No", "No", "Yes", "No", "No", "Yes", "No", "No", "Yes", "No"] * 100
    }
    pd.DataFrame(finance_data).to_csv("demo_data/finance_demo.csv", index=False)
    
    # 3. Retail
    retail_data = {
        "Product_ID": range(1, 101),
        "Category": ["Clothing", "Electronics", "Home", "Toys", "Beauty"] * 20,
        "Price": [25, 150, 45, 15, 35] * 20,
        "Stock_Level": [100, 50, 75, 200, 80] * 20,
        "Weekly_Sales": [12, 8, 15, 25, 10] * 20,
        "Sentiment": ["Positive", "Neutral", "Positive", "Positive", "Negative"] * 20
    }
    pd.DataFrame(retail_data).to_csv("demo_data/retail_demo.csv", index=False)

    # 4. Populate Database
    demo_files = [
        ("Healthcare Insights (CSV)", "demo_data/healthcare_demo.csv", "Healthcare"),
        ("Finance Audit (CSV)", "demo_data/finance_demo.csv", "Finance"),
        ("Retail Analysis (CSV)", "demo_data/retail_demo.csv", "Retail")
    ]
    
    for name, path, industry in demo_files:
        existing = db.query(Dataset).filter(Dataset.name == name).first()
        if not existing:
            dataset = Dataset(
                name=name,
                file_path=path,
                sample_path=path, # No sampling for demo
                industry=industry,
                is_demo=True
            )
            db.add(dataset)
    
    db.commit()
    db.close()
    print("Demo datasets seeded successfully!")

if __name__ == "__main__":
    create_demo_datasets()
