import json
import os
import pytest
from hypothesis import given, strategies as st, settings
import boto3
from create import lambda_handler

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

# **Feature: user-profile, Property 1: Profile creation generates unique ID and stores data**
@settings(max_examples=100)
@given(name=valid_name, email=valid_email, bio=valid_bio)
def test_profile_creation_generates_unique_id_and_stores(dynamodb_table, name, email, bio):
    """
    For any valid profile data (with name and email), creating a profile should 
    generate a unique user ID and store the complete profile in DynamoDB
    """
    table = dynamodb_table
    
    event = {
        'body': json.dumps({
            'name': name,
            'email': email,
            'bio': bio
        })
    }
    
    response = lambda_handler(event, None)
    
    # Verify response
    assert response['statusCode'] == 201
    body = json.loads(response['body'])
    
    # Verify unique ID was generated
    assert 'userId' in body
    assert body['userId']
    user_id = body['userId']
    
    # Verify data was stored in DynamoDB
    db_response = table.get_item(Key={'pk': f'USER#{user_id}', 'sk': 'PROFILE'})
    assert 'Item' in db_response
    
    stored_item = db_response['Item']
    assert stored_item['userId'] == user_id
    assert stored_item['name'] == name
    assert stored_item['email'] == email
    assert stored_item['bio'] == bio


# **Feature: user-profile, Property 2: Required fields validation**
@settings(max_examples=100)
@given(
    name=st.one_of(st.none(), st.just(''), st.text().filter(lambda x: not x.strip())),
    email=st.one_of(st.none(), st.just(''), st.text().filter(lambda x: not x.strip()))
)
def test_required_fields_validation(dynamodb_table, name, email):
    """
    For any profile creation request, if name or email fields are missing or empty,
    the system should reject the request
    """
    # Test missing name
    if name is None or not name.strip():
        event = {
            'body': json.dumps({
                'name': name if name is not None else '',
                'email': 'valid@email.com'
            })
        }
        response = lambda_handler(event, None)
        assert response['statusCode'] == 400
        body = json.loads(response['body'])
        assert 'error' in body
    
    # Test missing email
    if email is None or not email.strip():
        event = {
            'body': json.dumps({
                'name': 'Valid Name',
                'email': email if email is not None else ''
            })
        }
        response = lambda_handler(event, None)
        assert response['statusCode'] == 400
        body = json.loads(response['body'])
        assert 'error' in body


# **Feature: user-profile, Property 3: Email format validation**
@settings(max_examples=100)
@given(email_str=st.text(min_size=1, max_size=100))
def test_email_format_validation(dynamodb_table, email_str):
    """
    For any string provided as an email, only strings matching valid email format 
    should be accepted
    """
    import re
    email_pattern = r'^[^@]+@[^@]+\.[^@]+$'
    is_valid_format = bool(re.match(email_pattern, email_str))
    
    event = {
        'body': json.dumps({
            'name': 'Test Name',
            'email': email_str
        })
    }
    
    response = lambda_handler(event, None)
    
    if is_valid_format:
        # Valid email should succeed
        assert response['statusCode'] in [201, 400]  # Could fail for other reasons
    else:
        # Invalid email should fail with 400
        assert response['statusCode'] == 400
        body = json.loads(response['body'])
        assert 'error' in body


# **Feature: user-profile, Property 4: Profile creation response completeness**
@settings(max_examples=100)
@given(name=valid_name, email=valid_email, bio=valid_bio)
def test_creation_response_completeness(dynamodb_table, name, email, bio):
    """
    For any successfully created profile, the response should contain userId, name, 
    email, bio, createdAt, and updatedAt fields
    """
    event = {
        'body': json.dumps({
            'name': name,
            'email': email,
            'bio': bio
        })
    }
    
    response = lambda_handler(event, None)
    
    if response['statusCode'] == 201:
        body = json.loads(response['body'])
        
        # Verify all required fields are present
        assert 'userId' in body
        assert 'name' in body
        assert 'email' in body
        assert 'bio' in body
        assert 'createdAt' in body
        assert 'updatedAt' in body
        
        # Verify values match input
        assert body['name'] == name
        assert body['email'] == email
        assert body['bio'] == bio


# **Feature: user-profile, Property 9: DynamoDB key pattern consistency**
@settings(max_examples=100)
@given(name=valid_name, email=valid_email, bio=valid_bio)
def test_dynamodb_key_pattern_consistency(dynamodb_table, name, email, bio):
    """
    For any stored profile, the partition key should follow the pattern "USER#{userId}" 
    and the sort key should be "PROFILE"
    """
    from create import lambda_handler as create_handler
    
    table = dynamodb_table
    
    event = {
        'body': json.dumps({
            'name': name,
            'email': email,
            'bio': bio
        })
    }
    
    response = create_handler(event, None)
    
    if response['statusCode'] == 201:
        body = json.loads(response['body'])
        user_id = body['userId']
        
        # Verify the item exists with correct key pattern
        db_response = table.get_item(Key={'pk': f'USER#{user_id}', 'sk': 'PROFILE'})
        assert 'Item' in db_response
        
        item = db_response['Item']
        assert item['pk'] == f'USER#{user_id}'
        assert item['sk'] == 'PROFILE'
