# Implementation Plan

- [x] 1. Update presigned URL function to create clutch records





  - [x] 1.1 Modify generate-presigned-url.mjs to create clutch in DynamoDB


    - Generate clutchId (UUID) before creating presigned URL
    - Store clutch record with pk=CLUTCH#{clutchId}, sk=METADATA
    - Update S3 object key to use pattern `clutches/{clutchId}/{filename}`
    - Return clutchId in API response alongside presignedUrl and objectKey
    - _Requirements: 1.1, 1.2, 4.1_
  - [ ]* 1.2 Write property test for clutch creation
    - **Property 1: Clutch creation produces valid record**
    - **Validates: Requirements 1.1, 1.2**
  - [x] 1.3 Update SAM template with DynamoDB permissions for presigned URL function


    - Add dynamodb:PutItem permission to GeneratePresignedUrlFunction
    - _Requirements: 1.1_

- [x] 2. Update egg records to associate with clutches





  - [x] 2.1 Modify egg-stream-forwarder to extract clutchId from S3 key


    - Parse clutchId from object key pattern `clutches/{clutchId}/{filename}`
    - Include clutchId in forwarded message to SQS
    - _Requirements: 1.3_

  - [x] 2.2 Modify egg-analysis-agent to store eggs with clutch key pattern

    - Update pk to use CLUTCH#{clutchId} instead of previous pattern
    - Update sk to use EGG#{eggId} pattern
    - Store clutchId field on egg record
    - _Requirements: 1.3, 4.2_
  - [ ]* 2.3 Write property test for egg-clutch association
    - **Property 2: Egg-clutch association integrity**
    - **Validates: Requirements 1.3**

- [x] 3. Implement GET /clutches endpoint





  - [x] 3.1 Create list-clutches Lambda function


    - Scan for all CLUTCH# records with sk=METADATA
    - For each clutch, query eggs and compute eggCount and viabilityPercentage
    - Return array of clutch summaries
    - Handle empty clutches (eggCount=0, viabilityPercentage=null)
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  - [ ]* 3.2 Write property test for viability calculation
    - **Property 4: Viability calculation correctness**
    - **Validates: Requirements 2.4**
  - [x] 3.3 Add SAM template resources for list-clutches function


    - Create ListClutchesFunction with HTTP GET /clutches event
    - Add DynamoDB Scan and Query permissions
    - _Requirements: 2.1_

- [x] 4. Implement GET /clutches/{id} endpoint





  - [x] 4.1 Create get-clutch Lambda function


    - Query all items with pk=CLUTCH#{clutchId}
    - Separate METADATA record from EGG# records
    - Compute eggCount and viabilityPercentage
    - Return 404 if clutch not found
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  - [ ]* 4.2 Write property test for clutch detail completeness
    - **Property 5: Clutch detail completeness**
    - **Validates: Requirements 3.1, 3.2, 3.3**


  - [x] 4.3 Add SAM template resources for get-clutch function





    - Create GetClutchFunction with HTTP GET /clutches/{id} event
    - Add DynamoDB Query permissions
    - _Requirements: 3.1_

- [ ] 5. Update frontend to display clutch information
  - [ ] 5.1 Update ImageUpload component to capture and display clutchId
    - Store clutchId from presigned URL response
    - Show clutch ID after successful upload
    - _Requirements: 1.1_
  - [ ] 5.2 Create ClutchesList component to display all clutches
    - Fetch from GET /clutches endpoint
    - Display clutch cards with egg count and viability percentage
    - Add loading and empty states
    - _Requirements: 2.1, 2.2_
  - [ ] 5.3 Create ClutchDetail component for individual clutch view
    - Fetch from GET /clutches/{id} endpoint
    - Display clutch metadata and list of eggs with analysis data
    - Handle 404 errors gracefully
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 6. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
