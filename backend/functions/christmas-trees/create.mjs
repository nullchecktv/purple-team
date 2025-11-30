import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME;

export const handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    
    // Validate required fields
    const requiredFields = ['species', 'height', 'price', 'storeLocation'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Validation failed',
          details: missingFields.map(field => `${field} is required`)
        })
      };
    }

    // Validate data types
    if (typeof body.height !== 'number' || body.height <= 0) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Validation failed',
          details: ['height must be a positive number']
        })
      };
    }

    if (typeof body.price !== 'number' || body.price <= 0) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Validation failed',
          details: ['price must be a positive number']
        })
      };
    }

    const id = randomUUID();
    const now = new Date().toISOString();
    
    const tree = {
      pk: `TREE#${id}`,
      sk: 'METADATA',
      id,
      species: body.species,
      height: body.height,
      price: body.price,
      condition: body.condition || 'Good',
      description: body.description || '',
      storeLocation: body.storeLocation,
      createdAt: now,
      updatedAt: now
    };

    await ddb.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: tree
    }));

    return {
      statusCode: 201,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tree)
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message })
    };
  }
};
