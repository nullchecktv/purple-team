# Requirements Document

## Introduction

The EggMusicGenerator is a serverless Node.js application that transforms egg analysis data into unique musical compositions. When an egg analysis event is received via AWS EventBridge, the system uses AI to generate a creative music prompt based on the egg's characteristics, then produces a 15-second audio track with lyrics using the ElevenLabs Music API. The generated music file is stored in S3 and made accessible via a public URL.

## Glossary

- **EggMusicGenerator**: The serverless application system that generates music from egg attributes
- **EventBridge**: AWS service that captures and routes egg analysis events to the Lambda function
- **Lambda Handler**: The AWS Lambda function that orchestrates the music generation workflow
- **Bedrock**: AWS AI service used to generate creative music prompts using the Amazon Nova Lite model
- **ElevenLabs Music API**: Third-party API service that converts text prompts into audio music files
- **S3 Bucket**: AWS storage service where generated MP3 files are stored
- **DynamoDB Table**: AWS NoSQL database service where music file metadata and URLs are stored
- **Egg Attributes**: Structured data describing egg characteristics (color, shape, size, texture, etc.)
- **FULL_PROMPT**: Single text output from Bedrock containing both style description and lyrics in the format "Generate a song with this style: {style}. The lyrics are: {lyrics}"
- **Public URL**: Direct HTTP URL for accessing publicly readable S3 objects

## Requirements

### Requirement 1

**User Story:** As a system integrator, I want the EggMusicGenerator to receive egg analysis events via EventBridge, so that music generation is triggered automatically when egg data is available.

#### Acceptance Criteria

1. WHEN an EventBridge event containing egg attributes is received THEN the Lambda Handler SHALL extract all egg attribute fields from the event payload
2. WHEN the event payload is parsed THEN the Lambda Handler SHALL validate that required egg attributes (color, shape, size, shellTexture, shellIntegrity, hardness, spotsMarkings, bloomCondition, cleanliness, overallGrade) are present
3. WHEN required attributes are missing THEN the Lambda Handler SHALL log the validation error and return an error response
4. WHEN the EventBridge rule triggers the Lambda THEN the Lambda Handler SHALL begin execution within the configured timeout period

### Requirement 2

**User Story:** As a developer, I want the system to use AWS Bedrock to generate creative music prompts from egg attributes, so that each egg produces unique and contextually relevant music descriptions with both style and lyrics.

#### Acceptance Criteria

1. WHEN egg attributes are validated THEN the Lambda Handler SHALL invoke the AWS Bedrock service using the Amazon Nova Lite model
2. WHEN invoking Bedrock THEN the Lambda Handler SHALL construct a prompt that includes all egg attributes and requests a single text output optimized for the ElevenLabs Music API
3. WHEN constructing the Bedrock prompt THEN the Lambda Handler SHALL specify that the output must be in the exact format "Generate a song with this style: {style description}. The lyrics are: {lyrics with \n line breaks}"
4. WHEN constructing the Bedrock prompt THEN the Lambda Handler SHALL specify that the style description should include genre, instruments, tempo, and atmosphere in a few sentences
5. WHEN constructing the Bedrock prompt THEN the Lambda Handler SHALL specify that the lyrics must be positive and encouraging
6. WHEN constructing the Bedrock prompt THEN the Lambda Handler SHALL specify that the music track should be 15 seconds in duration
7. WHEN Bedrock returns a response THEN the Lambda Handler SHALL extract the complete text output as the FULL_PROMPT without additional parsing or combination
8. WHEN Bedrock invocation fails THEN the Lambda Handler SHALL log the error and return an error response

### Requirement 3

**User Story:** As a developer, I want the system to call the ElevenLabs Music API with the AI-generated FULL_PROMPT, so that text descriptions are converted into actual audio files.

#### Acceptance Criteria

1. WHEN a FULL_PROMPT is created from Bedrock output THEN the Lambda Handler SHALL invoke the ElevenLabs Text-to-Audio API with the FULL_PROMPT text
2. WHEN calling the ElevenLabs API THEN the Lambda Handler SHALL include the API key from environment variables in the request headers
3. WHEN calling the ElevenLabs API THEN the Lambda Handler SHALL specify the duration as 15 seconds
4. WHEN the ElevenLabs API returns audio data THEN the Lambda Handler SHALL receive the binary MP3 data
5. WHEN the ElevenLabs API call fails THEN the Lambda Handler SHALL log the error and return an error response

### Requirement 4

**User Story:** As a system administrator, I want generated music files stored in S3, so that audio files are persisted and accessible for retrieval.

#### Acceptance Criteria

1. WHEN binary MP3 data is received from ElevenLabs THEN the Lambda Handler SHALL upload the data to the configured S3 bucket
2. WHEN uploading to S3 THEN the Lambda Handler SHALL generate a unique object key using a timestamp and egg identifier
3. WHEN uploading to S3 THEN the Lambda Handler SHALL set the content type to "audio/mpeg"
4. WHEN uploading to S3 THEN the Lambda Handler SHALL set the object ACL to public-read
5. WHEN the S3 upload completes THEN the Lambda Handler SHALL construct a public URL for the uploaded file
6. WHEN the S3 bucket is created THEN the bucket SHALL be configured to allow public read access
7. WHEN S3 upload fails THEN the Lambda Handler SHALL log the error and return an error response

### Requirement 5

**User Story:** As a developer, I want the music file URL and metadata stored in DynamoDB, so that generated music can be queried and retrieved later.

#### Acceptance Criteria

1. WHEN the music file is successfully uploaded to S3 THEN the Lambda Handler SHALL store a record in the DynamoDB table
2. WHEN storing in DynamoDB THEN the Lambda Handler SHALL use a partition key (pk) with format "EGG#<unique-id>"
3. WHEN storing in DynamoDB THEN the Lambda Handler SHALL use a sort key (sk) with value "MUSIC"
4. WHEN storing in DynamoDB THEN the Lambda Handler SHALL include the S3 public URL in the record
5. WHEN storing in DynamoDB THEN the Lambda Handler SHALL include all egg attributes used for generation
6. WHEN storing in DynamoDB THEN the Lambda Handler SHALL include metadata (timestamp, Bedrock model used, FULL_PROMPT)
7. WHEN DynamoDB write fails THEN the Lambda Handler SHALL log the error and return an error response

### Requirement 6

**User Story:** As a developer, I want the Lambda function to return the S3 URL in the response, so that downstream systems can access the generated music file.

#### Acceptance Criteria

1. WHEN the music file is successfully uploaded to S3 and stored in DynamoDB THEN the Lambda Handler SHALL return a success response containing the S3 URL
2. WHEN returning the response THEN the Lambda Handler SHALL include the egg attributes used for generation
3. WHEN returning the response THEN the Lambda Handler SHALL include metadata about the generation process (timestamp, model used)
4. WHEN returning the response THEN the Lambda Handler SHALL include the DynamoDB record ID
5. WHEN any step in the workflow fails THEN the Lambda Handler SHALL return an error response with appropriate status code and error message

### Requirement 7

**User Story:** As a system administrator, I want the Lambda function to use environment variables for configuration, so that sensitive credentials and resource names are not hardcoded.

#### Acceptance Criteria

1. WHEN the Lambda function initializes THEN the Lambda Handler SHALL read the Bedrock model ID from the BEDROCK_MODEL_ID environment variable
2. WHEN the Lambda function initializes THEN the Lambda Handler SHALL read the ElevenLabs API key from the ELEVENLABS_API_KEY environment variable
3. WHEN the Lambda function initializes THEN the Lambda Handler SHALL read the S3 bucket name from the S3_BUCKET_NAME environment variable
4. WHEN the Lambda function initializes THEN the Lambda Handler SHALL read the DynamoDB table name from the TABLE_NAME environment variable
5. WHEN required environment variables are missing THEN the Lambda Handler SHALL log an error and fail initialization
6. WHEN the Lambda function is deployed THEN the SAM template SHALL define all required environment variables

### Requirement 8

**User Story:** As a security administrator, I want the Lambda function to have minimal IAM permissions, so that the principle of least privilege is maintained.

#### Acceptance Criteria

1. WHEN the Lambda function is deployed THEN the execution role SHALL include permissions to invoke Bedrock models
2. WHEN the Lambda function is deployed THEN the execution role SHALL include permissions to put objects in the specified S3 bucket with public-read ACL
3. WHEN the Lambda function is deployed THEN the execution role SHALL include permissions to put items in the DynamoDB table
4. WHEN the Lambda function is deployed THEN the execution role SHALL include permissions to write logs to CloudWatch
5. WHEN the S3 bucket is created THEN the bucket policy SHALL allow public read access to all objects
6. WHEN the Lambda function is deployed THEN the execution role SHALL NOT include permissions beyond those required for the music generation workflow

### Requirement 9

**User Story:** As a developer, I want the system to log all operations and errors, so that I can troubleshoot issues and monitor system behavior.

#### Acceptance Criteria

1. WHEN the Lambda function receives an event THEN the Lambda Handler SHALL log the incoming egg attributes
2. WHEN invoking Bedrock THEN the Lambda Handler SHALL log the request and response
3. WHEN calling ElevenLabs API THEN the Lambda Handler SHALL log the API call status
4. WHEN uploading to S3 THEN the Lambda Handler SHALL log the upload status and resulting URL
5. WHEN storing in DynamoDB THEN the Lambda Handler SHALL log the write operation status
6. WHEN any error occurs THEN the Lambda Handler SHALL log the error with sufficient context for debugging
