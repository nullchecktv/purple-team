#!/bin/bash

echo "🐣 Deploying Chicken Hatching Management System..."
echo "=================================================="

# Build the SAM application
echo "📦 Building SAM application..."
sam build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Deploy with simplified parameters
echo "🚀 Deploying to AWS..."
sam deploy \
    --stack-name chicken-hatching-system \
    --region us-east-1 \
    --capabilities CAPABILITY_IAM \
    --no-confirm-changeset \
    --no-fail-on-empty-changeset

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo ""
    echo "🔗 Getting API Gateway URL..."
    aws cloudformation describe-stacks \
        --stack-name chicken-hatching-system \
        --region us-east-1 \
        --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' \
        --output text
else
    echo "❌ Deployment failed!"
    exit 1
fi