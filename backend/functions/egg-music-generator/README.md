# EggMusicGenerator Lambda Function

Transforms egg analysis data into unique musical compositions using AWS Bedrock and ElevenLabs Music API.

## Overview

This Lambda function is triggered by EventBridge when an egg analysis is complete. It:
1. Parses and validates egg attributes
2. Generates a creative music prompt using AWS Bedrock (Nova Lite model)
3. Creates a 15-second music track using ElevenLabs Music API
4. Uploads the MP3 file to S3 with public access
5. Stores metadata in DynamoDB
6. Returns the public URL and metadata

## Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `BEDROCK_MODEL_ID` | Amazon Bedrock model identifier | Yes | `us.amazon.nova-lite-v1:0` |
| `ELEVENLABS_API_KEY` | ElevenLabs API authentication key | Yes | `sk_...` |
| `S3_BUCKET_NAME` | S3 bucket name for music storage | Yes | `my-stack-music-123456789` |
| `TABLE_NAME` | DynamoDB table name | Yes | `DataTable` |
| `AWS_REGION` | AWS region | Auto | `us-east-1` |

## Setup Instructions

### 1. Store ElevenLabs API Key in SSM Parameter Store

```bash
aws ssm put-parameter \
  --name "/egg-music-generator/elevenlabs-api-key" \
  --value "YOUR_ELEVENLABS_API_KEY" \
  --type "SecureString" \
  --description "ElevenLabs API key for music generation"
```

### 2. Deploy the Stack

```bash
cd backend
sam build
sam deploy --guided
```

### 3. Verify Deployment

Check that the following resources were created:
- Lambda function: `EggMusicGeneratorFunction`
- S3 bucket: `{stack-name}-music-{account-id}`
- EventBridge rule for egg analysis events
- IAM permissions for Bedrock, S3, and DynamoDB

## Testing

### Trigger a Test Event

Create a test event file `test-event.json`:

```json
{
  "version": "0",
  "id": "test-event-id",
  "detail-type": "Egg Analysis Complete",
  "source": "custom.egg.analysis",
  "account": "123456789012",
  "time": "2024-01-01T12:00:00Z",
  "region": "us-east-1",
  "resources": [],
  "detail": {
    "color": "brown",
    "shape": "oval",
    "size": "large",
    "shellTexture": "smooth",
    "shellIntegrity": "intact",
    "hardness": "hard",
    "spotsMarkings": "light speckles",
    "bloomCondition": "present",
    "cleanliness": "clean",
    "visibleDefects": [],
    "overallGrade": "A",
    "hatchLikelihood": 95,
    "possibleBreeds": ["Rhode Island Red", "Plymouth Rock"],
    "breedConfidence": "high",
    "chickenAppearance": {
      "plumageColor": "red-brown",
      "combType": "single",
      "bodyType": "large/heavy",
      "featherPattern": "solid",
      "legColor": "yellow"
    },
    "notes": "Excellent quality egg"
  }
}
```

Invoke the function:

```bash
aws lambda invoke \
  --function-name EggMusicGeneratorFunction \
  --payload file://test-event.json \
  response.json

cat response.json
```

### Send Event via EventBridge

```bash
aws events put-events \
  --entries '[{
    "Source": "custom.egg.analysis",
    "DetailType": "Egg Analysis Complete",
    "Detail": "{\"color\":\"brown\",\"shape\":\"oval\",\"size\":\"large\",\"shellTexture\":\"smooth\",\"shellIntegrity\":\"intact\",\"hardness\":\"hard\",\"spotsMarkings\":\"light speckles\",\"bloomCondition\":\"present\",\"cleanliness\":\"clean\",\"visibleDefects\":[],\"overallGrade\":\"A\",\"hatchLikelihood\":95,\"possibleBreeds\":[\"Rhode Island Red\"],\"breedConfidence\":\"high\"}"
  }]'
```

## Verification

### Check CloudWatch Logs

```bash
aws logs tail /aws/lambda/EggMusicGeneratorFunction --follow
```

### Verify S3 Upload

```bash
aws s3 ls s3://{stack-name}-music-{account-id}/music/
```

### Test Public URL

The function returns a public URL in the response. Test it:

```bash
curl -I https://{bucket-name}.s3.{region}.amazonaws.com/music/{timestamp}-{egg-id}.mp3
```

### Query DynamoDB

```bash
aws dynamodb query \
  --table-name DataTable \
  --key-condition-expression "pk = :pk AND sk = :sk" \
  --expression-attribute-values '{":pk":{"S":"EGG#{egg-id}"},":sk":{"S":"MUSIC"}}'
```

## Troubleshooting

### Common Issues

1. **ElevenLabs Authentication Failed**
   - Verify API key is stored in SSM Parameter Store
   - Check parameter name matches: `/egg-music-generator/elevenlabs-api-key`
   - Ensure Lambda has permission to read SSM parameters

2. **Bedrock Invocation Failed**
   - Verify Bedrock model access in your AWS account
   - Check IAM permissions for `bedrock:InvokeModel`
   - Ensure model ID is correct: `us.amazon.nova-lite-v1:0`

3. **S3 Upload Failed**
   - Verify bucket exists and name matches environment variable
   - Check IAM permissions for `s3:PutObject` and `s3:PutObjectAcl`
   - Ensure bucket policy allows public read access

4. **DynamoDB Write Failed**
   - Verify table exists and name matches environment variable
   - Check IAM permissions for `dynamodb:PutItem`

### Logs

All operations are logged to CloudWatch Logs. Check logs for:
- Incoming event details
- Validation results
- Bedrock request/response
- ElevenLabs API call status
- S3 upload status
- DynamoDB write status
- Error messages with context

## Architecture

```
EventBridge (Egg Analysis Complete)
    ↓
Lambda: EggMusicGenerator
    ↓
    ├─→ Bedrock (Nova Lite) → Generate music prompt
    ├─→ ElevenLabs API → Generate MP3
    ├─→ S3 → Store MP3 (public access)
    └─→ DynamoDB → Store metadata
```

## Response Format

### Success Response (200)

```json
{
  "success": true,
  "recordId": "EGG#1234567890-abc123",
  "musicUrl": "https://bucket.s3.region.amazonaws.com/music/1234567890-abc123.mp3",
  "eggAttributes": {
    "color": "brown",
    "shape": "oval",
    ...
  },
  "metadata": {
    "timestamp": "2024-01-01T12:00:00.000Z",
    "bedrockModel": "us.amazon.nova-lite-v1:0",
    "fullPrompt": "Generate a song with this style: ..."
  }
}
```

### Error Response (400/500)

```json
{
  "success": false,
  "error": "ValidationError",
  "message": "Missing required fields: color, shape"
}
```

## Cost Considerations

- **Bedrock**: ~$0.0008 per request (Nova Lite)
- **ElevenLabs**: Varies by plan (check ElevenLabs pricing)
- **Lambda**: ~$0.0000166667 per GB-second (1024 MB, ~30-40s execution)
- **S3**: ~$0.023 per GB storage + $0.0004 per 1000 PUT requests
- **DynamoDB**: On-demand pricing, ~$1.25 per million write requests

Estimated cost per music generation: ~$0.01-0.05 depending on ElevenLabs plan.

## License

MIT
