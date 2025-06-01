# Fix specific pages to use high-performance language system
Write-Host "Fixing specific pages to use high-performance language system..."

# Define file paths to fix
$filesToFix = @(
    "c:\Users\noname\Documents\SEBAWEB\sebawebstorage\index.html",
    "c:\Users\noname\Documents\SEBAWEB\sebawebstorage\faq.html",
    "c:\Users\noname\Documents\SEBAWEB\sebawebstorage\blog\international-standards.html",
    "c:\Users\noname\Documents\SEBAWEB\sebawebstorage\about.html",
    "c:\Users\noname\Documents\SEBAWEB\sebawebstorage\services.html",
    "c:\Users\noname\Documents\SEBAWEB\sebawebstorage\projects.html",
    "c:\Users\noname\Documents\SEBAWEB\sebawebstorage\blog.html",
    "c:\Users\noname\Documents\SEBAWEB\sebawebstorage\contact.html"
)

foreach ($filePath in $filesToFix) {
    Write-Host "Processing file: $filePath"
    $fileName = Split-Path -Leaf $filePath
    
    # Skip files that don't exist
    if (-not (Test-Path $filePath)) {
        Write-Host "File not found: $fileName"
        continue
    }
    
    $content = Get-Content -Path $filePath -Raw
    $isModified = $false
    
    # Determine script path based on location
    $scriptPath = "assets/js/"
    if ($filePath -like "*\blog\*") {
        $scriptPath = "../assets/js/"
    }
    
    # Replace language-system.js or language-system-optimized.js with high-performance-language.js
    $systemPattern = '<script src="' + $scriptPath + 'language-system[^"]*\.js"></script>'
    if ($content -match $systemPattern) {
        $content = $content -replace $systemPattern, '<script src="' + $scriptPath + 'high-performance-language.js"></script>'
        $isModified = $true
    }
    
    # Replace language-enhancer.js if present
    $enhancerPattern = '<script src="' + $scriptPath + 'language-enhancer\.js"[^>]*></script>'
    if ($content -match $enhancerPattern) {
        $content = $content -replace $enhancerPattern, ''
        $isModified = $true
    }
    
    # Remove diagnostic or test scripts
    $diagnosticPattern = '<script src="' + $scriptPath + 'language-diagnostic\.js"[^>]*></script>'
    if ($content -match $diagnosticPattern) {
        $content = $content -replace $diagnosticPattern, ''
        $isModified = $true
    }
    
    $testPattern = '<script src="' + $scriptPath + 'language-test\.js"[^>]*></script>'
    if ($content -match $testPattern) {
        $content = $content -replace $testPattern, ''
        $isModified = $true
    }
    
    $fixPattern = '<script src="' + $scriptPath + 'fix-translations\.js"[^>]*></script>'
    if ($content -match $fixPattern) {
        $content = $content -replace $fixPattern, ''
        $isModified = $true
    }
    
    # Fix Font Awesome if needed
    $oldFontAwesome = '<script src="https://kit.fontawesome.com/a076d05399.js" crossorigin="anonymous"></script>'
    $newFontAwesome = '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" integrity="sha512-1ycn6IcaQQ40/MKBW2W4Rhis/DbILU74C1vSrLJxCq57o941Ym01SwNsOMqvEBFlcgUa6xLiPY/NS5R+E6ztJQ==" crossorigin="anonymous" referrerpolicy="no-referrer" />'
    
    if ($content -match [regex]::Escape($oldFontAwesome)) {
        $content = $content -replace [regex]::Escape($oldFontAwesome), $newFontAwesome
        $isModified = $true
    }
    
    # Update the file if modified
    if ($isModified) {
        Set-Content -Path $filePath -Value $content
        Write-Host "Updated file: $fileName"
    } else {
        Write-Host "No changes needed for: $fileName"
    }
}

Write-Host "Fix complete."
