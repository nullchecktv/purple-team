import json
import os
import boto3

def lambda_handler(event, context):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table(os.environ['TABLE_NAME'])
    try:
        # Get userId from path parameters
        user_id = event.get('pathParameters', {}).get('userId')
        
        if not user_id:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'userId is required'})
            }
        
        # Query DynamoDB using pk/sk pattern
        response = table.get_item(
            Key={
                'pk': f'USER#{user_id}',
                'sk': 'PROFILE'
            }
        )
        
        # Check if profile exists
        if 'Item' not in response:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Profile not found'})
            }
        
        item = response['Item']
        
        # Return profile without pk/sk
        profile = {
            'userId': item['userId'],
            'name': item['name'],
            'email': item['email'],
            'bio': item.get('bio', ''),
            'createdAt': item['createdAt'],
            'updatedAt': item['updatedAt']
        }
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps(profile)
        }
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Internal server error'})
        }
