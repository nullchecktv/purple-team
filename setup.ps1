# Hackathon Setup Script (Windows PowerShell)
Write-Host "Hackathon Setup Script (Windows)" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

$ErrorCount = 0

# Check Node.js
Write-Host "Checking Node.js..." -NoNewline
try {
    $nodeVersion = node -v 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host " OK Node.js installed: $nodeVersion" -ForegroundColor Green
    } else {
        throw
    }
} catch {
    Write-Host " FAIL Node.js not found" -ForegroundColor Red
    Write-Host "  Install from: https://nodejs.org/" -ForegroundColor Yellow
    $ErrorCount++
}

# Check npm
Write-Host "Checking npm..." -NoNewline
try {
    $npmVersion = npm -v 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host " OK npm installed: $npmVersion" -ForegroundColor Green
    } else {
        throw
    }
} catch {
    Write-Host " FAIL npm not found" -ForegroundColor Red
    $ErrorCount++
}

# Check Python (optional)
Write-Host "Checking Python..." -NoNewline
try {
    $pythonVersion = python --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host " OK Python installed: $pythonVersion" -ForegroundColor Green
    } else {
        throw
    }
} catch {
    Write-Host " WARN Python not found (optional)" -ForegroundColor Yellow
}

# Check AWS CLI
Write-Host "Checking AWS CLI..." -NoNewline
try {
    $awsVersion = aws --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host " OK AWS CLI installed: $awsVersion" -ForegroundColor Green
    } else {
        throw
    }
} catch {
    Write-Host " FAIL AWS CLI not found" -ForegroundColor Red
    Write-Host "  Install from: https://aws.amazon.com/cli/" -ForegroundColor Yellow
    $ErrorCount++
}

# Check AWS SAM CLI
Write-Host "Checking AWS SAM CLI..." -NoNewline
try {
    $samVersion = sam --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host " OK SAM CLI installed: $samVersion" -ForegroundColor Green
    } else {
        throw
    }
} catch {
    Write-Host " FAIL SAM CLI not found" -ForegroundColor Red
    Write-Host "  Install from: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html" -ForegroundColor Yellow
    $ErrorCount++
}

# Check AWS credentials
Write-Host "Checking AWS credentials..." -NoNewline
try {
    $awsAccount = aws sts get-caller-identity --query Account --output text 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host " OK AWS credentials configured (Account: $awsAccount)" -ForegroundColor Green
    } else {
        Write-Host " WARN AWS credentials not configured" -ForegroundColor Yellow
        Write-Host "  Run: aws configure" -ForegroundColor Yellow
    }
} catch {
    Write-Host " WARN AWS credentials not configured" -ForegroundColor Yellow
    Write-Host "  Run: aws configure" -ForegroundColor Yellow
}

if ($ErrorCount -gt 0) {
    Write-Host ""
    Write-Host "Setup failed. Please install missing prerequisites." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
Push-Location frontend
try {
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "OK Frontend dependencies installed" -ForegroundColor Green
    } else {
        throw
    }
} catch {
    Write-Host "FAIL Failed to install frontend dependencies" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location

Write-Host ""
Write-Host "Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Deploy backend: cd backend; sam build; sam deploy --guided"
Write-Host "2. Get API URL from outputs"
Write-Host "3. Create frontend/.env.local with: NEXT_PUBLIC_API_URL=<your-api-url>"
Write-Host "4. Start frontend: cd frontend; npm run dev"
Write-Host ""
