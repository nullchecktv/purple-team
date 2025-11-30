import json
import os
import uuid
import boto3
from datetime import datetime, timedelta
from decimal import Decimal

# Initialize DynamoDB
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['TABLE_NAME'])

def lambda_handler(event, context):
    """
    Egg Registration Service - Handles comprehensive egg registration with metadata validation
    """
    try:
        # Handle GET requests for listing eggs
        if event.get('httpMethod') == 'GET' or event.get('requestContext', {}).get('http', {}).get('method') == 'GET':
            return list_eggs()
        
        # Parse request body for POST requests
        if event.get('body'):
            body = json.loads(event['body'])
        else:
            body = event
        
        # Generate unique 128-bit UUID for egg
        egg_id = str(uuid.uuid4())
        
        # Validate comprehensive metadata (47 required fields)
        required_fields = [
            'shell_thickness', 'weight', 'circumference', 'parental_lineage',
            'genetic_markers', 'shell_color', 'shell_texture', 'candling_results',
            'breed', 'age_of_hen', 'nutrition_score', 'health_status',
            'collection_date', 'storage_conditions', 'transport_method',
            'ambient_temperature', 'humidity_level', 'air_quality_index',
            'magnetic_field_strength', 'lunar_phase_at_collection', 'solar_activity',
            'barometric_pressure', 'wind_direction', 'cosmic_radiation_level',
            'electromagnetic_interference', 'gravitational_anomalies', 'ph_level',
            'mineral_content', 'protein_density', 'fat_composition', 'vitamin_levels',
            'enzyme_activity', 'hormone_levels', 'stress_indicators', 'fertility_markers',
            'shell_porosity', 'membrane_thickness', 'air_cell_size', 'yolk_color',
            'albumen_quality', 'shell_strength', 'surface_texture', 'weight_distribution',
            'center_of_gravity', 'rotational_inertia', 'acoustic_properties', 'thermal_conductivity'
        ]
        
        metadata = body.get('metadata', {})
        missing_fields = [field for field in required_fields if field not in metadata]
        
        if missing_fields:
            return {
                'statusCode': 400,
                'body': json.dumps({
                    'error': 'Missing required metadata fields',
                    'missing_fields': missing_fields,
                    'total_required': len(required_fields)
                })
            }
        
        # Calculate astronomical hatch date (21 days + lunar adjustments)
        registration_date = datetime.utcnow()
        base_incubation_days = 21
        
        # Lunar cycle adjustments (highly scientific)
        lunar_phase = metadata.get('lunar_phase_at_collection', 'new_moon')
        lunar_adjustment = {
            'new_moon': 0.5,
            'waxing_crescent': 0.3,
            'first_quarter': 0.1,
            'waxing_gibbous': -0.1,
            'full_moon': -0.3,
            'waning_gibbous': -0.1,
            'last_quarter': 0.1,
            'waning_crescent': 0.3
        }.get(lunar_phase, 0)
        
        # Solar activity adjustments
        solar_activity = metadata.get('solar_activity', 'moderate')
        solar_adjustment = {
            'low': 0.2,
            'moderate': 0,
            'high': -0.2,
            'extreme': -0.5
        }.get(solar_activity, 0)
        
        total_incubation_days = base_incubation_days + lunar_adjustment + solar_adjustment
        predicted_hatch_date = registration_date + timedelta(days=total_incubation_days)
        
        # Generate QR code data (simplified for demo)
        qr_code_data = f"CHMS-EGG-{egg_id}-{registration_date.strftime('%Y%m%d')}"
        
        # Generate blockchain certificate hash (simplified)
        blockchain_certificate = f"BLOCKCHAIN-CERT-{egg_id}-{hash(str(metadata))}"
        
        # Create digital twin profile
        digital_twin = {
            'egg_id': egg_id,
            'creation_timestamp': registration_date.isoformat(),
            'predicted_development_stages': [
                {'day': 1, 'stage': 'fertilization_confirmation'},
                {'day': 3, 'stage': 'neural_tube_formation'},
                {'day': 7, 'stage': 'limb_bud_development'},
                {'day': 14, 'stage': 'feather_follicle_formation'},
                {'day': 18, 'stage': 'internal_pip'},
                {'day': 21, 'stage': 'external_pip_and_hatch'}
            ],
            'ai_confidence_score': 0.997,
            'quantum_entanglement_coefficient': 0.42
        }
        
        # Convert float values to Decimal for DynamoDB
        def convert_floats_to_decimal(obj):
            if isinstance(obj, dict):
                return {k: convert_floats_to_decimal(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [convert_floats_to_decimal(v) for v in obj]
            elif isinstance(obj, float):
                return Decimal(str(obj))
            else:
                return obj
        
        # Store egg data in DynamoDB
        egg_record = {
            'pk': f'EGG#{egg_id}',
            'sk': 'METADATA',
            'egg_id': egg_id,
            'registration_timestamp': registration_date.isoformat(),
            'metadata': convert_floats_to_decimal(metadata),
            'predictions': {
                'hatch_date': predicted_hatch_date.isoformat(),
                'confidence_interval': Decimal('99.7'),
                'success_probability': Decimal('94.3')
            },
            'qr_code': qr_code_data,
            'blockchain_certificate': blockchain_certificate,
            'digital_twin_profile': convert_floats_to_decimal(digital_twin),
            'status': 'registered'
        }
        
        table.put_item(Item=egg_record)
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'egg_id': egg_id,
                'registration_timestamp': registration_date.isoformat(),
                'predicted_hatch_date': predicted_hatch_date.isoformat(),
                'qr_code': qr_code_data,
                'blockchain_certificate': blockchain_certificate,
                'digital_twin_created': True,
                'metadata_fields_validated': len(required_fields),
                'message': 'Egg successfully registered with comprehensive digital twin profile'
            }, default=str)
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }

def list_eggs():
    """List all registered eggs"""
    try:
        # Scan for all eggs with METADATA sort key
        response = table.scan(
            FilterExpression='attribute_exists(egg_id) AND sk = :sk',
            ExpressionAttributeValues={
                ':sk': 'METADATA'
            }
        )
        
        eggs = []
        for item in response.get('Items', []):
            try:
                egg = {
                    'egg_id': item.get('egg_id', 'unknown'),
                    'registration_timestamp': item.get('registration_timestamp', ''),
                    'predicted_hatch_date': item.get('predictions', {}).get('hatch_date', ''),
                    'qr_code': item.get('qr_code', ''),
                    'blockchain_certificate': item.get('blockchain_certificate', ''),
                    'status': item.get('status', 'registered'),
                    'metadata': item.get('metadata', {})
                }
                eggs.append(egg)
            except Exception as item_error:
                # Skip malformed items but continue processing
                print(f"Error processing item: {item_error}")
                continue
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(eggs, default=str)
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)})
        }