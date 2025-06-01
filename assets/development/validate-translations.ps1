# Advanced translations validator
Write-Host "Validating translations.js file" -ForegroundColor Cyan

# Read the translations.js file content
$translationsPath = ".\assets\js\translations.js"
$content = Get-Content -Path $translationsPath -Raw

# Extract just the JSON part (remove the variable declaration and export)
$jsonPattern = "(?s)var TRANSLATIONS = \{(.*?)\}\s*;"
$jsonMatch = [regex]::Match($content, $jsonPattern)

if ($jsonMatch.Success) {
    # Prepare the JSON string for validation
    $jsonText = "{" + $jsonMatch.Groups[1].Value + "}"
    
    # Save to a temporary file for testing
    $tempFile = ".\temp_translations.json"
    $jsonText | Out-File -FilePath $tempFile -Encoding utf8
    
    Write-Host "Attempting to parse the JSON..." -ForegroundColor Yellow
    
    try {
        # Try to parse the JSON
        $jsonObject = Get-Content -Path $tempFile -Raw | ConvertFrom-Json
        
        # Count translations
        $enCount = ($jsonObject.en | Get-Member -MemberType NoteProperty).Count
        $trCount = ($jsonObject.tr | Get-Member -MemberType NoteProperty).Count
        
        Write-Host "JSON is valid!" -ForegroundColor Green
        Write-Host "EN translations: $enCount" -ForegroundColor Green
        Write-Host "TR translations: $trCount" -ForegroundColor Green
    }
    catch {
        Write-Host "JSON validation failed:" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        
        # Try to identify the line with the error
        $errorMessage = $_.Exception.Message
        if ($errorMessage -match "at line (\d+)") {
            $errorLine = [int]$matches[1]
            
            # Show context around the error
            $lines = $jsonText -split "`n"
            $start = [Math]::Max(0, $errorLine - 5)
            $end = [Math]::Min($lines.Count - 1, $errorLine + 5)
            
            Write-Host "Error context:" -ForegroundColor Yellow
            for ($i = $start; $i -le $end; $i++) {
                if ($i -eq $errorLine - 1) {
                    Write-Host "$i: $($lines[$i])" -ForegroundColor Red
                } else {
                    Write-Host "$i: $($lines[$i])"
                }
            }
        }
    }
    
    # Clean up
    Remove-Item -Path $tempFile -Force
}
else {
    Write-Host "Could not extract JSON object from translations.js" -ForegroundColor Red
}

Write-Host "Validation complete" -ForegroundColor Cyan
