import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME;

export const handler = async (event) => {
  try {
    const treeId = event.pathParameters?.treeId;

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

    // Delete the tree
    await ddb.send(new DeleteCommand({
      TableName: TABLE_NAME,
      Key: {
        pk: `TREE#${treeId}`,
        sk: 'METADATA'
      }
    }));

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Tree deleted successfully', id: treeId })
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
