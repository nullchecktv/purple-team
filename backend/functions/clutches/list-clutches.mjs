import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';

const ddbClient = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(ddbClient);
const TABLE_NAME = process.env.TABLE_NAME;

export const handler = async () => {
  try {
    const clutchesResponse = await ddb.send(new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'entities',
      KeyConditionExpression: 'GSI1PK = :pk',
      ExpressionAttributeValues: {
        ':pk': 'CLUTCHES'
      },
      ScanIndexForward: false
    }));

    const clutches = clutchesResponse.Items || [];

    const clutchSummaries = await Promise.all(
      clutches.map(async (clutch) => {
        const eggsResponse = await ddb.send(new QueryCommand({
          TableName: TABLE_NAME,
          KeyConditionExpression: 'pk = :pk AND begins_with(sk, :eggPrefix)',
          ExpressionAttributeValues: {
            ':pk': clutch.pk,
            ':eggPrefix': 'EGG#'
          }
        }));

        const eggs = eggsResponse.Items || [];
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
          id: clutch.id,
          uploadTimestamp: clutch.uploadTimestamp,
          imageKey: clutch.imageKey,
          eggCount,
          viabilityPercentage
        };
      })
    );

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clutches: clutchSummaries })
    };
  } catch (err) {
    console.error('Error listing clutches:', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to retrieve clutches', code: 'INTERNAL_ERROR' })
    };
  }
};
