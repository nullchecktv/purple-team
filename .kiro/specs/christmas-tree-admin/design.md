# Design Document

## Overview

The Christmas Tree Admin Panel is a full-stack serverless application built on AWS that enables store administrators to manage Christmas tree inventory across multiple retail locations. The system follows a three-tier architecture with a React-based frontend, API Gateway for routing, Lambda functions for business logic, and DynamoDB for data persistence.

The design prioritizes rapid development for hackathon delivery while maintaining a polished, professional user experience with smooth animations, loading states, and responsive design.

## Architecture

### High-Level Architecture

```
┌─────────────────┐
│  React Frontend │
│   (Next.js)     │
└────────┬────────┘
         │ HTTPS
         ▼
┌─────────────────┐
│  API Gateway    │
│   (HTTP API)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Lambda Functions│
│  - Create Tree  │
│  - List Trees   │
│  - Update Tree  │
│  - Delete Tree  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   DynamoDB      │
│  (Single Table) │
└─────────────────┘
```

### Technology Stack

- **Frontend**: Next.js 14 with TypeScript, Tailwind CSS
- **Backend**: AWS Lambda (Node.js 22.x or Python 3.13 based on .env preference)
- **API**: AWS API Gateway (HTTP API)
- **Database**: AWS DynamoDB
- **Infrastructure**: AWS SAM (Serverless Application Model)

## Components and Interfaces

### Frontend Components

#### TreeAdminPanel (Main Component)
- Manages overall state for tree inventory
- Coordinates between list view and form view
- Handles API communication
- Manages loading, error, and success states

#### TreeList Component
- Displays all Christmas trees in a grid or table layout
- Shows tree attributes: species, height, price, condition, store location
- Provides edit and delete actions for each tree
- Includes filtering by store location
- Shows loading skeletons during data fetch
- Displays empty state when no trees exist

#### TreeForm Component
- Handles both create and update operations
- Form fields: species, height, price, condition, description, store location
- Client-side validation before submission
- Disabled state during submission
- Success/error feedback

#### UI Components (Reusable)
- LoadingSpinner: Animated spinner for async operations
- ErrorMessage: Styled error display
- EmptyState: Friendly message when no data exists
- Card: Container for tree items
- Button: Consistent button styling with hover states

### Backend API Endpoints

#### POST /trees
- Creates a new Christmas tree record
- Request body: tree attributes (species, height, price, condition, description, storeLocation)
- Response: Created tree with generated ID and timestamps
- Status codes: 201 (created), 400 (validation error), 500 (server error)

#### GET /trees
- Retrieves all Christmas trees
- Optional query parameter: storeLocation (for filtering)
- Response: Array of tree objects
- Status codes: 200 (success), 500 (server error)

#### PUT /trees/{treeId}
- Updates an existing Christmas tree
- Path parameter: treeId
- Request body: updated tree attributes
- Response: Updated tree object
- Status codes: 200 (success), 400 (validation error), 404 (not found), 500 (server error)

#### DELETE /trees/{treeId}
- Deletes a Christmas tree
- Path parameter: treeId
- Response: Success confirmation
- Status codes: 200 (success), 404 (not found), 500 (server error)

### Lambda Functions

#### CreateTreeFunction
- Validates input attributes
- Generates unique tree ID (UUID)
- Adds creation timestamp
- Persists to DynamoDB
- Returns created tree object

#### ListTreesFunction
- Queries DynamoDB for all trees
- Optionally filters by store location
- Returns array of tree objects
- Handles empty results gracefully

#### UpdateTreeFunction
- Validates tree ID exists
- Validates updated attributes
- Preserves creation timestamp
- Updates modification timestamp
- Persists changes to DynamoDB
- Returns updated tree object

#### DeleteTreeFunction
- Validates tree ID exists
- Removes tree from DynamoDB
- Returns success confirmation

## Data Models

### ChristmasTree Entity

```typescript
interface ChristmasTree {
  id: string;                    // UUID, primary key
  species: string;               // e.g., "Fraser Fir", "Douglas Fir"
  height: number;                // Height in feet
  price: number;                 // Price in dollars
  condition: string;             // e.g., "Excellent", "Good", "Fair"
  description: string;           // Detailed description
  storeLocation: string;         // Store identifier
  createdAt: string;             // ISO 8601 timestamp
  updatedAt: string;             // ISO 8601 timestamp
}
```

### DynamoDB Schema

**Table Name**: DataTable (shared table from base template)

**Primary Key Pattern**:
- `pk`: `TREE#{treeId}` (Partition Key)
- `sk`: `METADATA` (Sort Key)

**Attributes**:
- All ChristmasTree fields stored as item attributes
- GSI for store location filtering (optional, can use scan for hackathon speed)

**Example Item**:
```json
{
  "pk": "TREE#123e4567-e89b-12d3-a456-426614174000",
  "sk": "METADATA",
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "species": "Fraser Fir",
  "height": 7,
  "price": 89.99,
  "condition": "Excellent",
  "description": "Beautiful Fraser Fir with full branches",
  "storeLocation": "Downtown Store",
  "createdAt": "2025-11-29T10:30:00Z",
  "updatedAt": "2025-11-29T10:30:00Z"
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Tree creation persistence
*For any* valid tree data (with species, height, price, condition, description, and store location), creating a tree should result in that tree being retrievable from storage with all attributes intact.
**Validates: Requirements 1.1, 5.1, 5.2, 5.3**

### Property 2: Unique ID assignment
*For any* set of created trees, all tree IDs should be unique and non-empty.
**Validates: Requirements 1.2**

### Property 3: Invalid creation rejection
*For any* tree data missing required attributes (species, height, price, storeLocation), the creation attempt should be rejected with validation errors.
**Validates: Requirements 1.3, 6.1**

### Property 4: UI list synchronization
*For any* tree operation (create, update, delete), the Admin Panel inventory list should reflect the current backend state after the operation completes.
**Validates: Requirements 1.4, 2.1, 4.2**

### Property 5: Timestamp management
*For any* created tree, the system should record a creation timestamp, and for any updated tree, the system should preserve the original creation timestamp while updating the modification timestamp.
**Validates: Requirements 1.5, 3.2, 3.3**

### Property 6: Complete attribute rendering
*For any* tree displayed in the Admin Panel, the rendered output should include species, height, price, condition, description, and store location.
**Validates: Requirements 2.2, 5.4, 6.2**

### Property 7: Update persistence
*For any* existing tree and any valid attribute modifications, updating the tree should result in the changes being persisted and retrievable from storage.
**Validates: Requirements 3.1, 3.5**

### Property 8: Invalid update rejection
*For any* tree update with invalid attributes (wrong data types, missing required fields), the update attempt should be rejected with validation errors.
**Validates: Requirements 3.4, 5.5**

### Property 9: Deletion completeness
*For any* tree that is deleted, subsequent queries for that tree should return a not found response, and the tree should not appear in the inventory list.
**Validates: Requirements 4.1, 4.5**

### Property 10: Store location filtering
*For any* store location filter applied, the displayed trees should only include trees from that specific location.
**Validates: Requirements 6.3, 6.5**

### Property 11: Loading state visibility
*For any* asynchronous operation (list, create, update, delete), the Admin Panel should display loading indicators during the operation and disable interactive elements until completion.
**Validates: Requirements 7.1, 7.4, 7.5**

### Property 12: Error handling
*For any* operation that fails, the Admin Panel should display a clear error message and maintain the current state without corruption.
**Validates: Requirements 2.5, 4.4, 7.3**

## Error Handling

### Validation Errors
- Missing required fields (species, height, price, storeLocation)
- Invalid data types (non-numeric height or price)
- Invalid values (negative height or price)
- Empty or whitespace-only strings

### Runtime Errors
- DynamoDB connection failures
- Item not found errors
- Concurrent modification conflicts
- Network timeouts

### Error Response Format
```json
{
  "error": "Validation failed",
  "details": [
    "species is required",
    "height must be a positive number"
  ]
}
```

### Frontend Error Handling
- Display user-friendly error messages
- Maintain form state on validation errors
- Provide retry mechanisms for network failures
- Log errors to console for debugging

## Testing Strategy

### Property-Based Testing

We will use **fast-check** (for Node.js/TypeScript) as our property-based testing library. Each correctness property will be implemented as a property-based test that runs a minimum of 100 iterations with randomly generated inputs.

Each property-based test will:
- Be tagged with a comment referencing the design document property: `**Feature: christmas-tree-admin, Property {number}: {property_text}**`
- Generate random valid and invalid inputs as appropriate
- Verify the property holds across all generated inputs
- Run at least 100 iterations to ensure thorough coverage

### Unit Testing

Unit tests will cover:
- Specific examples of tree creation, update, and deletion
- Edge cases like empty inventory lists, deletion confirmations
- Integration between UI components and API calls
- Form validation logic

### Testing Approach

Following the hackathon speed rules, we prioritize:
1. Property-based tests for core CRUD operations (high value for catching bugs)
2. Minimal unit tests for specific examples and edge cases
3. No integration tests or end-to-end tests (time constraint)

Tests will be written after implementation to validate functionality, not before (implementation-first development for speed).

## Implementation Notes

### Hackathon Optimizations

Following the hackathon speed rules:
- Single Lambda function per operation (no microservice splitting)
- Inline logic (no utility abstractions unless used 3+ times)
- No authentication (can add if time permits)
- Minimal error handling (basic try-catch only)
- No logging except actual errors
- Focus on visual polish and smooth UX

### Visual Polish Requirements

Every UI component must include:
- Loading states with spinners or skeleton loaders
- Smooth transitions (transition-all duration-200)
- Hover states on interactive elements
- Consistent Tailwind theme colors (no arbitrary values)
- Proper spacing using Tailwind scale
- Empty states with helpful messaging
- Disabled states during async operations

### Development Workflow

1. Set up Lambda functions using .env runtime preference
2. Implement backend CRUD operations
3. Create React components with full visual polish
4. Wire up API Gateway routes in SAM template
5. Test core functionality
6. Write property-based tests for validation
7. Polish UI animations and transitions
