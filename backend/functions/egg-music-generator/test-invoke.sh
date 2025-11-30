#!/bin/bash

# Quick test script for EggMusicGenerator Lambda

FUNCTION_NAME="EggMusicGeneratorFunction"
TEST_EVENT_FILE="test-event.json"
RESPONSE_FILE="response.json"

echo "🥚 Testing EggMusicGenerator Lambda Function..."
echo ""

# Check if function exists
if ! aws lambda get-function --function-name $FUNCTION_NAME &> /dev/null; then
    echo "❌ Function $FUNCTION_NAME not found. Have you deployed the stack?"
    exit 1
fi

echo "✅ Function found: $FUNCTION_NAME"
echo ""

# Invoke the function
echo "📤 Invoking Lambda with test event..."
aws lambda invoke \
  --function-name $FUNCTION_NAME \
  --payload file://$TEST_EVENT_FILE \
  --cli-binary-format raw-in-base64-out \
  $RESPONSE_FILE

echo ""
echo "📥 Response received:"
cat $RESPONSE_FILE | jq .

# Extract music URL if successful
MUSIC_URL=$(cat $RESPONSE_FILE | jq -r '.body' | jq -r '.musicUrl' 2>/dev/null)

if [ ! -z "$MUSIC_URL" ] && [ "$MUSIC_URL" != "null" ]; then
    echo ""
    echo "🎵 Music generated successfully!"
    echo "🔗 Public URL: $MUSIC_URL"
    echo ""
    echo "💡 You can play it with:"
    echo "   curl -o music.mp3 '$MUSIC_URL' && open music.mp3"
else
    echo ""
    echo "⚠️  No music URL in response. Check the error message above."
fi

echo ""
echo "📊 View logs with:"
echo "   aws logs tail /aws/lambda/$FUNCTION_NAME --follow"
