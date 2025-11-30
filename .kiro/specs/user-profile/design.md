# Design Document

## Overview

The user-profile feature implements a full-stack user profile management system using AWS serverless architecture. The system consists of Python Lambda functions for backend operations, DynamoDB for data persistence, API Gateway for HTTP routing, and a React/Next.js frontend for user interaction. The design prioritizes simplicity and speed for hackathon delivery while maintaining a polished user experience.

## Architecture

### High-Level Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐         ┌──────────────┐
│   React UI  │────────▶│ API Gateway  │────────▶│   Lambda    │────────▶│   DynamoDB   │
│  (Next.js)  │◀────────│   (HttpApi)  │◀────────│  (Python)   │◀────────│    Table     │
└─────────────┘         └──────────────┘         └─────────────┘         └──────────────┘
```

### Component Interaction Flow

1. User interacts with Profile UI component
2. UI makes HTTP requests to API Gateway endpoints
3. API Gateway routes requests to appropriate Lambda functions
4. Lambda functions perform business logic and data validation
5. Lambda functions interact with DynamoDB for persistence
6. Responses flow back through the chain to the UI

## Components and Interfaces

### Backend Components

#### Lambda Functions

**CreateProfileFunction**
- **Purpose**: Handle profile creation requests
- **Runtime**: Python 3.12
- **Handler**: `create.lambda_handler`
- **HTTP Method**: POST
- **Path**: `/profile`
- **Input**: JSON body with `name`, `email`, `bio` (optional)
- **Output**: JSON with created profile including `userId`, `name`, `email`, `bio`, `createdAt`, `updatedAt`

**GetProfileFunction**
- **Purpose**: Retrieve profile by user ID
- **Runtime**: Python 3.12
- **Handler**: `get.lambda_handler`
- **HTTP Method**: GET
- **Path**: `/profile/{userId}`
- **Input**: Path parameter `userId`
- **Output**: JSON with profile data or 404 error

**UpdateProfileFunction**
- **Purpose**: Update existing profile
- **Runtime**: Python 3.12
- **Handler**: `update.lambda_handler`
- **HTTP Method**: PUT
- **Path**: `/profile/{userId}`
- **Input**: Path parameter `userId` and JSON body with fields to update
- **Output**: JSON with updated profile data

### Frontend Components

**ProfilePage Component**
- **Location**: `frontend/src/app/profile/page.tsx`
- **Purpose**: Main profile management interface
- **Features**:
  - Display profile information in a card layout
  - Edit mode with form inputs
  - Loading states with spinners
  - Error handling with user-friendly messages
  - Smooth transitions and hover effects

### API Contracts

**POST /profile**
```json
Request:
{
  "name": "string (required)",
  "email": "string (required, valid email format)",
  "bio": "string (optional)"
}

Response (201):
{
  "userId": "uuid",
  "name": "string",
  "email": "string",
  "bio": "string",
  "createdAt": "ISO 8601 timestamp",
  "updatedAt": "ISO 8601 timestamp"
}
```

**GET /profile/{userId}**
```json
Response (200):
{
  "userId": "uuid",
  "name": "string",
  "email": "string",
  "bio": "string",
  "createdAt": "ISO 8601 timestamp",
  "updatedAt": "ISO 8601 timestamp"
}

Response (404):
{
  "error": "Profile not found"
}
```

**PUT /profile/{userId}**
```json
Request:
{
  "name": "string (optional)",
  "email": "string (optional)",
  "bio": "string (optional)"
}

Response (200):
{
  "userId": "uuid",
  "name": "string",
  "email": "string",
  "bio": "string",
  "createdAt": "ISO 8601 timestamp",
  "updatedAt": "ISO 8601 timestamp"
}
```

## Data Models

### Profile Data Model

**DynamoDB Item Structure**
```python
{
    "pk": "USER#<userId>",           # Partition key
    "sk": "PROFILE",                  # Sort key
    "userId": "uuid string",
    "name": "string",
    "email": "string",
    "bio": "string",
    "createdAt": "ISO 8601 timestamp",
    "updatedAt": "ISO 8601 timestamp"
}
```

**Key Design Decisions**:
- Use composite key pattern (pk/sk) for future extensibility
- Store userId redundantly for easier querying
- Use ISO 8601 timestamps for consistency
- All fields stored as strings for simplicity

### Validation Rules

**Name Field**:
- Required for creation
- Must be non-empty string
- No length restrictions for hackathon speed

**Email Field**:
- Required for creation
- Must match basic email regex pattern: `^[^@]+@[^@]+\.[^@]+$`
- No uniqueness constraint for hackathon speed

**Bio Field**:
- Optional
- Can be empty string or omitted

## Co
rrectness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Property 1: Profile creation generates unique ID and stores data
*For any* valid profile data (with name and email), creating a profile should generate a unique user ID and store the complete profile in DynamoDB
**Validates: Requirements 1.1**

Property 2: Required fields validation
*For any* profile creation request, if name or email fields are missing or empty, the system should reject the request
**Validates: Requirements 1.2**

Property 3: Email format validation
*For any* string provided as an email, only strings matching valid email format should be accepted
**Validates: Requirements 1.3**

Property 4: Profile creation response completeness
*For any* successfully created profile, the response should contain userId, name, email, bio, createdAt, and updatedAt fields
**Validates: Requirements 1.4**

Property 5: Profile retrieval returns complete data
*For any* existing profile, retrieving it by userId should return all stored fields including name, email, bio, and timestamps
**Validates: Requirements 2.1, 2.3**

Property 6: Update preserves immutable fields
*For any* profile update operation, the userId and createdAt fields should remain unchanged from their original values
**Validates: Requirements 3.2**

Property 7: Update modifies timestamp
*For any* profile update operation, the updatedAt timestamp should be different from (and later than) the previous value
**Validates: Requirements 3.3**

Property 8: Update merges data correctly
*For any* profile update with partial data, the updated profile should contain the new values for specified fields and preserve existing values for unspecified fields
**Validates: Requirements 3.1**

Property 9: DynamoDB key pattern consistency
*For any* stored profile, the partition key should follow the pattern "USER#{userId}" and the sort key should be "PROFILE"
**Validates: Requirements 5.2**

Property 10: HTTP status codes correctness
*For any* profile operation, successful operations should return 200/201, not found errors should return 404, validation errors should return 400, and server errors should return 500
**Validates: Requirements 5.3**

Property 11: UI displays all profile fields
*For any* profile data fetched from the API, the UI should render the name, email, and bio fields
**Validates: Requirements 4.2**

Property 12: Edit form pre-fills current values
*For any* profile in edit mode, the form inputs should be pre-filled with the current profile values
**Validates: Requirements 4.3**

Property 13: UI updates after successful save
*For any* successful profile update, the UI should display the updated data
**Validates: Requirements 4.5**

## Error Handling

### Backend Error Handling

**Validation Errors (400)**:
- Missing required fields
- Invalid email format
- Empty string values for required fields

**Not Found Errors (404)**:
- Profile does not exist for given userId
- Invalid userId format

**Server Errors (500)**:
- DynamoDB operation failures
- Unexpected exceptions

**Error Response Format**:
```json
{
  "error": "Descriptive error message"
}
```

### Frontend Error Handling

**Network Errors**:
- Display: "Unable to connect. Please check your connection."
- Action: Retry button

**API Errors**:
- Display error message from API response
- Action: Dismiss button

**Validation Errors**:
- Display inline validation messages
- Prevent form submission

## Testing Strategy

### Property-Based Testing

We will use **Hypothesis** (Python property-based testing library) for backend Lambda function testing.

**Configuration**:
- Minimum 100 iterations per property test
- Each test tagged with format: `**Feature: user-profile, Property {number}: {property_text}**`
- Tests will generate random valid and invalid inputs to verify properties

**Property Test Coverage**:
- Profile creation with random valid data
- Validation rejection with random invalid data
- Email format validation with random strings
- Profile retrieval round-trip (create then get)
- Update operations with random field combinations
- Immutable field preservation across updates
- DynamoDB key pattern verification
- HTTP status code verification

### Unit Testing

**Backend Unit Tests** (using pytest):
- Specific examples of valid profile creation
- Specific examples of invalid inputs (empty name, invalid email)
- Edge cases: very long strings, special characters
- DynamoDB mock interactions

**Frontend Unit Tests** (using Jest/React Testing Library):
- Component rendering with sample data
- Form submission handling
- Loading state display
- Error message display
- Edit mode toggle

### Integration Testing

**End-to-End Flow**:
- Create profile → Retrieve profile → Update profile
- Verify data persistence across operations
- Verify UI reflects backend state

## Implementation Notes

### Hackathon Optimizations

- No authentication/authorization (add later if needed)
- No email uniqueness validation (simplify for speed)
- Minimal input validation (basic format checks only)
- No pagination (assume small dataset)
- Inline all code (no shared utilities unless used 3+ times)
- Hardcode table name from environment variable
- Single Lambda per operation (no microservice splitting)

### AWS Service Configuration

**DynamoDB Table**:
- Use existing shared table from base template
- Partition key: `pk` (String)
- Sort key: `sk` (String)
- No GSIs needed for hackathon scope

**Lambda Configuration**:
- Runtime: Python 3.12
- Memory: 128 MB (default)
- Timeout: 10 seconds
- Environment variables: `TABLE_NAME`

**API Gateway**:
- Use existing HttpApi from base template
- CORS enabled for frontend access
- No custom authorizers

### Frontend Styling

**Tailwind Theme Colors**:
- Primary: `blue-600`, `blue-700`
- Background: `gray-50`, `gray-100`
- Text: `gray-900`, `gray-600`
- Borders: `gray-300`
- Success: `green-600`
- Error: `red-600`

**Animation Classes**:
- Transitions: `transition-all duration-200`
- Hover effects: `hover:shadow-lg`
- Loading spinner: `animate-spin`

## Deployment

### SAM Template Updates

Add three Lambda functions to `backend/template.yaml`:
1. CreateProfileFunction
2. GetProfileFunction
3. UpdateProfileFunction

Each function will:
- Reference the shared DynamoDB table
- Have appropriate IAM permissions
- Connect to HttpApi with correct path and method
- Use Python 3.12 runtime

### Environment Variables

Functions will receive:
- `TABLE_NAME`: Reference to shared DynamoDB table

### Frontend Deployment

Profile page will be added to Next.js app:
- Route: `/profile`
- Component: `frontend/src/app/profile/page.tsx`
- API calls to deployed API Gateway endpoint
