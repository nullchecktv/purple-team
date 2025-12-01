#!/usr/bin/env python3

import requests
import json

# Test the music generation API
API_URL = "https://p5f57pijb2.execute-api.us-east-1.amazonaws.com/api/music/generate"

# Test data
test_data = {
    "style": "Calm ambient music, soft piano, peaceful atmosphere",
    "lyrics": "Gentle sounds of nature, peaceful and serene",
    "duration": 15,
    "egg_id": "test-egg-001"
}

print("🎵 Testing Music Generation API")
print("=" * 50)
print(f"Endpoint: {API_URL}")
print(f"Test data: {json.dumps(test_data, indent=2)}")
print()

try:
    print("Making request...")
    response = requests.post(API_URL, json=test_data, timeout=30)
    
    print(f"Status Code: {response.status_code}")
    print(f"Response Headers: {dict(response.headers)}")
    print()
    
    if response.status_code == 200:
        result = response.json()
        print("✅ SUCCESS!")
        print(f"Music URL: {result.get('music_url', 'N/A')}")
        print(f"Duration: {result.get('duration_seconds', 'N/A')} seconds")
        print(f"Generated at: {result.get('generated_at', 'N/A')}")
    else:
        print("❌ ERROR!")
        print(f"Response: {response.text}")
        
except requests.exceptions.RequestException as e:
    print(f"❌ REQUEST ERROR: {e}")
except Exception as e:
    print(f"❌ UNEXPECTED ERROR: {e}")

print()
print("🔗 Available endpoints to test:")
print("- GET  /clutches")
print("- GET  /api/eggs") 
print("- GET  /api/environment/current")
print("- GET  /api/blockchain/network-status")
print("- POST /api/music/generate (not deployed yet)")