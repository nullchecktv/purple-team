# Christmas Tree Wizard - Deployment Guide

## Quick Start (5 minutes)

### Step 1: Deploy Backend

```bash
cd backend
sam build
sam deploy --guided
```

When prompted:
- Stack Name: `christmas-tree-wizard`
- AWS Region: `us-east-1` (or your preferred region)
- Confirm changes: `Y`
- Allow SAM CLI IAM role creation: `Y`
- Save arguments to config: `Y`

**Save the API URL from the output!** It will look like:
```
Outputs:
ApiUrl: https://abc123.execute-api.us-east-1.amazonaws.com
```

### Step 2: Seed the Database

```bash
# Still in backend directory
export TABLE_NAME=$(aws cloudformation describe-stacks \
  --stack-name christmas-tree-wizard \
  --query 'Stacks[0].Outputs[?OutputKey==`TableName`].OutputValue' \
  --output text)

cd ..
python3 backend/scripts/seed-trees.py
```

This will add 25 sample Christmas trees to your database.

### Step 3: Configure Frontend

```bash
cd frontend

# Create environment file
cp .env.local.example .env.local

# Edit .env.local and add your API URL
# NEXT_PUBLIC_API_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com
```

### Step 4: Run Frontend Locally

```bash
# Still in frontend directory
npm install
npm run dev
```

Open http://localhost:3000 and start finding Christmas trees!

## Testing the Application

1. **Location Step**: Enter "Dallas" or "75201"
2. **Price Range**: Set your budget (e.g., $50-$200)
3. **Quality**: Select minimum quality (e.g., 4 stars)
4. **Delivery**: Choose "Delivery Required"
5. **Return Policy**: Select 14 or 30 days
6. **Social Popularity**: Choose "Trending" or "Any"
7. **Results**: See matching trees with match scores!

## Deployment to Production

### Frontend (Vercel - Recommended)

1. Push your code to GitHub
2. Go to https://vercel.com
3. Import your repository
4. Add environment variable:
   - `NEXT_PUBLIC_API_URL`: Your API Gateway URL
5. Deploy!

### Frontend (AWS Amplify)

```bash
cd frontend
npm run build

# Upload the 'out' directory to S3 or use Amplify Console
```

## Troubleshooting

### Backend Issues

**Lambda function errors:**
```bash
# Check CloudWatch logs
sam logs -n TreeSearchFunction --stack-name christmas-tree-wizard --tail
```

**DynamoDB issues:**
```bash
# Verify table exists
aws dynamodb describe-table --table-name <your-table-name>

# Check item count
aws dynamodb scan --table-name <your-table-name> --select COUNT
```

### Frontend Issues

**API connection errors:**
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`
- Check CORS settings in `backend/template.yaml`
- Ensure API Gateway is deployed

**Build errors:**
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

## Updating the Application

### Add More Trees

1. Edit `backend/scripts/seed-trees.py`
2. Add tree objects to the `trees` array
3. Run: `python3 backend/scripts/seed-trees.py`

### Modify Delivery Zones

1. Edit `backend/shared/delivery_zones.py`
2. Update `DELIVERY_ZONES` dictionary
3. Redeploy: `sam build && sam deploy`

### Update Lambda Functions

```bash
cd backend
sam build
sam deploy
```

## Cost Estimate

For a hackathon/demo with moderate usage:
- **API Gateway**: ~$0.01/day
- **Lambda**: Free tier covers most usage
- **DynamoDB**: ~$0.25/day (on-demand)
- **Total**: < $10/month

## Cleanup

To delete all AWS resources:

```bash
cd backend
sam delete --stack-name christmas-tree-wizard
```

This removes:
- API Gateway
- Lambda functions
- DynamoDB table (and all data)
- IAM roles
- CloudWatch logs

## Support

For issues or questions:
1. Check CloudWatch logs for backend errors
2. Check browser console for frontend errors
3. Verify environment variables are set correctly
4. Ensure AWS credentials are configured

Happy tree shopping! 🎄
