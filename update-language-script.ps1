# PowerShell script to add language-enhancer.js to all HTML files

# Define the line we want to add
$enhancerScriptLine = '    <script src="assets/js/language-enhancer.js" defer></script>'
$blogEnhancerScriptLine = '    <script src="../assets/js/language-enhancer.js" defer></script>'

# Process all main directory HTML files
$htmlFiles = Get-ChildItem -Path "C:\Users\noname\Documents\SEBAWEB\sebawebstorage" -Filter "*.html" -File | Where-Object { $_.Name -ne "google7c9e77390335bf0c.html" }

foreach ($file in $htmlFiles) {
    Write-Host "Processing $($file.FullName)..."
    $content = Get-Content -Path $file.FullName -Raw

    # Check if the file already has the enhancer script
    if ($content -match "language-enhancer\.js") {
        Write-Host "  Script already exists in $($file.Name)."
        continue
    }

    # Look for the closing script tag before </head>
    $pattern = '(?<=<script.*?>.*?</script>)\s*(?=</head>)'
    $replacement = "`n$enhancerScriptLine`n"
    $newContent = $content -replace $pattern, $replacement

    # If no change was made, try another approach
    if ($newContent -eq $content) {
        $pattern = '(?<=<link.*?>|<script.*?>.*?</script>)\s*(?=</head>)'
        $newContent = $content -replace $pattern, "`n$enhancerScriptLine`n"
    }

    # Save the file if changes were made
    if ($newContent -ne $content) {
        Set-Content -Path $file.FullName -Value $newContent -NoNewline
        Write-Host "  Added script to $($file.Name)"
    } else {
        Write-Host "  Could not find insertion point in $($file.Name)."
    }
}

# Process all blog directory HTML files
$blogHtmlFiles = Get-ChildItem -Path "C:\Users\noname\Documents\SEBAWEB\sebawebstorage\blog" -Filter "*.html" -File

foreach ($file in $blogHtmlFiles) {
    Write-Host "Processing $($file.FullName)..."
    $content = Get-Content -Path $file.FullName -Raw

    # Check if the file already has the enhancer script
    if ($content -match "language-enhancer\.js") {
        Write-Host "  Script already exists in $($file.Name)."
        continue
    }

    # Look for the closing script tag before </head>
    $pattern = '(?<=<script.*?>.*?</script>)\s*(?=</head>)'
    $replacement = "`n$blogEnhancerScriptLine`n"
    $newContent = $content -replace $pattern, $replacement

    # If no change was made, try another approach
    if ($newContent -eq $content) {
        $pattern = '(?<=<link.*?>|<script.*?>.*?</script>)\s*(?=</head>)'
        $newContent = $content -replace $pattern, "`n$blogEnhancerScriptLine`n"
    }

    # Save the file if changes were made
    if ($newContent -ne $content) {
        Set-Content -Path $file.FullName -Value $newContent -NoNewline
        Write-Host "  Added script to $($file.Name)"
    } else {
        Write-Host "  Could not find insertion point in $($file.Name)."
    }
}

Write-Host "Script completed. Check files to ensure the language enhancer script was added correctly."
