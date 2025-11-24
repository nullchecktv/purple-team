# Deploy Backend and Configure Frontend
Write-Host "Deploying Backend and Configuring Frontend" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

# Install dependencies and deploy using npm scripts
Write-Host "Installing dependencies..." -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "npm install failed" -ForegroundColor Red
    Pop-Location
    exit 1
}

Write-Host ""
Write-Host "Building and deploying..." -ForegroundColor Cyan
if (-not (Test-Path samconfig.toml)) {
    Write-Host "First time deployment - running guided setup..." -ForegroundColor Yellow
    sam build
    sam deploy --guided
} else {
    sam build
    sam deploy
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "Deployment failed" -ForegroundColor Red
    exit 1
}

# Get stack name from samconfig.toml
Write-Host ""
Write-Host "Getting API URL from stack outputs..." -ForegroundColor Cyan
$stackName = (Get-Content samconfig.toml | Select-String 'stack_name\s*=\s*"([^"]+)"').Matches.Groups[1].Value

# Get API URL from stack outputs
$apiUrl = aws cloudformation describe-stacks --stack-name $stackName --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' --output text

if ([string]::IsNullOrEmpty($apiUrl)) {
    Write-Host "Could not retrieve API URL from stack outputs" -ForegroundColor Red
    exit 1
}

Write-Host "OK API URL: $apiUrl" -ForegroundColor Green

# Configure frontend
$frontendPath = Join-Path $PSScriptRoot ".." "frontend"
Push-Location $frontendPath

$envFile = ".env.local"
$envContent = "NEXT_PUBLIC_API_URL=$apiUrl"

if (Test-Path $envFile) {
    # Read existing content
    $content = Get-Content $envFile -Raw

    if ($content -match "NEXT_PUBLIC_API_URL=") {
        # Update existing value
        $content = $content -replace "NEXT_PUBLIC_API_URL=.*", $envContent
        Set-Content $envFile $content -NoNewline
        Write-Host "OK Updated NEXT_PUBLIC_API_URL in frontend/.env.local" -ForegroundColor Green
    } else {
        # Append to existing file
        Add-Content $envFile "`n$envContent"
        Write-Host "OK Added NEXT_PUBLIC_API_URL to frontend/.env.local" -ForegroundColor Green
    }
} else {
    # Create new file
    Set-Content $envFile $envContent
    Write-Host "OK Created frontend/.env.local with API URL" -ForegroundColor Green
}

Pop-Location

Write-Host ""
Write-Host "Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Start frontend: cd frontend; npm run dev"
Write-Host "2. Open http://localhost:3000"
Write-Host ""
