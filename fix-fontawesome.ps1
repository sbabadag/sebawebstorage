# Fix Font Awesome loading issue
Write-Host "Fixing Font Awesome loading issue on all HTML files..."

# Define paths
$rootDir = "c:\Users\noname\Documents\SEBAWEB\sebawebstorage"
$htmlFiles = Get-ChildItem -Path $rootDir -Filter "*.html" -Recurse

# Process each HTML file
foreach ($file in $htmlFiles) {
    Write-Host "Processing file: $($file.FullName)"
    
    # Read file content
    $content = Get-Content -Path $file.FullName -Raw
    
    # Replace the problematic Font Awesome script with a working CDN
    $oldFontAwesome = '<script src="https://kit.fontawesome.com/a076d05399.js" crossorigin="anonymous"></script>'
    $newFontAwesome = '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" integrity="sha512-1ycn6IcaQQ40/MKBW2W4Rhis/DbILU74C1vSrLJxCq57o941Ym01SwNsOMqvEBFlcgUa6xLiPY/NS5R+E6ztJQ==" crossorigin="anonymous" referrerpolicy="no-referrer" />'
    
    # Make the replacement
    $newContent = $content -replace [regex]::Escape($oldFontAwesome), $newFontAwesome
    
    # Write the updated content back to the file
    if ($newContent -ne $content) {
        Set-Content -Path $file.FullName -Value $newContent
        Write-Host "Updated Font Awesome in: $($file.Name)"
    } else {
        Write-Host "No Font Awesome updates needed for: $($file.Name)"
    }
}

Write-Host "Font Awesome loading issue fixed on all HTML files."
