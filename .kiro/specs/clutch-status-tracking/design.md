# Design Document

## Overview

This feature implements real-time status tracking for clutch processing by adding status fields to the database, updating them at each processing stage, and implementing a polling-based UI that displays progress and final results. The design focuses on simplicity and uses existing infrastructure (DynamoDB, Lambda functions, API Gateway) without introducing new services.

## Architecture

### System Components

1. **Database Layer (DynamoDB)**
   - Add `status` field to clutch metadata records (only new field needed)
   - Note: `totalEggCount`, `viableEggCount`, and `chickenImageKey` already exist

2. **Backend Processing Layer (Lambda Functions)**
   - Modify `upload-clutch.mjs` to set initial status to "Uploaded"
   - Modify `egg-detector.mjs` to update status to "Detecting Eggs" at start
   - Modify `egg-detector.mjs` to update status to "Determining Egg Viability" after storing eggs
   - Modify `gather-egg-findings.mjs` to update status to "Calculating Flock Numbers" at start
   - Modify `gather-egg-findings.mjs` to update status to "Completed" when updating clutch record

3. **API Layer**
   - Modify `get-clutch.mjs` to include status and chickenImageKey in response
   - Rename `eggCount` to `totalEggCount` in response for consistency

4. **Frontend Layer (React)**
   - Create `ClutchStatusTracker` component for polling and status display
   - Modify `ImageUpload` component to show status tracker after upload
   - Create status display UI with loading states and animations

### Data Flow

```
User uploads image
    ↓
Upload handler creates clutch with status="Uploaded"
    ↓
Frontend starts polling get-clutch endpoint every 10s
    ↓
Egg detector starts → Updates status to "Detecting Eggs"
    ↓
Egg detector completes → Updates status to "Determining Egg Viability", stores eggCount
    ↓
Egg analysis runs for each egg
    ↓
Gather findings starts → Updates status to "Calculating Flock Numbers"
    ↓
Chick image generated → Updates status to "Completed", stores viableEggCount and chickImageKey
    ↓
Frontend displays final results and stops polling
```

## Components and Interfaces

### Database Schema Updates

#### Clutch Metadata Record
```typescript
interface ClutchMetadata {
  pk: string;              // "CLUTCH#{clutchId}"
  sk: string;              // "METADATA"
  id: string;              // clutchId
  uploadTimestamp: string;
  imageKey: string;
  status: string;          // NEW: "Uploaded" | "Detecting Eggs" | "Determining Egg Viability" | "Calculating Flock Numbers" | "Completed" | "Error"
  totalEggCount?: number;  // EXISTING: Set by gather-egg-findings
  viableEggCount?: number; // EXISTING: Set by gather-egg-findings
  chickenImageKey?: string;// EXISTING: Set by gather-egg-findings
  errorMessage?: string;   // NEW: Error details if status is "Error"
  createdAt: string;
  GSI1PK: string;
  GSI1SK: string;
}
```

### API Response Updates

#### GET /clutches/{id} Response
```typescript
interface ClutchResponse {
  id: string;
  uploadTimestamp: string;
  imageKey: string;
  status: string;          // NEW
  totalEggCount?: number;  // EXISTING (rename from eggCount in response)
  viableEggCount?: number; // EXISTING
  chickenImageKey?: string;// EXISTING
  errorMessage?: string;   // NEW
  viabilityPercentage?: number; // EXISTING
  eggs: EggSummary[];      // EXISTING
}
```

### Frontend Components

#### ClutchStatusTracker Component
```typescript
interface ClutchStatusTrackerProps {
  clutchId: string;
  onComplete: (clutch: ClutchResponse) => void;
}

// Polls every 10 seconds until status is "Completed" or "Error"
// Displays current status with appropriate loading animation
// Shows final results when complete
```

#### Status Display States
- **Uploaded**: Initial state, waiting for processing
- **Detecting Eggs**: Animated egg icon, "Analyzing your image..."
- **Determining Egg Viability**: Animated checkmark, "Evaluating egg quality..."
- **Calculating Flock Numbers**: Animated chicken icon, "Generating your flock..."
- **Completed**: Show results card with egg counts and chicken image
- **Error**: Show error message with retry option

## Data Models

### Status Enum
```typescript
type ClutchStatus =
  | "Uploaded"
  | "Detecting Eggs"
  | "Determining Egg Viability"
  | "Calculating Flock Numbers"
  | "Completed"
  | "Error";
```

### Status Update Helper
```typescript
async function updateClutchStatus(
  clutchId: string,
  status: ClutchStatus,
  additionalFields?: {
    eggCount?: number;
    viableEggCount?: number;
    chickImageKey?: string;
    errorMessage?: string;
  }
): Promise<void>
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Status updates reflect within polling interval
*For any* clutch status change, the displayed status in the UI should reflect the new status within 10 seconds (one polling interval).
**Validates: Requirements 1.2**

### Property 2: Completed clutches display all required fields
*For any* clutch with status "Completed", the UI should display total egg count, viable egg count, and chicken image.
**Validates: Requirements 1.3, 4.1, 4.2, 4.3**

### Property 3: Error states display error messages
*For any* clutch with status "Error", the UI should display an error message to the user.
**Validates: Requirements 1.4**

### Property 4: Component unmount stops polling
*For any* active polling session, when the component unmounts, the polling interval should be cleared.
**Validates: Requirements 1.5, 3.3**

### Property 5: Egg detector sets detecting status
*For any* egg detector invocation, the clutch status should be updated to "Detecting Eggs" at the start of execution.
**Validates: Requirements 2.1**

### Property 6: Egg detector completion transitions status
*For any* successful egg detector completion, the clutch status should be updated to "Determining Egg Viability" after storing the egg count.
**Validates: Requirements 2.2**

### Property 7: Gather findings sets calculating status
*For any* gather-egg-findings invocation, the clutch status should be updated to "Calculating Flock Numbers" at the start of execution.
**Validates: Requirements 2.3**

### Property 8: Image generation completes processing
*For any* successful chick image generation, the clutch status should be updated to "Completed" with viable egg count and chicken image key.
**Validates: Requirements 2.4**

### Property 9: Processing failures set error status
*For any* processing stage failure, the clutch status should be updated to "Error" with error details.
**Validates: Requirements 2.5**

### Property 10: Polling interval is 10 seconds
*For any* active polling session, requests to the get-clutch endpoint should occur every 10 seconds.
**Validates: Requirements 3.1**

### Property 11: Terminal states stop polling
*For any* clutch that reaches "Completed" or "Error" status, the polling mechanism should stop making requests.
**Validates: Requirements 3.2**

### Property 12: Network errors don't stop polling
*For any* network error during polling, the polling cycle should continue without stopping.
**Validates: Requirements 3.4**

## Error Handling

### Backend Error Handling
- Wrap all status update operations in try-catch blocks
- If status update fails, log error but continue processing
- If processing stage fails, update status to "Error" with error message
- Use conditional updates to prevent race conditions

### Frontend Error Handling
- Handle network errors during polling gracefully (retry without stopping)
- Display user-friendly error messages for "Error" status
- Implement timeout after 5 minutes of polling
- Provide retry button for failed uploads

### Error Scenarios
1. **Network failure during polling**: Continue polling, show transient error indicator
2. **Processing failure**: Display error message from backend, offer retry
3. **Timeout (5 minutes)**: Stop polling, show timeout message with refresh option
4. **Invalid clutch ID**: Show "Clutch not found" error immediately

## Testing Strategy

### Unit Testing
- Test status update helper function with various input combinations
- Test polling logic with mocked API responses
- Test component cleanup on unmount
- Test error handling for network failures

### Integration Testing
- Test end-to-end flow from upload through completion
- Test status transitions at each processing stage
- Test polling behavior with different status values
- Test timeout behavior after 5 minutes

### Manual Testing
- Upload real egg image and verify status updates appear correctly
- Verify final results display with all expected data
- Test navigation away during processing (verify polling stops)
- Test error scenarios (invalid image, processing failures)

## Implementation Notes

### Polling Strategy
- Use `setInterval` with 10-second interval
- Store interval ID in component state for cleanup
- Clear interval on unmount using `useEffect` cleanup function
- Clear interval when terminal status reached

### Status Update Timing
- Update status at the START of each processing stage (not end)
- This provides immediate feedback to users
- Exception: "Completed" status set at END of final stage

### Performance Considerations
- Polling every 10 seconds is acceptable load for API Gateway and Lambda
- DynamoDB reads are cheap and fast
- Consider adding caching headers to reduce costs (not required for MVP)

### UI/UX Considerations
- Use smooth transitions between status states
- Show animated loading indicators for each stage
- Display chicken image with fade-in animation
- Use color coding: blue for processing, green for completed, red for error

