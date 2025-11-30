# Design Document

## Overview

The image upload feature provides a secure, user-friendly way to upload images to AWS S3 using presigned URLs. The system consists of three main components: a React-based drag-and-drop UI, a Lambda function that generates presigned URLs, and an S3 bucket configured with EventBridge notifications for downstream processing.

The architecture follows a direct-to-S3 upload pattern where the client requests a presigned URL from the backend, then uploads directly to S3 without routing the image data through the Lambda function. This approach minimizes Lambda execution time and data transfer costs while maintaining security through time-limited, scoped presigned URLs.

## Architecture

### High-Level Flow

```
User → Upload UI → Lambda (Presigned URL) → Upload UI → S3 Bucket → EventBridge
```

1. User selects or drags an image file
2. Upload UI validates file type and size
3. Upload UI requests presigned URL from Lambda function
4. Lambda generates presigned URL with constraints and returns to client
5. Upload UI uploads image directly to S3 using presigned URL
6. S3 stores image and emits EventBridge notification
7. Upload UI displays success confirmation

### AWS Services

- **API Gateway (HTTP API)**: REST endpoint for presigned URL generation
- **Lambda**: Serverless function to generate presigned URLs
- **S3**: Object storage for uploaded images with EventBridge enabled
- **EventBridge**: Event bus for downstream processing triggers
- **DynamoDB**: Optional metadata storage for upload tracking

## Components and Interfaces

### 1. Upload UI Component (React)

**Location**: `frontend/src/components/ImageUpload.tsx`

**Responsibilities**:
- Render drag-and-drop zone with visual feedback
- Handle file selection via drag-and-drop or file picker
- Validate file type (JPEG, PNG, GIF, WebP) and size (max 10MB)
- Request presigned URL from backend API
- Upload file to S3 using presigned URL
- Display upload progress and status
- Show success/error messages

**Key Functions**:
- `handleFileSelect(file: File)`: Validates and initiates upload
- `requestPresignedUrl(fileName: string, fileType: string)`: Calls backend API
- `uploadToS3(presignedUrl: string, file: File)`: Performs S3 upload
- `handleDragOver(event: DragEvent)`: Provides visual feedback
- `handleDrop(event: DragEvent)`: Processes dropped files

**State Management**:
- `uploading: boolean` - Upload in progress
- `progress: number` - Upload progress percentage
- `error: string | null` - Error message
- `uploadedUrl: string | null` - Uploaded image URL

### 2. Presigned URL Lambda Function

**Location**: `backend/functions/image-upload/generate-presigned-url.mjs`

**Responsibilities**:
- Receive presigned URL requests from API Gateway
- Validate request parameters
- Generate unique object key with timestamp and UUID
- Create presigned URL with 5-minute expiration
- Apply content-type constraints
- Return presigned URL and object key to client

**Input**:
```json
{
  "fileName": "photo.jpg",
  "contentType": "image/jpeg"
}
```

**Output**:
```json
{
  "presignedUrl": "https://bucket.s3.amazonaws.com/...",
  "objectKey": "uploads/2024-01-15/uuid-photo.jpg",
  "expiresIn": 300
}
```

**Key Functions**:
- `generateObjectKey(fileName: string)`: Creates unique S3 key
- `generatePresignedUrl(objectKey: string, contentType: string)`: Creates presigned URL
- `validateRequest(body: object)`: Validates input parameters

### 3. S3 Bucket Configuration

**Bucket Name**: `${StackName}-image-uploads-${AWS::AccountId}`

**Configuration**:
- EventBridge notifications enabled
- CORS configured for browser uploads
- Lifecycle policy for cleanup (optional)
- Server-side encryption enabled

**Event Notifications**:
- Event type: `s3:ObjectCreated:*`
- Destination: EventBridge
- Event payload includes: bucket, key, size, etag, timestamp

## Data Models

### Presigned URL Request
```typescript
interface PresignedUrlRequest {
  fileName: string;      // Original file name
  contentType: string;   // MIME type (image/jpeg, image/png, etc.)
}
```

### Presigned URL Response
```typescript
interface PresignedUrlResponse {
  presignedUrl: string;  // Time-limited S3 upload URL
  objectKey: string;     // S3 object key for the upload
  expiresIn: number;     // Expiration time in seconds
}
```

### S3 Event Payload
```typescript
interface S3Event {
  version: string;
  id: string;
  'detail-type': 'Object Created';
  source: 'aws.s3';
  account: string;
  time: string;
  region: string;
  resources: string[];
  detail: {
    version: string;
    bucket: {
      name: string;
    };
    object: {
      key: string;
      size: number;
      etag: string;
      sequencer: string;
    };
    'request-id': string;
    requester: string;
    'source-ip-address': string;
  };
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, several properties can be consolidated:
- Properties 1.2 and 1.4 both test that file selection triggers upload - these can be combined
- Properties 2.1 and 2.2 both test file type validation - these can be combined into one comprehensive property
- Properties 4.3 and 4.4 both test UI state after upload completion - these can be combined
- Properties 6.1 and 6.3 both test error display - these can be combined into one error handling property

### UI Interaction Properties

**Property 1: Drag feedback activation**
*For any* drag event over the upload area, the UI state should reflect active drag status with appropriate visual feedback
**Validates: Requirements 1.1**

**Property 2: File selection triggers upload**
*For any* valid image file selected through drag-and-drop or file picker, the upload process should be initiated with that file
**Validates: Requirements 1.2, 1.4**

**Property 3: Upload progress indication**
*For any* upload in progress, the UI should display loading state with progress information
**Validates: Requirements 1.5**

### Validation Properties

**Property 4: Image type validation**
*For any* file with MIME type in [image/jpeg, image/png, image/gif, image/webp], validation should pass; for any other MIME type, validation should fail with an error message
**Validates: Requirements 2.1, 2.2**

**Property 5: Valid files proceed to upload**
*For any* file that passes validation, the system should request a presigned URL from the backend
**Validates: Requirements 2.4**

### Backend Properties

**Property 6: Presigned URL expiration**
*For any* presigned URL request, the generated URL should have an expiration time of exactly 300 seconds (5 minutes)
**Validates: Requirements 3.1**

**Property 7: Content type constraint**
*For any* presigned URL generated with content type T, the presigned URL parameters should enforce content type T
**Validates: Requirements 3.2**

**Property 8: Object key uniqueness**
*For any* two presigned URL requests, even with identical file names, the generated object keys should be unique
**Validates: Requirements 3.3**

**Property 9: Response structure completeness**
*For any* successful presigned URL generation, the response should contain presignedUrl, objectKey, and expiresIn fields
**Validates: Requirements 3.4**

**Property 10: Error response format**
*For any* presigned URL generation failure, the response should have status code >= 400 and include an error message
**Validates: Requirements 3.5**

### Upload Completion Properties

**Property 11: Upload completion UI state**
*For any* completed upload (success or failure), the UI should display appropriate feedback (success message with preview OR error message with retry option)
**Validates: Requirements 4.3, 4.4**

### Error Handling Properties

**Property 12: Error display**
*For any* error during presigned URL request or S3 upload, the UI should display an error message describing the failure
**Validates: Requirements 6.1, 6.3**

**Property 13: Error logging**
*For any* error in the Upload System, the error details should be logged to CloudWatch
**Validates: Requirements 6.4**

## Error Handling

### Client-Side Errors

**File Validation Errors**:
- Invalid file type: Display "Please select an image file (JPEG, PNG, GIF, or WebP)"
- File too large: Display "File size must be less than 10MB"
- No file selected: Display "Please select a file to upload"

**Network Errors**:
- Presigned URL request fails: Display "Connection error. Please check your internet and try again"
- S3 upload fails: Display "Upload failed: [error reason]. Please try again"
- Timeout: Display "Upload timed out. Please try again"

**Error Recovery**:
- All errors provide a "Try Again" button
- Failed uploads can be retried without page refresh
- Error messages auto-dismiss after successful retry

### Server-Side Errors

**Lambda Function Errors**:
- Invalid request body: Return 400 with validation error details
- S3 client errors: Return 500 with generic error message (log details)
- Missing environment variables: Return 500 with configuration error
- Unexpected errors: Return 500 with generic error message (log stack trace)

**Error Response Format**:
```json
{
  "error": "Error message for client",
  "code": "ERROR_CODE",
  "requestId": "uuid"
}
```

## Testing Strategy

**Hackathon Mode**: Testing is skipped to maximize development speed. Focus on visual demo and core functionality.

## Security Considerations

### Presigned URL Security

- **Time-Limited Access**: URLs expire after 5 minutes to minimize exposure window
- **Content-Type Enforcement**: Presigned URLs enforce specific content types to prevent malicious file uploads
- **Unique Keys**: Random UUIDs prevent key guessing and overwriting
- **HTTPS Only**: All uploads use HTTPS for encryption in transit

### S3 Bucket Security

- **Private Bucket**: Bucket is not publicly accessible
- **Server-Side Encryption**: All objects encrypted at rest using SSE-S3
- **CORS Configuration**: Restricted to specific origins (configure for production)
- **Bucket Policies**: Enforce encryption and deny unencrypted uploads

### Input Validation

- **Client-Side**: File type and size validation before upload
- **Server-Side**: Content-Type validation in presigned URL constraints
- **File Name Sanitization**: Original file names sanitized to prevent path traversal

## Performance Considerations

### Lambda Optimization

- **Cold Start**: Use ARM64 architecture for better price/performance
- **Memory**: 512MB sufficient for presigned URL generation
- **Timeout**: 30 seconds provides ample time for S3 API calls
- **Connection Reuse**: Enable AWS SDK connection reuse

### Frontend Optimization

- **Direct Upload**: Files upload directly to S3, bypassing Lambda
- **Progress Tracking**: XMLHttpRequest provides upload progress events
- **Lazy Loading**: Upload component code-split for faster initial load
- **Image Preview**: Generate preview from File object before upload

### S3 Optimization

- **Multipart Upload**: For files > 5MB, use multipart upload (future enhancement)
- **Transfer Acceleration**: Enable for faster uploads from distant regions (optional)
- **Lifecycle Policies**: Auto-delete old uploads if needed

## Deployment Configuration

### SAM Template Resources

**S3 Bucket**:
```yaml
ImageUploadBucket:
  Type: AWS::S3::Bucket
  Properties:
    BucketName: !Sub '${AWS::StackName}-image-uploads-${AWS::AccountId}'
    NotificationConfiguration:
      EventBridgeConfiguration:
        EventBridgeEnabled: true
    CorsConfiguration:
      CorsRules:
        - AllowedOrigins: ['*']
          AllowedMethods: [PUT, POST]
          AllowedHeaders: ['*']
          MaxAge: 3000
    BucketEncryption:
      ServerSideEncryptionConfiguration:
        - ServerSideEncryptionByDefault:
            SSEAlgorithm: AES256
```

**Lambda Function**:
```yaml
GeneratePresignedUrlFunction:
  Type: AWS::Serverless::Function
  Properties:
    Runtime: nodejs22.x
    Handler: generate-presigned-url.handler
    CodeUri: functions/image-upload/
    Environment:
      Variables:
        BUCKET_NAME: !Ref ImageUploadBucket
    Policies:
      - S3CrudPolicy:
          BucketName: !Ref ImageUploadBucket
    Events:
      Api:
        Type: HttpApi
        Properties:
          ApiId: !Ref HttpApi
          Path: /upload/presigned-url
          Method: post
```

### Environment Variables

**Backend**:
- `BUCKET_NAME`: S3 bucket name for uploads
- `TABLE_NAME`: DynamoDB table for metadata (optional)
- `API_URL`: API Gateway URL

**Frontend**:
- `NEXT_PUBLIC_API_URL`: Backend API endpoint

## Future Enhancements

1. **Multipart Upload**: Support for large files (>10MB) using multipart upload
2. **Image Processing**: Automatic thumbnail generation using Lambda triggered by EventBridge
3. **Upload Metadata**: Store upload metadata in DynamoDB for tracking
4. **Progress Persistence**: Resume interrupted uploads
5. **Multiple File Upload**: Support batch uploads
6. **Image Validation**: Server-side image validation (dimensions, format verification)
7. **CDN Integration**: CloudFront distribution for uploaded images
8. **Upload History**: User dashboard showing upload history
