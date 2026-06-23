#!/usr/bin/env bash

# ITACS Enterprise Insights Platform - Railway Automated Monorepo Deployment
# Run this script directly on your CLOUDTOP to deploy the backend and frontend.

set -eo pipefail

PROJECT_NAME="itacs-ai"
BACKEND_DIR="backend"
FRONTEND_DIR="frontend"

echo "===================================================================="
echo "🛤️ Starting ITACS Platform Railway Deployment on Cloudtop"
echo "Project Name: $PROJECT_NAME"
echo "===================================================================="

# 1. Verify Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Error: Railway CLI is not installed on your Cloudtop."
    echo "Please install it using: npm install -g @railway/cli"
    exit 1
fi

# 2. Authenticate
echo "Step 1: Checking Railway authentication..."
if ! railway whoami &> /dev/null; then
    echo "Please log in to your Railway account:"
    railway login
else
    echo "✓ Authenticated as: $(railway whoami)"
fi

# 3. Create or Link Project
echo "Step 2: Linking to Railway project '$PROJECT_NAME'..."
# Create project if it doesn't exist, or link to it
if ! railway list | grep -q "$PROJECT_NAME"; then
    echo "Project '$PROJECT_NAME' not found. Creating a new one..."
    railway init --name "$PROJECT_NAME"
else
    echo "Project '$PROJECT_NAME' found. Linking..."
    railway link "$PROJECT_NAME"
fi

# 4. Deploy Backend Service
echo "Step 3: Deploying backend service..."
if [ -d "$BACKEND_DIR" ]; then
    echo "Uploading backend source to Railway..."
    # Navigate to backend directory and trigger build/deploy
    cd "$BACKEND_DIR"
    railway up --service itacs-backend --detach
    cd ..
else
    echo "❌ Error: Backend directory '$BACKEND_DIR' not found."
    exit 1
fi

# 5. Deploy Frontend Service
echo "Step 4: Deploying frontend service..."
if [ -d "$FRONTEND_DIR" ]; then
    echo "Uploading frontend source to Railway..."
    # Navigate to frontend directory and trigger build/deploy
    cd "$FRONTEND_DIR"
    railway up --service itacs-frontend --detach
    cd ..
else
    echo "❌ Error: Frontend directory '$FRONTEND_DIR' not found."
    exit 1
fi

echo "===================================================================="
echo "🎉 DEPLOYMENT COMMANDS SENT"
echo "===================================================================="
echo "Your services are now compiling and building on Railway!"
echo "Run 'railway status' or visit https://railway.app to track progress."
echo "===================================================================="
