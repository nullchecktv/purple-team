#!/bin/bash

echo "🐣 Starting Chicken Hatching Management System Frontend"
echo "=================================================="
echo "Port: 3000"
echo "API: https://na4zg40otd.execute-api.us-east-1.amazonaws.com"
echo ""

# Make sure we're using the right API URL
export NEXT_PUBLIC_API_URL="https://na4zg40otd.execute-api.us-east-1.amazonaws.com"

# Start Next.js dev server on port 3000
npm run dev