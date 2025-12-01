import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';

const bedrock = new BedrockRuntimeClient({});
const s3 = new S3Client({});
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const TABLE_NAME = process.env.TABLE_NAME;
const BUCKET_NAME = process.env.BUCKET_NAME;
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

export const handler = async (event) => {
  for (const record of event.Records) {
    const eggRecord = JSON.parse(record.body);
    const { pk, sk, hatchLikelihood, predictedChickBreed, chickenAppearance } = eggRecord;
    const eggId = sk.replace('EGG#', '');

    // Skip if hatchLikelihood < 70
    if (hatchLikelihood < 70) {
      console.log(`Skipping egg ${eggId} - hatchLikelihood ${hatchLikelihood} < 70`);
      continue;
    }

    // Skip if already has both media (prevent reprocessing)
    if (eggRecord.chickImageUrl && eggRecord.chickMusicUrl) {
      console.log(`Skipping egg ${eggId} - already has both chickImageUrl and chickMusicUrl`);
      continue;
    }

    console.log(`Generating chick media for egg ${eggId} with hatchLikelihood ${hatchLikelihood}`);

    try {
      const appearance = chickenAppearance || {};
      let imageS3Uri = eggRecord.chickImageUrl;
      let musicS3Uri = eggRecord.chickMusicUrl;

      // Generate image if not already present
      if (!imageS3Uri) {
        const imagePrompt = buildImagePrompt(predictedChickBreed, appearance);
        const imageBase64 = await generateImage(imagePrompt);
        const imageS3Key = `chicks/${pk}/${eggId}.png`;
        await uploadImageToS3(imageS3Key, imageBase64);
        imageS3Uri = `s3://${BUCKET_NAME}/${imageS3Key}`;
        console.log(`Uploaded chick image to ${imageS3Uri}`);
      }

      // Generate music if not already present
      if (!musicS3Uri) {
        const musicDescription = buildMusicDescription(predictedChickBreed, appearance);
        const musicBuffer = await generateMusic(musicDescription);
        const musicS3Key = `chicks/${pk}/${eggId}.mp3`;
        await uploadMusicToS3(musicS3Key, musicBuffer);
        musicS3Uri = `s3://${BUCKET_NAME}/${musicS3Key}`;
        console.log(`Uploaded chick music to ${musicS3Uri}`);
      }

      // Update DynamoDB record with both URLs
      await updateRecord(pk, sk, imageS3Uri, musicS3Uri);
      console.log(`Updated egg record ${eggId} with chickImageUrl and chickMusicUrl`);

    } catch (err) {
      console.error(`Error generating chick media for ${eggId}:`, err);
      throw err; // Let SQS retry
    }
  }

  return { statusCode: 200 };
};


function buildImagePrompt(breed, appearance) {
  const plumage = appearance.plumageColor || 'yellow';
  const comb = appearance.combType || 'single';
  const body = appearance.bodyType || 'medium';
  const pattern = appearance.featherPattern || 'solid';
  const legs = appearance.legColor || 'yellow';

  return `A photorealistic image of a cute baby chick, ${breed || 'mixed breed'} breed. ` +
    `The chick has ${plumage} downy feathers, a small ${comb} comb beginning to form, ` +
    `${body} body proportions, ${pattern} feather pattern emerging, and ${legs} legs. ` +
    `The chick is standing on clean straw in a warm brooder with soft lighting. ` +
    `Professional poultry photography style, high detail, adorable expression.`;
}

function buildMusicDescription(breed, appearance) {
  const plumage = appearance.plumageColor || 'yellow';
  const comb = appearance.combType || 'single';
  const body = appearance.bodyType || 'medium';
  const pattern = appearance.featherPattern || 'solid';
  const legs = appearance.legColor || 'yellow';

  return `A cheerful and playful melody for a baby ${breed || 'mixed breed'} chick. ` +
    `The music should reflect the ${body} nature and ${plumage} personality of this breed. ` +
    `${pattern} rhythmic patterns with a ${comb} melodic structure. ` +
    `Warm, nurturing tones suitable for a farm setting with gentle ${legs} undertones.`;
}

async function generateImage(prompt) {
  const response = await bedrock.send(new InvokeModelCommand({
    modelId: 'amazon.nova-canvas-v1:0',
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({
      taskType: 'TEXT_IMAGE',
      textToImageParams: {
        text: prompt
      },
      imageGenerationConfig: {
        numberOfImages: 1,
        width: 1024,
        height: 1024,
        quality: 'standard'
      }
    })
  }));

  const result = JSON.parse(new TextDecoder().decode(response.body));
  return result.images[0]; // Base64 encoded image
}

async function generateMusic(description) {
  const response = await fetch('https://api.elevenlabs.io/v1/sound-generation', {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': ELEVENLABS_API_KEY
    },
    body: JSON.stringify({
      text: description,
      duration_seconds: 15,
      prompt_influence: 0.3
    })
  });

  if (!response.ok) {
    throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
  }

  return Buffer.from(await response.arrayBuffer());
}

async function uploadImageToS3(key, base64Image) {
  const buffer = Buffer.from(base64Image, 'base64');

  await s3.send(new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: 'image/png'
  }));
}

async function uploadMusicToS3(key, musicBuffer) {
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: musicBuffer,
    ContentType: 'audio/mpeg'
  }));
}

async function updateRecord(pk, sk, imageS3Uri, musicS3Uri) {
  await ddb.send(new UpdateCommand({
    TableName: TABLE_NAME,
    Key: { pk, sk },
    UpdateExpression: 'SET chickImageUrl = :imageUrl, chickMusicUrl = :musicUrl, mediaGeneratedAt = :ts',
    ExpressionAttributeValues: {
      ':imageUrl': imageS3Uri,
      ':musicUrl': musicS3Uri,
      ':ts': new Date().toISOString()
    }
  }));
}
