import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { recordToBlockchain } from '../utils/blockchain.mjs';

const ddbClient = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(ddbClient);
const bedrockClient = new BedrockRuntimeClient({});
const s3Client = new S3Client({});
const TABLE_NAME = process.env.TABLE_NAME;
const BUCKET_NAME = process.env.BUCKET_NAME;

export const handler = async (event) => {
  try {
    const clutchId = event.detail?.clutchId;

    if (!clutchId) {
      console.error('Missing clutchId in event detail');
      throw new Error('Missing clutchId in event detail');
    }

    await updateClutchStatus(clutchId, 'Calculating Flock Numbers');

    const { metadata, eggs } = await queryClutchAndEggs(clutchId);

    if (!metadata) {
      console.error(`Clutch not found: ${clutchId}`);
      throw new Error(`Clutch not found: ${clutchId}`);
    }

    const { totalEggCount, viableEggCount } = calculateEggCounts(eggs);
    const viableEggs = getViableEggs(eggs);

    console.log(`Clutch ${clutchId}: ${totalEggCount} total eggs, ${viableEggCount} viable`);

    let chickenImageKey = null;

    if (viableEggCount > 0) {
      try {
        const imageBytes = await generateChickenImage(viableEggs);
        if (imageBytes) {
          chickenImageKey = await storeImageInS3(clutchId, imageBytes);
        }
      } catch (err) {
        console.error('Image generation failed:', err);
      }
    }

    // Record to blockchain (non-blocking)
    let blockchainTx = null;
    try {
      blockchainTx = await recordToBlockchain(clutchId, 'CLUTCH_CONSOLIDATED', {
        totalEggCount,
        viableEggCount,
        chickenImageKey
      });
    } catch (err) {
      console.error('Blockchain recording failed for consolidation:', err.message);
    }

    await updateClutchRecord(clutchId, totalEggCount, viableEggCount, chickenImageKey, blockchainTx);

    return {
      clutchId,
      totalEggCount,
      viableEggCount,
      chickenImageKey,
      blockchainTxId: blockchainTx?.transactionId || null
    };
  } catch (err) {
    console.error('Consolidation failed:', err);
    throw err;
  }
};

async function updateClutchStatus(clutchId, status) {
  await ddb.send(new UpdateCommand({
    TableName: TABLE_NAME,
    Key: {
      pk: `CLUTCH#${clutchId}`,
      sk: 'METADATA'
    },
    UpdateExpression: 'SET #status = :status',
    ExpressionAttributeNames: {
      '#status': 'status'
    },
    ExpressionAttributeValues: {
      ':status': status
    }
  }));
}

async function queryClutchAndEggs(clutchId) {
  const response = await ddb.send(new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'pk = :pk',
    ExpressionAttributeValues: {
      ':pk': `CLUTCH#${clutchId}`
    }
  }));

  const items = response.Items || [];
  const metadata = items.find(item => item.sk === 'METADATA');
  const eggs = items.filter(item => item.sk.startsWith('EGG#'));

  return { metadata, eggs };
}

function calculateEggCounts(eggs) {
  const totalEggCount = eggs.length;
  const viableEggCount = eggs.filter(egg => egg.hatchLikelihood >= 50).length;

  return { totalEggCount, viableEggCount };
}

function getViableEggs(eggs) {
  return eggs.filter(egg => egg.hatchLikelihood >= 50);
}

export function buildChickenImagePrompt(viableEggs) {
  const viableCount = viableEggs.length;

  if (viableCount === 0) {
    return null;
  }

  // Group eggs by breed and count them
  const breedCounts = {};
  viableEggs.forEach(egg => {
    const breed = egg.predictedChickBreed || 'mixed breed';
    breedCounts[breed] = (breedCounts[breed] || 0) + 1;
  });

  // Create concise breed list
  const breedList = Object.entries(breedCounts)
    .map(([breed, count]) => count === 1 ? `1 ${breed}` : `${count} ${breed}s`)
    .join(', ');

  return `A photorealistic photograph of ${viableCount} adult chicken${viableCount > 1 ? 's' : ''} (${breedList}) foraging and scratching in a lush green grassy pasture on a sunny day. Each chicken should display authentic breed characteristics. The chickens are actively scratching the ground, pecking at grass, and foraging naturally. Soft golden sunlight, shallow depth of field, detailed feather textures, professional wildlife photography style.`;
}

async function generateChickenImage(viableEggs) {
  const prompt = buildChickenImagePrompt(viableEggs);

  if (!prompt) {
    return null;
  }

  const requestBody = {
    taskType: 'TEXT_IMAGE',
    textToImageParams: {
      text: prompt
    },
    imageGenerationConfig: {
      numberOfImages: 1,
      height: 1024,
      width: 1024,
      quality: 'standard'
    }
  };

  const response = await bedrockClient.send(new InvokeModelCommand({
    modelId: 'amazon.nova-canvas-v1:0',
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify(requestBody)
  }));

  const responseBody = JSON.parse(new TextDecoder().decode(response.body));
  const imageBase64 = responseBody.images?.[0];

  if (!imageBase64) {
    throw new Error('No image returned from Nova Canvas');
  }

  return Buffer.from(imageBase64, 'base64');
}

async function storeImageInS3(clutchId, imageBytes) {
  const key = `clutches/${clutchId}/chickens.png`;

  await s3Client.send(new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: imageBytes,
    ContentType: 'image/png',
    ACL: 'public-read'
  }));

  return key;
}

async function updateClutchRecord(clutchId, totalEggCount, viableEggCount, chickenImageKey, blockchainTx) {
  const consolidatedAt = new Date().toISOString();

  const updateExpression = blockchainTx
    ? 'SET totalEggCount = :total, viableEggCount = :viable, chickenImageKey = :imageKey, consolidatedAt = :consolidatedAt, consolidationBlockchainTxId = :txId, consolidationBlockchainHash = :txHash, #status = :status'
    : 'SET totalEggCount = :total, viableEggCount = :viable, chickenImageKey = :imageKey, consolidatedAt = :consolidatedAt, #status = :status';

  const expressionValues = {
    ':total': totalEggCount,
    ':viable': viableEggCount,
    ':imageKey': chickenImageKey,
    ':consolidatedAt': consolidatedAt,
    ':status': 'Completed'
  };

  if (blockchainTx) {
    expressionValues[':txId'] = blockchainTx.transactionId;
    expressionValues[':txHash'] = blockchainTx.transactionHash;
  }

  await ddb.send(new UpdateCommand({
    TableName: TABLE_NAME,
    Key: {
      pk: `CLUTCH#${clutchId}`,
      sk: 'METADATA'
    },
    UpdateExpression: updateExpression,
    ExpressionAttributeNames: {
      '#status': 'status'
    },
    ExpressionAttributeValues: expressionValues
  }));
}
