import json
import os
import pytest
from hypothesis import given, strategies as st, settings
import boto3
from datetime import datetime
from uuid import uuid4
from update import lambda_handler
import time

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

# **Feature: user-profile, Property 6: Update preserves immutable fields**
@settings(max_examples=100)
@given(
    original_name=valid_name,
    original_email=valid_email,
    original_bio=valid_bio,
    new_name=valid_name,
    new_email=valid_email,
    new_bio=valid_bio
)
def test_update_preserves_immutable_fields(dynamodb_table, original_name, original_email, 
                                          original_bio, new_name, new_email, new_bio):
    """
    For any profile update operation, the userId and createdAt fields should remain 
    unchanged from their original values
    """
    table = dynamodb_table
    
    # Create original profile
    user_id = str(uuid4())
    created_timestamp = datetime.utcnow().isoformat()
    
    original_profile = {
        'pk': f'USER#{user_id}',
        'sk': 'PROFILE',
        'userId': user_id,
        'name': original_name,
        'email': original_email,
        'bio': original_bio,
        'createdAt': created_timestamp,
        'updatedAt': created_timestamp
    }
    
    table.put_item(Item=original_profile)
    
    # Update the profile
    event = {
        'pathParameters': {'userId': user_id},
        'body': json.dumps({
            'name': new_name,
            'email': new_email,
            'bio': new_bio
        })
    }
    
    response = lambda_handler(event, None)
    
    assert response['statusCode'] == 200
    body = json.loads(response['body'])
    
    # Verify immutable fields are preserved
    assert body['userId'] == user_id
    assert body['createdAt'] == created_timestamp
    
    # Verify updates were applied
    assert body['name'] == new_name
    assert body['email'] == new_email
    assert body['bio'] == new_bio


# **Feature: user-profile, Property 7: Update modifies timestamp**
@settings(max_examples=100)
@given(
    name=valid_name,
    email=valid_email,
    bio=valid_bio,
    new_name=valid_name
)
def test_update_modifies_timestamp(dynamodb_table, name, email, bio, new_name):
    """
    For any profile update operation, the updatedAt timestamp should be different 
    from (and later than) the previous value
    """
    table = dynamodb_table
    
    # Create original profile
    user_id = str(uuid4())
    original_timestamp = datetime.utcnow().isoformat()
    
    profile = {
        'pk': f'USER#{user_id}',
        'sk': 'PROFILE',
        'userId': user_id,
        'name': name,
        'email': email,
        'bio': bio,
        'createdAt': original_timestamp,
        'updatedAt': original_timestamp
    }
    
    table.put_item(Item=profile)
    
    # Small delay to ensure timestamp difference
    time.sleep(0.01)
    
    # Update the profile
    event = {
        'pathParameters': {'userId': user_id},
        'body': json.dumps({'name': new_name})
    }
    
    response = lambda_handler(event, None)
    
    assert response['statusCode'] == 200
    body = json.loads(response['body'])
    
    # Verify updatedAt changed
    assert body['updatedAt'] != original_timestamp
    assert body['updatedAt'] > original_timestamp


# **Feature: user-profile, Property 8: Update merges data correctly**
@settings(max_examples=100)
@given(
    original_name=valid_name,
    original_email=valid_email,
    original_bio=valid_bio,
    update_field=st.sampled_from(['name', 'email', 'bio']),
    new_value=st.one_of(valid_name, valid_email, valid_bio)
)
def test_update_merges_data_correctly(dynamodb_table, original_name, original_email, 
                                     original_bio, update_field, new_value):
    """
    For any profile update with partial data, the updated profile should contain 
    the new values for specified fields and preserve existing values for unspecified fields
    """
    table = dynamodb_table
    
    # Create original profile
    user_id = str(uuid4())
    timestamp = datetime.utcnow().isoformat()
    
    profile = {
        'pk': f'USER#{user_id}',
        'sk': 'PROFILE',
        'userId': user_id,
        'name': original_name,
        'email': original_email,
        'bio': original_bio,
        'createdAt': timestamp,
        'updatedAt': timestamp
    }
    
    table.put_item(Item=profile)
    
    # Update only one field
    update_data = {update_field: new_value}
    
    event = {
        'pathParameters': {'userId': user_id},
        'body': json.dumps(update_data)
    }
    
    response = lambda_handler(event, None)
    
    if response['statusCode'] == 200:
        body = json.loads(response['body'])
        
        # Verify the updated field has new value
        if update_field == 'name':
            assert body['name'] == new_value
            assert body['email'] == original_email
            assert body['bio'] == original_bio
        elif update_field == 'email':
            assert body['name'] == original_name
            assert body['email'] == new_value
            assert body['bio'] == original_bio
        elif update_field == 'bio':
            assert body['name'] == original_name
            assert body['email'] == original_email
            assert body['bio'] == new_value
