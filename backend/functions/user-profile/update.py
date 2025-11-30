import json
import os
import boto3
import re
from datetime import datetime

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
        
        # Parse update data
        body = json.loads(event['body'])
        
        # Check if profile exists
        get_response = table.get_item(
            Key={
                'pk': f'USER#{user_id}',
                'sk': 'PROFILE'
            }
        )
        
        if 'Item' not in get_response:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Profile not found'})
            }
        
        existing_profile = get_response['Item']
        
        # Validate and merge updates
        name = body.get('name', existing_profile['name']).strip() if 'name' in body else existing_profile['name']
        email = body.get('email', existing_profile['email']).strip() if 'email' in body else existing_profile['email']
        bio = body.get('bio', existing_profile.get('bio', '')).strip() if 'bio' in body else existing_profile.get('bio', '')
        
        # Validate name if provided
        if 'name' in body and not name:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Name cannot be empty'})
            }
        
        # Validate email if provided
        if 'email' in body:
            if not email:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'Email cannot be empty'})
                }
            email_pattern = r'^[^@]+@[^@]+\.[^@]+$'
            if not re.match(email_pattern, email):
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'Invalid email format'})
                }
        
        # Update timestamp
        updated_timestamp = datetime.utcnow().isoformat()
        
        # Update profile preserving userId and createdAt
        updated_profile = {
            'pk': f'USER#{user_id}',
            'sk': 'PROFILE',
            'userId': user_id,
            'name': name,
            'email': email,
            'bio': bio,
            'createdAt': existing_profile['createdAt'],  # Preserve original
            'updatedAt': updated_timestamp
        }
        
        table.put_item(Item=updated_profile)
        
        # Return profile without pk/sk
        response_profile = {
            'userId': user_id,
            'name': name,
            'email': email,
            'bio': bio,
            'createdAt': existing_profile['createdAt'],
            'updatedAt': updated_timestamp
        }
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps(response_profile)
        }
    except json.JSONDecodeError:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Invalid JSON in request body'})
        }
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Internal server error'})
        }
