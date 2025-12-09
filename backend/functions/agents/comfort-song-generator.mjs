import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { DynamoDBClient, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';

const s3 = new S3Client();
const ddb = new DynamoDBClient();
const eventBridge = new EventBridgeClient();

export const handler = async (event) => {
  for (const record of event.Records) {
    const eggRecord = JSON.parse(record.body);
    const { pk, sk, hatchLikelihood } = eggRecord;
    const eggId = sk.replace('EGG#', '');
    const clutchId = pk.replace('CLUTCH#', '');

    console.log(`Processing non-viable egg ${eggId} with hatchLikelihood ${hatchLikelihood}`);

    try {
      // If no API key is configured, skip processing
      if (!process.env.ELEVENLABS_API_KEY || process.env.ELEVENLABS_API_KEY.trim() === '') {
        console.log(`No ElevenLabs API key configured, skipping comfort song generation for egg ${eggId}`);
        continue;
      }

      // Build comfort song prompt from egg characteristics
      const prompt = buildSongPrompt(eggRecord);
      console.log(`Generated prompt for egg ${eggId}: ${prompt}`);

      // Generate music using ElevenLabs API
      const audioBuffer = await generateMusic(prompt);

      if (audioBuffer) {
        // Upload MP3 to S3
        const s3Key = `${clutchId}/songs/${eggId}.mp3`;
        await uploadToS3(s3Key, audioBuffer);
        console.log(`Uploaded comfort song to s3://${process.env.BUCKET_NAME}/${s3Key}`);

        // Update DynamoDB record
        await updateEggRecord(pk, sk, s3Key, prompt);
        console.log(`Updated egg record ${eggId} with comfort song`);
      }

    } catch (err) {
      console.error(`Error processing comfort song for ${eggId}:`, err);
      throw err;
    } finally {
      // Always publish completion event
      await publishEggProcessingCompleted(clutchId, eggId);
      console.log(`Published Egg Processing Completed event for clutch ${clutchId}`);
    }
  }

  return { statusCode: 200 };
};

function buildSongPrompt(eggRecord) {
  const { color, predictedChickBreed, chickenAppearance } = eggRecord;

  const breed = predictedChickBreed || 'special';
  const eggColor = color || 'beautiful';
  const plumage = chickenAppearance?.plumageColor || 'colorful';

  return `An uplifting, positive comfort song celebrating a ${eggColor} ${breed} egg with ${plumage} heritage. Warm, encouraging, and hopeful melody.`;
}

async function generateMusic(prompt) {
  try {
    const response = await fetch('https://api.elevenlabs.io/v1/music/compose', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg',
        'xi-api-key': process.env.ELEVENLABS_API_KEY
      },
      body: JSON.stringify({
        prompt,
        duration_ms: 15000
      })
    });

    if (!response.ok) {
      console.error(`ElevenLabs API error: ${response.status}`);
      return null;
    }

    return Buffer.from(await response.arrayBuffer());
  } catch (err) {
    console.error('ElevenLabs API failed:', err.message);
    return null;
  }
}

async function uploadToS3(key, buffer) {
  await s3.send(new PutObjectCommand({
    Bucket: process.env.BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: 'audio/mpeg',
    ACL: 'public-read'
  }));
}

async function updateEggRecord(pk, sk, s3Key, prompt) {
  await ddb.send(new UpdateItemCommand({
    TableName: process.env.TABLE_NAME,
    Key: marshall({ pk, sk }),
    UpdateExpression: 'SET comfortSongKey = :key, comfortSongGeneratedAt = :ts, comfortSongPrompt = :prompt',
    ExpressionAttributeValues: marshall({
      ':key': s3Key,
      ':ts': new Date().toISOString(),
      ':prompt': prompt
    })
  }));
}



async function publishEggProcessingCompleted(clutchId, eggId) {
  try {
    await eventBridge.send(new PutEventsCommand({
      Entries: [{
        Source: 'chicken-counter',
        DetailType: 'Egg Processing Completed',
        Detail: JSON.stringify({ clutchId, eggId })
      }]
    }));
  } catch (err) {
    console.error(`Failed to publish EventBridge event for egg ${eggId}:`, err);
    throw err;
  }
}
