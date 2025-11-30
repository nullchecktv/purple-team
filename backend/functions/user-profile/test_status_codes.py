import json
import os
import pytest
from hypothesis import given, strategies as st, settings
import boto3
from datetime import datetime
from uuid import uuid4

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

valid_name = st.text(min_size=1, max_size=100).filter(lambda x: x.strip())
valid_email = st.emails()
valid_bio = st.text(max_size=500)

# **Feature: user-profile, Property 10: HTTP status codes correctness**
@settings(max_examples=100)
@given(name=valid_name, email=valid_email, bio=valid_bio)
def test_http_status_codes_correctness(dynamodb_table, name, email, bio):
    """
    For any profile operation, successful operations should return 200/201, 
    not found errors should return 404, validation errors should return 400, 
    and server errors should return 500
    """
    from create import lambda_handler as create_handler
    from get import lambda_handler as get_handler
    from update import lambda_handler as update_handler
    
    table = dynamodb_table
    
    # Test successful creation returns 201
    create_event = {
        'body': json.dumps({
            'name': name,
            'email': email,
            'bio': bio
        })
    }
    
    create_response = create_handler(create_event, None)
    assert create_response['statusCode'] == 201
    
    user_id = json.loads(create_response['body'])['userId']
    
    # Test successful retrieval returns 200
    get_event = {
        'pathParameters': {'userId': user_id}
    }
    
    get_response = get_handler(get_event, None)
    assert get_response['statusCode'] == 200
    
    # Test not found returns 404
    get_not_found_event = {
        'pathParameters': {'userId': str(uuid4())}
    }
    
    get_not_found_response = get_handler(get_not_found_event, None)
    assert get_not_found_response['statusCode'] == 404
    
    # Test validation error returns 400
    invalid_create_event = {
        'body': json.dumps({
            'name': '',
            'email': email
        })
    }
    
    invalid_response = create_handler(invalid_create_event, None)
    assert invalid_response['statusCode'] == 400
    
    # Test successful update returns 200
    update_event = {
        'pathParameters': {'userId': user_id},
        'body': json.dumps({'name': 'Updated Name'})
    }
    
    update_response = update_handler(update_event, None)
    assert update_response['statusCode'] == 200
    
    # Test update not found returns 404
    update_not_found_event = {
        'pathParameters': {'userId': str(uuid4())},
        'body': json.dumps({'name': 'Test'})
    }
    
    update_not_found_response = update_handler(update_not_found_event, None)
    assert update_not_found_response['statusCode'] == 404
