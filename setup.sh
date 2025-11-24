#!/bin/bash

echo "🚀 Hackathon Setup Script (Mac/Linux)"
echo "======================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
echo "Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓${NC} Node.js installed: $NODE_VERSION"
else
    echo -e "${RED}✗${NC} Node.js not found"
    echo "  Install from: https://nodejs.org/"
    exit 1
fi

# Check npm
echo "Checking npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✓${NC} npm installed: $NPM_VERSION"
else
    echo -e "${RED}✗${NC} npm not found"
    exit 1
fi

# Check Python (optional)
echo "Checking Python..."
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo -e "${GREEN}✓${NC} Python installed: $PYTHON_VERSION"
else
    echo -e "${YELLOW}⚠${NC} Python not found (optional, only needed if using Python Lambdas)"
fi

# Check AWS CLI
echo "Checking AWS CLI..."
if command -v aws &> /dev/null; then
    AWS_VERSION=$(aws --version)
    echo -e "${GREEN}✓${NC} AWS CLI installed: $AWS_VERSION"
else
    echo -e "${RED}✗${NC} AWS CLI not found"
    echo "  Install from: https://aws.amazon.com/cli/"
    exit 1
fi

# Check AWS SAM CLI
echo "Checking AWS SAM CLI..."
if command -v sam &> /dev/null; then
    SAM_VERSION=$(sam --version)
    echo -e "${GREEN}✓${NC} SAM CLI installed: $SAM_VERSION"
else
    echo -e "${RED}✗${NC} SAM CLI not found"
    echo "  Install from: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html"
    exit 1
fi

# Check AWS credentials
echo "Checking AWS credentials..."
if aws sts get-caller-identity &> /dev/null; then
    AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
    echo -e "${GREEN}✓${NC} AWS credentials configured (Account: $AWS_ACCOUNT)"
else
    echo -e "${YELLOW}⚠${NC} AWS credentials not configured"
    echo "  Run: aws configure"
fi

echo ""
echo "Installing frontend dependencies..."
cd frontend
if npm install; then
    echo -e "${GREEN}✓${NC} Frontend dependencies installed"
else
    echo -e "${RED}✗${NC} Failed to install frontend dependencies"
    exit 1
fi
cd ..

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Deploy backend: cd backend && sam build && sam deploy --guided"
echo "2. Get API URL from outputs"
echo "3. Create frontend/.env.local with: NEXT_PUBLIC_API_URL=<your-api-url>"
echo "4. Start frontend: cd frontend && npm run dev"
echo ""
