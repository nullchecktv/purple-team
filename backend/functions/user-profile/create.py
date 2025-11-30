import json
import os
import boto3
import re
from datetime import datetime
from uuid import uuid4

def lambda_handler(event, context):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table(os.environ['TABLE_NAME'])
    try:
        body = json.loads(event['body'])
        
        # Validate required fields
        name = body.get('name', '').strip()
        email = body.get('email', '').strip()
        bio = body.get('bio', '').strip()
        
        if not name:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Name is required and cannot be empty'})
            }
        
        if not email:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Email is required and cannot be empty'})
            }
        
        # Validate email format
        email_pattern = r'^[^@]+@[^@]+\.[^@]+$'
        if not re.match(email_pattern, email):
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Invalid email format'})
            }
        
        # Generate unique user ID
        user_id = str(uuid4())
        timestamp = datetime.utcnow().isoformat()
        
        # Create profile with pk/sk pattern
        profile = {
            'pk': f'USER#{user_id}',
            'sk': 'PROFILE',
            'userId': user_id,
            'name': name,
            'email': email,
            'bio': bio,
            'createdAt': timestamp,
            'updatedAt': timestamp
        }
        
        table.put_item(Item=profile)
        
        # Return profile without pk/sk
        response_profile = {
            'userId': user_id,
            'name': name,
            'email': email,
            'bio': bio,
            'createdAt': timestamp,
            'updatedAt': timestamp
        }
        
        return {
            'statusCode': 201,
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
