# Implementation Plan

- [ ] 1. Set up project structure and dependencies
  - Create Lambda function directory at `backend/functions/egg-music-generator/`
  - Initialize package.json with required dependencies (@aws-sdk/client-bedrock-runtime, @aws-sdk/client-s3, @aws-sdk/client-dynamodb, @aws-sdk/lib-dynamodb, node-fetch)
  - Create index.mjs as the main handler file
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 2. Implement event parsing and validation
  - [ ] 2.1 Create event parser function to extract egg attributes from EventBridge event
    - Parse event.detail to extract all egg attribute fields
    - Return structured EggAttributes object
    - _Requirements: 1.1_

  - [ ] 2.2 Create validation function for required egg attributes
    - Validate presence of required fields (color, shape, size, shellTexture, shellIntegrity, hardness, spotsMarkings, bloomCondition, cleanliness, overallGrade)
    - Return validation errors if fields are missing
    - _Requirements: 1.2, 1.3_

  - [ ]* 2.3 Write property test for event attribute extraction
    - **Property 1: Event attribute extraction completeness**
    - **Validates: Requirements 1.1, 1.2**

  - [ ]* 2.4 Write property test for validation error handling
    - **Property 2: Validation error handling**
    - **Validates: Requirements 1.3**

- [ ] 3. Implement Bedrock integration for prompt generation
  - [ ] 3.1 Create Bedrock client and prompt construction function
    - Initialize BedrockRuntimeClient
    - Create prompt template that includes all egg attributes
    - Format prompt to request single text output in format: "Generate a song with this style: {style}. The lyrics are: {lyrics}"
    - Specify that style should include genre, instruments, tempo, atmosphere
    - Specify that lyrics must be positive and encouraging
    - Include example outputs in the prompt
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [ ] 3.2 Implement Bedrock invocation and response parsing
    - Call InvokeModel API with constructed prompt
    - Extract the complete text output as FULL_PROMPT (no JSON parsing needed)
    - Validate that response contains "Generate a song with this style:" and "The lyrics are:"
    - Handle Bedrock errors and return appropriate error responses
    - _Requirements: 2.7, 2.8_

  - [ ]* 3.3 Write property test for Bedrock prompt includes all attributes
    - **Property 2: Bedrock prompt includes all attributes**
    - **Validates: Requirements 2.2**

  - [ ]* 3.4 Write property test for Bedrock response format validation
    - **Property 3: Bedrock response format validity**
    - **Validates: Requirements 2.3, 2.7**

  - [ ]* 3.5 Write property test for Bedrock error propagation
    - **Property 6: Error propagation from Bedrock**
    - **Validates: Requirements 2.8**

- [ ] 4. Implement ElevenLabs Music API integration
  - [ ] 4.1 Create ElevenLabs API client function
    - Implement fetch call to ElevenLabs text-to-sound-effects endpoint
    - Include API key from environment variable in headers
    - Send FULL_PROMPT with duration_seconds: 15
    - Return binary MP3 data
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ] 4.2 Implement error handling for ElevenLabs API
    - Handle authentication failures
    - Handle rate limits
    - Handle network timeouts with retry logic
    - Return appropriate error responses
    - _Requirements: 3.5_

  - [ ]* 4.3 Write property test for ElevenLabs error propagation
    - **Property 7: Error propagation from ElevenLabs**
    - **Validates: Requirements 3.5**

- [ ] 5. Implement S3 storage with public access
  - [ ] 5.1 Create S3 upload function
    - Initialize S3Client
    - Generate unique object key using timestamp and egg ID
    - Upload MP3 binary data with ContentType: 'audio/mpeg'
    - Set ACL to 'public-read'
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ] 5.2 Create public URL construction function
    - Build URL in format: https://{bucket}.s3.{region}.amazonaws.com/{key}
    - Return public URL
    - _Requirements: 4.5_

  - [ ] 5.3 Implement error handling for S3 operations
    - Handle upload failures
    - Handle permission errors
    - Handle bucket not found errors
    - Return appropriate error responses
    - _Requirements: 4.7_

  - [ ]* 5.4 Write property test for S3 key uniqueness
    - **Property 9: S3 key uniqueness**
    - **Validates: Requirements 4.2**

  - [ ]* 5.5 Write property test for S3 public URL construction
    - **Property 10: S3 public URL construction**
    - **Validates: Requirements 4.5**

  - [ ]* 5.6 Write property test for S3 error propagation
    - **Property 11: Error propagation from S3**
    - **Validates: Requirements 4.7**

- [ ] 6. Implement DynamoDB metadata storage
  - [ ] 6.1 Create DynamoDB write function
    - Initialize DynamoDBDocumentClient
    - Generate partition key in format: EGG#{unique-id}
    - Set sort key to 'MUSIC'
    - Create record with musicUrl, timestamp, eggAttributes, and metadata (bedrockModel, fullPrompt, generatedAt)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [ ] 6.2 Implement error handling for DynamoDB operations
    - Handle write failures
    - Handle table not found errors
    - Handle throttling with retry logic
    - Return appropriate error responses
    - _Requirements: 5.7_

  - [ ]* 6.3 Write property test for DynamoDB pk format
    - **Property 13: DynamoDB pk format**
    - **Validates: Requirements 5.2**

  - [ ]* 6.4 Write property test for DynamoDB record completeness
    - **Property 14: DynamoDB record completeness**
    - **Validates: Requirements 5.4, 5.5, 5.6**

  - [ ]* 6.5 Write property test for DynamoDB error propagation
    - **Property 15: Error propagation from DynamoDB**
    - **Validates: Requirements 5.7**

- [ ] 7. Implement main Lambda handler orchestration
  - [ ] 7.1 Create main handler function
    - Orchestrate the complete workflow: parse → validate → Bedrock → ElevenLabs → S3 → DynamoDB
    - Implement error handling at each step
    - Return success response with musicUrl, recordId, eggAttributes, and metadata (timestamp, bedrockModel, fullPrompt)
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [ ] 7.2 Implement response formatting
    - Format success response with all required fields
    - Format error responses with statusCode and error message
    - _Requirements: 6.5_

  - [ ] 7.3 Add comprehensive logging
    - Log incoming events
    - Log Bedrock requests/responses
    - Log ElevenLabs API calls
    - Log S3 upload status
    - Log DynamoDB write operations
    - Log all errors with context
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

  - [ ]* 7.4 Write property test for response data consistency
    - **Property 17: Response data consistency**
    - **Validates: Requirements 6.2**

  - [ ]* 7.5 Write property test for error response format
    - **Property 20: Error response format**
    - **Validates: Requirements 6.5**

- [ ] 8. Create SAM template resources
  - [ ] 8.1 Add Lambda function to template.yaml
    - Define EggMusicGeneratorFunction with nodejs22.x runtime
    - Set timeout to 60 seconds
    - Set memory to 1024 MB
    - Configure esbuild metadata
    - _Requirements: 7.5_

  - [ ] 8.2 Add environment variables to Lambda function
    - Add BEDROCK_MODEL_ID environment variable
    - Add ELEVENLABS_API_KEY environment variable
    - Add S3_BUCKET_NAME environment variable
    - Add TABLE_NAME environment variable (reference existing DataTable)
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [ ] 8.3 Create S3 bucket for music storage
    - Define MusicBucket resource
    - Configure bucket for public read access
    - Add bucket policy to allow GetObject for all objects
    - _Requirements: 4.6_

  - [ ] 8.4 Add IAM permissions to Lambda execution role
    - Add bedrock:InvokeModel permission for Nova Lite model
    - Add s3:PutObject and s3:PutObjectAcl permissions for MusicBucket
    - Add dynamodb:PutItem permission for DataTable
    - _Requirements: 8.1, 8.2, 8.3, 8.5_

  - [ ] 8.5 Create EventBridge rule for egg analysis events
    - Define EggAnalysisEventRule
    - Configure event pattern to match egg analysis events
    - Add Lambda function as target
    - Add Lambda invoke permission for EventBridge
    - _Requirements: 1.4_

- [ ] 9. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Create deployment documentation
  - Document required environment variables
  - Document ElevenLabs API key setup
  - Document how to trigger test events
  - Document how to verify music generation
  - _Requirements: All_
