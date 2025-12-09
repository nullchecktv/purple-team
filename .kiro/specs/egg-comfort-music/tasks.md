<clu# Implementation Plan

- [x] 1. Create non-viable queue infrastructure




  - Add NonViableEggQueue resource to SAM template
  - Configure as standard SQS queue with 300s visibility timeout and 120s retention
  - Add NonViableEggQueueDLQ dead letter queue resource
  - Configure DLQ with maxReceiveCount of 3
  - Add queue URL outputs to template
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 2. Update Analysis Forwarder with routing logic




  - Add NON_VIABLE_QUEUE_URL environment variable to template
  - Modify analysis-forwarder.mjs to implement hatchLikelihood-based routing
  - Route eggs with hatchLikelihood < 50 to non-viable queue
  - Route eggs with hatchLikelihood >= 50 to existing chick image queue
  - Ensure exactly one message is sent per egg
  - Preserve all egg data in queue messages
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 3. Create Comfort Song Agent Lambda function




  - Create backend/functions/agents/comfort-song-generator.mjs
  - Set up basic Lambda handler structure following existing agent patterns
  - Add SQS event source mapping to non-viable queue
  - Configure Lambda with 300s timeout and appropriate memory
  - Add required environment variables (TABLE_NAME, BUCKET_NAME, ELEVENLABS_API_KEY)
  - Add IAM permissions for Bedrock, S3, DynamoDB, SQS, and EventBridge
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 4. Implement lyrics generation with Bedrock





  - Import Bedrock Converse API client
  - Create system prompt for generating three-line affirmations
  - Build user message from egg characteristics (color, shape, breed, appearance)
  - Call Bedrock with nova-pro-v1:0 model
  - Parse response to extract three-line lyrics
  - Add error handling with try-catch and fallback lyrics
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 5. Integrate ElevenLabs Music API





  - Add ElevenLabs API key to environment configuration
  - Implement function to call text-to-sound-effects endpoint
  - Send lyrics with 15-second duration parameter
  - Implement retry logic with exponential backoff (1s, 2s, 4s)
  - Handle API failures gracefully without blocking pipeline
  - Return MP3 audio buffer on success
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 6. Implement S3 upload and DynamoDB update





  - Generate S3 key using pattern music/{clutchId}-{eggId}_{timestamp}.mp3
  - Upload MP3 buffer to S3 with public-read ACL
  - Update egg record in DynamoDB with comfortSongKey field
  - Add comfortSongGeneratedAt timestamp field in ISO 8601 format
  - Add comfortSongLyrics field with the three-line lyrics
  - Implement retry logic for S3 and DynamoDB operations
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 7. Publish EventBridge completion event




  - Import EventBridge client
  - Extract clutchId and eggId from egg record
  - Publish "Egg Processing Completed" event with DetailType and Source
  - Include clutchId and eggId in event Detail
  - Add error handling for EventBridge failures
  - _Requirements: 4.6_

- [x] 8. Add secrets management for ElevenLabs API key

  - Create AWS Secrets Manager secret for ElevenLabs API key
  - Add secret ARN to SAM template parameters
  - Grant Lambda permission to read secret
  - Update Lambda function to retrieve API key from Secrets Manager at runtime
  - _Requirements: 3.1_

- [x] 9. Checkpoint - Ensure all tests pass



  - Ensure all tests pass, ask the user if questions arise.
