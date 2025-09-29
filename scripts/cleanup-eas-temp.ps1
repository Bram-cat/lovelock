# EAS CLI Temp Directory Cleanup Script for Windows
# This script forcefully removes EAS CLI temp files that cause EPERM errors

Write-Host "🧹 Cleaning EAS CLI temp directories..." -ForegroundColor Yellow

$tempPath = "$env:LOCALAPPDATA\Temp\eas-cli-nodejs"

if (Test-Path $tempPath) {
    Write-Host "📁 Found EAS CLI temp directory: $tempPath" -ForegroundColor Cyan

    # Stop any processes that might be locking files
    Get-Process | Where-Object {$_.ProcessName -like "*expo*" -or $_.ProcessName -like "*eas*"} | Stop-Process -Force -ErrorAction SilentlyContinue

    # Take ownership of all files recursively
    Write-Host "🔐 Taking ownership of temp files..." -ForegroundColor Yellow
    & takeown /f "$tempPath" /r /d y 2>$null

    # Grant full permissions
    Write-Host "✅ Granting full permissions..." -ForegroundColor Yellow
    & icacls "$tempPath" /grant "${env:USERNAME}:F" /t 2>$null

    # Force remove the entire directory
    Write-Host "🗑️ Removing temp directory..." -ForegroundColor Red
    Remove-Item -Path "$tempPath" -Recurse -Force -ErrorAction SilentlyContinue

    # Verify removal
    if (Test-Path $tempPath) {
        Write-Host "⚠️ Some files may still be locked. Manual cleanup required." -ForegroundColor Red
    } else {
        Write-Host "✅ EAS CLI temp directory cleaned successfully!" -ForegroundColor Green
    }
} else {
    Write-Host "✅ No EAS CLI temp directory found - already clean!" -ForegroundColor Green
}

Write-Host "🚀 Ready for EAS build!" -ForegroundColor Green