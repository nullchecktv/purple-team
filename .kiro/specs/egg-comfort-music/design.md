# Design Document: Egg Comfort Music Generation

## Overview

This feature extends the egg analysis pipeline to provide emotional support for non-viable eggs through AI-generated comfort songs. When an egg is determined to have less than 50% hatch likelihood, the system generates personalized three-line affirmation lyrics and converts them into music using the ElevenLabs Music API. The generated songs are stored in S3 and linked to the egg records for later access.

The design follows the existing agent patterns used in the codebase (chick-image-generator.mjs and egg-analysis.mjs) and integrates seamlessly with the current DynamoDB Streams-based processing pipeline.

## Architecture

### High-Level Flow

```
DynamoDB Stream (egg analysis complete)
  ↓
Analysis Forwarder (updated with routing logic)
  ↓
  ├─→ [hatchLikelihood >= 50%] → Chick Image Queue → Chick Image Generator → EventBridge
  └─→ [hatchLikelihood < 50%] → Non-Viable Queue → Comfort Song Agent → EventBridge
                                                        ↓
                                                   ElevenLabs API
                                                        ↓
                                                      S3 Upload
                                                        ↓
                                                   DynamoDB Update
                                                        ↓
                                                   EventBridge (Egg Processing Completed)
```

### Components

1. **Analysis Forwarder (Modified)**: Routes eggs to appropriate queues based on hatchLikelihood
2. **Non-Viable Queue**: SQS FIFO queue for non-viable egg processing
3. **Comfort Song Agent**: Lambda function that generates lyrics and music
4. **ElevenLabs Integration**: External API for music generation
5. **S3 Storage**: Stores generated MP3 files
6. **DynamoDB Updates**: Links songs to egg records

## Components and Interfaces

### 1. Analysis Forwarder Updates

**File**: `backend/functions/streams/analysis-forwarder.mjs`

**Changes**:
- Add environment variable for non-viable queue URL
- Implement routing logic based on hatchLikelihood threshold
- Send messages to appropriate queue

**Interface**:
```javascript
// Input: DynamoDB Stream event
{
  Records: [{
    eventName: 'MODIFY',
    dynamodb: {
      NewImage: { /* marshalled egg record */ }
    }
  }]
}

// Output: SQS messages sent to appropriate queues
```

### 2. Non-Viable Queue

**Resource Type**: AWS::SQS::Queue (Standard)

**Configuration**:
- Queue name: `NonViableEggQueue`
- Visibility timeout: 300 seconds
- Message retention: 120 seconds (2 minutes)
- Dead letter queue: after 3 receive attempts

### 3. Comfort Song Agent

**File**: `backend/functions/agents/comfort-song-generator.mjs`

**Responsibilities**:
- Receive egg records from SQS
- Generate three-line affirmation lyrics using Bedrock
- Call ElevenLabs Music API to generate MP3
- Upload MP3 to S3
- Update egg record with song reference
- Publish "Egg Processing Completed" event to EventBridge

**Interface**:
```javascript
// Input: SQS event with egg record
{
  Records: [{
    body: JSON.stringify({
      pk: 'CLUTCH#uuid',
      sk: 'EGG#uuid',
      hatchLikelihood: 35,
      color: 'brown',
      predictedChickBreed: 'Rhode Island Red',
      // ... other egg fields
    })
  }]
}

// Output: Updated DynamoDB record with comfortSongKey
```

**Bedrock Converse Pattern**:
```javascript
const systemPrompt = `You are a compassionate poet who creates uplifting affirmations for eggs.
Generate exactly three lines of positive, encouraging lyrics that celebrate the egg's unique qualities.
Focus on the egg's beauty, characteristics, and inherent worth.
Avoid any negative language or references to viability or failure.`;

const userMessage = `Create three lines of affirmation for this egg:
- Color: ${color}
- Shape: ${shape}
- Predicted breed: ${predictedChickBreed}
- Appearance: ${JSON.stringify(chickenAppearance)}`;
```

### 4. ElevenLabs Music API Integration

**API Endpoint**: `https://api.elevenlabs.io/v1/text-to-sound-effects`

**Request Format**:
```javascript
{
  text: "Three line lyrics here...",
  duration_seconds: 15,
  prompt_influence: 0.5
}
```

**Response**: Audio file (MP3 format)

**Error Handling**:
- Retry up to 3 times with exponential backoff (1s, 2s, 4s)
- Log failures but don't block pipeline
- Continue processing without music if all retries fail

### 5. S3 Storage Pattern

**Bucket**: Existing `BUCKET_NAME` environment variable

**Key Pattern**: `music/{clutchId}-{eggId}_{timestamp}.mp3`

**Example**: `music/abc123-def456_1703001234567.mp3`

**Upload Configuration**:
```javascript
{
  Bucket: BUCKET_NAME,
  Key: s3Key,
  Body: audioBuffer,
  ContentType: 'audio/mpeg',
  ACL: 'public-read'
}
```

## Data Models

### Updated Egg Record Schema

```typescript
interface EggRecord {
  // Existing fields...
  pk: string;
  sk: string;
  hatchLikelihood: number;

  // New fields for comfort songs
  comfortSongKey?: string;           // S3 key for the MP3 file
  comfortSongGeneratedAt?: string;   // ISO 8601 timestamp
  comfortSongLyrics?: string;        // The three-line lyrics
}
```

### SQS Message Format

Both queues use the same message format (unmarshalled DynamoDB item):

```javascript
{
  pk: 'CLUTCH#uuid',
  sk: 'EGG#uuid',
  id: 'uuid',
  clutchId: 'uuid',
  hatchLikelihood: 35,
  color: 'brown',
  shape: 'oval',
  predictedChickBreed: 'Rhode Island Red',
  chickenAppearance: {
    plumageColor: 'red-brown',
    combType: 'single',
    bodyType: 'large/heavy',
    featherPattern: 'solid',
    legColor: 'yellow'
  },
  // ... other egg analysis fields
}
```


## Correctness Properties

*A property is aistic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Non-viable eggs route to non-viable queue

*For any* egg record with hatchLikelihood less than 50%, the Analysis Forwarder should send a message to the non-viable queue and not to the chick image queue.

**Validates: Requirements 1.1**

### Property 2: Viable eggs route to chick image queue

*For any* egg record with hatchLikelihood of 50% or greater, the Analysis Forwarder should send a message to the chick image queue and not to the non-viable queue.

**Validates: Requirements 1.2**

### Property 3: Routing is mutually exclusive

*For any* egg record, the Analysis Forwarder should send exactly one message to exactly one queue (either non-viable or chick image, never both, never neither).

**Validates: Requirements 1.3**

### Property 4: Queue messages preserve egg data

*For any* egg record routed through the Analysis Forwarder, all fields from the original record should be present in the queue message body.

**Validates: Requirements 1.4**

### Property 5: Lyrics are exactly three lines

*For any* egg record processed by the Comfort Song Agent, the generated lyrics should contain exactly three lines (two newline characters).

**Validates: Requirements 2.1, 2.5**

### Property 6: Lyrics incorporate egg characteristics

*For any* egg record processed by the Comfort Song Agent, the generated lyrics should mention at least one of the egg's characteristics (color, shape, or predicted breed).

**Validates: Requirements 2.2**

### Property 7: Lyrics avoid negative language

*For any* generated lyrics, the text should not contain negative words from a predefined list (e.g., "fail", "broken", "dead", "bad", "reject", "defect").

**Validates: Requirements 2.4**

### Property 8: S3 keys follow naming pattern

*For any* music file uploaded to S3, the key should match the pattern `music/{clutchId}-{eggId}_{timestamp}.mp3` where clutchId and eggId are UUIDs and timestamp is a positive integer.

**Validates: Requirements 4.2**

### Property 9: S3 upload updates DynamoDB

*For any* successful S3 upload of a music file, the corresponding egg record in DynamoDB should be updated with a `comfortSongKey` field that matches the S3 key.

**Validates: Requirements 4.3, 4.4**

### Property 10: Timestamp field is ISO 8601

*For any* egg record updated with a comfort song, the `comfortSongGeneratedAt` field should be a valid ISO 8601 timestamp string.

**Validates: Requirements 4.5**

### Property 11: EventBridge event published on completion

*For any* egg processed by the Comfort Song Agent, an "Egg Processing Completed" event should be published to EventBridge with the correct clutchId and eggId.

**Validates: Requirements 4.6**

## Error Handling

### Analysis Forwarder Errors

- **DynamoDB Stream Read Failures**: Lambda will automatically retry failed batches
- **SQS Send Failures**: Retry with exponential backoff (AWS SDK default)
- **Invalid Egg Records**: Log error and skip record, don't fail entire batch

### Comfort Song Agent Errors

- **Bedrock API Failures**:
  - Retry up to 3 times with exponential backoff
  - If all retries fail, use fallback generic lyrics
  - Continue processing to ensure pipeline doesn't block

- **ElevenLabs API Failures**:
  - Retry up to 3 times with exponential backoff (1s, 2s, 4s)
  - If all retries fail, log error and skip music generation
  - Update egg record without comfortSongKey
  - Don't throw exception - allow SQS message to be deleted

- **S3 Upload Failures**:
  - Retry up to 3 times with exponential backoff
  - If all retries fail, log error and throw exception
  - SQS will retry the entire message processing

- **DynamoDB Update Failures**:
  - Retry up to 3 times with exponential backoff
  - If all retries fail, throw exception
  - SQS will retry the entire message processing

### Dead Letter Queue

Messages that fail processing after 3 SQS delivery attempts will be moved to the dead letter queue for manual investigation.

## Testing Strategy

### Unit Testing

Unit tests will cover specific examples and edge cases:

- **Analysis Forwarder**:
  - Test with hatchLikelihood = 49 (should route to non-viable)
  - Test with hatchLikelihood = 50 (should route to chick image)
  - Test with hatchLikelihood = 0 (edge case)
  - Test with hatchLikelihood = 100 (edge case)
  - Test with missing hatchLikelihood field

- **Comfort Song Agent**:
  - Test with complete egg record
  - Test with minimal egg record (missing optional fields)
  - Test with ElevenLabs API failure (mock)
  - Test with S3 upload failure (mock)

### Property-Based Testing

Property-based tests will verify universal properties across many inputs using a PBT library appropriate for Node.js (e.g., fast-check):

- Each property-based test will run a minimum of 100 iterations
- Each test will be tagged with a comment referencing the correctness property
- Tag format: `**Feature: egg-comfort-music, Property {number}: {property_text}**`

**Property Tests to Implement**:

1. **Property 1-3 (Routing)**: Generate random egg records with various hatchLikelihood values (0-100) and verify correct queue routing
2. **Property 4 (Data Preservation)**: Generate random egg records and verify all fields are preserved in queue messages
3. **Property 5 (Three Lines)**: Generate random egg records and verify lyrics always have exactly 3 lines
4. **Property 6 (Characteristics)**: Generate random egg records and verify lyrics mention at least one characteristic
5. **Property 7 (No Negative Words)**: Generate random egg records and verify lyrics don't contain negative words
6. **Property 8 (S3 Key Pattern)**: Generate random clutchId/eggId combinations and verify S3 keys match pattern
7. **Property 9 (Round Trip)**: Generate random music files, upload to S3, and verify DynamoDB is updated correctly
8. **Property 10 (ISO 8601)**: Generate random timestamps and verify they parse as valid ISO 8601

### Integration Testing

Integration tests are optional but recommended for end-to-end validation:

- Deploy to test environment
- Trigger DynamoDB stream with test egg records
- Verify messages appear in correct queues
- Verify music files are generated and stored
- Verify DynamoDB records are updated correctly

## Deployment Considerations

### Environment Variables

**Analysis Forwarder**:
- `CHICK_QUEUE_URL`: Existing chick image queue URL
- `NON_VIABLE_QUEUE_URL`: New non-viable queue URL (to be added)

**Comfort Song Agent**:
- `TABLE_NAME`: DynamoDB table name
- `BUCKET_NAME`: S3 bucket name
- `ELEVENLABS_API_KEY`: ElevenLabs API key (from Secrets Manager or Parameter Store)

### IAM Permissions

**Analysis Forwarder**:
- `sqs:SendMessage` on both queue ARNs

**Comfort Song Agent**:
- `bedrock:InvokeModel` for Converse API
- `s3:PutObject` on bucket
- `dynamodb:UpdateItem` on table
- `sqs:ReceiveMessage`, `sqs:DeleteMessage` on non-viable queue
- `events:PutEvents` for EventBridge

### Secrets Management

ElevenLabs API key should be stored in AWS Secrets Manager or Systems Manager Parameter Store and retrieved at runtime:

```javascript
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const secretsManager = new SecretsManagerClient({});
const secret = await secretsManager.send(new GetSecretValueCommand({
  SecretId: process.env.ELEVENLABS_SECRET_NAME
}));
const apiKey = JSON.parse(secret.SecretString).apiKey;
```

### Monitoring

- CloudWatch Logs for all Lambda functions
- CloudWatch Metrics for queue depth and processing time
- Alarms for dead letter queue message count
- Alarms for Lambda error rates

## Performance Considerations

### Concurrency

- Analysis Forwarder: Low concurrency (1-2) since it processes DynamoDB stream
- Comfort Song Agent: Medium concurrency (5-10) to handle batch processing

### Timeouts

- Analysis Forwarder: 30 seconds (quick routing logic)
- Comfort Song Agent: 300 seconds (5 minutes) to account for:
  - Bedrock API call: ~5-10 seconds
  - ElevenLabs API call: ~30-60 seconds for music generation
  - S3 upload: ~5 seconds
  - DynamoDB update: ~1 second
  - Retries and backoff: additional buffer

### Cost Optimization

- Use standard SQS queues for simplicity and lower cost
- Set short message retention (2 minutes) since processing should be fast
- Consider caching ElevenLabs API responses if same lyrics are generated multiple times (unlikely but possible)

## Future Enhancements

- Support for different music styles based on egg characteristics
- Longer songs (30-60 seconds) for special eggs
- Lyrics in multiple languages
- User-selectable music generation parameters
- Gallery view of all comfort songs in the frontend
- Sharing comfort songs on social media

