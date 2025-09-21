# Quick deployment script for frontend
# Run this from the frontend directory

Write-Host "Starting frontend deployment..." -ForegroundColor Cyan

# Check if .env.production exists
if (-not (Test-Path ".env.production")) {
    Write-Host "Error: .env.production file not found!" -ForegroundColor Red
    Write-Host "Please create .env.production with your production environment variables." -ForegroundColor Yellow
    Write-Host "See DEPLOYMENT.md for details." -ForegroundColor Yellow
    exit 1
}

# Check environment variables
if (-not $env:FRONTEND_IMAGE_URI) {
    Write-Host "Error: FRONTEND_IMAGE_URI environment variable not set!" -ForegroundColor Red
    Write-Host "Please set: `$env:FRONTEND_IMAGE_URI = 'your-image-uri'" -ForegroundColor Yellow
    exit 1
}

if (-not $env:REGION) {
    Write-Host "Error: REGION environment variable not set!" -ForegroundColor Red
    Write-Host "Please set: `$env:REGION = 'your-region'" -ForegroundColor Yellow
    exit 1
}

Write-Host "Environment variables configured" -ForegroundColor Green

# Build Docker image
Write-Host "Building Docker image..." -ForegroundColor Blue
docker build --no-cache -t $env:FRONTEND_IMAGE_URI -f Dockerfile.frontend .

if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Docker build successful!" -ForegroundColor Green

# Push to registry
Write-Host "Pushing to registry..." -ForegroundColor Blue
docker push $env:FRONTEND_IMAGE_URI

if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker push failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Docker push successful!" -ForegroundColor Green

# Deploy to Cloud Run
Write-Host "Deploying to Cloud Run..." -ForegroundColor Blue
gcloud run deploy career-planner-frontend `
  --image=$env:FRONTEND_IMAGE_URI `
  --platform=managed `
  --region=$env:REGION `
  --allow-unauthenticated `
  --port=80 `
  --memory=512Mi `
  --cpu=1 `
  --max-instances=10

if ($LASTEXITCODE -eq 0) {
    Write-Host "Frontend deployment successful!" -ForegroundColor Green
    Write-Host "Don't forget to update your backend CORS settings!" -ForegroundColor Yellow
} else {
    Write-Host "Deployment failed!" -ForegroundColor Red
    exit 1
}