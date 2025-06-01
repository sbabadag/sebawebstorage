# PowerShell script to compress CSS and JS files for better performance
# This script requires 7-Zip to be installed. You can download it from https://www.7-zip.org/

# Configuration
$compressExtensions = @("css", "js")
$compressDirectories = @("assets\css", "assets\js")
$7zPath = "C:\Program Files\7-Zip\7z.exe"  # Update this path if 7-Zip is installed elsewhere
$compressLevel = 9  # Compression level (1-9, higher is better compression but slower)
$useGzip = $true    # Create .gz files
$useBrotli = $true  # Create .br files (if brotli command is available)

# Check if 7-Zip is installed
if (-not (Test-Path $7zPath)) {
    Write-Host "7-Zip not found at $7zPath. Please install it or update the path in this script." -ForegroundColor Red
    exit
}

# Check if brotli is installed (only if we want to use it)
$brotliAvailable = $false
if ($useBrotli) {
    try {
        $brotliVersion = brotli --version
        $brotliAvailable = $true
        Write-Host "Brotli compressor found: $brotliVersion"
    } catch {
        Write-Host "Brotli not found. Will only create gzip files." -ForegroundColor Yellow
        Write-Host "To enable Brotli compression, install the Brotli tool."
    }
}

# Count total files to compress
$filesToCompress = @()
foreach ($dir in $compressDirectories) {
    foreach ($ext in $compressExtensions) {
        $files = Get-ChildItem -Path $dir -Filter "*.$ext" -File -Recurse
        $filesToCompress += $files
    }
}

$totalFiles = $filesToCompress.Count
$processedFiles = 0

# Process each file
foreach ($file in $filesToCompress) {
    $processedFiles++
    $percentComplete = [math]::Round(($processedFiles / $totalFiles) * 100)
    
    Write-Progress -Activity "Compressing Files" -Status "$processedFiles of $totalFiles ($percentComplete%)" -PercentComplete $percentComplete
    
    # Create gzip compressed version
    if ($useGzip) {
        $outputPath = "$($file.FullName).gz"
        Write-Host "Creating gzip: $($file.Name).gz"
        
        & $7zPath a -tgzip "$outputPath" "$($file.FullName)" -mx=$compressLevel | Out-Null
        
        # Report size reduction
        $originalSize = (Get-Item $file.FullName).Length / 1KB
        $compressedSize = (Get-Item $outputPath).Length / 1KB
        $reduction = 100 - [math]::Round(($compressedSize / $originalSize) * 100)
        
        Write-Host "  Gzip: $([math]::Round($originalSize)) KB → $([math]::Round($compressedSize)) KB ($reduction% smaller)"
    }
    
    # Create brotli compressed version
    if ($useBrotli -and $brotliAvailable) {
        $outputPath = "$($file.FullName).br"
        Write-Host "Creating brotli: $($file.Name).br"
        
        # Use the brotli command
        brotli -q $compressLevel -o "$outputPath" "$($file.FullName)" | Out-Null
        
        # Report size reduction
        $originalSize = (Get-Item $file.FullName).Length / 1KB
        $compressedSize = (Get-Item $outputPath).Length / 1KB
        $reduction = 100 - [math]::Round(($compressedSize / $originalSize) * 100)
        
        Write-Host "  Brotli: $([math]::Round($originalSize)) KB → $([math]::Round($compressedSize)) KB ($reduction% smaller)"
    }
}

Write-Host "`nFile compression complete!" -ForegroundColor Green
Write-Host "Compressed $totalFiles files"
