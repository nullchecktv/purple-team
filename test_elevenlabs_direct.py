#!/usr/bin/env python3

import requests
import json
import time

# ElevenLabs API configuration
ELEVENLABS_API_KEY = "sk_770510badacbad393c4219c74b46dba2a3f4f597958fd1ef"

def test_music_generation():
    """Test ElevenLabs music generation directly"""
    
    # Test parameters
    style_prompt = "Slow jazz ballad, deep baritone vocal, smooth saxophone, brushed drums, relaxed atmosphere, calming and hypnotic"
    lyrics = "Not yet, my friend, just wait a while,\nStay inside with a sleepy smile.\nThe sun is hot, the ground is cold,\nWait until your story's told."
    full_prompt = f"Generate a song with this style: {style_prompt}. The lyrics are: {lyrics}"
    duration_seconds = 15
    
    print("🎵 Testing ElevenLabs Music Generation")
    print("=" * 50)
    print(f"API Key: {ELEVENLABS_API_KEY[:20]}...")
    print(f"Duration: {duration_seconds} seconds")
    print(f"Prompt: {full_prompt[:100]}...")
    print()
    
    # Try the music compose endpoint first
    music_url = "https://api.elevenlabs.io/v1/music/compose"
    headers = {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY
    }
    
    data = {
        'prompt': full_prompt,
        'music_length_ms': duration_seconds * 1000,  # Convert to milliseconds
        'prompt_influence': 0.5
    }
    
    print(f"🎼 Testing Music Compose API: {music_url}")
    print(f"Payload: {json.dumps(data, indent=2)}")
    print()
    
    try:
        start_time = time.time()
        response = requests.post(music_url, json=data, headers=headers, timeout=120)
        end_time = time.time()
        
        print(f"⏱️  Request took: {end_time - start_time:.2f} seconds")
        print(f"📊 Status Code: {response.status_code}")
        print(f"📏 Content Length: {len(response.content)} bytes")
        print(f"🏷️  Content Type: {response.headers.get('content-type', 'unknown')}")
        print()
        
        if response.status_code == 200:
            print("✅ SUCCESS! Music generated successfully")
            
            # Save the audio file
            filename = f"test_music_{duration_seconds}s.mp3"
            with open(filename, 'wb') as f:
                f.write(response.content)
            print(f"💾 Saved to: {filename}")
            
            # Check actual duration (approximate based on file size)
            file_size_kb = len(response.content) / 1024
            estimated_duration = file_size_kb / 16  # Rough estimate: 16KB per second for MP3
            print(f"📊 File size: {file_size_kb:.1f} KB")
            print(f"⏱️  Estimated duration: {estimated_duration:.1f} seconds")
            
            if estimated_duration < duration_seconds * 0.8:
                print("⚠️  WARNING: Generated audio might be shorter than requested!")
            
        else:
            print("❌ FAILED!")
            print(f"Error: {response.text}")
            
            # Try alternative endpoint
            print("\n🔄 Trying alternative endpoint...")
            alt_url = "https://api.elevenlabs.io/v1/text-to-sound-effects/convert"
            alt_data = {
                'text': full_prompt,
                'duration_seconds': duration_seconds,
                'prompt_influence': 0.5
            }
            
            alt_response = requests.post(alt_url, json=alt_data, headers=headers, timeout=120)
            print(f"Alternative endpoint status: {alt_response.status_code}")
            
            if alt_response.status_code == 200:
                print("✅ Alternative endpoint worked!")
                filename = f"test_music_alt_{duration_seconds}s.mp3"
                with open(filename, 'wb') as f:
                    f.write(alt_response.content)
                print(f"💾 Saved to: {filename}")
            else:
                print(f"❌ Alternative also failed: {alt_response.text}")
                
    except Exception as e:
        print(f"❌ Exception: {e}")

if __name__ == "__main__":
    test_music_generation()