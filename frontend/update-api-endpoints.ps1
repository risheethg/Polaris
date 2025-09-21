# Script to update all API endpoints in frontend files
# Run this from the frontend directory

$files = @(
    "src/pages/Dashboard.tsx",
    "src/pages/Landing.tsx", 
    "src/pages/PersonalDetailsForm.tsx",
    "src/pages/Profile.tsx",
    "src/pages/Results.tsx"
)

$replacements = @{
    "http://127.0.0.1:8000/api/v1/users/me" = "apiConfig.endpoints.users.me"
    "http://127.0.0.1:8000/api/v1/users/register" = "apiConfig.endpoints.users.register"
    "http://127.0.0.1:8000/api/v1/users/token" = "apiConfig.endpoints.users.token"
    "http://127.0.0.1:8000/api/v1/ml/jobs/recommend" = "apiConfig.endpoints.ml.recommend"
    "http://127.0.0.1:8000/api/v1/ml/jobs/cluster-profiles" = "apiConfig.endpoints.ml.clusterProfiles"
    "http://127.0.0.1:8000/api/v1/ml/jobs/all" = "apiConfig.endpoints.ml.allJobs"
}

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Updating $file..." -ForegroundColor Green
        
        # Add import at the top if not already present
        $content = Get-Content $file -Raw
        if ($content -notmatch "import.*apiConfig.*from.*@/lib/api-config") {
            $content = $content -replace "(import.*from.*;)", "`$1`nimport { apiConfig } from '@/lib/api-config';"
        }
        
        # Replace URLs
        foreach ($old in $replacements.Keys) {
            $new = $replacements[$old]
            $content = $content -replace [regex]::Escape("'$old'"), $new
            $content = $content -replace [regex]::Escape("`"$old`""), $new
        }
        
        Set-Content -Path $file -Value $content
        Write-Host "✅ Updated $file" -ForegroundColor Green
    }
    else {
        Write-Host "❌ File not found: $file" -ForegroundColor Red
    }
}

Write-Host "🎉 All files updated!" -ForegroundColor Cyan