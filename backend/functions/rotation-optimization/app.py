import json
import os
import boto3
import math
from datetime import datetime, timedelta
from decimal import Decimal

# Initialize DynamoDB
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['TABLE_NAME'])

def lambda_handler(event, context):
    """
    Rotation Optimization Service - Precise egg turning with servo-controlled mechanisms
    """
    try:
        # Parse request body
        if event.get('body'):
            body = json.loads(event['body'])
        else:
            body = event
        
        action = body.get('action', 'schedule_rotation')
        egg_id = body.get('egg_id')
        
        if not egg_id:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'egg_id is required'})
            }
        
        if action == 'schedule_rotation':
            return schedule_rotation(egg_id, body)
        elif action == 'execute_rotation':
            return execute_rotation(egg_id, body)
        elif action == 'verify_position':
            return verify_position(egg_id)
        elif action == 'get_rotation_history':
            return get_rotation_history(egg_id)
        else:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Invalid action'})
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }

def schedule_rotation(egg_id, body):
    """Calculate optimal rotation timing based on lunar cycles and embryonic development"""
    
    # Get egg registration data
    response = table.get_item(
        Key={'pk': f'EGG#{egg_id}', 'sk': 'METADATA'}
    )
    
    if 'Item' not in response:
        return {
            'statusCode': 404,
            'body': json.dumps({'error': 'Egg not found'})
        }
    
    egg_data = response['Item']
    registration_date = datetime.fromisoformat(egg_data['registration_timestamp'].replace('Z', '+00:00'))
    current_time = datetime.utcnow()
    
    # Calculate embryonic development stage
    days_since_registration = (current_time - registration_date).days
    development_stage = min(days_since_registration, 21)
    
    # Lunar cycle calculations (highly scientific)
    lunar_phases = ['new_moon', 'waxing_crescent', 'first_quarter', 'waxing_gibbous', 
                   'full_moon', 'waning_gibbous', 'last_quarter', 'waning_crescent']
    
    # Calculate current lunar phase (simplified)
    days_since_new_moon = (current_time.day % 29.5)
    lunar_phase_index = int(days_since_new_moon / 3.69)  # 29.5 / 8 phases
    current_lunar_phase = lunar_phases[lunar_phase_index % 8]
    
    # Base rotation interval: every 2 hours and 37 minutes
    base_interval_minutes = 2 * 60 + 37
    
    # Lunar adjustments (in minutes)
    lunar_adjustments = {
        'new_moon': 5,
        'waxing_crescent': 3,
        'first_quarter': 0,
        'waxing_gibbous': -2,
        'full_moon': -5,
        'waning_gibbous': -2,
        'last_quarter': 0,
        'waning_crescent': 3
    }
    
    # Development stage adjustments
    stage_adjustments = {
        range(0, 3): 10,    # Early development - less frequent
        range(3, 7): 5,     # Neural development - moderate
        range(7, 14): 0,    # Active growth - standard
        range(14, 18): -5,  # Pre-hatch - more frequent
        range(18, 21): -10  # Hatching preparation - very frequent
    }
    
    stage_adjustment = 0
    for stage_range, adjustment in stage_adjustments.items():
        if development_stage in stage_range:
            stage_adjustment = adjustment
            break
    
    # Calculate optimal interval
    optimal_interval = base_interval_minutes + lunar_adjustments[current_lunar_phase] + stage_adjustment
    
    # Schedule next rotation
    next_rotation = current_time + timedelta(minutes=optimal_interval)
    
    # Store rotation schedule
    schedule_record = {
        'pk': f'EGG#{egg_id}',
        'sk': f'ROTATION_SCHEDULE#{current_time.isoformat()}',
        'egg_id': egg_id,
        'scheduled_time': next_rotation.isoformat(),
        'development_stage': development_stage,
        'lunar_phase': current_lunar_phase,
        'optimal_interval_minutes': optimal_interval,
        'base_interval': base_interval_minutes,
        'lunar_adjustment': lunar_adjustments[current_lunar_phase],
        'stage_adjustment': stage_adjustment,
        'status': 'scheduled'
    }
    
    table.put_item(Item=schedule_record)
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'egg_id': egg_id,
            'next_rotation': next_rotation.isoformat(),
            'development_stage': development_stage,
            'lunar_phase': current_lunar_phase,
            'optimal_interval_minutes': optimal_interval,
            'rotation_precision': '45_degrees',
            'servo_control': 'QUANTUM_PRECISION'
        })
    }

def execute_rotation(egg_id, body):
    """Execute precise 45-degree rotation with servo-controlled mechanisms"""
    
    current_time = datetime.utcnow()
    
    # Servo motor parameters
    target_angle = 45.0  # Exactly 45 degrees
    rotation_velocity = 15.0  # degrees per second (optimal for embryo safety)
    rotation_duration = target_angle / rotation_velocity  # 3 seconds
    
    # Generate rotation event ID
    rotation_id = f"ROT_{egg_id}_{int(current_time.timestamp())}"
    
    # Simulate servo motor control (in real implementation, would control actual hardware)
    servo_commands = {
        'servo_id': f'SERVO_QUANTUM_{egg_id}',
        'target_angle': target_angle,
        'velocity': rotation_velocity,
        'acceleration': 5.0,  # degrees per second squared
        'precision': 0.01,    # 0.01 degree precision
        'torque_limit': 0.5,  # Nm (gentle for eggs)
        'feedback_sensor': 'OPTICAL_ENCODER_NANO'
    }
    
    # Calculate exact timing
    start_time = current_time
    end_time = start_time + timedelta(seconds=rotation_duration)
    
    # Store rotation event
    rotation_record = {
        'pk': f'EGG#{egg_id}',
        'sk': f'ROTATION#{rotation_id}',
        'rotation_id': rotation_id,
        'egg_id': egg_id,
        'start_timestamp': start_time.isoformat(),
        'end_timestamp': end_time.isoformat(),
        'angle': Decimal(str(target_angle)),
        'velocity': Decimal(str(rotation_velocity)),
        'duration_seconds': Decimal(str(rotation_duration)),
        'servo_commands': servo_commands,
        'position_verified': False,  # Will be verified in next step
        'status': 'completed'
    }
    
    table.put_item(Item=rotation_record)
    
    # Trigger position verification
    verification_result = verify_position(egg_id)
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'rotation_id': rotation_id,
            'egg_id': egg_id,
            'angle_rotated': target_angle,
            'velocity': rotation_velocity,
            'duration_seconds': rotation_duration,
            'precision': '0.01_degrees',
            'servo_control': 'QUANTUM_PRECISION',
            'verification_triggered': True
        })
    }

def verify_position(egg_id):
    """Verify proper positioning using computer vision and correct misalignments"""
    
    current_time = datetime.utcnow()
    
    # Simulate computer vision analysis (in real implementation, would use AWS Rekognition)
    # Generate realistic position data
    import random
    
    # Expected position after rotation
    expected_angle = 45.0
    
    # Simulate slight variations in actual position
    actual_angle = expected_angle + random.uniform(-0.5, 0.5)
    position_error = abs(actual_angle - expected_angle)
    
    # Computer vision analysis results
    cv_analysis = {
        'camera_id': 'CV_CAM_QUANTUM_001',
        'image_resolution': '4K_ULTRA_HD',
        'analysis_algorithm': 'DEEP_LEARNING_EGG_POSITION_V2.0',
        'expected_angle': expected_angle,
        'detected_angle': actual_angle,
        'position_error': position_error,
        'confidence_score': 0.999,
        'processing_time_ms': 50
    }
    
    # Determine if correction is needed
    correction_needed = position_error > 0.1  # 0.1 degree tolerance
    correction_applied = False
    
    if correction_needed:
        # Apply micro-correction
        correction_angle = -position_error  # Correct the error
        cv_analysis['correction_applied'] = True
        cv_analysis['correction_angle'] = correction_angle
        correction_applied = True
    
    # Update the latest rotation record with verification results
    # Get the most recent rotation record
    response = table.query(
        KeyConditionExpression='pk = :pk AND begins_with(sk, :sk)',
        ExpressionAttributeValues={
            ':pk': f'EGG#{egg_id}',
            ':sk': 'ROTATION#'
        },
        ScanIndexForward=False,
        Limit=1
    )
    
    if response['Items']:
        latest_rotation = response['Items'][0]
        
        # Update with verification results
        table.update_item(
            Key={'pk': latest_rotation['pk'], 'sk': latest_rotation['sk']},
            UpdateExpression='SET position_verified = :verified, cv_analysis = :analysis, correction_applied = :correction',
            ExpressionAttributeValues={
                ':verified': True,
                ':analysis': cv_analysis,
                ':correction': correction_applied
            }
        )
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'egg_id': egg_id,
            'position_verified': True,
            'cv_analysis': cv_analysis,
            'correction_needed': correction_needed,
            'correction_applied': correction_applied,
            'verification_timestamp': current_time.isoformat()
        })
    }

def get_rotation_history(egg_id):
    """Get complete rotation history for an egg"""
    
    response = table.query(
        KeyConditionExpression='pk = :pk AND begins_with(sk, :sk)',
        ExpressionAttributeValues={
            ':pk': f'EGG#{egg_id}',
            ':sk': 'ROTATION#'
        },
        ScanIndexForward=False
    )
    
    rotations = response['Items']
    
    # Calculate statistics
    total_rotations = len(rotations)
    total_angle = sum(float(r.get('angle', 0)) for r in rotations)
    verified_rotations = sum(1 for r in rotations if r.get('position_verified', False))
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'egg_id': egg_id,
            'total_rotations': total_rotations,
            'total_angle_rotated': total_angle,
            'verified_rotations': verified_rotations,
            'verification_rate': verified_rotations / max(total_rotations, 1),
            'rotation_history': rotations
        }, default=str)
    }