# ITACS Enterprise Insights Platform - Deployment Guide 🌐

This guide outlines the step-by-step instructions for deploying the **ITACS Enterprise Insights Platform** to both **Google Cloud Run** and **Railway** under the project name `itacs-ai`.

---

## ☁️ Option 1: Google Cloud Run Deployment

Our automated script [deploy-cloudrun.sh](file:///Users/nitinagga/Documents/itacs-ai/deploy-cloudrun.sh) handles the entire GCP provisioning pipeline.

### Prerequisites
1. Install the [Google Cloud SDK](https://cloud.google.com/sdk/docs/install).
2. Authenticate and set your active project:
   ```bash
   gcloud auth login
   gcloud config set project your-gcp-project-id
   ```
3. Have your `GEMINI_API_KEY` ready in your environment.

### Steps to Deploy
1. **Run the deployment script**:
   ```bash
   chmod +x deploy-cloudrun.sh
   export GEMINI_API_KEY="your_api_key_here"
   ./deploy-cloudrun.sh
   ```
2. **What the script does**:
   * Enables Cloud Run, Cloud SQL, Artifact Registry, and IAM APIs.
   * Creates a private Docker repository in Artifact Registry (`itacs-platform`).
   * Provisions a production **Cloud SQL PostgreSQL v16** instance (`itacs-postgres-db`).
   * Compiles the FastAPI backend and React/Nginx frontend images, pushing them to Google Artifact Registry.
   * Deploys the Backend to Cloud Run, establishing secure SQL proxy bindings.
   * Deploys the Frontend, injecting the Backend URL as `VITE_API_URL`.
3. **Database Initialization**:
   To load the schemas, connect to your Cloud SQL database and run the [schema.sql](file:///Users/nitinagga/Documents/itacs-ai/database/schema.sql) commands.

---

## 🛤️ Option 2: Railway Deployment (Project: `itacs-ai`)

Railway natively supports monorepos. We have pre-configured [backend/railway.json](file:///Users/nitinagga/Documents/itacs-ai/backend/railway.json) and [frontend/railway.json](file:///Users/nitinagga/Documents/itacs-ai/frontend/railway.json) to automate builds using our Dockerfiles.

### Step 1: Create the Project on Railway
1. Go to [Railway.app](https://railway.app) and log in.
2. Click **New Project** -> **Empty Project**.
3. Name your project **`itacs-ai`** in the project settings.

### Step 2: Add the PostgreSQL Database
1. In your new project, click **+ Add Service** -> **Database** -> **PostgreSQL**.
2. Railway will provision a Postgres database with `pgvector` enabled out-of-the-box.
3. Keep note of the database service name (usually `Postgres`).

### Step 3: Deploy the Backend Service
1. Click **+ Add Service** -> **GitHub Repo** (or upload via the Railway CLI).
2. Select your repository.
3. Once added, click on the service card, go to **Settings**, and configure:
   * **Service Name**: `itacs-backend`
   * **Root Directory**: `backend`
4. Go to the **Variables** tab and add:
   * `DATABASE_URL`: `${{Postgres.DATABASE_URL}}` (This binds your service directly to the provisioned database!)
   * `GEMINI_API_KEY`: `your_gemini_api_key_here`
   * `PORT`: `8000` (FastAPI target port)

### Step 4: Deploy the Frontend Service
1. Click **+ Add Service** -> **GitHub Repo** again.
2. Select the same repository.
3. In the service **Settings**, configure:
   * **Service Name**: `itacs-frontend`
   * **Root Directory**: `frontend`
4. Go to the **Variables** tab and add:
   * `VITE_API_URL`: `${{itacs-backend.RAILWAY_STATIC_URL}}` (This binds your React client to your live FastAPI backend URL!)
5. In **Settings**, click **Generate Domain** under the networking section to expose your frontend to the public internet.

---

## 🔬 Verifying Your Deployments
1. Open your public **Frontend URL** (from Cloud Run or Railway).
2. In the left panel, upload a slide or document to trigger the ingestion pipeline.
3. Review the parsed ITACS card in the **SME Workspace**, make any text adjustments, and click **Approve to Memory** to verify write access.
4. Go to the **Strategic Synthesis** tab and type a question in the chat terminal to verify that Vector RAG searches are successfully querying the PostgreSQL instance.
