# Requirements Document

## Introduction

This feature provides emotional support for non-viable eggs (those with less than 50% hatch likelihood) by generating personalized comfort songs. When an egg is analyzed and determined to be non-viable, the system creates uplifting song lyrics based on the egg's characteristics and generates a musical composition using ElevenLabs Music API.

## Glossary

- **Non-Viable Egg**: An egg with a hatchLikelihood score below 50%, indicating low probability of successful hatching
- **Egg Analysis System**: The existing system that analyzes egg images and determines viability metrics
- **Analysis Forwarder**: Lambda function that routes analyzed eggs to appropriate processing queues
- **Comfort Song Agent**: AI agent that generates three-line affirmation lyrics based on egg characteristics
- **Music Generator**: ElevenLabs API service that converts lyrics into musical compositions
- **Egg Record**: DynamoDB item containing egg analysis data and metadata

## Requirements

### Requirement 1

**User Story:** As a farmer, I want non-viable eggs to receive words of affirmation through music, so that every egg is honored regardless of viability.

#### Acceptance Criteria

1. WHEN an egg has hatchLikelihood less than 50% THEN the Analysis Forwarder SHALL route the egg to the non-viable processing queue
2. WHEN an egg has hatchLikelihood of 50% or greater THEN the Analysis Forwarder SHALL route the egg to the existing chick image generation queue
3. WHEN the Analysis Forwarder processes an egg THEN the system SHALL send exactly one message to exactly one queue based on hatchLikelihood threshold
4. WHEN routing decisions are made THEN the system SHALL include all egg analysis data in the queue message

### Requirement 2

**User Story:** As a farmer, I want personalized song lyrics for each non-viable egg, so that the comfort feels genuine and specific.

#### Acceptance Criteria

1. WHEN the Comfort Song Agent receives an egg record THEN the system SHALL generate exactly three lines of affirmation lyrics
2. WHEN generating lyrics THEN the system SHALL incorporate the egg's color, shape, and breed information
3. WHEN generating lyrics THEN the system SHALL create uplifting and positive affirmations
4. WHEN lyrics are generated THEN the system SHALL avoid negative language or references to failure
5. WHEN the agent completes processing THEN the system SHALL return the three-line lyrics as structured text

### Requirement 3

**User Story:** As a farmer, I want the comfort songs to be actual music, so that I can listen to them and feel the emotional connection.

#### Acceptance Criteria

1. WHEN lyrics are generated THEN the system SHALL send the lyrics to ElevenLabs Music Generator API
2. WHEN calling ElevenLabs API THEN the system SHALL use the text-to-music endpoint with appropriate parameters
3. WHEN music generation completes THEN the system SHALL receive an audio file in MP3 format
4. WHEN API calls fail THEN the system SHALL retry up to three times with exponential backoff
5. WHEN all retries fail THEN the system SHALL log the error and continue without failing the entire process

### Requirement 4

**User Story:** As a farmer, I want the comfort songs stored with the egg records, so that I can access them later through the application.

#### Acceptance Criteria

1. WHEN a music file is generated THEN the system SHALL upload the file to the S3 bucket with a unique key
2. WHEN uploading to S3 THEN the system SHALL use the naming pattern `music/{clutchId}-{eggId}_{timestamp}.mp3`
3. WHEN the S3 upload completes THEN the system SHALL update the egg record in DynamoDB with the S3 key
4. WHEN updating the egg record THEN the system SHALL add a `comfortSongKey` field containing the S3 object key
5. WHEN updating the egg record THEN the system SHALL add a `comfortSongGeneratedAt` field with ISO 8601 timestamp
6. WHEN the Comfort Song Agent completes processing THEN the system SHALL publish an "Egg Processing Completed" event to EventBridge

### Requirement 5

**User Story:** As a system administrator, I want the non-viable processing to be asynchronous and decoupled, so that failures don't impact the main analysis pipeline.

#### Acceptance Criteria

1. WHEN creating the non-viable queue THEN the system SHALL configure it as a standard SQS queue
2. WHEN the queue is created THEN the system SHALL set visibility timeout to 300 seconds
3. WHEN the queue is created THEN the system SHALL set message retention period to 120 seconds
4. WHEN the Comfort Song Agent fails THEN the system SHALL use dead letter queue for failed messages after 3 attempts
5. WHEN processing completes THEN the system SHALL delete the message from the queue

### Requirement 6

**User Story:** As a developer, I want the Comfort Song Agent to follow existing agent patterns, so that the codebase remains consistent and maintainable.

#### Acceptance Criteria

1. WHEN implementing the agent THEN the system SHALL use the same structure as chick-image-generator.mjs and egg-analysis.mjs
2. WHEN implementing the agent THEN the system SHALL use Amazon Bedrock Converse API for lyrics generation
3. WHEN implementing the agent THEN the system SHALL use the nova-pro-v1:0 model
4. WHEN implementing the agent THEN the system SHALL include proper error handling with try-catch blocks
5. WHEN implementing the agent THEN the system SHALL log errors to CloudWatch without exposing sensitive data
