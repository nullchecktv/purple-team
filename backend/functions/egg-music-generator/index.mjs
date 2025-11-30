// EggMusicGenerator Lambda Handler
// Transforms egg analysis data into unique musical compositions

import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { ElevenLabsClient, save } from '@elevenlabs/elevenlabs-js';
import { readFileSync } from 'fs';


// Initialize clients
const bedrockClient = new BedrockRuntimeClient({ region: process.env.AWS_REGION || 'us-east-1' });
const s3Client = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });
const ddbClient = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

// Initialize ElevenLabs client
const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY
});

/**
 * Construct Bedrock prompt from egg attributes
 * @param {Object} eggAttributes - Egg attributes object
 * @returns {string} Formatted prompt for Bedrock
 */
function constructBedrockPrompt(eggAttributes) {
  console.log('Constructing Bedrock prompt');
  
  const prompt = `You are a creative music composer. Based on the following egg characteristics, generate a unique 15-second music composition prompt for the ElevenLabs Music API.


Generate a SINGLE TEXT OUTPUT in this EXACT format:
"Generate a song with this style: [style description]. The lyrics are: [lyrics]"

Style description should include: genre, instruments, tempo, and atmosphere in a few sentences.
Lyrics MUST be positive and encouraging, with line breaks indicated by \\n characters.

Examples:
- "Generate a song with this style: Ambient lullaby, female vocal, soft acoustic guitar picking, slow tempo, warm and reassuring. The lyrics are: Little heart beat slow and steady,\\nTake your time, you are not ready."
- "Generate a song with this style: Upbeat indie pop, male vocal, sunny melody, rhythmic clapping, major key, motivational. The lyrics are: Tap tap tap on the calcium wall,\\nYou're gonna be the biggest bird of all."
- "Generate a song with this style: Epic cinematic soundtrack, powerful choir vocals, rising orchestral strings, deep war drums. The lyrics are: Fight the darkness, break the night,\\nReach toward the morning light."
- "Generate a song with this style: Slow jazz ballad, deep baritone vocal, smooth saxophone, brushed drums, relaxed atmosphere. The lyrics are: Not yet, my friend, just wait a while,\\nStay inside with a sleepy smile."

Make the music style and lyrics reflect the egg's characteristics creatively:
- Pristine white eggs → clean, classical music with hopeful lyrics
- Speckled brown eggs → folk or country music with warm, encouraging lyrics
- High hatch likelihood → uplifting, motivational music with positive lyrics
- Excellent grade → triumphant, celebratory music

Respond with ONLY the single text output. Do not include any other text or formatting.`;

  return prompt;
}

/**
 * Parse egg attributes from EventBridge event
 * @param {Object} event - EventBridge event
 * @returns {Object} Egg attributes object
 */
function parseEggAttributes(event) {
  console.log('Parsing egg attributes from event');
  
  const detail = event.detail || {};
  
  return {
    color: detail.color,
    shape: detail.shape,
    size: detail.size,
    shellTexture: detail.shellTexture,
    shellIntegrity: detail.shellIntegrity,
    hardness: detail.hardness,
    spotsMarkings: detail.spotsMarkings,
    bloomCondition: detail.bloomCondition,
    cleanliness: detail.cleanliness,
    visibleDefects: detail.visibleDefects || [],
    overallGrade: detail.overallGrade,
    hatchLikelihood: detail.hatchLikelihood,
    possibleBreeds: detail.possibleBreeds || [],
    breedConfidence: detail.breedConfidence,
    chickenAppearance: detail.chickenAppearance || {},
    notes: detail.notes || ''
  };
}

/**
 * Validate required egg attributes
 * @param {Object} eggAttributes - Egg attributes object
 * @returns {Object} Validation result with isValid and missingFields
 */
function validateEggAttributes(eggAttributes) {
  console.log('Validating egg attributes');
  
  const requiredFields = [
    'color',
    'shape',
    'size',
    'shellTexture',
    'shellIntegrity',
    'hardness',
    'spotsMarkings',
    'bloomCondition',
    'cleanliness',
    'overallGrade'
  ];
  
  const missingFields = requiredFields.filter(field => {
    const value = eggAttributes[field];
    return value === undefined || value === null || value === '';
  });
  
  if (missingFields.length > 0) {
    console.error('Validation failed. Missing fields:', missingFields);
    return {
      isValid: false,
      missingFields
    };
  }
  
  console.log('Validation passed');
  return {
    isValid: true,
    missingFields: []
  };
}

/**
 * Invoke Bedrock to generate music prompt
 * @param {Object} eggAttributes - Egg attributes object
 * @returns {Promise<string>} FULL_PROMPT for ElevenLabs
 */
async function generateMusicPromptWithBedrock(eggAttributes) {
  console.log('Invoking Bedrock for music prompt generation');
  
  try {
    const prompt = constructBedrockPrompt(eggAttributes);
    const modelId = process.env.BEDROCK_MODEL_ID || 'us.amazon.nova-lite-v1:0';
    
    const requestBody = {
      messages: [{
        role: 'user',
        content: [{ text: prompt }]
      }],
      inferenceConfig: {
        max_new_tokens: 500,
        temperature: 0.8
      }
    };
    
    const command = new InvokeModelCommand({
      modelId,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(requestBody)
    });
    
    console.log('Sending request to Bedrock');
    const response = await bedrockClient.send(command);
    
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    console.log('Bedrock response received');
    console.log(responseBody);

    const formattedResponse = JSON.stringify(responseBody, null, 2);
    console.log(formattedResponse);
    
    const contentArray = responseBody.output.message.content;
    const fullPrompt = contentArray[0].text.trim();

    // const fullPrompt = responseBody.content[0].text.trim();
    
    // Validate response format
    if (!fullPrompt.includes('Generate a song with this style:') || !fullPrompt.includes('The lyrics are:')) {
      throw new Error('Bedrock response does not match expected format');
    }
    
    console.log('FULL_PROMPT generated successfully');
    return fullPrompt;
    
  } catch (error) {
    console.error('Bedrock invocation failed:', error);
    throw new Error(`Bedrock invocation failed: ${error.message}`);
  }
}

/**
 * Generate music using ElevenLabs API
 * @param {string} fullPrompt - Complete music prompt
 * @returns {Promise<Buffer>} MP3 audio data
 */
async function generateMusicWithElevenLabs(fullPrompt) {
  console.log('🎵 Step 1: Calling ElevenLabs Music API via SDK');
  
  try {
    if (!process.env.ELEVENLABS_API_KEY) {
      throw new Error('ELEVENLABS_API_KEY environment variable not set');
    }
    
    console.log('🎵 Step 2: Composing music with prompt:', fullPrompt.substring(0, 100) + '...');
    
    // Use the ElevenLabs SDK to compose music
    const track = await elevenlabs.music.compose({
      prompt: fullPrompt,
      musicLengthMs: 15000  // 15 seconds
    });
    
    console.log('✅ Step 3: ElevenLabs music composition successful');
    
    // Generate random filename
    const randomId = Math.random().toString(36).substring(7);
    const filename = `egg-music-${Date.now()}-${randomId}.mp3`;
    const tempFilePath = `/tmp/${filename}`;
    
    console.log('💾 Step 4: Saving track to Lambda temp directory:', tempFilePath);
    
    // Save the track to Lambda's /tmp directory
    await save(track, tempFilePath);
    
    console.log('✅ Step 5: Track saved successfully to:', tempFilePath);
    
    // Return the file path
    return tempFilePath;
    
  } catch (error) {
    console.error('❌ ElevenLabs music composition failed:', error);
    
    // Better error messages
    if (error.message?.includes('401') || error.message?.includes('authentication')) {
      throw new Error('ElevenLabs authentication failed - Check API Key');
    } else if (error.message?.includes('429') || error.message?.includes('rate limit')) {
      throw new Error('Rate limit exceeded');
    } else {
      throw new Error(`Music generation failed: ${error.message}`);
    }
  }
}

/**
 * Upload MP3 to S3 with public access
 * @param {string} tempFilePath - Path to MP3 file in /tmp
 * @param {string} eggId - Unique egg identifier
 * @returns {Promise<Object>} Object with key and publicUrl
 */
async function uploadToS3(tempFilePath, eggId) {
  console.log('📤 Step 1: Starting S3 upload from:', tempFilePath);
  
  try {
    const bucketName = process.env.S3_BUCKET_NAME;
    if (!bucketName) {
      throw new Error('S3_BUCKET_NAME environment variable not set');
    }
    
    console.log('📤 Step 2: Reading file from temp path');
    const fileBuffer = readFileSync(tempFilePath);
    console.log('📤 Step 3: File read successfully, size:', fileBuffer.length, 'bytes');
    
    const timestamp = Date.now();
    const key = `music/${timestamp}-${eggId}.mp3`;
    
    console.log('📤 Step 4: Uploading to S3 bucket:', bucketName, 'key:', key);
    
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: fileBuffer,
      ContentType: 'audio/mpeg',
      ACL: 'public-read'
    });
    
    await s3Client.send(command);
    console.log('✅ Step 5: S3 upload successful:', key);
    
    const region = process.env.AWS_REGION || 'us-east-1';
    const publicUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
    
    console.log('✅ Step 6: Public URL generated:', publicUrl);
    
    return { key, publicUrl };
    
  } catch (error) {
    console.error('❌ S3 upload failed:', error);
    
    if (error.name === 'NoSuchBucket') {
      throw new Error('S3 bucket not configured');
    } else if (error.name === 'AccessDenied') {
      throw new Error('S3 permission error');
    } else {
      throw new Error(`Failed to upload to S3: ${error.message}`);
    }
  }
}

/**
 * Store music metadata in DynamoDB
 * @param {string} eggId - Unique egg identifier
 * @param {string} musicUrl - Public URL of the music file
 * @param {Object} eggAttributes - Egg attributes
 * @param {string} fullPrompt - Complete music prompt
 * @returns {Promise<string>} Record ID (pk value)
 */
async function storeMetadataInDynamoDB(eggId, musicUrl, eggAttributes, fullPrompt) {
  console.log('Storing metadata in DynamoDB');
  
  try {
    const tableName = process.env.TABLE_NAME;
    if (!tableName) {
      throw new Error('TABLE_NAME environment variable not set');
    }
    
    const timestamp = new Date().toISOString();
    const pk = `EGG#${eggId}`;
    const sk = 'MUSIC';
    const bedrockModel = process.env.BEDROCK_MODEL_ID || 'us.amazon.nova-lite-v1:0';
    
    const item = {
      pk,
      sk,
      musicUrl,
      timestamp,
      eggAttributes,
      metadata: {
        bedrockModel,
        fullPrompt,
        generatedAt: timestamp
      }
    };
    
    const command = new PutCommand({
      TableName: tableName,
      Item: item
    });
    
    await ddbDocClient.send(command);
    console.log('DynamoDB write successful:', pk);
    
    return pk;
    
  } catch (error) {
    console.error('DynamoDB write failed:', error);
    
    if (error.name === 'ResourceNotFoundException') {
      throw new Error('DynamoDB table not configured');
    } else if (error.name === 'ProvisionedThroughputExceededException') {
      throw new Error('DynamoDB throttling');
    } else {
      throw new Error(`Failed to store metadata: ${error.message}`);
    }
  }
}

export const handler = async (event) => {
  console.log('EggMusicGenerator invoked', JSON.stringify(event, null, 2));
  
  try {
    // Step 1: Parse egg attributes from event
    const eggAttributes = parseEggAttributes(event);
    console.log('Egg attributes parsed:', JSON.stringify(eggAttributes, null, 2));
    
    // Step 2: Validate required attributes
    // const validation = validateEggAttributes(eggAttributes);
    // if (!validation.isValid) {
    //   console.error('Validation failed:', validation.missingFields);
    //   return {
    //     statusCode: 400,
    //     body: JSON.stringify({
    //       success: false,
    //       error: 'ValidationError',
    //       message: `Missing required fields: ${validation.missingFields.join(', ')}`
    //     })
    //   };
    // }
    
    // Step 3: Generate music prompt with Bedrock
    const fullPrompt = await generateMusicPromptWithBedrock(eggAttributes);
    console.log('Music prompt generated:', fullPrompt);
    
    // Step 4: Generate music with ElevenLabs (saves to /tmp and returns file path)
    const tempFilePath = await generateMusicWithElevenLabs(fullPrompt);
    console.log('✅ Music generated and saved to temp file:', tempFilePath);
    
    // Step 5: Upload to S3 from temp file
    const eggId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const { publicUrl } = await uploadToS3(tempFilePath, eggId);
    console.log('✅ Music uploaded to S3:', publicUrl);
    
    // Step 6: Store metadata in DynamoDB
    const recordId = await storeMetadataInDynamoDB(eggId, publicUrl, eggAttributes, fullPrompt);
    console.log('Metadata stored in DynamoDB:', recordId);
    
    // Step 7: Return success response
    const timestamp = new Date().toISOString();
    const bedrockModel = process.env.BEDROCK_MODEL_ID || 'us.amazon.nova-lite-v1:0';
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        recordId,
        musicUrl: publicUrl,
        eggAttributes,
        metadata: {
          timestamp,
          bedrockModel,
          fullPrompt
        }
      })
    };
    
  } catch (error) {
    console.error('Error in EggMusicGenerator:', error);
    
    // Determine appropriate status code
    let statusCode = 500;
    if (error.message.includes('Rate limit exceeded')) {
      statusCode = 429;
    } else if (error.message.includes('authentication failed')) {
      statusCode = 500;
    }
    
    return {
      statusCode,
      body: JSON.stringify({
        success: false,
        error: error.name || 'InternalError',
        message: error.message
      })
    };
  }
};
