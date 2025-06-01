# PowerShell script to check for broken links in HTML files
# This script validates internal links, external links, and resources

# Configuration
$htmlFiles = Get-ChildItem -Path "." -Include "*.html" -Recurse
$baseUrl = "https://selahattinbabadag.com"
$checkExternalLinks = $true  # Set to false to skip external link checking (faster)

# Results tracking
$brokenLinks = @()
$brokenResources = @()
$workingLinks = @()

# Function to resolve relative URLs
function Resolve-RelativeUrl {
    param (
        [string]$baseUrl,
        [string]$relativePath,
        [string]$currentPath
    )
    
    # If it's already an absolute URL, return as is
    if ($relativePath -match '^(https?://|//|mailto:|tel:)') {
        return $relativePath
    }
    
    # If it starts with /, it's relative to the domain root
    if ($relativePath -match '^/') {
        return "$baseUrl$relativePath"
    }
    
    # It's relative to the current path
    $currentDir = Split-Path -Parent $currentPath
    $currentDir = $currentDir -replace '\\', '/'
    
    # Handle parent directory navigation
    if ($relativePath -match '^\.\.') {
        $levels = ($relativePath -split '../').Count - 1
        for ($i = 0; $i -lt $levels; $i++) {
            $currentDir = Split-Path -Parent $currentDir
        }
        $relativePath = $relativePath -replace '^\.\./+', ''
    }
    
    # Handle current directory
    $relativePath = $relativePath -replace '^\./', ''
    
    # Combine paths
    $fullPath = Join-Path $currentDir $relativePath
    $fullPath = $fullPath -replace '\\', '/'
    
    return $fullPath
}

# Check if a local file exists
function Test-LocalResource {
    param (
        [string]$path
    )
    
    # Convert to local filesystem path
    $localPath = $path -replace '^https?://selahattinbabadag\.com/?', ''
    $localPath = $localPath -replace '/', '\'
    
    # If path is empty, assume index.html
    if (-not $localPath) {
        $localPath = "index.html"
    }
    
    # Check if file exists
    return Test-Path $localPath
}

# Check if an external URL is accessible
function Test-ExternalUrl {
    param (
        [string]$url
    )
    
    try {
        $request = [System.Net.WebRequest]::Create($url)
        $request.Method = "HEAD"
        $request.Timeout = 5000  # 5 seconds timeout
        
        $response = $request.GetResponse()
        $status = [int]$response.StatusCode
        $response.Close()
        
        return ($status -lt 400)
    } catch {
        return $false
    }
}

# Process each HTML file
foreach ($file in $htmlFiles) {
    Write-Host "Checking links in $($file.Name)..." -ForegroundColor Cyan
    
    # Read the file content
    $content = Get-Content $file.FullName -Raw
    
    # Extract all href and src attributes
    $hrefMatches = [regex]::Matches($content, 'href\s*=\s*[''"]([^''"]+)[''"]')
    $srcMatches = [regex]::Matches($content, 'src\s*=\s*[''"]([^''"]+)[''"]')
    
    # Process href attributes (links)
    foreach ($match in $hrefMatches) {
        $url = $match.Groups[1].Value
        
        # Skip fragment-only links and javascript: links
        if ($url -match '^#' -or $url -match '^javascript:' -or $url -match '^tel:' -or $url -match '^mailto:') {
            continue
        }
        
        $resolvedUrl = Resolve-RelativeUrl -baseUrl $baseUrl -relativePath $url -currentPath $file.FullName
        
        # Check if it's an internal or external link
        if ($resolvedUrl -match '^https?://selahattinbabadag\.com' -or -not ($resolvedUrl -match '^https?://')) {
            # Internal link - check if the file exists
            if (-not (Test-LocalResource -path $resolvedUrl)) {
                $brokenLinks += [PSCustomObject]@{
                    File = $file.Name
                    Link = $url
                    ResolvedLink = $resolvedUrl
                    Type = "Internal"
                }
            } else {
                $workingLinks += [PSCustomObject]@{
                    File = $file.Name
                    Link = $url
                    Type = "Internal"
                }
            }
        } elseif ($checkExternalLinks) {
            # External link - check if the URL is accessible
            if (-not (Test-ExternalUrl -url $resolvedUrl)) {
                $brokenLinks += [PSCustomObject]@{
                    File = $file.Name
                    Link = $url
                    ResolvedLink = $resolvedUrl
                    Type = "External"
                }
            } else {
                $workingLinks += [PSCustomObject]@{
                    File = $file.Name
                    Link = $url
                    Type = "External"
                }
            }
        }
    }
    
    # Process src attributes (resources)
    foreach ($match in $srcMatches) {
        $url = $match.Groups[1].Value
        
        # Skip data: URLs
        if ($url -match '^data:') {
            continue
        }
        
        $resolvedUrl = Resolve-RelativeUrl -baseUrl $baseUrl -relativePath $url -currentPath $file.FullName
        
        # Check if it's an internal or external resource
        if ($resolvedUrl -match '^https?://selahattinbabadag\.com' -or -not ($resolvedUrl -match '^https?://')) {
            # Internal resource - check if the file exists
            if (-not (Test-LocalResource -path $resolvedUrl)) {
                $brokenResources += [PSCustomObject]@{
                    File = $file.Name
                    Resource = $url
                    ResolvedResource = $resolvedUrl
                    Type = "Internal"
                }
            }
        } elseif ($checkExternalLinks) {
            # External resource - check if the URL is accessible
            if (-not (Test-ExternalUrl -url $resolvedUrl)) {
                $brokenResources += [PSCustomObject]@{
                    File = $file.Name
                    Resource = $url
                    ResolvedResource = $resolvedUrl
                    Type = "External"
                }
            }
        }
    }
}

# Display results
Write-Host "`n=== LINK CHECKING RESULTS ===" -ForegroundColor Green

if ($brokenLinks.Count -eq 0) {
    Write-Host "No broken links found! All links are working." -ForegroundColor Green
} else {
    Write-Host "`nBROKEN LINKS ($($brokenLinks.Count)):" -ForegroundColor Red
    $brokenLinks | Format-Table -AutoSize
}

if ($brokenResources.Count -eq 0) {
    Write-Host "`nNo broken resources found! All resources are loading." -ForegroundColor Green
} else {
    Write-Host "`nBROKEN RESOURCES ($($brokenResources.Count)):" -ForegroundColor Red
    $brokenResources | Format-Table -AutoSize
}

Write-Host "`nTotal links checked: $($workingLinks.Count + $brokenLinks.Count)" -ForegroundColor Cyan
Write-Host "Working links: $($workingLinks.Count)" -ForegroundColor Green
Write-Host "Broken links: $($brokenLinks.Count)" -ForegroundColor $(if ($brokenLinks.Count -eq 0) { "Green" } else { "Red" })
Write-Host "Broken resources: $($brokenResources.Count)" -ForegroundColor $(if ($brokenResources.Count -eq 0) { "Green" } else { "Red" })
