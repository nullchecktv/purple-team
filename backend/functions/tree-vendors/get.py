import json

# Hardcoded vendor data for MVP
VENDORS = [
    {
        "id": "vendor-1",
        "name": "Pine Tree Farm",
        "latitude": 40.7128,
        "longitude": -74.0060,
        "address": "123 Tree Lane, New York, NY 10001",
        "phone": "555-0123",
        "inventory": "Fraser Fir, Douglas Fir, Blue Spruce",
        "priceRange": "$40-$120"
    },
    {
        "id": "vendor-2",
        "name": "Holiday Tree Market",
        "latitude": 40.7580,
        "longitude": -73.9855,
        "address": "456 Christmas Ave, New York, NY 10019",
        "phone": "555-0456",
        "inventory": "Noble Fir, Balsam Fir, White Pine",
        "priceRange": "$50-$150"
    },
    {
        "id": "vendor-3",
        "name": "Evergreen Corner",
        "latitude": 40.6782,
        "longitude": -73.9442,
        "address": "789 Evergreen St, Brooklyn, NY 11238",
        "phone": "555-0789",
        "inventory": "Fraser Fir, Blue Spruce, Norway Spruce",
        "priceRange": "$35-$100"
    },
    {
        "id": "vendor-4",
        "name": "Winter Wonderland Trees",
        "latitude": 40.7489,
        "longitude": -73.9680,
        "address": "321 Winter Way, New York, NY 10010",
        "phone": "555-0321",
        "inventory": "Douglas Fir, Balsam Fir, Fraser Fir",
        "priceRange": "$45-$130"
    },
    {
        "id": "vendor-5",
        "name": "Brooklyn Christmas Trees",
        "latitude": 40.6501,
        "longitude": -73.9496,
        "address": "654 Holiday Blvd, Brooklyn, NY 11215",
        "phone": "555-0654",
        "inventory": "Blue Spruce, White Pine, Noble Fir",
        "priceRange": "$40-$110"
    },
    {
        "id": "vendor-6",
        "name": "Manhattan Tree Co",
        "latitude": 40.7614,
        "longitude": -73.9776,
        "address": "987 Central Park West, New York, NY 10025",
        "phone": "555-0987",
        "inventory": "Fraser Fir, Douglas Fir, Balsam Fir",
        "priceRange": "$60-$180"
    },
    {
        "id": "vendor-7",
        "name": "Queens Tree Lot",
        "latitude": 40.7282,
        "longitude": -73.7949,
        "address": "147 Forest Hills Dr, Queens, NY 11375",
        "phone": "555-0147",
        "inventory": "Norway Spruce, Blue Spruce, White Pine",
        "priceRange": "$30-$90"
    }
]

def lambda_handler(event, context):
    try:
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'vendors': VENDORS})
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
