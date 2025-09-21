# Frontend Deployment Instructions

## Prerequisites
1. Make sure you have your backend deployed and the URL ready
2. Set up your environment variables
3. Ensure Docker and gcloud CLI are installed

## Step 1: Create Production Environment File
Create `.env.production` file in the frontend directory:

```bash
# Replace these with your actual values
VITE_API_BASE_URL=https://your-backend-url.run.app
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

## Step 2: Set Environment Variables (PowerShell)
```powershell
# Set your image URI (replace with your actual values)
$env:FRONTEND_IMAGE_URI = "us-central1-docker.pkg.dev/just-inverter-472415-r6/job-rec-repo/career-planner-frontend"
$env:REGION = "us-central1"
```

## Step 3: Build and Deploy Commands

### Build Docker Image:
```powershell
docker build --no-cache -t $env:FRONTEND_IMAGE_URI -f Dockerfile.frontend .
```

### Push to Registry:
```powershell
docker push $env:FRONTEND_IMAGE_URI
```

### Deploy to Cloud Run:
```powershell
gcloud run deploy career-planner-frontend `
  --image=$env:FRONTEND_IMAGE_URI `
  --platform=managed `
  --region=$env:REGION `
  --allow-unauthenticated `
  --port=80 `
  --memory=512Mi `
  --cpu=1 `
  --max-instances=10
```

## Step 4: Update CORS in Backend
After frontend is deployed, update your backend's CORS settings to include your frontend URL.

## Complete Deployment Script (run from frontend directory):
```powershell
# Create .env.production file first!
docker build --no-cache -t $env:FRONTEND_IMAGE_URI -f Dockerfile.frontend .
docker push $env:FRONTEND_IMAGE_URI
gcloud run deploy career-planner-frontend `
  --image=$env:FRONTEND_IMAGE_URI `
  --platform=managed `
  --region=$env:REGION `
  --allow-unauthenticated `
  --port=80 `
  --memory=512Mi `
  --cpu=1 `
  --max-instances=10
```