#!/usr/bin/env python3

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import requests
import uuid
import os
import time
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# ElevenLabs API configuration
ELEVENLABS_API_KEY = "sk_770510badacbad393c4219c74b46dba2a3f4f597958fd1ef"

@app.route('/api/music/generate', methods=['POST'])
def generate_music():
    """Generate music using ElevenLabs API"""
    try:
        data = request.get_json()
        
        # Extract parameters
        style_prompt = data.get('style', 'Calm ambient music, soft piano, peaceful atmosphere')
        lyrics = data.get('lyrics', 'Gentle sounds of nature, peaceful and serene')
        duration_seconds = data.get('duration', 15)
        egg_id = data.get('eggId', f'egg-{uuid.uuid4().hex[:8]}')
        
        # Combine style and lyrics into full prompt
        full_prompt = f"Generate a song with this style: {style_prompt}. The lyrics are: {lyrics}"
        
        print(f"🎵 Generating music for egg {egg_id}")
        print(f"Duration: {duration_seconds} seconds")
        print(f"Prompt: {full_prompt[:100]}...")
        
        # Generate music using ElevenLabs API
        music_data = generate_music_with_elevenlabs(full_prompt, duration_seconds)
        
        if not music_data:
            return jsonify({'error': 'Failed to generate music'}), 500
        
        # Save to local file
        filename = f"music_{egg_id}_{int(time.time())}.mp3"
        filepath = os.path.join('generated_music', filename)
        
        # Create directory if it doesn't exist
        os.makedirs('generated_music', exist_ok=True)
        
        with open(filepath, 'wb') as f:
            f.write(music_data)
        
        # Return success response
        return jsonify({
            'message': 'Music generated successfully',
            'egg_id': egg_id,
            'music_url': f'/music/{filename}',
            'local_file': filepath,
            'duration_seconds': duration_seconds,
            'style': style_prompt,
            'generated_at': datetime.utcnow().isoformat(),
            'file_size_kb': len(music_data) / 1024
        })
        
    except Exception as e:
        print(f"Error generating music: {str(e)}")
        return jsonify({
            'error': 'Failed to generate music',
            'details': str(e)
        }), 500

@app.route('/music/<filename>')
def serve_music(filename):
    """Serve generated music files"""
    try:
        filepath = os.path.join('generated_music', filename)
        if os.path.exists(filepath):
            return send_file(filepath, mimetype='audio/mpeg')
        else:
            return jsonify({'error': 'File not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def generate_music_with_elevenlabs(prompt, duration_seconds):
    """Generate music using ElevenLabs API"""
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
        
        print(f"🎼 Making request to ElevenLabs Music API...")
        print(f"Duration: {duration_seconds}s ({duration_seconds * 1000}ms)")
        
        response = requests.post(music_api_url, json=data, headers=headers, timeout=120)
        
        if response.status_code == 200:
            print(f"✅ Music generated successfully, size: {len(response.content)} bytes")
            return response.content
        else:
            print(f"❌ ElevenLabs API error: {response.status_code} - {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Error calling ElevenLabs API: {str(e)}")
        return None

@app.route('/health')
def health():
    return jsonify({'status': 'healthy', 'service': 'music-generation'})

if __name__ == '__main__':
    print("🎵 Starting Chicken Vision Music Generation Server")
    print("=" * 50)
    print("Endpoints:")
    print("- POST /api/music/generate - Generate music")
    print("- GET  /music/<filename>   - Serve music files")
    print("- GET  /health             - Health check")
    print()
    print("CORS enabled for all origins")
    print("ElevenLabs API key configured")
    print()
    
    app.run(host='0.0.0.0', port=8000, debug=True)