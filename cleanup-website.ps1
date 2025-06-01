# PowerShell script to organize and clean up the website files
# This script moves unnecessary files to a backup folder instead of deleting them

# Create a backup directory if it doesn't exist
$backupDir = "C:\Users\noname\Documents\SEBAWEB\sebawebstorage-backup"
if (-not (Test-Path $backupDir)) {
    New-Item -Path $backupDir -ItemType Directory
    New-Item -Path "$backupDir\assets" -ItemType Directory
    New-Item -Path "$backupDir\assets\js" -ItemType Directory
}

# JS files to move (development/duplicate files)
$jsFilesToMove = @(
    "debug-performance.js",
    "high-performance-language.js",
    "fix-translations.js",
    "force-language-update.js",
    "language-diagnostic.js",
    "language-enhancer.js",
    "language-init.js",
    "language-system-optimized.js",
    "language-test.js",
    "translations.js",
    "translations.js.bak"
)

# HTML test files to move
$htmlFilesToMove = @(
    "language-test-page.html",
    "performance-test.html",
    "translation-test.html",
    "translations-validator.html"
)

# PowerShell scripts to move
$psScriptsToMove = @(
    "fix-fontawesome.ps1",
    "fix-specific-pages.ps1",
    "optimize-language-system.ps1",
    "update-high-performance.ps1",
    "update-language-script.ps1",
    "update-language-scripts.ps1",
    "update-language-system.ps1",
    "update-translations.ps1",
    "validate-translations.ps1"
)

# Documentation files to move
$docsToMove = @(
    "language-system-conclusion.md",
    "language-system-updates.md"
)

# Move JS files
foreach ($file in $jsFilesToMove) {
    $sourcePath = "C:\Users\noname\Documents\SEBAWEB\sebawebstorage\assets\js\$file"
    if (Test-Path $sourcePath) {
        Write-Host "Moving $file to backup..."
        Move-Item -Path $sourcePath -Destination "$backupDir\assets\js\$file" -Force
    } else {
        Write-Host "$file not found, skipping..."
    }
}

# Move HTML test files
foreach ($file in $htmlFilesToMove) {
    $sourcePath = "C:\Users\noname\Documents\SEBAWEB\sebawebstorage\$file"
    if (Test-Path $sourcePath) {
        Write-Host "Moving $file to backup..."
        Move-Item -Path $sourcePath -Destination "$backupDir\$file" -Force
    } else {
        Write-Host "$file not found, skipping..."
    }
}

# Move PowerShell scripts
foreach ($file in $psScriptsToMove) {
    $sourcePath = "C:\Users\noname\Documents\SEBAWEB\sebawebstorage\$file"
    if (Test-Path $sourcePath) {
        Write-Host "Moving $file to backup..."
        Move-Item -Path $sourcePath -Destination "$backupDir\$file" -Force
    } else {
        Write-Host "$file not found, skipping..."
    }
}

# Move documentation files
foreach ($file in $docsToMove) {
    $sourcePath = "C:\Users\noname\Documents\SEBAWEB\sebawebstorage\$file"
    if (Test-Path $sourcePath) {
        Write-Host "Moving $file to backup..."
        Move-Item -Path $sourcePath -Destination "$backupDir\$file" -Force
    } else {
        Write-Host "$file not found, skipping..."
    }
}

Write-Host "`nCleanup completed! All unnecessary files have been moved to $backupDir"
Write-Host "Your website should now run more smoothly with only essential files."
