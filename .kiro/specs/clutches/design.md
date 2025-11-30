# Clutches Feature Design

## Overview

The clutches feature organizes eggs into logical groups based on image uploads. When a user uploads an image containing eggs, the system creates a clutch record and associates all detected eggs with that clutch. This enables aggregate statistics and drill-down analysis capabilities.

## Architecture

```mermaid
flowchart LR
    subgraph Frontend
        UI[Image Upload UI]
    end

    subgraph API Gateway
        POST[POST /upload/presigned-url]
        GET1[GET /clutches]
        GET2[GET /clutches/{id}]
    end

    subgraph Lambda Functions
        Upload[Generate Presigned URL + Create Clutch]
        ListClutches[List Clutches]
        GetClutch[Get Clutch Details]
    end

    subgraph Storage
        S3[S3 Bucket]
        DDB[(DynamoDB)]
    end

    UI --> POST --> Upload
    Upload --> DDB
    Upload -.->|returns presigned URL| S3
    UI --> GET1 --> ListClutches --> DDB
    UI --> GET2 --> GetClutch --> DDB
```

The clutch is created at presigned URL generation time, giving the frontend immediate access to the clutch ID. The S3 object key includes the clutch ID for traceability.

## Components and Interfaces

### API Endpoints

#### GET /clutches
Returns a list of all clutches with summary statistics.

**Response:**
```json
{
  "clutches": [
    {
      "id": "uuid",
      "uploadTimestamp": "2025-11-30T12:00:00Z",
      "imageKey": "clutches/uuid/image.jpg",
      "eggCount": 5,
      "viabilityPercentage": 78.5
    }
  ]
}
```

#### POST /upload/presigned-url (Updated)
Creates a clutch and returns a presigned URL for uploading the image.

**Request:**
```json
{
  "fileName": "eggs.jpg",
  "contentType": "image/jpeg"
}
```

**Response:**
```json
{
  "presignedUrl": "https://s3.amazonaws.com/...",
  "objectKey": "clutches/uuid/image.jpg",
  "clutchId": "uuid",
  "expiresIn": 300
}
```

#### GET /clutches/{id}
Returns detailed information about a specific clutch including all eggs.

**Response:**
```json
{
  "id": "uuid",
  "uploadTimestamp": "2025-11-30T12:00:00Z",
  "imageKey": "clutches/uuid/image.jpg",
  "eggCount": 5,
  "viabilityPercentage": 78.5,
  "eggs": [
    {
      "id": "egg-uuid",
      "hatchLikelihood": 85,
      "possibleHenBreeds": ["Rhode Island Red"],
      "predictedChickBreed": "Rhode Island Red",
      "breedConfidence": "high",
      "chickenAppearance": {
        "plumageColor": "red-brown",
        "combType": "single",
        "bodyType": "large/heavy",
        "featherPattern": "solid",
        "legColor": "yellow"
      },
      "notes": "Healthy egg with good shell integrity"
    }
  ]
}
```

**Error Response (404):**
```json
{
  "error": "Clutch not found",
  "code": "CLUTCH_NOT_FOUND"
}
```

### Lambda Functions

#### GeneratePresignedUrlFunction (Updated)
- **Trigger**: HTTP POST /upload/presigned-url
- **Purpose**: Creates a clutch record in DynamoDB and returns a presigned URL for S3 upload
- **Input**: fileName, contentType
- **Output**: presignedUrl, objectKey, clutchId
- **Key change**: Clutch is created immediately, clutchId is embedded in the S3 object key

#### ListClutchesFunction
- **Trigger**: HTTP GET /clutches
- **Purpose**: Returns all clutches with computed summaries
- **Output**: Array of clutch summaries

#### GetClutchFunction
- **Trigger**: HTTP GET /clutches/{id}
- **Purpose**: Returns clutch details with all associated eggs
- **Output**: Clutch details with eggs array

## Data Models

### DynamoDB Key Structure

All clutch-related data uses a single-table design with the following patterns:

| Entity | pk | sk |
|--------|----|----|
| Clutch Metadata | CLUTCH#{clutchId} | METADATA |
| Egg | CLUTCH#{clutchId} | EGG#{eggId} |

### Clutch Record
```typescript
interface ClutchRecord {
  pk: string;           // "CLUTCH#{clutchId}"
  sk: string;           // "METADATA"
  id: string;           // clutchId (UUID)
  uploadTimestamp: string;
  imageKey: string;
  createdAt: string;
}
```

### Egg Record (Updated)
```typescript
interface EggRecord {
  pk: string;           // "CLUTCH#{clutchId}"
  sk: string;           // "EGG#{eggId}"
  id: string;           // eggId (UUID)
  clutchId: string;
  hatchLikelihood: number;
  possibleHenBreeds: string[];
  predictedChickBreed: string;
  breedConfidence: string;
  chickenAppearance: {
    plumageColor: string;
    combType: string;
    bodyType: string;
    featherPattern: string;
    legColor: string;
  };
  notes: string;
  analysisTimestamp: string;
}
```

### Clutch Summary (Computed)
```typescript
interface ClutchSummary {
  id: string;
  uploadTimestamp: string;
  imageKey: string;
  eggCount: number;
  viabilityPercentage: number | null;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Clutch creation produces valid record
*For any* image upload event, the created clutch record SHALL contain a valid UUID identifier, upload timestamp, and image key reference.
**Validates: Requirements 1.1, 1.2**

### Property 2: Egg-clutch association integrity
*For any* egg created from an image upload, the egg record SHALL reference the same clutch identifier as its parent clutch.
**Validates: Requirements 1.3**

### Property 3: Clutch list completeness
*For any* set of clutches in the database, the GET /clutches endpoint SHALL return all clutches with their summary data.
**Validates: Requirements 2.1, 2.2**

### Property 4: Viability calculation correctness
*For any* clutch with N eggs having hatch likelihoods [h1, h2, ..., hN], the viability percentage SHALL equal the arithmetic mean (h1 + h2 + ... + hN) / N.
**Validates: Requirements 2.4**

### Property 5: Clutch detail completeness
*For any* valid clutch ID, the GET /clutches/{id} endpoint SHALL return the clutch metadata and all associated eggs with complete analysis data.
**Validates: Requirements 3.1, 3.2, 3.3**

### Property 6: DynamoDB key pattern consistency
*For any* clutch record, the partition key SHALL match pattern "CLUTCH#{clutchId}" and sort key SHALL be "METADATA". *For any* egg record, the partition key SHALL match pattern "CLUTCH#{clutchId}" and sort key SHALL match pattern "EGG#{eggId}".
**Validates: Requirements 4.1, 4.2**

## Error Handling

| Scenario | HTTP Status | Error Code | Message |
|----------|-------------|------------|---------|
| Clutch not found | 404 | CLUTCH_NOT_FOUND | Clutch not found |
| Invalid clutch ID format | 400 | INVALID_CLUTCH_ID | Invalid clutch ID format |
| Database error | 500 | INTERNAL_ERROR | Failed to retrieve clutch data |

## Testing Strategy

### Property-Based Testing
- **Library**: fast-check (JavaScript property-based testing library)
- **Minimum iterations**: 100 per property test
- **Tag format**: `**Feature: clutches, Property {number}: {property_text}**`

Property tests will verify:
1. Clutch creation always produces valid records with required fields
2. Egg records always reference valid parent clutch IDs
3. List endpoint returns all clutches with correct summary calculations
4. Viability percentage calculation is mathematically correct
5. Detail endpoint returns complete clutch and egg data
6. All records use correct DynamoDB key patterns

### Unit Tests
Unit tests will cover:
- Edge case: Empty clutch returns eggCount=0 and viabilityPercentage=null
- Edge case: Non-existent clutch ID returns 404
- API response format validation
- Error handling paths
