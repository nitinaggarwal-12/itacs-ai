#!/usr/bin/env bash

# ITACS Enterprise Insights Platform - Google Cloud Run Deployment Pipeline
# This script automates the provisioning of Cloud SQL (PostgreSQL), building Docker images,
# pushing to Artifact Registry, and deploying separate backend/frontend Cloud Run services.

set -eo pipefail

# =====================================================================
# CONFIGURATION - ADJUST AS REQUIRED
# =====================================================================
PROJECT_ID=$(gcloud config get-value project 2>/dev/null || echo "itacs-enterprise-insights")
REGION="us-central1"
AR_REPO="itacs-platform"
DB_INSTANCE_NAME="itacs-postgres-db"
DB_NAME="itacs_enterprise"
DB_USER="itacs_admin"
DB_PASSWORD="itacs_secure_pass_2026" # In production, use Secret Manager!

BACKEND_SERVICE="itacs-backend"
FRONTEND_SERVICE="itacs-frontend"

echo "===================================================================="
echo "🧬 Starting ITACS Platform Cloud Run Deployment Pipeline"
echo "Project ID : $PROJECT_ID"
echo "Region     : $REGION"
echo "===================================================================="

# 1. Enable GCP API Services
echo "Step 1: Enabling required GCP APIs..."
gcloud services enable \
    run.googleapis.com \
    sqladmin.googleapis.com \
    artifactregistry.googleapis.com \
    secretmanager.googleapis.com \
    iam.googleapis.com \
    cloudbuild.googleapis.com \
    --project="$PROJECT_ID"

# 2. Create Artifact Registry Repository
echo "Step 2: Checking/Creating Artifact Registry Repository..."
if ! gcloud artifacts repositories describe "$AR_REPO" --location="$REGION" --project="$PROJECT_ID" &>/dev/null; then
    gcloud artifacts repositories create "$AR_REPO" \
        --repository-format=docker \
        --location="$REGION" \
        --description="Docker repository for ITACS Platform" \
        --project="$PROJECT_ID"
else
    echo "Repository $AR_REPO already exists."
fi

# Authenticate Docker to Artifact Registry (Optional - bypassed since local Docker is not installed)
gcloud auth configure-docker "$REGION-docker.pkg.dev" --quiet || true

# 3. Provision Cloud SQL PostgreSQL Database
echo "Step 3: Checking/Creating Cloud SQL Database Instance..."
if ! gcloud sql instances describe "$DB_INSTANCE_NAME" --project="$PROJECT_ID" &>/dev/null; then
    echo "Creating Cloud SQL Instance (PostgreSQL 16) - this may take several minutes..."
    gcloud sql instances create "$DB_INSTANCE_NAME" \
        --database-version=POSTGRES_16 \
        --tier=db-f1-micro \
        --edition=ENTERPRISE \
        --region="$REGION" \
        --root-password="$DB_PASSWORD" \
        --project="$PROJECT_ID"
else
    echo "Cloud SQL Instance $DB_INSTANCE_NAME already exists."
fi

# Create database and user
echo "Setting up database and database user..."
gcloud sql databases create "$DB_NAME" --instance="$DB_INSTANCE_NAME" --project="$PROJECT_ID" || true
gcloud sql users create "$DB_USER" --instance="$DB_INSTANCE_NAME" --password="$DB_PASSWORD" --project="$PROJECT_ID" || true

# Get Database Connection Name
DB_CONNECTION_NAME=$(gcloud sql instances describe "$DB_INSTANCE_NAME" --format="value(connectionName)" --project="$PROJECT_ID")
echo "Cloud SQL Connection String: $DB_CONNECTION_NAME"

# 4. Build and Push Backend Image via Cloud Build
echo "Step 4: Building Backend Docker Image in the cloud (via Google Cloud Build)..."
BACKEND_IMAGE="$REGION-docker.pkg.dev/$PROJECT_ID/$AR_REPO/$BACKEND_SERVICE:latest"
gcloud builds submit ./backend \
    --tag "$BACKEND_IMAGE" \
    --project="$PROJECT_ID"

# 5. Build and Push Frontend Image via Cloud Build
echo "Step 5: Building Frontend Docker Image in the cloud (via Google Cloud Build)..."
FRONTEND_IMAGE="$REGION-docker.pkg.dev/$PROJECT_ID/$AR_REPO/$FRONTEND_SERVICE:latest"
gcloud builds submit ./frontend \
    --tag "$FRONTEND_IMAGE" \
    --project="$PROJECT_ID"

# 6. Deploy Backend Service to Cloud Run
echo "Step 6: Deploying FastAPI Backend to Cloud Run..."
# We pass connection via Unix socket path: /cloudsql/CONNECTION_NAME
DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@/localhost/$DB_NAME?host=/cloudsql/$DB_CONNECTION_NAME"

# Deploy service
gcloud run deploy "$BACKEND_SERVICE" \
    --image="$BACKEND_IMAGE" \
    --region="$REGION" \
    --platform=managed \
    --add-cloudsql-instances="$DB_CONNECTION_NAME" \
    --set-env-vars="DATABASE_URL=$DATABASE_URL,GEMINI_API_KEY=$GEMINI_API_KEY" \
    --allow-unauthenticated \
    --project="$PROJECT_ID"

# Get backend service URL
BACKEND_URL=$(gcloud run services describe "$BACKEND_SERVICE" --region="$REGION" --format="value(status.url)" --project="$PROJECT_ID")
echo "Backend URL: $BACKEND_URL"

# 7. Deploy Frontend Service to Cloud Run
echo "Step 7: Deploying React Frontend to Cloud Run..."
gcloud run deploy "$FRONTEND_SERVICE" \
    --image="$FRONTEND_IMAGE" \
    --region="$REGION" \
    --platform=managed \
    --set-env-vars="VITE_API_URL=$BACKEND_URL" \
    --allow-unauthenticated \
    --project="$PROJECT_ID"

# Get frontend service URL
FRONTEND_URL=$(gcloud run services describe "$FRONTEND_SERVICE" --region="$REGION" --format="value(status.url)" --project="$PROJECT_ID")

echo "===================================================================="
echo "🎉 DEPLOYMENT COMPLETE"
echo "===================================================================="
echo "FastAPI Backend URL : $BACKEND_URL"
echo "React Frontend URL  : $FRONTEND_URL"
echo "===================================================================="
echo "Note: To initialize the database schemas, run the schema.sql script"
echo "against the Cloud SQL instance or let the backend auto-create it on boot."
