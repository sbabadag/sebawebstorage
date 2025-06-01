# Update all HTML files to use the new language system
Write-Host "Updating HTML files to use the new language system..."

# Define paths
$rootDir = "c:\Users\noname\Documents\SEBAWEB\sebawebstorage"
$rootHtmlFiles = Get-ChildItem -Path $rootDir -Filter "*.html"
$blogDir = Join-Path $rootDir "blog"
$blogHtmlFiles = Get-ChildItem -Path $blogDir -Filter "*.html"

# Update root HTML files
foreach ($file in $rootHtmlFiles) {
    $content = Get-Content -Path $file.FullName -Raw
    
    # Replace language script references with our new system
    $oldScriptPattern = '(?s)<script src="assets/js/translations[^"]*\.js"></script>.*?<script src="assets/js/language-init.js"></script>.*?(<script src="assets/js/script.js"[^>]*></script>).*?<script src="assets/js/language-enhancer.js"[^>]*></script>'
    $newScripts = '<script src="assets/js/translations-fixed.js"></script>
  <script src="assets/js/language-system.js"></script>
  $1'
    
    $updatedContent = $content -replace $oldScriptPattern, $newScripts
    
    # If we couldn't find the combined pattern, try a simpler pattern
    if ($updatedContent -eq $content) {
        $simplePattern = '(?s)<script src="assets/js/translations[^"]*\.js"></script>.*?<script src="assets/js/language-init.js"></script>'
        $simpleReplacement = '<script src="assets/js/translations-fixed.js"></script>
  <script src="assets/js/language-system.js"></script>'
        
        $updatedContent = $content -replace $simplePattern, $simpleReplacement
        
        # If still no match, try inserting after existing script tags
        if ($updatedContent -eq $content) {
            $headEndPattern = '</head>'
            $scriptInsert = '  <script src="assets/js/translations-fixed.js"></script>
  <script src="assets/js/language-system.js"></script>
</head>'
            
            $updatedContent = $content -replace $headEndPattern, $scriptInsert
        }
    }
    
    # Save the updated content
    Set-Content -Path $file.FullName -Value $updatedContent
    Write-Host "Updated $($file.Name)"
}

# Update blog HTML files
foreach ($file in $blogHtmlFiles) {
    $content = Get-Content -Path $file.FullName -Raw
    
    # Replace language script references with our new system
    $oldScriptPattern = '(?s)<script src="../assets/js/translations[^"]*\.js"></script>.*?<script src="../assets/js/language-init.js"></script>.*?(<script src="../assets/js/script.js"[^>]*></script>).*?<script src="../assets/js/language-enhancer.js"[^>]*></script>'
    $newScripts = '<script src="../assets/js/translations-fixed.js"></script>
  <script src="../assets/js/language-system.js"></script>
  $1'
    
    $updatedContent = $content -replace $oldScriptPattern, $newScripts
    
    # If we couldn't find the combined pattern, try a simpler pattern
    if ($updatedContent -eq $content) {
        $simplePattern = '(?s)<script src="../assets/js/translations[^"]*\.js"></script>.*?<script src="../assets/js/language-init.js"></script>'
        $simpleReplacement = '<script src="../assets/js/translations-fixed.js"></script>
  <script src="../assets/js/language-system.js"></script>'
        
        $updatedContent = $content -replace $simplePattern, $simpleReplacement
        
        # If still no match, try inserting after existing script tags
        if ($updatedContent -eq $content) {
            $headEndPattern = '</head>'
            $scriptInsert = '  <script src="../assets/js/translations-fixed.js"></script>
  <script src="../assets/js/language-system.js"></script>
</head>'
            
            $updatedContent = $content -replace $headEndPattern, $scriptInsert
        }
    }
    
    # Save the updated content
    Set-Content -Path $file.FullName -Value $updatedContent
    Write-Host "Updated $($file.Name)"
}

Write-Host "Update complete. All HTML files now use the new language system."
