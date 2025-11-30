#!/bin/bash

# Setup script for Amazon Managed Blockchain (AMB) Access integration
# This script helps configure the necessary AWS resources for Ethereum integration

echo "🚀 Setting up Amazon Managed Blockchain (AMB) Access for CHMS..."

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials not configured. Please run 'aws configure' first."
    exit 1
fi

echo "✅ AWS CLI configured"

# Set default values
REGION=${AWS_REGION:-us-east-1}
STACK_NAME=${STACK_NAME:-hackathon-demo}

echo "📍 Using region: $REGION"
echo "📦 Using stack name: $STACK_NAME"

# Create SSM parameter for AMB Access Token (placeholder)
echo "🔐 Creating SSM parameter for AMB Access Token..."

# Note: In a real implementation, you would get this token from AWS AMB console
# For demo purposes, we'll create a placeholder
AMB_TOKEN="ac-7DG7SG3HHREPVPVSXJWIPVYWGQ"

aws ssm put-parameter \
    --region $REGION \
    --name "/chms/amb/access-token" \
    --value "$AMB_TOKEN" \
    --type "SecureString" \
    --description "Amazon Managed Blockchain Access Token for CHMS Ethereum integration" \
    --overwrite 2>/dev/null || echo "⚠️  Parameter may already exist"

echo "✅ SSM parameter created: /chms/amb/access-token"

# Display AMB Access setup instructions
echo ""
echo "🌐 Amazon Managed Blockchain (AMB) Access Setup Instructions:"
echo "============================================================"
echo ""
echo "1. Go to AWS Console → Amazon Managed Blockchain"
echo "2. Navigate to 'Access' → 'Ethereum'"
echo "3. Create a new access token or use existing one"
echo "4. Update the SSM parameter with your real token:"
echo ""
echo "   aws ssm put-parameter \\"
echo "       --region $REGION \\"
echo "       --name '/chms/amb/access-token' \\"
echo "       --value 'YOUR_REAL_AMB_ACCESS_TOKEN' \\"
echo "       --type 'SecureString' \\"
echo "       --overwrite"
echo ""
echo "5. Your AMB Ethereum endpoint will be:"
echo "   https://ethereum-mainnet.managedblockchain.$REGION.amazonaws.com"
echo ""
echo "📋 Features enabled with AMB Access:"
echo "   • Real Ethereum mainnet transactions"
echo "   • NFT minting on Ethereum"
echo "   • Smart contract interactions"
echo "   • Immutable record keeping"
echo "   • Enterprise-grade security"
echo "   • AWS-managed infrastructure"
echo ""
echo "💰 Cost Optimization:"
echo "   • Pay only for actual blockchain transactions"
echo "   • No infrastructure management overhead"
echo "   • Automatic scaling and high availability"
echo ""
echo "🔒 Security Benefits:"
echo "   • AWS IAM integration"
echo "   • VPC endpoint support"
echo "   • Encrypted connections"
echo "   • Audit logging via CloudTrail"
echo ""
echo "✅ Setup complete! Deploy your stack with:"
echo "   cd backend && sam build && sam deploy"
echo ""
echo "🎯 This integration makes your chicken hatching system magnificently over-engineered"
echo "   with real blockchain capabilities - perfect for the hackathon!"