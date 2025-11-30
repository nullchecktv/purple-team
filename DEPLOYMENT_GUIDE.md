# 🐣 Chicken Hatching Management System - Deployment Guide

## Quick Deployment Steps

### 1. Deploy Backend (AWS SAM)

**Quick Deploy (Recommended):**
```bash
cd backend
./deploy-simple.sh
```

**Or Manual Deploy:**
```bash
cd backend
sam build
sam deploy --guided
```

During the guided deployment:
- Stack name: `chicken-hatching-system`
- AWS Region: `us-east-1` (or your preferred region)
- Confirm changes before deploy: `Y`
- Allow SAM CLI IAM role creation: `Y`
- Save parameters to samconfig.toml: `Y`

### 2. Get API Gateway URL

After deployment, note the API Gateway URL from the outputs:
```
Outputs:
ApiUrl: https://your-api-id.execute-api.us-east-1.amazonaws.com
```

### 3. Configure Frontend

Update the frontend environment:

```bash
cd frontend
echo "NEXT_PUBLIC_API_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com" > .env.local
```

### 4. Install Frontend Dependencies

```bash
npm install
```

### 5. Start Frontend Development Server

```bash
npm run dev
```

The dashboard will be available at `http://localhost:3000`

### 6. Populate Demo Data (Optional)

```bash
cd backend
# Update API_BASE_URL in populate_demo_data.py with your actual API Gateway URL
python3 populate_demo_data.py
```

## API Endpoints

The system provides these endpoints:

### Egg Management
- `POST /api/eggs` - Register new egg
- `GET /api/eggs` - List all eggs
- `GET /api/eggs/{eggId}` - Get specific egg

### Environmental Monitoring
- `GET /api/environment/current` - Get current conditions
- `POST /api/environment/readings` - Collect new readings
- `GET /api/environment/alerts` - Check alerts

### Rotation Management
- `POST /api/rotation/schedule` - Schedule rotation
- `POST /api/rotation/execute` - Execute rotation
- `GET /api/rotation/status/{eggId}` - Get rotation status

### AI Predictions
- `GET /api/predictions/{eggId}` - Get hatch prediction
- `POST /api/predictions/analyze` - Analyze variables
- `PUT /api/predictions/retrain` - Update model

### Emergence Monitoring
- `GET /api/emergence/live/{eggId}` - Live camera feed
- `POST /api/emergence/analyze` - Analyze cracking
- `POST /api/emergence/movement` - Monitor movement
- `POST /api/emergence/complete` - Complete hatching

### Maternal Simulation
- `POST /api/maternal/activate` - Start simulation
- `GET /api/maternal/status/{eggId}` - Get status
- `PUT /api/maternal/adjust` - Adjust parameters
- `GET /api/maternal/effectiveness/{eggId}` - Get effectiveness

### Analytics & Reporting
- `GET /api/analytics/dashboard` - Dashboard data
- `POST /api/analytics/reports` - Generate reports
- `GET /api/analytics/patterns` - Analyze patterns
- `PUT /api/analytics/export` - Export to consortium

### Blockchain Integration
- `POST /api/blockchain/record` - Record to blockchain
- `POST /api/blockchain/nft` - Generate NFT
- `POST /api/blockchain/contract` - Create smart contract
- `GET /api/blockchain/certificate/{entityId}` - Get certificate

## Architecture

```
Frontend (Next.js/React)
    ↓
API Gateway
    ↓
Lambda Functions (Python 3.13)
    ↓
DynamoDB
```

## AWS Services Used

- **Lambda** - 8 microservices
- **API Gateway** - REST API endpoints
- **DynamoDB** - All data storage (eggs, environmental, analytics)
- **Bedrock** - AI/ML predictions
- **Rekognition** - Computer vision
- **S3** - File storage (referenced)

## Demo Features

✅ **Egg Registration** with 47-field validation  
✅ **Real-time Environmental Monitoring** (0.3s intervals)  
✅ **AI-Powered Predictions** (99.7% accuracy)  
✅ **Servo-Controlled Rotation** (45° precision)  
✅ **Computer Vision Monitoring**  
✅ **Maternal Simulation** (432Hz audio, 72 BPM)  
✅ **Quantum Analytics** (127 variables)  
✅ **Blockchain Certificates** (SHA-512 encrypted)  
✅ **NFT Generation** for hatched chicks  

## Troubleshooting

### CORS Issues
If you get CORS errors, make sure the API Gateway has proper CORS configuration (already included in SAM template).

### DynamoDB Permissions
All Lambda functions have the necessary DynamoDB permissions configured in the SAM template.

### Environment Variables
The Lambda functions automatically get the DynamoDB table name via environment variables.

### Frontend API Calls
Make sure `NEXT_PUBLIC_API_URL` is set correctly in `.env.local`.

## Cost Optimization

The system uses:
- **Pay-per-request** DynamoDB billing
- **ARM64** Lambda functions for better price/performance
- **Minimal memory** allocations (512MB)
- **Short timeouts** (30 seconds)

Expected cost for demo usage: **< $1/day**

## Ready for Demo! 🚀

The system showcases:
- **Over-engineered complexity** for simple egg incubation
- **Multiple AWS services** working together
- **Professional UI** with real-time updates
- **Quantum-enhanced algorithms** (because why not?)
- **Blockchain verification** (everything needs blockchain!)
- **AI predictions** with ridiculous precision

Perfect for impressing hackathon judges with magnificent impracticality! 🐣✨