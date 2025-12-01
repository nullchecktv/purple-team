# Implementation Plan

- [x] 1. Create shared blockchain utility module



  - [x] 1.1 Create `backend/functions/shared/blockchain-utils.mjs` with `recordToBlockchain` function

    - Accept eggId, eventType, and eventData parameters
    - Call existing blockchain integration function via HTTP
    - Return transaction ID, hash, and block number on success
    - Return null on failure (non-blocking)
    - _Requirements: 4.1, 4.2, 4.3_
  - [ ]* 1.2 Write property test for blockchain utility payload formatting
    - **Property 3: Blockchain utility formats payload correctly**
    - **Validates: Requirements 4.2**

- [x] 2. Update Egg Analysis Agent with blockchain recording


  - [x] 2.1 Modify `backend/functions/egg-analysis-agent/index.mjs` to import blockchain utility


    - Add import for blockchain-utils module
    - Call `recordToBlockchain` after `handleSaveEggAnalysis` succeeds
    - Store transaction ID in egg record via additional PutCommand fields
    - Wrap in try-catch for non-blocking behavior
    - _Requirements: 1.1, 1.2, 1.3_
  - [ ]* 2.2 Write property test for analysis blockchain recording
    - **Property 1: Blockchain recording stores transaction ID**
    - **Validates: Requirements 1.2**

- [x] 3. Update Chick Image Generator with blockchain recording


  - [x] 3.1 Modify `backend/functions/chick-image-generator/index.mjs` to record image generation


    - Add import for blockchain-utils module
    - Call `recordToBlockchain` after successful S3 upload
    - Update DynamoDB record with transaction ID fields
    - Wrap in try-catch for non-blocking behavior
    - _Requirements: 2.1, 2.2, 2.3_
  - [ ]* 3.2 Write property test for image generation blockchain recording
    - **Property 1: Blockchain recording stores transaction ID**
    - **Validates: Requirements 2.2**



- [x] 4. Update Consolidate Findings with blockchain recording

  - [x] 4.1 Modify `backend/functions/consolidate-findings/index.mjs` to record consolidation

    - Add import for blockchain-utils module
    - Call `recordToBlockchain` after `updateClutchRecord` succeeds
    - Update clutch METADATA record with transaction ID fields
    - Wrap in try-catch for non-blocking behavior
    - _Requirements: 3.1, 3.2, 3.3_
  - [ ]* 4.2 Write property test for consolidation blockchain recording
    - **Property 1: Blockchain recording stores transaction ID**
    - **Validates: Requirements 3.2**

- [x] 5. Update SAM template with blockchain endpoint environment variable


  - [x] 5.1 Add BLOCKCHAIN_API_URL environment variable to relevant functions


    - Add to EggAnalysisAgent function
    - Add to ChickImageGenerator function
    - Add to ConsolidateFindingsFunction
    - Reference the HttpApi URL for internal calls
    - _Requirements: 4.1_

- [x] 6. Final Checkpoint - Make sure all tests pass



  - Ensure all tests pass, ask the user if questions arise.
