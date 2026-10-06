# Operator open: ASA ChatGPT window (no monitor log).
# ASCII-only messages so Windows PowerShell 5.1 does not mis-parse UTF-8.
$ErrorActionPreference = "Stop"
$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..\..")).Path
$ExtPath = Join-Path $RepoRoot "tools\chatgpt_activity_sidecar\extension"
$EdgeExe = "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe"
$PrefsPath = Join-Path $env:LOCALAPPDATA "Microsoft\Edge\User Data\Default\Preferences"

function Get-ExtensionIdFromPrefs {
    if (-not (Test-Path $PrefsPath)) { return $null }
    $raw = Get-Content $PrefsPath -Raw
    foreach ($m in [regex]::Matches($raw, '"([a-p]{32})"\s*:\s*\{[^\}]*ASA ChatGPT Activity Sidecar')) {
        return $m.Groups[1].Value
    }
    return $null
}

if (-not (Test-Path $EdgeExe)) {
    throw "Edge not found: $EdgeExe"
}

Write-Host ""
Write-Host "Opening ASA ChatGPT."
Write-Host "Closing Edge first so the extension can load."
Write-Host ""

Get-Process msedge -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 3
if (Get-Process msedge -ErrorAction SilentlyContinue) {
    throw "Edge is still running. Close it manually and retry."
}

& (Join-Path $RepoRoot "tools\chatgpt_activity_sidecar\install\register_native_host.ps1") -Browser Edge

$launchArgs = @(
    "--load-extension=$ExtPath",
    "--profile-directory=Default",
    "https://chatgpt.com/"
)
Start-Process -FilePath $EdgeExe -ArgumentList $launchArgs | Out-Null
Start-Sleep -Seconds 8

$extId = Get-ExtensionIdFromPrefs
if ($extId) {
    & (Join-Path $RepoRoot "tools\chatgpt_activity_sidecar\install\register_native_host.ps1") -ExtensionId $extId -Browser Edge
}

Write-Host "Opened. Next steps:"
Write-Host "1. Create a New chat in the Edge window"
Write-Host "2. Paste what you want to tell ASA"
Write-Host "Do not reuse a long existing chat."
Write-Host ""
