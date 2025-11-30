# Bedrock Agent Setup Guide

This guide walks through creating and configuring the Bedrock Agent for egg quality analysis.

## Prerequisites

- AWS Account with Bedrock access
- Amazon Nova Pro model access enabled in your region
- Egg Data Tool Lambda function deployed

## Step 1: Create Bedrock Agent

1. Navigate to Amazon Bedrock console
2. Go to "Agents" section
3. Click "Create Agent"
4. Configure basic settings:
   - **Agent name**: `egg-quality-analyzer`
   - **Description**: `Analyzes egg images and stores quality assessments`
   - **Model**: Select `Amazon Nova Pro`

## Step 2: Configure Agent Instructions

Add the following instructions to the agent:

```
You are an expert egg quality analyst. When given an image of eggs:

1. Identify each individual egg in the image
2. For each egg, assess the following quality dimensions:
   - Color: Describe the shell color (white, brown, cream, speckled, etc.)
   - Shape: Classify as (round, oval, elongated, irregular)
   - Size: Categorize as (small, medium, large, extra-large, jumbo)
   - Shell Texture: Describe surface texture (smooth, rough, pitted, bumpy)
   - Shell Integrity: Assess structural soundness (intact, hairline-crack, cracked, broken)
   - Hardness: Indicate shell strength (hard, normal, soft, thin)
   - Spot Markings: Identify spots (none, light, moderate, heavy)
   - Bloom Condition: Assess protective coating (excellent, good, fair, poor, removed)
   - Cleanliness: Rate cleanliness (clean, slightly-dirty, dirty, very-dirty)
   - Visible Defects: List any defects (none, stains, blood-spots, meat-spots, deformities)
   - Overall Grade: Assign grade (AA, A, B, C, reject)

3. Use the create_egg_data tool to store all egg assessments
4. Return a summary of the analysis

Be thorough and consistent in your assessments.
```

## Step 3: Create Action Group

1. In the agent configuration, go to "Action groups"
2. Click "Add action group"
3. Configure:
   - **Action group name**: `egg-data-storage`
   - **Description**: `Stores egg quality data in DynamoDB`
   - **Action group type**: Select "Define with function details"

## Step 4: Define Tool Schema

Add the following tool definition:

**Tool Name**: `create_egg_data`

**Description**: `Stores egg quality assessment data for multiple eggs in DynamoDB`

**Parameters**:

```json
{
  "eggs": {
    "type": "array",
    "description": "Array of egg quality assessment records",
    "required": true,
    "items": {
      "type": "object",
      "properties": {
        "color": {
          "type": "string",
          "description": "Shell color",
          "required": true
        },
        "shape": {
          "type": "string",
          "description": "Egg shape classification",
          "required": true
        },
        "size": {
          "type": "string",
          "description": "Size category",
          "required": true
        },
        "shellTexture": {
          "type": "string",
          "description": "Surface texture",
          "required": true
        },
        "shellIntegrity": {
          "type": "string",
          "description": "Structural soundness",
          "required": true
        },
        "hardness": {
          "type": "string",
          "description": "Shell strength",
          "required": true
        },
        "spotMarkings": {
          "type": "string",
          "description": "Spot presence and severity",
          "required": true
        },
        "bloomCondition": {
          "type": "string",
          "description": "Protective coating status",
          "required": true
        },
        "cleanliness": {
          "type": "string",
          "description": "Cleanliness level",
          "required": true
        },
        "visibleDefects": {
          "type": "string",
          "description": "Any visible defects",
          "required": true
        },
        "overallGrade": {
          "type": "string",
          "description": "Quality grade",
          "required": true
        }
      }
    }
  },
  "imageKey": {
    "type": "string",
    "description": "S3 object key of the source image",
    "required": true
  }
}
```

## Step 5: Link Lambda Function

1. In the action group configuration, select "Select an existing Lambda function"
2. Choose the `EggDataToolFunction` from your deployed stack
3. Grant Bedrock permission to invoke the Lambda function

## Step 6: Create Agent Alias

1. After configuring the agent, click "Prepare"
2. Once prepared, go to "Aliases"
3. Click "Create alias"
4. Configure:
   - **Alias name**: `production`
   - **Description**: `Production version of egg quality analyzer`
5. Note the **Agent ID** and **Alias ID** - you'll need these for the Image Processor Lambda

## Step 7: Update Lambda Environment Variables

After creating the agent and alias, update the SAM template with the actual IDs:

1. Open `backend/template.yaml`
2. Find the `ImageProcessorFunction` resource
3. Update the environment variables:
   ```yaml
   Environment:
     Variables:
       BEDROCK_AGENT_ID: <your-agent-id>
       BEDROCK_AGENT_ALIAS_ID: <your-alias-id>
   ```
4. Redeploy: `sam build && sam deploy`

## Testing the Agent

You can test the agent directly in the Bedrock console:

1. Go to your agent in the Bedrock console
2. Click "Test" in the top right
3. Upload a test egg image
4. Ask: "Analyze this egg image and store the quality data"
5. Verify the agent:
   - Identifies eggs in the image
   - Assesses all 11 quality dimensions
   - Calls the create_egg_data tool
   - Returns a summary

## Troubleshooting

**Agent doesn't see the image:**
- Ensure the image is uploaded in the test interface
- Try rephrasing: "What do you see in this image?"

**Tool invocation fails:**
- Check Lambda function logs in CloudWatch
- Verify Lambda has DynamoDB permissions
- Ensure tool schema matches Lambda input format

**Agent doesn't call the tool:**
- Review agent instructions
- Make sure to explicitly ask it to "store" or "save" the data
- Check that the tool is properly linked in the action group

## Next Steps

Once the agent is configured and tested:
1. Note the Agent ID and Alias ID
2. Update the SAM template environment variables
3. Proceed to implement the Image Processor Lambda (Task 4)
