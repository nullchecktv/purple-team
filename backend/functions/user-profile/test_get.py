import json
import os
import pytest
from hypothesis import given, strategies as st, settings
import boto3
from datetime import datetime
from uuid import uuid4
from get import lambda_handler

# Get table name from environment or use default
TABLE_NAME = os.environ.get('TABLE_NAME', 'hackathon-demo-DataTable-1EXAMPLE')

@pytest.fixture(scope='session')
def dynamodb_table():
    """Get reference to the deployed DynamoDB table"""
    os.environ['TABLE_NAME'] = TABLE_NAME
    # Use the AWS profile from environment
    session = boto3.Session(profile_name=os.environ.get('AWS_PROFILE'))
    dynamodb = session.resource('dynamodb', region_name='us-east-1')
    table = dynamodb.Table(TABLE_NAME)
    return table

# Property test generators
valid_name = st.text(min_size=1, max_size=100).filter(lambda x: x.strip())
valid_email = st.emails()
valid_bio = st.text(max_size=500)

# **Feature: user-profile, Property 5: Profile retrieval returns complete data**
@settings(max_examples=100)
@given(name=valid_name, email=valid_email, bio=valid_bio)
def test_profile_retrieval_returns_complete_data(dynamodb_table, name, email, bio):
    """
    For any existing profile, retrieving it by userId should return all stored fields 
    including name, email, bio, and timestamps
    """
    table = dynamodb_table
    
    # Create a profile first
    user_id = str(uuid4())
    timestamp = datetime.utcnow().isoformat()
    
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
    
    # Retrieve the profile
    event = {
        'pathParameters': {
            'userId': user_id
        }
    }
    
    response = lambda_handler(event, None)
    
    # Verify response
    assert response['statusCode'] == 200
    body = json.loads(response['body'])
    
    # Verify all fields are present and correct
    assert body['userId'] == user_id
    assert body['name'] == name
    assert body['email'] == email
    assert body['bio'] == bio
    assert 'createdAt' in body
    assert 'updatedAt' in body
    assert body['createdAt'] == timestamp
    assert body['updatedAt'] == timestamp
