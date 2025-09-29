# EAS Build for Android with Automatic Cleanup
# This script cleans temp files before building to avoid Windows permission issues

Write-Host "🏗️ Starting EAS Build for Android..." -ForegroundColor Cyan

# Run cleanup first
& "$PSScriptRoot\cleanup-eas-temp.ps1"

# Wait a moment for cleanup to complete
Start-Sleep -Seconds 2

# Run the EAS build
Write-Host "📱 Building Android APK..." -ForegroundColor Green
& npx eas build --platform android --profile preview --non-interactive

Write-Host "🎉 Build process completed!" -ForegroundColor Green