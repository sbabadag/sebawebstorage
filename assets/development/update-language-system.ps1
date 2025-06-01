# Update all HTML files to use consistent language initialization
$htmlFiles = Get-ChildItem -Path "." -Filter "*.html" -Recurse 

foreach ($file in $htmlFiles) {
    $content = Get-Content -Path $file.FullName -Raw
    
    # Skip Google verification file
    if ($file.Name -eq "google7c9e77390335bf0c.html") {
        Write-Host "Skipping Google verification file"
        continue
    }
    
    # Determine if it's a blog file (in subdirectory)
    $inBlogDir = $file.Directory.Name -eq "blog"
    $translationsPath = if ($inBlogDir) { "../assets/js/translations.js" } else { "assets/js/translations.js" }
    $initPath = if ($inBlogDir) { "../assets/js/language-init.js" } else { "assets/js/language-init.js" }
    
    # Update script loading to ensure proper order
    # First check if translations.js is already included
    if ($content -match '<script[^>]*src="[^"]*translations\.js"[^>]*>') {
        # Replace with proper loading order
        $content = $content -replace '(<script[^>]*src="[^"]*translations\.js"[^>]*>)(\s*</script>)', 
                            "`$1`$2`n  <script src=`"$initPath`"></script>"
    }
    else {
        # Add translations.js and language-init.js before the first script tag
        $content = $content -replace '(<script)', 
                            "<script src=`"$translationsPath`"></script>`n  <script src=`"$initPath`"></script>`n  `$1"
    }
    
    # Update language buttons to use data-lang attribute
    $content = $content -replace '<button class="lang-btn" onclick="setLanguage\(''en''\)">EN</button>', 
                         '<button class="lang-btn" data-lang="en">EN</button>'
    $content = $content -replace '<button class="lang-btn" onclick="setLanguage\(''tr''\)">TR</button>', 
                         '<button class="lang-btn" data-lang="tr">TR</button>'
    
    # Write the updated content back to the file
    Set-Content -Path $file.FullName -Value $content
    Write-Host "Updated $($file.Name)"
}

Write-Host "Language system update completed for all HTML files"
