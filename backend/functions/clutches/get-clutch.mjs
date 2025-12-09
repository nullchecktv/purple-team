import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';

const ddbClient = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(ddbClient);
const TABLE_NAME = process.env.TABLE_NAME;

export const handler = async (event) => {
  try {
    const clutchId = event.pathParameters?.id;

    if (!clutchId) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid clutch ID format', code: 'INVALID_CLUTCH_ID' })
      };
    }

    const response = await ddb.send(new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'pk = :pk',
      ExpressionAttributeValues: {
        ':pk': `CLUTCH#${clutchId}`
      }
    }));

    const items = response.Items || [];

    const metadataRecord = items.find(item => item.sk === 'METADATA');
    if (!metadataRecord) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Clutch not found', code: 'CLUTCH_NOT_FOUND' })
      };
    }

    const eggs = items
      .filter(item => item.sk.startsWith('EGG#'))
      .map(egg => ({
        id: egg.id,
        hatchLikelihood: egg.hatchLikelihood,
        possibleHenBreeds: egg.possibleHenBreeds,
        predictedChickBreed: egg.predictedChickBreed,
        breedConfidence: egg.breedConfidence,
        chickenAppearance: egg.chickenAppearance,
        notes: egg.notes
      }));

    const eggCount = eggs.length;
    let viabilityPercentage = null;

    if (eggCount > 0) {
      const eggsWithHatchLikelihood = eggs.filter(egg => typeof egg.hatchLikelihood === 'number');
      if (eggsWithHatchLikelihood.length > 0) {
        const sum = eggsWithHatchLikelihood.reduce((acc, egg) => acc + egg.hatchLikelihood, 0);
        viabilityPercentage = sum / eggsWithHatchLikelihood.length;
      }
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: metadataRecord.id,
        uploadTimestamp: metadataRecord.uploadTimestamp,
        imageKey: metadataRecord.imageKey,
        eggCount,
        viabilityPercentage,
        eggs
      })
    };
  } catch (err) {
    console.error('Error getting clutch:', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to retrieve clutch data', code: 'INTERNAL_ERROR' })
    };
  }
};
