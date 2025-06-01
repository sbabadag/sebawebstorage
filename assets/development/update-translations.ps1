# Update all HTML files to use the fixed translations file
$htmlFiles = Get-ChildItem -Path "." -Filter "*.html" -Recurse

foreach ($file in $htmlFiles) {
    $content = Get-Content -Path $file.FullName -Raw
    
    # Skip Google verification file
    if ($file.Name -eq "google7c9e77390335bf0c.html" -or $file.Name -eq "translations-validator.html") {
        Write-Host "Skipping special file: $($file.Name)" -ForegroundColor Yellow
        continue
    }
    
    # Determine if it's a blog file (in subdirectory)
    $inBlogDir = $file.Directory.Name -eq "blog"
    $fixScriptPath = if ($inBlogDir) { "../assets/js/fix-translations.js" } else { "assets/js/fix-translations.js" }
    $translationsPath = if ($inBlogDir) { "../assets/js/translations-fixed.js" } else { "assets/js/translations-fixed.js" }
    
    # Replace translations.js with translations-fixed.js
    if ($content -match 'src="[^"]*translations\.js"') {
        $content = $content -replace 'src="([^"]*?)translations\.js"', "src=`"`$1translations-fixed.js`""
        Write-Host "Updated translations reference in $($file.Name)" -ForegroundColor Green
    }
    
    # Add fix-translations.js if not already present
    if (-not ($content -match 'src="[^"]*fix-translations\.js"')) {
        # Find the closing head tag
        $content = $content -replace '(</head>)', "  <script src=`"$fixScriptPath`" defer></script>`n`$1"
        Write-Host "Added fix-translations.js to $($file.Name)" -ForegroundColor Green
    }
    
    # Write the updated content back to the file
    Set-Content -Path $file.FullName -Value $content -Encoding UTF8
}

Write-Host "Update completed for all HTML files" -ForegroundColor Cyan
