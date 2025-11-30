import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME;

export const handler = async (event) => {
  try {
    const treeId = event.pathParameters?.treeId;
    const body = JSON.parse(event.body);

    if (!treeId) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Tree ID is required' })
      };
    }

    // Check if tree exists
    const existingTree = await ddb.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        pk: `TREE#${treeId}`,
        sk: 'METADATA'
      }
    }));

    if (!existingTree.Item) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Tree not found' })
      };
    }

    // Validate required fields if provided
    if (body.height !== undefined && (typeof body.height !== 'number' || body.height <= 0)) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Validation failed',
          details: ['height must be a positive number']
        })
      };
    }

    if (body.price !== undefined && (typeof body.price !== 'number' || body.price <= 0)) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Validation failed',
          details: ['price must be a positive number']
        })
      };
    }

    // Update tree, preserving createdAt
    const updatedTree = {
      ...existingTree.Item,
      ...body,
      pk: `TREE#${treeId}`,
      sk: 'METADATA',
      id: treeId,
      createdAt: existingTree.Item.createdAt, // Preserve original
      updatedAt: new Date().toISOString()
    };

    await ddb.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: updatedTree
    }));

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedTree)
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
