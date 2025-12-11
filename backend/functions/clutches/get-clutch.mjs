import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { formatResponse } from '../utils/api.mjs';
import { validateBlockchainHash } from '../utils/blockchain.mjs';

const ddbClient = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(ddbClient);
const TABLE_NAME = process.env.TABLE_NAME;
const BUCKET_NAME = process.env.BUCKET_NAME;
const AWS_REGION = process.env.AWS_REGION;

export const handler = async (event) => {
  try {
    const clutchId = event.pathParameters?.id;

    if (!clutchId) {
      return formatResponse(400, { error: 'Invalid clutch ID format', code: 'INVALID_CLUTCH_ID' });
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
      return formatResponse(404, { error: 'Clutch not found', code: 'CLUTCH_NOT_FOUND' });
    }

    const eggs = await Promise.all(
      items
        .filter(item => item.sk.startsWith('EGG#'))
        .map(async (egg) => {
          // Validate blockchain certification if hash exists
          let isCertified = false;
          if (egg.analysisBlockchainHash) {
            try {
              isCertified = await validateBlockchainHash(egg.analysisBlockchainHash);
            } catch (err) {
              console.error('Blockchain validation error for egg', egg.id, ':', err.message);
              isCertified = false;
            }
          }

          return {
            id: egg.id,
            hatchLikelihood: egg.hatchLikelihood,
            predictedChickBreed: egg.predictedChickBreed,
            breedConfidence: egg.breedConfidence,
            isCertified,
            details: {
              color: egg.color,
              cleanliness: egg.cleanliness,
              hardness: egg.hardness,
              grade: egg.overallGrade,
              shape: egg.shape,
              shellIntegrity: egg.shellIntegrity,
              shellTexture: egg.shellTexture,
              size: egg.size,
              spotsMarkings: egg.spotsMarkings
            },
            notes: egg.notes,
            ...egg.chickImageUrl && { image: egg.chickImageUrl}
          };
        })
    );

    // Calculate viability percentage
    const viableCount = eggs.filter(egg => (egg.hatchLikelihood || 0) >= 70).length;
    const viabilityPercentage = eggs.length > 0 ? (viableCount / eggs.length) * 100 : 0;

    const responseBody = {
      id: metadataRecord.id,
      uploadTimestamp: metadataRecord.uploadTimestamp,
      imageKey: metadataRecord.imageKey,
      status: metadataRecord.status,
      detectedEggCount: eggs.length,
      processedEggCount: metadataRecord.processingComplete,
      viabilityPercentage,
      eggs: eggs.map(egg => {
        const { isProcessed, ...eggData } = egg;
        return eggData;
      })
    };

    if (metadataRecord.viableEggCount !== undefined) {
      responseBody.viableEggCount = metadataRecord.viableEggCount;
    }

    if (metadataRecord.chickenImageKey) {
      responseBody.chickenImageKey = metadataRecord.chickenImageKey;
      responseBody.chickenImageUrl = `https://${BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${metadataRecord.chickenImageKey}`;
    }

    if (metadataRecord.errorMessage) {
      responseBody.errorMessage = metadataRecord.errorMessage;
    }

    return formatResponse(200, responseBody);
  } catch (err) {
    console.error('Error getting clutch:', err);
    return formatResponse(500, { error: 'Failed to retrieve clutch data', code: 'INTERNAL_ERROR' });
  }
};
