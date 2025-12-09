# 🎵 Deploy Music Generation Backend

## ✅ ElevenLabs API Test Results

The ElevenLabs API is working perfectly:
- ✅ **API Key Valid**: `sk_770510badacbad393c4219c74b46dba2a3f4f597958fd1ef`
- ✅ **Full Duration**: Successfully generates 15-second audio (14.7s actual)
- ✅ **File Size**: 235KB for 15 seconds (good quality)
- ✅ **Response Time**: ~12 seconds generation time
- ✅ **Format**: MP3 audio/mpeg

## 🚀 Quick Deployment Steps

### Option 1: Manual Deploy (Recommended)
```bash
cd backend
sam build --use-container  # If Docker available
# OR
sam build                  # If esbuild installed locally
sam deploy
```

### Option 2: Deploy Just Music Function
```bash
# Create a minimal template with just the music function
cd backend
cp template.yaml template-music.yaml
# Edit template-music.yaml to include only MusicGenerationFunction
sam deploy --template-file template-music.yaml --stack-name music-generation
```

### Option 3: Test Locally First
```bash
cd backend
sam local start-api
# Test with: curl -X POST http://localhost:3000/api/music/generate
```

## 🔧 Backend Function Status

### ✅ Ready Components
- **Lambda Function**: `functions/music-generation/app.py`
- **Dependencies**: `requests`, `boto3` (minimal requirements)
- **API Integration**: ElevenLabs music compose endpoint
- **S3 Storage**: Configured for music file uploads
- **DynamoDB**: Metadata storage ready
- **SAM Template**: Function definition complete

### 🎯 Expected Behavior
1. **POST /api/music/generate**:
   - Accepts: style, lyrics, duration, egg_id
   - Calls ElevenLabs API with correct parameters
   - Uploads MP3 to S3
   - Returns presigned URL for playback
   - Stores metadata in DynamoDB

2. **GET /api/music/egg/{eggId}**:
   - Returns all music tracks for an egg
   - Includes fresh presigned URLs
   - Shows generation metadata

## 🎵 Music Generation Parameters

### Working Configuration
```python
# ElevenLabs API call that works
data = {
    'prompt': full_prompt,
    'music_length_ms': duration_seconds * 1000,  # Key: milliseconds!
    'prompt_influence': 0.5
}
```

### Duration Fix
The key issue was using `music_length_ms` (milliseconds) instead of `duration_seconds`. The backend now correctly:
- Converts seconds to milliseconds: `15s → 15000ms`
- Uses proper endpoint: `/v1/music/compose`
- Includes fallback to `/v1/text-to-sound-effects/convert`

## 🎯 Next Steps

1. **Deploy Backend**: Run `sam build && sam deploy`
2. **Test Endpoint**: Verify `/api/music/generate` works
3. **Update Frontend**: Switch from demo mode to real API
4. **Test Full Flow**: Generate → Store → Play → Download

## 🔍 Troubleshooting

If deployment fails:
1. Check AWS credentials: `aws sts get-caller-identity`
2. Verify region: `aws configure get region`
3. Check stack status: `aws cloudformation describe-stacks --stack-name [stack-name]`
4. Try minimal deployment with just the music function

The ElevenLabs integration is proven to work - just need to get it deployed! 🎵✨