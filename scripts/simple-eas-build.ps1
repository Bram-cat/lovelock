# Simple EAS Build Script with Direct Commands
# Simplified approach to avoid PowerShell syntax issues

Write-Host "Starting EAS Build..." -ForegroundColor Green

# Clear any existing EAS temp files first
$easTemp = "$env:LOCALAPPDATA\Temp\eas-cli-nodejs"
if (Test-Path $easTemp) {
    Write-Host "Removing EAS temp files..." -ForegroundColor Yellow
    takeown /f "$easTemp" /r /d y
    icacls "$easTemp" /grant "Everyone:F" /t
    Remove-Item -Path $easTemp -Recurse -Force -ErrorAction SilentlyContinue
}

# Create project temp directory
$projectTemp = ".\temp"
if (Test-Path $projectTemp) {
    Remove-Item -Path $projectTemp -Recurse -Force -ErrorAction SilentlyContinue
}
New-Item -ItemType Directory -Path $projectTemp -Force

# Set temp environment variables
$env:TMPDIR = $projectTemp
$env:TMP = $projectTemp
$env:TEMP = $projectTemp

Write-Host "Running EAS build..." -ForegroundColor Cyan

# Run the EAS build
npx eas build --platform android --profile preview --non-interactive

Write-Host "Build completed!" -ForegroundColor Green

# Cleanup
Remove-Item -Path $projectTemp -Recurse -Force -ErrorAction SilentlyContinue