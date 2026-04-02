# Deployment Guide — Vercel & Render

Follow these steps to deploy the AGENTIQ AI project to production.

## 1. Backend Deployment (Render)

Render will use the `render.yaml` file at the **repository root** to automatically configure your service.

> [!IMPORTANT]
> The `render.yaml` must be at the repo root — Render Blueprints do not scan subdirectories.
> The Dockerfile uses **Python 3.11** to ensure compatibility with PyCaret and scikit-learn.

1.  **Log in to [Render](https://render.com/)**.
2.  Click **New +** > **Blueprint**.
3.  Connect your GitHub repository.
4.  Render will detect the `render.yaml` at the repo root. Review the service details.
5.  **Environment Variables:** You will be prompted to provide values for the following variables:
    *   `HUGGINGFACEHUB_API_TOKEN`: Your HuggingFace API token.
    *   `SUPABASE_URL`: Your Supabase project URL.
    *   `SUPABASE_ANON_KEY`: Your Supabase anon/public key.
    *   `SUPABASE_DB_HOST`: Your Supabase database hostname.
    *   `SUPABASE_DB_PASSWORD`: Your Supabase database password.
    *   `CORS_ORIGINS`: Set this to your Vercel URL (e.g., `https://your-app.vercel.app`) or leave the default wildcard for testing.
6.  Click **Apply**. Render will build the Docker container and deploy the backend.
7.  **Note your Backend URL:** Once deployed, you'll have a URL like `https://agentiq-backend.onrender.com`.

---

## 2. Frontend Deployment (Vercel)

Vercel needs to be configured to handle the monorepo-style structure.

1.  **Log in to [Vercel](https://vercel.com/)**.
2.  Click **Add New...** > **Project**.
3.  Connect your GitHub repository.
4.  **Important: Configure Project Settings:**
    *   **Root Directory:** Set this to `frontend`.
    *   **Framework Preset:** Next.js (detected automatically).
    *   **Build Command:** `cd .. && npm run build --prefix frontend` (This allows accessing the `shared` folder during build).
    *   **Output Directory:** `.next` (default).
5.  **Environment Variables:**
    *   Add `NEXT_PUBLIC_API_URL`.
    *   **Value:** Paste your Render backend URL (e.g., `https://agentiq-backend.onrender.com`).
6.  Click **Deploy**.

---

## 3. Database Setup (Supabase)

Make sure your Supabase database is ready:

1.  Go to your Supabase project dashboard.
2.  Go to the **SQL Editor**.
3.  Copy and paste the contents of `backend/supabase_migration.sql`.
4.  Run the script to create the necessary tables and schemas.

---

## Troubleshooting

- **CORS Errors:** Ensure the `CORS_ORIGINS` on Render includes your Vercel URL.
- **Import Errors:** If the frontend fails to build because it can't find the `shared` folder, double-check that the "Root Directory" in Vercel is set to `frontend` but the build command is executed from a level that can see `shared`.

> [!TIP]
> Alternatively, you can point Vercel's "Root Directory" to the repository root and set the "Build Command" to `cd frontend && npm run build` and "Output Directory" to `frontend/.next`.
