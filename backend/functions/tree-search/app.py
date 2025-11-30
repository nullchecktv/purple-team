import json
import os
import boto3
from decimal import Decimal
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['TABLE_NAME'])

def decimal_to_float(obj):
    """Convert Decimal objects to float for JSON serialization."""
    if isinstance(obj, Decimal):
        return float(obj)
    elif isinstance(obj, dict):
        return {k: decimal_to_float(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [decimal_to_float(item) for item in obj]
    return obj

def calculate_match_score(tree, criteria):
    """Calculate match score for a tree against filter criteria."""
    matches = {
        'priceMatch': False,
        'qualityMatch': False,
        'deliveryMatch': False,
        'returnMatch': False,
        'popularityMatch': False
    }
    
    # Price match
    price = float(tree.get('price', 0))
    if criteria['minPrice'] <= price <= criteria['maxPrice']:
        matches['priceMatch'] = True
    
    # Quality match
    quality = float(tree.get('qualityRating', 0))
    if quality >= criteria['minQuality']:
        matches['qualityMatch'] = True
    
    # Delivery match
    if criteria['deliveryRequired']:
        if criteria['deliveryZone'] in tree.get('deliveryZones', []):
            matches['deliveryMatch'] = True
    else:
        matches['deliveryMatch'] = True
    
    # Return policy match
    return_days = int(tree.get('returnWindowDays', 0))
    if return_days >= criteria['minReturnDays']:
        matches['returnMatch'] = True
    
    # Popularity match
    popularity_score = float(tree.get('socialPopularityScore', 0))
    popularity_level = criteria['popularityLevel']
    
    if popularity_level == 'any':
        matches['popularityMatch'] = True
    elif popularity_level == 'high' and popularity_score >= 80:
        matches['popularityMatch'] = True
    elif popularity_level == 'medium' and 50 <= popularity_score < 80:
        matches['popularityMatch'] = True
    elif popularity_level == 'low' and popularity_score < 50:
        matches['popularityMatch'] = True
    
    # Calculate overall match percentage
    total_criteria = len(matches)
    matched_criteria = sum(1 for v in matches.values() if v)
    match_percentage = (matched_criteria / total_criteria) * 100
    
    # Calculate weighted score (0-100)
    score = match_percentage
    
    return {
        'tree': tree,
        'score': score,
        'matchDetails': matches,
        'matchPercentage': match_percentage
    }

def lambda_handler(event, context):
    try:
        # Parse query parameters
        params = event.get('queryStringParameters', {}) or {}
        
        criteria = {
            'deliveryZone': params.get('deliveryZone', ''),
            'minPrice': float(params.get('minPrice', 0)),
            'maxPrice': float(params.get('maxPrice', 1000)),
            'minQuality': float(params.get('minQuality', 0)),
            'deliveryRequired': params.get('deliveryRequired', 'false').lower() == 'true',
            'minReturnDays': int(params.get('minReturnDays', 0)),
            'popularityLevel': params.get('popularityLevel', 'any')
        }
        
        # Query all trees from DynamoDB
        response = table.query(
            KeyConditionExpression=Key('pk').eq('TREE') & Key('sk').begins_with('TREE#')
        )
        
        trees = response.get('Items', [])
        
        # Calculate match scores for all trees
        scored_trees = []
        for tree in trees:
            match_result = calculate_match_score(tree, criteria)
            # Only include trees that match all required criteria
            if all(match_result['matchDetails'].values()):
                scored_trees.append(match_result)
        
        # Sort by score descending
        scored_trees.sort(key=lambda x: x['score'], reverse=True)
        
        # Convert Decimal to float for JSON serialization
        scored_trees = decimal_to_float(scored_trees)
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(scored_trees)
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)})
        }
