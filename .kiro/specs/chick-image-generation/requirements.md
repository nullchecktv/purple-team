# Requirements Document

## Introduction

This feature extends the egg analysis pipeline to generate realistic images and custom music for predicted chicks using Amazon Nova Canvas and ElevenLabs when eggs have a high likelihood of successful hatching. When an egg record is updated with analysis results indicating high viability (hatchLikelihood >= 70%), the system automatically generates a photorealistic image of the predicted chick based on breed and appearance characteristics, creates custom music that reflects the chick's personality and breed traits, stores both assets in S3, and updates the DynamoDB record with their locations. This provides farmers with both visual and auditory previews of the expected chick.

## Glossary

- **Chick_Media_Generator**: The Lambda function that generates both chick images using Amazon Nova Canvas and custom music using ElevenLabs, storing both in S3
- **Nova_Canvas**: Amazon's image generation model (amazon.nova-canvas-v1:0) capable of creating photorealistic images from text prompts
- **ElevenLabs_API**: Music generation service that creates custom audio based on text descriptions and style parameters
- **High_Hatch_Likelihood**: An egg record with hatchLikelihood >= 70%
- **Media_Storage_Bucket**: The S3 bucket where generated chick images and music files are stored
- **Egg_Record**: A DynamoDB record with sk beginning with "EGG#" that gets updated with analysis results (hatchLikelihood, chickenAppearance, predictedChickBreed, etc.)
- **Chicken_Appearance**: The predicted visual characteristics of the chick (plumageColor, combType, bodyType, featherPattern, legColor)
- **Chick_Music**: Custom-generated audio that reflects the personality and breed characteristics of the predicted chick

## Requirements

### Requirement 1

**User Story:** As a poultry farm operator, I want chick images and music generated only for viable eggs, so that I can visualize and hear what chicks will be like from eggs worth incubating.

#### Acceptance Criteria

1. WHEN an egg record is modified in DynamoDB with hatchLikelihood >= 70 THEN the Chick_Media_Generator SHALL be triggered to generate both image and music
2. WHEN an egg record has hatchLikelihood < 70 THEN the Chick_Media_Generator SHALL skip media generation for that record
3. WHEN the Chick_Media_Generator receives an egg record THEN the system SHALL extract chickenAppearance and predictedChickBreed from the record

### Requirement 2

**User Story:** As a poultry farm operator, I want realistic chick images generated based on breed characteristics, so that I can see an accurate preview of the expected chick.

#### Acceptance Criteria

1. WHEN generating a chick image THEN the Chick_Media_Generator SHALL construct a prompt using predictedChickBreed, plumageColor, combType, bodyType, featherPattern, and legColor
2. WHEN invoking Nova Canvas THEN the Chick_Media_Generator SHALL request a photorealistic image of a baby chick with the specified characteristics
3. WHEN Nova Canvas returns an image THEN the Chick_Media_Generator SHALL receive the image as base64-encoded data

### Requirement 3

**User Story:** As a poultry farm operator, I want custom music generated that reflects the chick's personality and breed traits, so that I can experience the unique character of each predicted chick.

#### Acceptance Criteria

1. WHEN generating chick music THEN the Chick_Media_Generator SHALL construct a music description using predictedChickBreed and chickenAppearance characteristics
2. WHEN invoking ElevenLabs API THEN the Chick_Media_Generator SHALL request 15-second music with breed-appropriate style and personality traits
3. WHEN ElevenLabs returns audio THEN the Chick_Media_Generator SHALL receive the music as binary audio data

### Requirement 4

**User Story:** As a system integrator, I want generated images and music stored in S3 with predictable paths, so that the frontend can easily retrieve and display them.

#### Acceptance Criteria

1. WHEN storing a chick image THEN the Chick_Media_Generator SHALL upload to S3 with key format "chicks/{pk}/{eggId}.png"
2. WHEN storing chick music THEN the Chick_Media_Generator SHALL upload to S3 with key format "chicks/{pk}/{eggId}.mp3"
3. WHEN uploading to S3 THEN the Chick_Media_Generator SHALL set appropriate ContentType ("image/png" for images, "audio/mpeg" for music)
4. WHEN the S3 uploads complete THEN the Chick_Media_Generator SHALL construct full S3 URIs for both assets

### Requirement 5

**User Story:** As a system integrator, I want the DynamoDB record updated with both image and music locations, so that downstream systems can access the generated media.

#### Acceptance Criteria

1. WHEN the S3 uploads complete successfully THEN the Chick_Media_Generator SHALL update the egg record with chickImageUrl and chickMusicUrl fields
2. WHEN updating the DynamoDB record THEN the Chick_Media_Generator SHALL preserve all existing fields and add chickImageUrl, chickMusicUrl, and mediaGeneratedAt timestamp
3. WHEN the media generation completes THEN the system SHALL log the successful generation with eggId and both S3 locations

### Requirement 6

**User Story:** As a developer, I want the infrastructure properly configured with correct IAM permissions, so that the system operates securely.

#### Acceptance Criteria

1. WHEN deploying the Chick_Media_Generator THEN the SAM template SHALL grant bedrock:InvokeModel permission for amazon.nova-canvas-v1:0
2. WHEN deploying the Chick_Media_Generator THEN the SAM template SHALL grant s3:PutObject permission to the Media_Storage_Bucket
3. WHEN deploying the Chick_Media_Generator THEN the SAM template SHALL grant dynamodb:UpdateItem permission to the DataTable
4. WHEN deploying the Chick_Media_Generator THEN the SAM template SHALL include ElevenLabs API key as an environment variable
5. WHEN configuring the DynamoDB stream event source THEN the SAM template SHALL use FilterCriteria to match MODIFY events on EGG# records where hatchLikelihood exists and is >= 70
