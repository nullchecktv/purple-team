import { BedrockAgentRuntimeClient, InvokeAgentCommand } from '@aws-sdk/client-bedrock-agent-runtime';
import { randomUUID } from 'crypto';

const bedrockClient = new BedrockAgentRuntimeClient({});

const BEDROCK_AGENT_ID = process.env.BEDROCK_AGENT_ID;
const BEDROCK_AGENT_ALIAS_ID = process.env.BEDROCK_AGENT_ALIAS_ID;
const BUCKET_NAME = process.env.BUCKET_NAME;
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

    // Invoke Bedrock agent with retry logic
    const agentResponse = await invokeAgentWithRetry(bucketName, objectKey);

    // Parse agent response
    const processingTimeMs = Date.now() - startTime;
    
    console.log('Agent invocation successful');
    console.log(`Processing completed in ${processingTimeMs}ms`);

    return {
      imageKey: objectKey,
      eggsAnalyzed: agentResponse.eggsAnalyzed || 0,
      recordsStored: agentResponse.recordsStored || 0,
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

async function invokeAgentWithRetry(bucketName, objectKey) {
  let lastError;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      console.log(`Agent invocation attempt ${attempt + 1}/${MAX_RETRIES}`);

      const sessionId = randomUUID();
      const s3Location = `s3://${bucketName}/${objectKey}`;
      
      const inputText = `Analyze the egg image at ${s3Location}. Identify all eggs in the image, assess their quality across all 11 dimensions, and store the data using the create_egg_data tool with imageKey "${objectKey}".`;

      const command = new InvokeAgentCommand({
        agentId: BEDROCK_AGENT_ID,
        agentAliasId: BEDROCK_AGENT_ALIAS_ID,
        sessionId,
        inputText
      });

      const response = await bedrockClient.send(command);

      // Process the streaming response
      let completion = '';
      let eggsAnalyzed = 0;
      let recordsStored = 0;

      if (response.completion) {
        for await (const event of response.completion) {
          if (event.chunk?.bytes) {
            const text = new TextDecoder().decode(event.chunk.bytes);
            completion += text;
          }

          // Check for tool invocation results
          if (event.trace?.trace?.orchestrationTrace?.observation?.actionGroupInvocationOutput) {
            const output = event.trace.trace.orchestrationTrace.observation.actionGroupInvocationOutput;
            console.log('Tool invocation output:', JSON.stringify(output));
            
            // Parse tool response to get counts
            if (output.text) {
              try {
                const toolResult = JSON.parse(output.text);
                if (toolResult.recordsStored) {
                  recordsStored = toolResult.recordsStored;
                  eggsAnalyzed = toolResult.recordsStored;
                }
              } catch (e) {
                console.warn('Could not parse tool output:', e);
              }
            }
          }
        }
      }

      console.log('Agent completion:', completion);

      return {
        completion,
        eggsAnalyzed,
        recordsStored
      };

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

  throw new Error(`Agent invocation failed after ${MAX_RETRIES} attempts: ${lastError.message}`);
}
