import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME;

export const handler = async (event) => {
  try {
    const storeLocation = event.queryStringParameters?.storeLocation;
    
    const scanParams = {
      TableName: TABLE_NAME,
      FilterExpression: 'begins_with(pk, :prefix)',
      ExpressionAttributeValues: {
        ':prefix': 'TREE#'
      }
    };

    // Add store location filter if provided
    if (storeLocation) {
      scanParams.FilterExpression += ' AND storeLocation = :location';
      scanParams.ExpressionAttributeValues[':location'] = storeLocation;
    }

    const result = await ddb.send(new ScanCommand(scanParams));

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result.Items || [])
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
