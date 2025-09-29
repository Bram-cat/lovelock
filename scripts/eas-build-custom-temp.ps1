# EAS Build with Custom Temp Directory (Workaround for Windows EPERM)
# This script uses a custom temp directory to avoid Windows permission issues

Write-Host "🚀 Starting EAS Build with Custom Temp Directory..." -ForegroundColor Cyan

# Create a custom temp directory in the project
$customTemp = "C:\Users\vsbha\OneDrive\Desktop\lovelock\temp"

if (Test-Path $customTemp) {
    Write-Host "🧹 Cleaning existing temp directory..." -ForegroundColor Yellow
    Remove-Item -Path $customTemp -Recurse -Force -ErrorAction SilentlyContinue
}

New-Item -ItemType Directory -Path $customTemp -Force | Out-Null
Write-Host "📁 Created custom temp directory: $customTemp" -ForegroundColor Green

# Set environment variables to use custom temp
$env:TMPDIR = $customTemp
$env:TMP = $customTemp
$env:TEMP = $customTemp

Write-Host "🔧 Environment variables set:" -ForegroundColor Cyan
Write-Host "   TMPDIR = $env:TMPDIR" -ForegroundColor Gray
Write-Host "   TMP = $env:TMP" -ForegroundColor Gray
Write-Host "   TEMP = $env:TEMP" -ForegroundColor Gray

# Run initial cleanup of system temp
& "$PSScriptRoot\cleanup-eas-temp.ps1"

Write-Host "📱 Starting EAS Build with custom temp location..." -ForegroundColor Green

try {
    # Run EAS build with custom temp directory
    & npx eas build --platform android --profile preview --non-interactive

    Write-Host "✅ Build process completed!" -ForegroundColor Green

} catch {
    Write-Host "❌ Build failed: $($_.Exception.Message)" -ForegroundColor Red
} finally {
    # Cleanup custom temp directory
    Write-Host "🧹 Cleaning up custom temp directory..." -ForegroundColor Yellow
    Remove-Item -Path $customTemp -Recurse -Force -ErrorAction SilentlyContinue

    Write-Host "🎉 Cleanup completed!" -ForegroundColor Green
}