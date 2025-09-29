# EAS Build with Real-Time Temp Directory Monitoring
# This script monitors and cleans EAS temp files in real-time during the build

Write-Host "🚀 Starting EAS Build with Real-Time Monitoring..." -ForegroundColor Cyan

# Initial cleanup
& "$PSScriptRoot\cleanup-eas-temp.ps1"

# Function to monitor and clean temp directories
function Start-TempMonitor {
    Write-Host "🔍 Starting temp directory monitor..." -ForegroundColor Yellow

    $job = Start-Job -ScriptBlock {
        $tempPath = "$env:LOCALAPPDATA\Temp\eas-cli-nodejs"

        while ($true) {
            if (Test-Path $tempPath) {
                Get-ChildItem -Path $tempPath -Directory | ForEach-Object {
                    $dirPath = $_.FullName
                    $expoPath = Join-Path $dirPath ".expo"

                    if (Test-Path $expoPath) {
                        Write-Host "🧹 Found .expo directory, cleaning: $expoPath" -ForegroundColor Red

                        # Take ownership and remove
                        & takeown /f "$expoPath" /r /d y 2>$null
                        & icacls "$expoPath" /grant "${env:USERNAME}:F" /t 2>$null
                        Remove-Item -Path "$expoPath" -Recurse -Force -ErrorAction SilentlyContinue

                        # Also try to remove the parent directory
                        & takeown /f "$dirPath" /r /d y 2>$null
                        & icacls "$dirPath" /grant "${env:USERNAME}:F" /t 2>$null
                        Remove-Item -Path "$dirPath" -Recurse -Force -ErrorAction SilentlyContinue
                    }
                }
            }

            Start-Sleep -Milliseconds 500  # Check every 500ms
        }
    }

    return $job
}

# Start the monitoring job
$monitorJob = Start-TempMonitor

try {
    # Give monitor a moment to start
    Start-Sleep -Seconds 1

    Write-Host "📱 Starting EAS Build..." -ForegroundColor Green

    # Run EAS build in the background so we can monitor it
    $buildJob = Start-Job -ScriptBlock {
        Set-Location "C:\Users\vsbha\OneDrive\Desktop\lovelock"
        & npx eas build --platform android --profile preview --non-interactive
    }

    # Wait for build to complete while monitoring
    Write-Host "⏳ Build running... Monitor active..." -ForegroundColor Cyan

    do {
        Start-Sleep -Seconds 2
        $buildStatus = $buildJob.State
        Write-Host "📊 Build Status: $buildStatus" -ForegroundColor Blue
    } while ($buildStatus -eq "Running")

    # Get build results
    $buildResult = Receive-Job -Job $buildJob
    Write-Host $buildResult

    if ($buildJob.State -eq "Completed") {
        Write-Host "✅ Build completed successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Build failed or was interrupted" -ForegroundColor Red
    }

} finally {
    # Clean up jobs
    Write-Host "🛑 Stopping monitor..." -ForegroundColor Yellow
    Stop-Job -Job $monitorJob -ErrorAction SilentlyContinue
    Remove-Job -Job $monitorJob -ErrorAction SilentlyContinue

    if ($buildJob) {
        Remove-Job -Job $buildJob -ErrorAction SilentlyContinue
    }

    # Final cleanup
    & "$PSScriptRoot\cleanup-eas-temp.ps1"
}

Write-Host "🎉 Process completed!" -ForegroundColor Green