import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';

const bedrockClient = new BedrockRuntimeClient({});
const s3Client = new S3Client({});
const lambdaClient = new LambdaClient({});

const EGG_DATA_TOOL_FUNCTION = process.env.EGG_DATA_TOOL_FUNCTION;
const MODEL_ID = 'us.amazon.nova-pro-v1:0';
const MAX_RETRIES = 3;
const SUPPORTED_FORMATS = ['jpg', 'jpeg', 'png', 'tiff'];

export const handler = async (event) => {
  const startTime = Date.now();
  
  try {
    console.log('Image Processor invoked');

    // Extract S3 location from EventBridge event
    const bucketName = event.detail?.bucket?.name;
    const objectKey = event.detail?.object?.key;

    if (!bucketName || !objectKey) {
      console.error('Invalid event structure:', JSON.stringify(event));
      throw new Error('Missing bucket name or object key in event');
    }

    console.log(`Processing image: s3://${bucketName}/${objectKey}`);

    // Validate image format
    const fileExtension = objectKey.split('.').pop()?.toLowerCase();
    if (!SUPPORTED_FORMATS.includes(fileExtension)) {
      console.warn(`Unsupported file format: ${fileExtension}`);
      return {
        imageKey: objectKey,
        eggsAnalyzed: 0,
        recordsStored: 0,
        processingTimeMs: Date.now() - startTime,
        status: 'failed',
        errors: [`Unsupported file format: ${fileExtension}. Supported formats: ${SUPPORTED_FORMATS.join(', ')}`]
      };
    }

    // Get image from S3
    const imageData = await getImageFromS3(bucketName, objectKey);

    // Analyze image with Bedrock Converse API using tool calling
    const result = await analyzeImageWithToolCalling(imageData, fileExtension, objectKey);

    const processingTimeMs = Date.now() - startTime;
    
    console.log('Image analysis and storage successful');
    console.log(`Processing completed in ${processingTimeMs}ms`);

    return {
      imageKey: objectKey,
      eggsAnalyzed: result.recordsStored || 0,
      recordsStored: result.recordsStored || 0,
      processingTimeMs,
      status: 'success'
    };

  } catch (err) {
    console.error('Error in Image Processor:', err);
    
    const processingTimeMs = Date.now() - startTime;
    
    return {
      imageKey: event.detail?.object?.key || 'unknown',
      eggsAnalyzed: 0,
      recordsStored: 0,
      processingTimeMs,
      status: 'failed',
      errors: [err.message]
    };
  }
};

async function getImageFromS3(bucketName, objectKey) {
  console.log(`Fetching image from S3: ${bucketName}/${objectKey}`);
  
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: objectKey
  });

  const response = await s3Client.send(command);
  const imageBytes = await response.Body.transformToByteArray();
  
  console.log(`Image fetched: ${imageBytes.length} bytes`);
  return imageBytes;
}

const eggDataToolSpec = {
  toolSpec: {
    name: 'store_egg_data',
    description: 'Store analyzed egg data to the database. Call this tool after analyzing all eggs in the image with their quality assessments.',
    inputSchema: {
      json: {
        type: 'object',
        properties: {
          eggs: {
            type: 'array',
            description: 'Array of egg analysis objects',
            items: {
              type: 'object',
              properties: {
                color: { type: 'string', description: 'Shell color (e.g., white, brown, cream, speckled brown, blue-green)' },
                shape: { type: 'string', description: 'Egg shape (e.g., oval, round, elongated, pointed, asymmetric)' },
                size: { type: 'string', description: 'Egg size (e.g., small, medium, large, extra-large, jumbo)' },
                shellTexture: { type: 'string', description: 'Shell texture (e.g., smooth, rough, porous, bumpy, wrinkled)' },
                shellIntegrity: { type: 'string', description: 'Shell condition (e.g., intact, hairline crack, cracked, chipped, broken)' },
                hardness: { type: 'string', description: 'Shell hardness (e.g., hard, normal, soft, thin, rubbery)' },
                spotMarkings: { type: 'string', description: 'Spots or markings (e.g., none, light speckles, heavy speckles, calcium deposits)' },
                bloomCondition: { type: 'string', description: 'Bloom status (e.g., present, partial, absent, washed off)' },
                cleanliness: { type: 'string', description: 'Cleanliness level (e.g., clean, slightly dirty, dirty, debris attached)' },
                visibleDefects: { type: 'array', items: { type: 'string' }, description: 'Array of visible defects' },
                overallGrade: { type: 'string', description: 'Quality grade (A, B, C, or non-viable)' },
                notes: { type: 'string', description: 'Additional observations' }
              },
              required: ['color', 'shape', 'size', 'shellTexture', 'shellIntegrity', 'hardness', 'spotMarkings', 'bloomCondition', 'cleanliness', 'visibleDefects', 'overallGrade']
            }
          }
        },
        required: ['eggs']
      }
    }
  }
};

async function analyzeImageWithToolCalling(imageBytes, format, imageKey) {
  let lastError;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      console.log(`Bedrock analysis attempt ${attempt + 1}/${MAX_RETRIES}`);

      const messages = [
        {
          role: 'user',
          content: [
            {
              image: {
                format: format === 'jpg' ? 'jpeg' : format,
                source: { bytes: imageBytes }
              }
            },
            {
              text: `Analyze this egg image carefully. Identify all eggs visible and assess each one across these quality dimensions: color, shape, size, shell texture, shell integrity, hardness, spot markings, bloom condition, cleanliness, visible defects, overall grade, and any additional notes. Then use the store_egg_data tool to save the results.`
            }
          ]
        }
      ];

      let conversationComplete = false;
      let toolResult = null;

      while (!conversationComplete) {
        const command = new ConverseCommand({
          modelId: MODEL_ID,
          messages,
          toolConfig: { tools: [eggDataToolSpec] },
          inferenceConfig: {
            maxTokens: 4096,
            temperature: 0.3
          }
        });

        const response = await bedrockClient.send(command);
        const { stopReason, output } = response;

        console.log(`Stop reason: ${stopReason}`);

        if (stopReason === 'tool_use') {
          // Extract tool use from response
          const toolUse = output.message.content.find(c => c.toolUse);
          
          if (toolUse) {
            console.log(`Tool called: ${toolUse.toolUse.name}`);
            console.log(`Tool input: ${JSON.stringify(toolUse.toolUse.input).substring(0, 200)}...`);

            // Execute the tool (call eggDataTool Lambda)
            toolResult = await executeEggDataTool(toolUse.toolUse.input, imageKey);

            // Add assistant message and tool result to conversation
            messages.push(output.message);
            messages.push({
              role: 'user',
              content: [
                {
                  toolResult: {
                    toolUseId: toolUse.toolUse.toolUseId,
                    content: [{ json: toolResult }]
                  }
                }
              ]
            });
          }
        } else {
          conversationComplete = true;
        }
      }

      if (!toolResult) {
        throw new Error('Model did not call the store_egg_data tool');
      }

      console.log(`Analysis complete: ${toolResult.recordsStored} eggs stored`);
      return toolResult;

    } catch (err) {
      lastError = err;
      console.error(`Attempt ${attempt + 1} failed:`, err);

      if (attempt < MAX_RETRIES - 1) {
        const backoffMs = Math.pow(2, attempt) * 1000;
        console.log(`Retrying in ${backoffMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, backoffMs));
      }
    }
  }

  throw new Error(`Bedrock analysis failed after ${MAX_RETRIES} attempts: ${lastError.message}`);
}

async function executeEggDataTool(input, imageKey) {
  console.log(`Executing eggDataTool with ${input.eggs?.length || 0} eggs`);

  const payload = {
    eggs: input.eggs,
    imageKey
  };

  const command = new InvokeCommand({
    FunctionName: EGG_DATA_TOOL_FUNCTION,
    InvocationType: 'RequestResponse',
    Payload: JSON.stringify(payload)
  });

  const response = await lambdaClient.send(command);
  const result = JSON.parse(new TextDecoder().decode(response.Payload));

  if (!result.success) {
    console.error('eggDataTool failed:', result.errors);
    throw new Error(`Failed to store egg data: ${result.errors?.join(', ')}`);
  }

  console.log(`Successfully stored ${result.recordsStored} records`);
  return result;
}
