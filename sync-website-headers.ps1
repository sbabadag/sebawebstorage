# PowerShell script to ensure consistency across all HTML files
# This script will sync header scripts and metas across all HTML files

$sourceFile = "index.html"
$targetFiles = @(
    "about.html",
    "services.html",
    "projects.html",
    "blog.html",
    "contact.html",
    "faq.html"
)

# Read the source file content
$sourceContent = Get-Content -Path $sourceFile -Raw

# Extract the head section
if ($sourceContent -match '(?s)<head>(.*?)</head>') {
    $headContent = $matches[1]
    
    # Process each target file
    foreach ($file in $targetFiles) {
        if (Test-Path $file) {
            $targetContent = Get-Content -Path $file -Raw
            
            # Replace the head section while maintaining the title and meta
            if ($targetContent -match '(?s)<head>(.*?)</head>') {
                $oldHeadContent = $matches[1]
                
                # Extract title from target file
                $title = ""
                if ($oldHeadContent -match '<title[^>]*>(.*?)</title>') {
                    $title = $matches[1]
                }
                
                # Extract meta description from target file
                $metaDesc = ""
                if ($oldHeadContent -match '<meta name="description"[^>]*content="(.*?)"') {
                    $metaDesc = $matches[1]
                }
                
                # Create a new head content with updated scripts but original title and meta
                $newHeadContent = $headContent
                
                # Keep original title if found
                if ($title -ne "") {
                    $newHeadContent = $newHeadContent -replace '(<title[^>]*>).*?(</title>)', "`$1$title`$2"
                }
                
                # Keep original meta description if found
                if ($metaDesc -ne "") {
                    $newHeadContent = $newHeadContent -replace '(<meta name="description"[^>]*content=").*?(")(\s*/>|\s*>)', "`$1$metaDesc`$2`$3"
                }
                
                # Replace the head section
                $newContent = $targetContent -replace '(?s)<head>.*?</head>', "<head>$newHeadContent</head>"
                
                # Write the updated content back to the file
                Set-Content -Path $file -Value $newContent
                Write-Host "Updated $file with consistent head section"
            }
        } else {
            Write-Host "File $file not found, skipping..."
        }
    }
    
    # Process blog posts separately to handle relative paths
    $blogFiles = Get-ChildItem -Path "blog/*.html"
    foreach ($blogFile in $blogFiles) {
        $blogContent = Get-Content -Path $blogFile.FullName -Raw
        
        if ($blogContent -match '(?s)<head>(.*?)</head>') {
            $oldHeadContent = $matches[1]
            
            # Extract title and meta as before
            $title = ""
            if ($oldHeadContent -match '<title[^>]*>(.*?)</title>') {
                $title = $matches[1]
            }
            
            $metaDesc = ""
            if ($oldHeadContent -match '<meta name="description"[^>]*content="(.*?)"') {
                $metaDesc = $matches[1]
            }
            
            # Create new head content with proper relative paths
            $newHeadContent = $headContent
            
            # Fix paths in the head content for blog posts
            $newHeadContent = $newHeadContent -replace 'href="assets/', 'href="../assets/'
            $newHeadContent = $newHeadContent -replace 'src="assets/', 'src="../assets/'
            
            # Keep original title and meta description
            if ($title -ne "") {
                $newHeadContent = $newHeadContent -replace '(<title[^>]*>).*?(</title>)', "`$1$title`$2"
            }
            
            if ($metaDesc -ne "") {
                $newHeadContent = $newHeadContent -replace '(<meta name="description"[^>]*content=").*?(")(\s*/>|\s*>)', "`$1$metaDesc`$2`$3"
            }
            
            # Replace the head section
            $newContent = $blogContent -replace '(?s)<head>.*?</head>', "<head>$newHeadContent</head>"
            
            # Write the updated content back to the file
            Set-Content -Path $blogFile.FullName -Value $newContent
            Write-Host "Updated $($blogFile.Name) with consistent head section (with relative paths)"
        }
    }
    
    Write-Host "`nScript completed! All pages now have consistent scripts and meta tags."
} else {
    Write-Host "Could not find the head section in $sourceFile"
}