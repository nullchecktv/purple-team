# Implementation Plan

- [x] 1. Set up S3 bucket and Lambda function infrastructure
  - Add S3 bucket resource to backend/template.yaml with EventBridge enabled
  - Add Lambda function resource for presigned URL generation
  - Configure CORS on S3 bucket for browser uploads
  - Add IAM permissions for Lambda to generate presigned URLs
  - Add bucket name to Lambda environment variables
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 5.1, 5.2, 5.3_

- [x] 2. Implement presigned URL Lambda function
  - Create backend/functions/image-upload/generate-presigned-url.mjs
  - Implement request validation for fileName and contentType
  - Implement unique object key generation with timestamp and UUID
  - Implement S3 presigned URL generation with 5-minute expiration
  - Implement content-type constraint in presigned URL
  - Add error handling and logging
  - Return presignedUrl, objectKey, and expiresIn in response
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 6.4_

- [x] 3. Create image upload UI component
  - Create frontend/src/components/ImageUpload.tsx
  - Implement drag-and-drop zone with visual feedback
  - Implement file picker trigger on click
  - Add file type validation (JPEG, PNG, GIF, WebP)
  - Add file size validation (max 10MB)
  - Implement state management for upload status
  - Add Tailwind styling with theme colors
  - _Requirements: 1.1, 1.3, 2.1, 2.2, 2.3_

- [x] 4. Implement upload flow in UI component
  - Implement presigned URL request to backend API
  - Implement direct S3 upload using presigned URL
  - Add upload progress tracking
  - Add loading state with spinner animation
  - Add success state with image preview
  - Add error handling with retry button
  - Display appropriate error messages for different failure types
  - _Requirements: 1.2, 1.4, 1.5, 2.4, 4.3, 4.4, 6.1, 6.3_

- [x] 5. Integrate upload component into application
  - Add ImageUpload component to appropriate page
  - Wire up API endpoint URL from environment variables
  - Add navigation/routing if needed
  - Ensure responsive design
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 6. Deploy and verify
  - Deploy backend with sam build && sam deploy
  - Deploy frontend
  - Test upload flow end-to-end
  - Verify EventBridge events in CloudWatch
  - Verify uploaded images in S3 console
  - _Requirements: All_
