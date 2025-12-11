import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'node:crypto';
import { formatResponse } from '../utils/api.mjs';

const s3Client = new S3Client({});
const ddbClient = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(ddbClient);

const BUCKET_NAME = process.env.BUCKET_NAME;
const TABLE_NAME = process.env.TABLE_NAME;
const URL_EXPIRATION = 300;

export const handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { fileName, contentType } = body;

    if (!fileName || !contentType) {
      return formatResponse(400, {
        error: 'fileName and contentType are required',
        code: 'INVALID_REQUEST'
      });
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(contentType)) {
      return formatResponse(400, {
        error: 'Invalid content type. Must be image/jpeg, image/png, image/gif, or image/webp',
        code: 'INVALID_CONTENT_TYPE'
      });
    }

    const clutchId = randomUUID();
    const extension = fileName.split('.').pop().toLowerCase();
    const objectKey = `clutches/${clutchId}/upload.${extension}`;
    const uploadTimestamp = new Date().toISOString();

    await ddb.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        pk: `CLUTCH#${clutchId}`,
        sk: 'METADATA',
        id: clutchId,
        uploadTimestamp,
        imageKey: objectKey,
        status: 'Uploaded',
        createdAt: uploadTimestamp,
        GSI1PK: 'CLUTCHES',
        GSI1SK: uploadTimestamp
      }
    }));

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: objectKey,
      ContentType: contentType
    });

    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: URL_EXPIRATION
    });

    return formatResponse(200, {
      presignedUrl,
      objectKey,
      clutchId,
      expiresIn: URL_EXPIRATION
    });
  } catch (err) {
    console.error('Error generating presigned URL:', err);
    return formatResponse(500, {
      error: 'Failed to generate presigned URL',
      code: 'INTERNAL_ERROR'
    });
  }
};
