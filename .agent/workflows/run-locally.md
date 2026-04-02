---
description: how to run the Antigravity ML platform locally
---

### 1. Backend Setup
1. Open a terminal in the `backend` directory:
   ```powershell
   cd backend
   ```
2. Create and configure your `.env` file (ensure `HUGGINGFACEHUB_API_TOKEN` is set).

3. Install dependencies:
   ```powershell
   pip install -r requirements.txt
   ```

4. Seed the demo database (Important for first run):
   ```powershell
   $env:PYTHONPATH="."; python scripts/seed_demo.py
   ```

5. Start the FastAPI server (using proper PYTHONPATH):
   // turbo
   ```powershell
   $env:PYTHONPATH="."; python app/main.py
   ```
   *(Note: The server runs on http://127.0.0.1:8000)*

### 2. Frontend Setup
1. Open a **NEW** terminal in the `frontend` directory:
   ```powershell
   cd frontend
   ```
2. Install dependencies:
   ```powershell
   npm install
   ```
3. Start the Next.js development server:
   // turbo
   ```powershell
   npm run dev
   ```
   *(Note: The frontend runs on http://localhost:3000)*

### 3. Usage Guide
1. **Open Browser:** Navigate to [http://localhost:3000](http://localhost:3000).
2. **Login:** Use any email/password (or click Register).
3. **Select Dataset:** Choose a "Demo Dataset" (e.g., Healthcare) or upload your own CSV.
4. **Activate Swarm:** Click "Activate Swarm" to see the agents in action.
5. **Explore Features:**
   - **Data Profiling:** View interactive charts.
   - **ML Predictor:** Go to the tab, enter values, and click "Generate Prediction".
   - **AI Explorer:** Ask questions about your data.

### 4. Troubleshooting
- If the backend fails to start with "Address already in use", run this command to kill the process on port 8000:
  ```powershell
  Get-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess | Stop-Process -Force
  ```
