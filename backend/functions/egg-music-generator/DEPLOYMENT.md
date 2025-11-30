# EggMusicGenerator - Quick Deployment Guide

## Prerequisites

1. **ElevenLabs API Key**: Sign up at https://elevenlabs.io and get your API key
2. **AWS Account**: With Bedrock access enabled
3. **AWS CLI**: Configured with appropriate credentials
4. **SAM CLI**: Installed for deployment

## Quick Start

### Step 1: Store ElevenLabs API Key

```bash
aws ssm put-parameter \
  --name "/egg-music-generator/elevenlabs-api-key" \
  --value "YOUR_ELEVENLABS_API_KEY_HERE" \
  --type "SecureString" \
  --region us-east-1
```

### Step 2: Deploy

```bash
cd backend
sam build
sam deploy --guided
```

During guided deployment:
- Stack Name: `egg-music-stack` (or your choice)
- AWS Region: `us-east-1` (or your choice)
- Confirm changes: `Y`
- Allow SAM CLI IAM role creation: `Y`
- Disable rollback: `N`
- Save arguments to config: `Y`

### Step 3: Test

Send a test event via EventBridge:

```bash
aws events put-events --entries '[
  {
    "Source": "custom.egg.analysis",
    "DetailType": "Egg Analysis Complete",
    "Detail": "{\"color\":\"brown\",\"shape\":\"oval\",\"size\":\"large\",\"shellTexture\":\"smooth\",\"shellIntegrity\":\"intact\",\"hardness\":\"hard\",\"spotsMarkings\":\"light speckles\",\"bloomCondition\":\"present\",\"cleanliness\":\"clean\",\"visibleDefects\":[],\"overallGrade\":\"A\",\"hatchLikelihood\":95,\"possibleBreeds\":[\"Rhode Island Red\"],\"breedConfidence\":\"high\",\"chickenAppearance\":{\"plumageColor\":\"red-brown\",\"combType\":\"single\",\"bodyType\":\"large/heavy\",\"featherPattern\":\"solid\",\"legColor\":\"yellow\"},\"notes\":\"Excellent egg\"}"
  }
]'
```

### Step 4: Check Results

View logs:
```bash
aws logs tail /aws/lambda/EggMusicGeneratorFunction --follow
```

List generated music files:
```bash
aws s3 ls s3://$(aws cloudformation describe-stacks --stack-name egg-music-stack --query 'Stacks[0].Outputs[?OutputKey==`MusicBucketName`].OutputValue' --output text)/music/
```

## What Gets Created

- **Lambda Function**: `EggMusicGeneratorFunction` (60s timeout, 1024MB memory)
- **S3 Bucket**: `{stack-name}-music-{account-id}` (public read access)
- **EventBridge Rule**: Triggers on "Egg Analysis Complete" events
- **IAM Roles**: With permissions for Bedrock, S3, DynamoDB, CloudWatch
- **DynamoDB**: Uses existing `DataTable` from stack

## Environment Variables (Auto-configured)

- `BEDROCK_MODEL_ID`: `us.amazon.nova-lite-v1:0`
- `ELEVENLABS_API_KEY`: Retrieved from SSM Parameter Store
- `S3_BUCKET_NAME`: Auto-set to created bucket
- `TABLE_NAME`: Auto-set to existing DynamoDB table

## Expected Behavior

1. EventBridge receives "Egg Analysis Complete" event
2. Lambda function is triggered
3. Bedrock generates creative music prompt based on egg attributes
4. ElevenLabs API creates 15-second music track
5. MP3 file uploaded to S3 with public access
6. Metadata stored in DynamoDB
7. Response includes public URL to music file

## Troubleshooting

**Lambda timeout**: Increase timeout if needed (currently 60s)
```bash
aws lambda update-function-configuration \
  --function-name EggMusicGeneratorFunction \
  --timeout 90
```

**Check Bedrock access**:
```bash
aws bedrock list-foundation-models --region us-east-1
```

**Verify SSM parameter**:
```bash
aws ssm get-parameter --name "/egg-music-generator/elevenlabs-api-key" --with-decryption
```

## Clean Up

```bash
# Delete stack
sam delete --stack-name egg-music-stack

# Delete SSM parameter
aws ssm delete-parameter --name "/egg-music-generator/elevenlabs-api-key"

# Empty and delete S3 bucket (if needed)
aws s3 rm s3://{bucket-name} --recursive
```

## Cost Estimate

Per music generation:
- Bedrock (Nova Lite): ~$0.0008
- ElevenLabs: Varies by plan
- Lambda: ~$0.001
- S3: ~$0.0001
- DynamoDB: ~$0.00001

**Total**: ~$0.01-0.05 per generation (depending on ElevenLabs plan)

## Next Steps

- Monitor CloudWatch Logs for execution details
- Check DynamoDB for stored metadata
- Access generated music files via public URLs
- Integrate with frontend application
