#!/bin/bash

# Quick test script for EggMusicGenerator

echo "🥚 Testing EggMusicGenerator Lambda..."
echo ""

# Test with brown egg
echo "📤 Invoking Lambda with brown egg..."
aws lambda invoke \
  --function-name EggMusicGeneratorFunction \
  --cli-binary-format raw-in-base64-out \
  --payload '{
    "detail": {
      "color": "brown",
      "shape": "oval",
      "size": "large",
      "shellTexture": "smooth",
      "shellIntegrity": "intact",
      "hardness": "hard",
      "spotsMarkings": "light speckles",
      "bloomCondition": "present",
      "cleanliness": "clean",
      "visibleDefects": [],
      "overallGrade": "A",
      "hatchLikelihood": 95,
      "possibleBreeds": ["Rhode Island Red"],
      "breedConfidence": "high",
      "chickenAppearance": {
        "plumageColor": "red-brown",
        "combType": "single",
        "bodyType": "large/heavy",
        "featherPattern": "solid",
        "legColor": "yellow"
      },
      "notes": "Excellent egg"
    }
  }' \
  response.json

echo ""
echo "📥 Response:"
cat response.json | jq .

# Check if successful
if cat response.json | jq -e '.body' > /dev/null 2>&1; then
    BODY=$(cat response.json | jq -r '.body')
    if echo "$BODY" | jq -e '.musicUrl' > /dev/null 2>&1; then
        MUSIC_URL=$(echo "$BODY" | jq -r '.musicUrl')
        echo ""
        echo "✅ Success! Music URL: $MUSIC_URL"
        echo ""
        echo "🎵 Download and play:"
        echo "   curl -o music.mp3 '$MUSIC_URL' && open music.mp3"
    else
        echo ""
        echo "⚠️  No music URL in response"
    fi
else
    echo ""
    echo "❌ Error in response"
fi

echo ""
echo "📊 View logs:"
echo "   aws logs tail /aws/lambda/EggMusicGeneratorFunction --follow"
