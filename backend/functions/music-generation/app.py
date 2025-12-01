import json
import boto3
import os
import uuid
import time
from datetime import datetime
import requests
import base64

# Initialize AWS clients
s3_client = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['TABLE_NAME'])

# ElevenLabs API configuration
ELEVENLABS_API_KEY = "sk_770510badacbad393c4219c74b46dba2a3f4f597958fd1ef"
ELEVENLABS_MUSIC_API_URL = "https://api.elevenlabs.io/v1/music/compose"

def lambda_handler(event, context):
    """
    Generate music using ElevenLabs API and upload to S3
    """
    try:
        # Parse request body
        if event.get('body'):
            body = json.loads(event['body'])
        else:
            body = event
        
        # Extract parameters
        style_prompt = body.get('style', 'Calm ambient music, soft piano, peaceful atmosphere')
        lyrics = body.get('lyrics', 'Gentle sounds of nature, peaceful and serene')
        duration_seconds = body.get('duration', 15)
        egg_id = body.get('egg_id', f'egg-{uuid.uuid4().hex[:8]}')
        
        # Combine style and lyrics into full prompt
        full_prompt = f"Generate a song with this style: {style_prompt}. The lyrics are: {lyrics}"
        
        print(f"Generating music for egg {egg_id}")
        print(f"Prompt: {full_prompt}")
        print(f"Duration: {duration_seconds} seconds")
        
        # Generate music using ElevenLabs API
        music_data = generate_music_with_elevenlabs(full_prompt, duration_seconds)
        
        if not music_data:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Failed to generate music'})
            }
        
        # Upload to S3
        bucket_name = os.environ.get('BUCKET_NAME', 'default-bucket')
        s3_key = f'music/{egg_id}/{uuid.uuid4().hex}.mp3'
        
        s3_client.put_object(
            Bucket=bucket_name,
            Key=s3_key,
            Body=music_data,
            ContentType='audio/mpeg',
            Metadata={
                'egg_id': egg_id,
                'style': style_prompt,
                'duration': str(duration_seconds),
                'generated_at': datetime.utcnow().isoformat()
            }
        )
        
        # Generate presigned URL for playback
        presigned_url = s3_client.generate_presigned_url(
            'get_object',
            Params={'Bucket': bucket_name, 'Key': s3_key},
            ExpiresIn=3600  # 1 hour
        )
        
        # Store metadata in DynamoDB
        music_record = {
            'pk': f'MUSIC#{egg_id}',
            'sk': f'TRACK#{uuid.uuid4().hex[:8]}',
            'egg_id': egg_id,
            's3_key': s3_key,
            'presigned_url': presigned_url,
            'style_prompt': style_prompt,
            'lyrics': lyrics,
            'duration_seconds': duration_seconds,
            'generated_at': datetime.utcnow().isoformat(),
            'status': 'completed'
        }
        
        table.put_item(Item=music_record)
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
            },
            'body': json.dumps({
                'message': 'Music generated successfully',
                'egg_id': egg_id,
                'music_url': presigned_url,
                's3_key': s3_key,
                'duration_seconds': duration_seconds,
                'style': style_prompt,
                'generated_at': music_record['generated_at']
            })
        }
        
    except Exception as e:
        print(f"Error generating music: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': 'Failed to generate music',
                'details': str(e)
            })
        }

def generate_music_with_elevenlabs(prompt, duration_seconds):
    """
    Generate music using ElevenLabs API
    """
    try:
        # Use the correct ElevenLabs Music API endpoint
        music_api_url = "https://api.elevenlabs.io/v1/music/compose"
        
        headers = {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': ELEVENLABS_API_KEY
        }
        
        # Updated payload for music generation
        data = {
            'prompt': prompt,
            'music_length_ms': duration_seconds * 1000,  # Convert to milliseconds
            'prompt_influence': 0.5
        }
        
        print(f"Making request to ElevenLabs Music API...")
        print(f"URL: {music_api_url}")
        print(f"Duration: {duration_seconds}s ({duration_seconds * 1000}ms)")
        print(f"Prompt: {prompt[:100]}...")
        
        response = requests.post(music_api_url, json=data, headers=headers, timeout=120)
        
        if response.status_code == 200:
            print(f"Music generated successfully, size: {len(response.content)} bytes")
            return response.content
        else:
            print(f"ElevenLabs API error: {response.status_code} - {response.text}")
            
            # Try alternative endpoint if the first one fails
            alt_url = "https://api.elevenlabs.io/v1/text-to-sound-effects/convert"
            print(f"Trying alternative endpoint: {alt_url}")
            
            alt_data = {
                'text': prompt,
                'duration_seconds': duration_seconds,
                'prompt_influence': 0.5
            }
            
            alt_response = requests.post(alt_url, json=alt_data, headers=headers, timeout=120)
            
            if alt_response.status_code == 200:
                print(f"Alternative endpoint successful, size: {len(alt_response.content)} bytes")
                return alt_response.content
            else:
                print(f"Alternative endpoint also failed: {alt_response.status_code} - {alt_response.text}")
                return None
            
    except Exception as e:
        print(f"Error calling ElevenLabs API: {str(e)}")
        return None

def get_music_for_egg(event, context):
    """
    Get all music tracks for a specific egg
    """
    try:
        egg_id = event['pathParameters']['eggId']
        
        response = table.query(
            KeyConditionExpression='pk = :pk',
            ExpressionAttributeValues={
                ':pk': f'MUSIC#{egg_id}'
            }
        )
        
        tracks = []
        for item in response.get('Items', []):
            # Generate fresh presigned URL
            presigned_url = s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': os.environ.get('BUCKET_NAME'), 'Key': item['s3_key']},
                ExpiresIn=3600
            )
            
            tracks.append({
                'track_id': item['sk'].replace('TRACK#', ''),
                'music_url': presigned_url,
                'style_prompt': item.get('style_prompt', ''),
                'lyrics': item.get('lyrics', ''),
                'duration_seconds': item.get('duration_seconds', 0),
                'generated_at': item.get('generated_at', ''),
                'status': item.get('status', 'unknown')
            })
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'egg_id': egg_id,
                'tracks': tracks,
                'total_tracks': len(tracks)
            })
        }
        
    except Exception as e:
        print(f"Error getting music for egg: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': 'Failed to get music tracks',
                'details': str(e)
            })
        }