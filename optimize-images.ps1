# PowerShell script to optimize website images
# This script requires ImageMagick to be installed. You can download it from https://imagemagick.org/

# Configuration
$imageFolder = "assets\images"
$outputFolder = "assets\images\optimized"
$compressionLevel = "85%"  # Quality level (lower means smaller file size)
$maxWidth = 1200  # Maximum width for large images

# Create output directory if it doesn't exist
if (-not (Test-Path $outputFolder)) {
    New-Item -Path $outputFolder -ItemType Directory -Force
}

# Get all image files
$imageFiles = Get-ChildItem -Path $imageFolder -Include "*.jpg", "*.jpeg", "*.png" -File -Recurse

# Check if ImageMagick is installed
try {
    $magickVersion = magick -version
    Write-Host "Using ImageMagick: $($magickVersion[0])"
} catch {
    Write-Host "ImageMagick not found. Please install it first: https://imagemagick.org/"
    exit
}

# Count total images
$totalImages = $imageFiles.Count
$processedImages = 0

# Process each image
foreach ($image in $imageFiles) {
    $processedImages++
    $percentComplete = [math]::Round(($processedImages / $totalImages) * 100)
    
    $outputPath = Join-Path $outputFolder $image.Name
    
    Write-Progress -Activity "Optimizing Images" -Status "$processedImages of $totalImages ($percentComplete%)" -PercentComplete $percentComplete
    
    # Get image dimensions
    try {
        $imageInfo = magick identify -format "%w %h" $image.FullName
        $dimensions = $imageInfo.Split(" ")
        $width = [int]$dimensions[0]
        $height = [int]$dimensions[1]
        
        $resizeParam = ""
        if ($width -gt $maxWidth) {
            $resizeParam = "-resize ${maxWidth}x"
        }
        
        # Optimize the image
        Write-Host "Processing $($image.Name) ($width x $height)..."
        magick $image.FullName $resizeParam -strip -interlace Plane -gaussian-blur 0.05 -quality $compressionLevel $outputPath
        
        # Get file size reduction
        $originalSize = (Get-Item $image.FullName).Length / 1KB
        $newSize = (Get-Item $outputPath).Length / 1KB
        $reduction = 100 - [math]::Round(($newSize / $originalSize) * 100)
        
        Write-Host "  Reduced from $([math]::Round($originalSize)) KB to $([math]::Round($newSize)) KB ($reduction% smaller)"
    } catch {
        Write-Host "  Error processing $($image.Name): $_" -ForegroundColor Red
    }
}

Write-Host "`nImage optimization complete!" -ForegroundColor Green
Write-Host "Processed $totalImages images"
Write-Host "Optimized images are available in the $outputFolder folder"
