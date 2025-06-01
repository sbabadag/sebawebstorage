# Update all HTML files to use the high-performance language system
Write-Host "Updating HTML files to use high-performance language system..."

# Define paths
$rootDir = "c:\Users\noname\Documents\SEBAWEB\sebawebstorage"
$htmlFiles = Get-ChildItem -Path $rootDir -Filter "*.html" -Recurse

# Process each HTML file
foreach ($file in $htmlFiles) {
    Write-Host "Processing file: $($file.FullName)"
    
    # Skip our test files
    if ($file.Name -eq "performance-test.html") {
        Write-Host "Skipping test file: $($file.Name)"
        continue
    }
    
    # Read file content
    $content = Get-Content -Path $file.FullName -Raw
    
    # Determine if we need to use relative paths (for files in subdirectories)
    $scriptPath = "assets/js/"
    if ($file.FullName -like "*\blog\*") {
        $scriptPath = "../assets/js/"
    }
    
    # Replace any existing language system scripts with our high-performance version
    $patterns = @(
        '<script src="' + $scriptPath + 'language-system-optimized.js"></script>',
        '<script src="' + $scriptPath + 'language-system.js"></script>',
        '<script src="' + $scriptPath + 'language-enhancer.js"[^>]*></script>',
        '<script src="' + $scriptPath + 'language-diagnostic.js"[^>]*></script>',
        '<script src="' + $scriptPath + 'language-test.js"[^>]*></script>'
    )
    
    # New script tag to use high-performance version
    $replacement = '<script src="' + $scriptPath + 'high-performance-language.js"></script>'
    
    # Make replacements
    foreach ($pattern in $patterns) {
        $content = $content -replace $pattern, $replacement
    }
    
    # Remove any duplicate translations-fixed.js
    $translationsPattern = '(<script src="' + $scriptPath + 'translations-fixed.js"></script>).*?<script src="' + $scriptPath + 'translations-fixed.js"></script>'
    $content = $content -replace $translationsPattern, '$1'
    
    # Remove any problematic test/diagnostic scripts
    $content = $content -replace '<script src="' + $scriptPath + 'fix-translations.js"[^>]*></script>', ''
    
    # Remove test scripts that verify language switching
    $testScriptPattern = '(?s)<script>\s*// Add test to verify language switching is working.*?</script>'
    $content = $content -replace $testScriptPattern, ''
    
    # Make sure translations are loaded before language system
    $translationsScript = '<script src="' + $scriptPath + 'translations-fixed.js"></script>'
    $languageSystemScript = '<script src="' + $scriptPath + 'high-performance-language.js"></script>'
    
    # If we have the language system but not translations, add translations
    if ($content -match $languageSystemScript -and $content -notmatch $translationsScript) {
        $content = $content -replace $languageSystemScript, $translationsScript + "`n  " + $languageSystemScript
    }
    
    # Fix Font Awesome if needed
    $oldFontAwesome = '<script src="https://kit.fontawesome.com/a076d05399.js" crossorigin="anonymous"></script>'
    $newFontAwesome = '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" integrity="sha512-1ycn6IcaQQ40/MKBW2W4Rhis/DbILU74C1vSrLJxCq57o941Ym01SwNsOMqvEBFlcgUa6xLiPY/NS5R+E6ztJQ==" crossorigin="anonymous" referrerpolicy="no-referrer" />'
    
    $content = $content -replace [regex]::Escape($oldFontAwesome), $newFontAwesome
    
    # Write the updated content back to the file
    $modified = $content -ne (Get-Content -Path $file.FullName -Raw)
    if ($modified) {
        Set-Content -Path $file.FullName -Value $content
        Write-Host "Updated file: $($file.Name)"
    } else {
        Write-Host "No changes needed for: $($file.Name)"
    }
}

Write-Host "All HTML files updated to use high-performance language system."
