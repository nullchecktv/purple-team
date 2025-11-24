#!/bin/bash

echo "🚀 Deploying Backend and Configuring Frontend"
echo "=============================================="
echo ""

# Install dependencies and deploy using npm scripts
echo "Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ npm install failed"
    exit 1
fi

echo ""
echo "Building and deploying..."
if [ ! -f samconfig.toml ]; then
    echo "First time deployment - running guided setup..."
    sam build && sam deploy --guided
else
    sam build && sam deploy
fi

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed"
    exit 1
fi

# Get API URL from stack outputs
echo ""
echo "Getting API URL from stack outputs..."
STACK_NAME=$(grep 'stack_name' samconfig.toml | cut -d'"' -f2)
API_URL=$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' --output text)

if [ -z "$API_URL" ]; then
    echo "❌ Could not retrieve API URL from stack outputs"
    exit 1
fi

echo "✅ API URL: $API_URL"

# Configure frontend
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/../frontend"

if [ -f .env.local ]; then
    # Check if NEXT_PUBLIC_API_URL already exists
    if grep -q "NEXT_PUBLIC_API_URL" .env.local; then
        # Update existing value
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=$API_URL|" .env.local
        else
            sed -i "s|NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=$API_URL|" .env.local
        fi
        echo "✅ Updated NEXT_PUBLIC_API_URL in frontend/.env.local"
    else
        # Append to existing file
        echo "NEXT_PUBLIC_API_URL=$API_URL" >> .env.local
        echo "✅ Added NEXT_PUBLIC_API_URL to frontend/.env.local"
    fi
else
    # Create new file
    echo "NEXT_PUBLIC_API_URL=$API_URL" > .env.local
    echo "✅ Created frontend/.env.local with API URL"
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Start frontend: cd frontend && npm run dev"
echo "2. Open http://localhost:3000"
echo ""
