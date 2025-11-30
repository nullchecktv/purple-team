import json

# Delivery zones data
DELIVERY_ZONES = {
    "North Texas": {
        "cities": ["Dallas", "Fort Worth", "Arlington", "Plano", "Irving", "Garland", "Frisco", "McKinney", "Denton", "Richardson"],
        "zip_prefixes": ["750", "751", "752", "753", "754", "755", "760", "761", "762"]
    },
    "Central Texas": {
        "cities": ["Austin", "San Antonio", "Round Rock", "Georgetown", "Cedar Park", "Pflugerville", "Waco", "Temple", "Killeen"],
        "zip_prefixes": ["786", "787", "788", "789", "781", "782", "765", "766", "767"]
    },
    "South Texas": {
        "cities": ["Houston", "Corpus Christi", "Laredo", "Brownsville", "McAllen", "Galveston", "Beaumont", "Port Arthur"],
        "zip_prefixes": ["770", "771", "772", "773", "774", "775", "776", "777", "778", "779", "784", "785"]
    },
    "West Texas": {
        "cities": ["El Paso", "Lubbock", "Amarillo", "Midland", "Odessa", "Abilene", "San Angelo"],
        "zip_prefixes": ["799", "794", "795", "791", "797", "796", "768", "769"]
    }
}

def validate_location(location):
    """Validate if a location is in Texas and return the delivery zone."""
    location = location.strip()
    
    # Check if it's a zip code (5 digits)
    if location.isdigit() and len(location) == 5:
        zip_prefix = location[:3]
        for zone, data in DELIVERY_ZONES.items():
            if zip_prefix in data["zip_prefixes"]:
                return (True, zone, None)
        return (False, None, "Zip code not in Texas delivery zones")
    
    # Check if it's a city name
    location_lower = location.lower()
    for zone, data in DELIVERY_ZONES.items():
        for city in data["cities"]:
            if city.lower() == location_lower:
                return (True, zone, None)
    
    return (False, None, "City not found in Texas delivery zones")

def get_all_zones():
    """Return list of all delivery zone names."""
    return list(DELIVERY_ZONES.keys())

def lambda_handler(event, context):
    try:
        # Check if a specific location validation is requested
        params = event.get('queryStringParameters', {}) or {}
        location = params.get('location')
        
        if location:
            # Validate specific location
            is_valid, zone, error = validate_location(location)
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'valid': is_valid,
                    'deliveryZone': zone,
                    'error': error
                })
            }
        else:
            # Return all zones with their cities
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'zones': get_all_zones(),
                    'details': DELIVERY_ZONES
                })
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
