# Egg Quality Analysis System - Deployment Guide

This guide provides step-by-step instructions for deploying the Egg Quality Analysis System.

## Prerequisites

- AWS CLI configured with appropriate credentials
- AWS SAM CLI installed
- Node.js 20.x or later
- esbuild installed globally (`npm install -g esbuild`)
- AWS account with access to:
  - Lambda
  - DynamoDB
  - S3
  - EventBridge
  - Amazon Bedrock (with Nova Pro model access)
  - CloudWatch

## Architecture Overview

The system consists of:
- **S3 Bucket**: Stores uploaded egg images
- **EventBridge Rule**: Triggers processing when images are uploaded
- **Image Processor Lambda**: Orchestrates analysis via Bedrock Agent
- **Bedrock Agent**: Analyzes images using Nova Pro model
- **Egg Data Tool Lambda**: Stores quality assessments in DynamoDB
- **DynamoDB Table**: Persists egg quality data
- **CloudWatch**: Monitoring and logging

## Deployment Steps

### Step 1: Install Dependencies

```bash
cd backend
npm install
npm install -g esbuild
```

### Step 2: Build the SAM Application

```bash
sam build
```

This will:
- Bundle Lambda functions using esbuild
- Install npm dependencies for each function
- Prepare the deployment package

### Step 3: Deploy Infrastructure

For first-time deployment:

```bash
sam deploy --guided
```

You'll be prompted for:
- **Stack Name**: e.g., `egg-quality-analysis`
- **AWS Region**: e.g., `us-east-1`
- **Confirm changes**: Y
- **Allow SAM CLI IAM role creation**: Y
- **Disable rollback**: N (recommended)
- **Save arguments to configuration file**: Y

For subsequent deployments:

```bash
sam deploy
```

### Step 4: Note the Outputs

After deployment, note these outputs:
- `ImageUploadBucketName`: S3 bucket for uploading egg images
- `TableName`: DynamoDB table name
- `ImageProcessorFunctionArn`: Image Processor Lambda ARN
- `EggDataToolFunctionArn`: Egg Data Tool Lambda ARN

### Step 5: Create and Configure Bedrock Agent

**IMPORTANT**: This step must be done manually via AWS Console.

Follow the detailed instructions in `BEDROCK_AGENT_SETUP.md`:

1. Create Bedrock Agent with Nova Pro model
2. Add agent instructions for egg quality analysis
3. Create action group with Egg Data Tool Lambda
4. Define tool schema
5. Create agent alias
6. Note the Agent ID and Alias ID

### Step 6: Update Lambda Environment Variables

After creating the Bedrock Agent:

1. Open `template.yaml`
2. Find the `ImageProcessorFunction` resource
3. Update environment variables:
   ```yaml
   Environment:
     Variables:
       BEDROCK_AGENT_ID: <your-agent-id>
       BEDROCK_AGENT_ALIAS_ID: <your-alias-id>
   ```
4. Redeploy:
   ```bash
   sam build && sam deploy
   ```

### Step 7: Test the System

#### Upload a Test Image

```bash
aws s3 cp test-egg-image.jpg s3://<ImageUploadBucketName>/
```

#### Check CloudWatch Logs

```bash
# Image Processor logs
aws logs tail /aws/lambda/<stack-name>-ImageProcessorFunction --follow

# Egg Data Tool logs
aws logs tail /aws/lambda/<stack-name>-EggDataToolFunction --follow
```

#### Query DynamoDB

```bash
aws dynamodb scan --table-name <TableName>
```

## Environment Variables

### Image Processor Lambda

- `BUCKET_NAME`: S3 bucket name (auto-configured)
- `TABLE_NAME`: DynamoDB table name (auto-configured)
- `BEDROCK_AGENT_ID`: Bedrock agent ID (manual configuration required)
- `BEDROCK_AGENT_ALIAS_ID`: Bedrock agent alias ID (manual configuration required)

### Egg Data Tool Lambda

- `TABLE_NAME`: DynamoDB table name (auto-configured)

## Monitoring

### CloudWatch Alarms

The deployment creates the following alarms:

1. **ImageProcessor-Errors**: Alerts when error count > 5 in 5 minutes
2. **ImageProcessor-Duration**: Alerts when duration > 4 minutes
3. **EggDataTool-Errors**: Alerts when error count > 5 in 5 minutes
4. **DynamoDB-Throttles**: Alerts on DynamoDB throttling

### CloudWatch Logs

All Lambda functions log to CloudWatch Logs:
- `/aws/lambda/<stack-name>-ImageProcessorFunction`
- `/aws/lambda/<stack-name>-EggDataToolFunction`

### X-Ray Tracing

X-Ray tracing is enabled for all Lambda functions. View traces in the AWS X-Ray console.

## Troubleshooting

### Build Fails with "Cannot find esbuild"

```bash
npm install -g esbuild
```

### Deployment Fails with IAM Permissions

Ensure your AWS credentials have permissions for:
- CloudFormation
- Lambda
- DynamoDB
- S3
- EventBridge
- IAM (for role creation)

### Image Processor Times Out

- Check Bedrock agent is properly configured
- Verify agent ID and alias ID are correct
- Check CloudWatch logs for detailed error messages
- Ensure Bedrock service is available in your region

### Egg Data Tool Fails to Write

- Check DynamoDB table exists
- Verify Lambda has DynamoDB write permissions
- Check CloudWatch logs for validation errors
- Ensure input data has all required fields

### EventBridge Not Triggering

- Verify S3 bucket has EventBridge notifications enabled
- Check EventBridge rule is in ENABLED state
- Ensure rule event pattern matches S3 events
- Verify Lambda has permission for EventBridge invocation

## Updating the Application

### Code Changes

1. Make code changes to Lambda functions
2. Build: `sam build`
3. Deploy: `sam deploy`

### Infrastructure Changes

1. Update `template.yaml`
2. Build: `sam build`
3. Deploy: `sam deploy`
4. Review changeset before confirming

## Cleanup

To delete all resources:

```bash
# Empty S3 bucket first
aws s3 rm s3://<ImageUploadBucketName> --recursive

# Delete stack
sam delete
```

**Note**: This will delete:
- All Lambda functions
- DynamoDB table and data
- S3 bucket
- EventBridge rules
- CloudWatch alarms
- IAM roles

The Bedrock Agent must be deleted manually via the AWS Console.

## Cost Considerations

### Estimated Monthly Costs (Low Usage)

- **Lambda**: ~$0.20 (1000 invocations)
- **DynamoDB**: ~$1.25 (on-demand, 1GB storage)
- **S3**: ~$0.50 (10GB storage, 1000 requests)
- **Bedrock**: Variable (based on Nova Pro usage)
- **CloudWatch**: ~$0.50 (logs and metrics)

**Total**: ~$2.50/month + Bedrock costs

### Cost Optimization

- Use DynamoDB on-demand billing for variable workloads
- Enable S3 lifecycle policies to archive old images
- Set CloudWatch log retention to 7-30 days
- Monitor Bedrock usage and optimize prompts

## Security Best Practices

1. **S3 Bucket**: Public access is blocked by default
2. **IAM Roles**: Follow least privilege principle
3. **Encryption**: Enable DynamoDB encryption at rest
4. **VPC**: Consider deploying Lambda in VPC for production
5. **Secrets**: Use AWS Secrets Manager for sensitive data
6. **API Gateway**: Add authentication if exposing via API

## Support

For issues or questions:
1. Check CloudWatch logs for error details
2. Review `BEDROCK_AGENT_SETUP.md` for agent configuration
3. Verify all prerequisites are met
4. Check AWS service quotas and limits

## Next Steps

After successful deployment:
1. Test with various egg images
2. Monitor CloudWatch metrics and logs
3. Adjust Bedrock agent instructions as needed
4. Implement frontend for image upload (optional)
5. Add API Gateway for programmatic access (optional)
