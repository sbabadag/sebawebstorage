# Update HTML files to use optimized language system
Write-Host "Updating HTML files to use optimized language system..."

# Define paths
$rootDir = "c:\Users\noname\Documents\SEBAWEB\sebawebstorage"
Write-Host "Root directory: $rootDir"
$htmlFiles = Get-ChildItem -Path $rootDir -Filter "*.html" -Recurse
Write-Host "Found $($htmlFiles.Count) HTML files"

# Process each HTML file
foreach ($file in $htmlFiles) {
    Write-Host "Processing file: $($file.FullName)"
    
    # Read file content
    $content = Get-Content -Path $file.FullName -Raw
    
    # Determine if we need to use relative paths (for files in subdirectories)
    $scriptPath = "assets/js/"
    if ($file.FullName -like "*\blog\*") {
        $scriptPath = "../assets/js/"
    }
    
    # Pattern to find multiple script tags and test script
    $pattern = '(?s)<script\s+src=["'']' + $scriptPath.Replace('/', '\/') + 'language-system\.js["''].*?></script>.*?<script\s+src=["'']' + $scriptPath.Replace('/', '\/') + 'language-test\.js["''].*?></script>\s*<script>.*?</script>'
    
    # New script tag to use optimized version
    $replacement = '<script src="' + $scriptPath + 'language-system-optimized.js"></script>'
    
    # Try to replace the complex pattern
    $newContent = $content -replace $pattern, $replacement
    
    # If no change, try simpler replacement
    if ($newContent -eq $content) {
        # Just replace the language-system.js reference
        $simplePattern = '<script\s+src=["'']' + $scriptPath.Replace('/', '\/') + 'language-system\.js["''].*?></script>'
        $newContent = $content -replace $simplePattern, $replacement
    }
    
    # Also remove any duplicate script tags loading translations-fixed.js
    $duplicateTranslationsPattern = '(<script\s+src=["'']' + $scriptPath.Replace('/', '\/') + 'translations-fixed\.js["''].*?></script>).*?<script\s+src=["'']' + $scriptPath.Replace('/', '\/') + 'translations-fixed\.js["''].*?></script>'
    $newContent = $newContent -replace $duplicateTranslationsPattern, '$1'
    
    # Also remove any language-test.js scripts
    $testPattern = '<script\s+src=["'']' + $scriptPath.Replace('/', '\/') + 'language-test\.js["''].*?></script>'
    $newContent = $newContent -replace $testPattern, ''
    
    # Also remove any language diagnostic scripts
    $diagnosticPattern = '<script\s+src=["'']' + $scriptPath.Replace('/', '\/') + 'language-diagnostic\.js["''].*?></script>'
    $newContent = $newContent -replace $diagnosticPattern, ''
    
    # Remove any test verification scripts
    $testVerificationPattern = '(?s)<script>\s*// Add test to verify language switching is working.*?</script>'
    $newContent = $newContent -replace $testVerificationPattern, ''
    
    # Remove any fix-translations.js scripts
    $fixTranslationsPattern = '<script\s+src=["'']' + $scriptPath.Replace('/', '\/') + 'fix-translations\.js["''].*?></script>'
    $newContent = $newContent -replace $fixTranslationsPattern, ''
    
    # Write the updated content back to the file
    if ($newContent -ne $content) {
        Set-Content -Path $file.FullName -Value $newContent
        Write-Host "Updated file: $($file.Name)"
    } else {
        Write-Host "No changes needed for: $($file.Name)"
    }
}

Write-Host "All HTML files updated to use optimized language system."
