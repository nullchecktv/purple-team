import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'node:crypto';

const s3Client = new S3Client({});
const BUCKET_NAME = process.env.BUCKET_NAME;
const URL_EXPIRATION = 300; // 5 minutes

export const handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { fileName, contentType } = body;

    // Validate request
    if (!fileName || !contentType) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'fileName and contentType are required',
          code: 'INVALID_REQUEST'
        })
      };
    }

    // Validate content type is an image
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(contentType)) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Invalid content type. Must be image/jpeg, image/png, image/gif, or image/webp',
          code: 'INVALID_CONTENT_TYPE'
        })
      };
    }

    // Generate unique object key
    const timestamp = new Date().toISOString().split('T')[0];
    const uuid = randomUUID();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const objectKey = `uploads/${timestamp}/${uuid}-${sanitizedFileName}`;

    // Generate presigned URL
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: objectKey,
      ContentType: contentType
    });

    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: URL_EXPIRATION
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        presignedUrl,
        objectKey,
        expiresIn: URL_EXPIRATION
      })
    };
  } catch (err) {
    console.error('Error generating presigned URL:', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Failed to generate presigned URL',
        code: 'INTERNAL_ERROR'
      })
    };
  }
};
