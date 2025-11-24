import json
import os
import boto3
from datetime import datetime
from uuid import uuid4

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['TABLE_NAME'])

def lambda_handler(event, context):
    try:
        body = json.loads(event['body'])
        item_id = str(uuid4())

        table.put_item(
            Item={
                'pk': 'data',
                'sk': item_id,
                'id': item_id,
                **body,
                'createdAt': datetime.utcnow().isoformat()
            }
        )

        return {
            'statusCode': 201,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'id': item_id, **body})
        }
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': str(e)})
        }
