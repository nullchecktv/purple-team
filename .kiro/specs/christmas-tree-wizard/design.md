# Design Document

## Overview

The Christmas Tree Wizard is a multi-step web application that guides users through a personalized Christmas tree shopping experience. The system consists of a React-based frontend wizard interface, a serverless backend API for tree data management and recommendations, and a DynamoDB database for storing tree listings and user sessions. The architecture follows a serverless pattern using AWS Lambda, API Gateway, and DynamoDB to ensure scalability and cost-effectiveness during the holiday shopping season.

## Architecture

### High-Level Architecture

```
┌─────────────────┐
│   React SPA     │
│  (Next.js)      │
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
│  - Get Trees    │
│  - Filter Trees │
│  - Get Details  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   DynamoDB      │
│  - Tree Data    │
│  - Vendors      │
└─────────────────┘
```

### Component Interaction Flow

1. User opens wizard in browser
2. Frontend renders step-by-step wizard interface
3. User completes each step (location, price, quality, delivery, returns, social)
4. Frontend collects all criteria and sends to backend API
5. Lambda function queries DynamoDB with filter criteria
6. Recommendation engine scores and ranks results
7. Results returned to frontend for display
8. User selects tree and views detailed information

## Components and Interfaces

### Frontend Components

#### WizardContainer
- Main orchestrator component managing wizard state and navigation
- Tracks current step, collected criteria, and navigation history
- Handles step transitions and data persistence

#### LocationStep
- Input: None
- Output: { city: string, zipCode: string, deliveryZone: string }
- Validates Texas locations against known delivery zones
- Provides autocomplete for Texas cities

#### PriceRangeStep
- Input: None
- Output: { minPrice: number, maxPrice: number }
- Dual-handle slider for price range selection
- Real-time price display

#### QualityStep
- Input: None
- Output: { minQuality: number }
- Star rating selector (1-5 stars)
- Visual star display with hover effects

#### DeliveryStep
- Input: { deliveryZone: string }
- Output: { deliveryRequired: boolean, deliveryPreferred: boolean }
- Radio button selection for delivery preference

#### ReturnPolicyStep
- Input: None
- Output: { minReturnDays: number }
- Dropdown or button group for return window selection (7, 14, 30 days)

#### SocialPopularityStep
- Input: None
- Output: { popularityLevel: 'high' | 'medium' | 'low' | 'any' }
- Visual cards showing popularity tiers with social media icons

#### ResultsDisplay
- Input: { criteria: FilterCriteria, trees: TreeListing[] }
- Output: User selection or navigation back to wizard
- Grid/list view of matching trees
- Match percentage badges
- Sorting and filtering controls

#### TreeDetailModal
- Input: { treeId: string }
- Output: None (display only)
- Full tree specifications
- Vendor information and contact
- Purchase/inquiry buttons

### Backend API Endpoints

#### GET /api/trees/search
- Query Parameters: location, minPrice, maxPrice, minQuality, deliveryRequired, minReturnDays, popularityLevel
- Response: Array of TreeListing objects with match scores
- Implements filtering and ranking logic

#### GET /api/trees/{treeId}
- Path Parameter: treeId
- Response: Detailed TreeListing object with vendor information

#### GET /api/delivery-zones
- Response: Array of valid Texas delivery zones
- Used for location validation

### Data Models

#### TreeListing
```typescript
interface TreeListing {
  id: string;
  vendorId: string;
  vendorName: string;
  treeName: string;
  treeType: 'real' | 'artificial';
  height: number; // in feet
  price: number;
  qualityRating: number; // 1-5
  imageUrl: string;
  deliveryZones: string[]; // Texas regions
  deliveryFee: number;
  returnWindowDays: number;
  socialPopularityScore: number; // 0-100
  socialMentions: number;
  description: string;
  specifications: {
    width: number;
    needleType?: string;
    lightCount?: number;
    material?: string;
  };
  inStock: boolean;
  createdAt: string;
  updatedAt: string;
}
```

#### FilterCriteria
```typescript
interface FilterCriteria {
  location: {
    city: string;
    zipCode: string;
    deliveryZone: string;
  };
  priceRange: {
    min: number;
    max: number;
  };
  minQuality: number;
  delivery: {
    required: boolean;
    preferred: boolean;
  };
  minReturnDays: number;
  popularityLevel: 'high' | 'medium' | 'low' | 'any';
}
```

#### MatchScore
```typescript
interface MatchScore {
  tree: TreeListing;
  score: number; // 0-100
  matchDetails: {
    priceMatch: boolean;
    qualityMatch: boolean;
    deliveryMatch: boolean;
    returnMatch: boolean;
    popularityMatch: boolean;
  };
  matchPercentage: number;
}
```

### DynamoDB Schema

#### Table: ChristmasTreeData

**Primary Key:**
- pk: String (Partition Key)
- sk: String (Sort Key)

**Access Patterns:**

1. Get all trees: pk = "TREE", sk begins_with "TREE#"
2. Get tree by ID: pk = "TREE", sk = "TREE#{treeId}"
3. Get vendor info: pk = "VENDOR", sk = "VENDOR#{vendorId}"
4. Query by delivery zone: GSI on deliveryZone attribute

**Item Structure for Tree:**
```
{
  pk: "TREE",
  sk: "TREE#<treeId>",
  id: "<treeId>",
  vendorId: "<vendorId>",
  vendorName: "...",
  treeName: "...",
  price: 150,
  qualityRating: 4.5,
  deliveryZones: ["North Texas", "Central Texas"],
  returnWindowDays: 30,
  socialPopularityScore: 85,
  // ... other attributes
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Location validation consistency
*For any* valid Texas location (city or zip code), the validation function should return true and identify the correct delivery zone.
**Validates: Requirements 1.2**

### Property 2: Invalid location rejection
*For any* invalid location string (non-Texas locations, malformed inputs), the validation function should return false and trigger an error message.
**Validates: Requirements 1.3**

### Property 3: Quality filter correctness
*For any* minimum quality rating and any set of tree listings, the filtered results should contain only trees with quality ratings greater than or equal to the selected minimum.
**Validates: Requirements 3.2**

### Property 4: Delivery zone filter correctness
*For any* user location and any set of tree listings, when delivery is required, the filtered results should contain only trees whose delivery zones include the user's location.
**Validates: Requirements 4.2**

### Property 5: Return policy filter correctness
*For any* minimum return window and any set of tree listings, the filtered results should contain only trees with return windows greater than or equal to the selected minimum.
**Validates: Requirements 5.2**

### Property 6: Match score ordering
*For any* set of tree listings with calculated match scores, the results should be sorted in descending order by match score (highest match first).
**Validates: Requirements 7.2**

### Property 7: Required field presence in results
*For any* tree listing displayed in results, the rendered output should contain all required fields: image, vendor name, price, quality rating, delivery availability, return window, and social popularity score.
**Validates: Requirements 7.4**

### Property 8: Perfect match indicator accuracy
*For any* tree listing and filter criteria, if the tree matches all criteria (price, quality, delivery, return policy, popularity), then the rendered output should display a "Perfect Match" indicator.
**Validates: Requirements 8.2**

### Property 9: Match percentage calculation
*For any* tree listing and filter criteria, the match percentage should equal (number of matched criteria / total number of criteria) × 100.
**Validates: Requirements 8.3**

### Property 10: Navigation state preservation
*For any* wizard step with stored user input, navigating backward then forward should preserve the previously entered values.
**Validates: Requirements 9.2**

### Property 11: Criteria update propagation
*For any* modified wizard input, the stored filter criteria should reflect the updated value immediately.
**Validates: Requirements 9.3**

### Property 12: Multi-criteria filtering composition
*For any* complete set of filter criteria (location, price, quality, delivery, return, popularity) and any set of tree listings, the final filtered results should satisfy all individual filter conditions simultaneously.
**Validates: Requirements 7.1**

## Error Handling

### Frontend Error Handling

1. **Network Errors**
   - Display user-friendly error messages when API calls fail
   - Provide retry mechanisms for transient failures
   - Show loading states during API requests

2. **Validation Errors**
   - Inline validation messages for each wizard step
   - Prevent progression until valid input is provided
   - Clear error messages with guidance for correction

3. **Empty Results**
   - Display helpful message when no trees match criteria
   - Suggest relaxing specific filters
   - Provide "Start Over" option

4. **Session Management**
   - Store wizard state in browser localStorage
   - Recover state on page refresh
   - Clear state on explicit "Start Over" action

### Backend Error Handling

1. **Invalid Query Parameters**
   - Return 400 Bad Request with validation error details
   - Log invalid requests for monitoring

2. **Database Errors**
   - Return 500 Internal Server Error
   - Log errors with context for debugging
   - Implement retry logic for transient DynamoDB errors

3. **Missing Data**
   - Return 404 Not Found for invalid tree IDs
   - Return empty array (not error) for no matching results

4. **Rate Limiting**
   - Implement API Gateway throttling
   - Return 429 Too Many Requests when exceeded

## Testing Strategy

### Unit Testing

The application will use **Vitest** for unit testing React components and utility functions.

**Unit Test Coverage:**

1. **Validation Functions**
   - Test location validation with specific Texas cities and zip codes
   - Test invalid location examples (out-of-state, malformed)
   - Test price range boundary validation ($20 minimum, $500 maximum)

2. **Filter Functions**
   - Test quality filter with specific tree sets and quality thresholds
   - Test delivery zone matching with known locations
   - Test return policy filtering with specific day values

3. **Match Score Calculation**
   - Test match percentage calculation with known criteria and trees
   - Test perfect match detection with fully matching trees
   - Test partial match scenarios

4. **Component Rendering**
   - Test that LocationStep renders input field
   - Test that PriceRangeStep renders slider
   - Test that ResultsDisplay renders tree cards
   - Test that empty results show appropriate message

### Property-Based Testing

The application will use **fast-check** for property-based testing of core business logic.

**Property-Based Test Configuration:**
- Each property test will run a minimum of 100 iterations
- Each test will be tagged with a comment referencing the design document property
- Tag format: `**Feature: christmas-tree-wizard, Property {number}: {property_text}**`

**Property Test Coverage:**

1. **Property 1: Location validation consistency**
   - Generate random valid Texas locations
   - Verify all return true from validation function

2. **Property 2: Invalid location rejection**
   - Generate random invalid location strings
   - Verify all return false from validation function

3. **Property 3: Quality filter correctness**
   - Generate random tree sets and quality thresholds
   - Verify all filtered results meet quality requirement

4. **Property 4: Delivery zone filter correctness**
   - Generate random tree sets and locations
   - Verify all filtered results include user's delivery zone

5. **Property 5: Return policy filter correctness**
   - Generate random tree sets and return window minimums
   - Verify all filtered results meet return window requirement

6. **Property 6: Match score ordering**
   - Generate random tree sets with match scores
   - Verify results are in descending order

7. **Property 7: Required field presence**
   - Generate random tree listings
   - Verify rendered output contains all required fields

8. **Property 8: Perfect match indicator**
   - Generate random trees and criteria
   - Verify perfect match indicator appears only when all criteria match

9. **Property 9: Match percentage calculation**
   - Generate random trees and criteria
   - Verify match percentage equals (matched / total) × 100

10. **Property 10: Navigation state preservation**
    - Generate random wizard states
    - Verify backward/forward navigation preserves values

11. **Property 11: Criteria update propagation**
    - Generate random input changes
    - Verify stored criteria reflects updates

12. **Property 12: Multi-criteria filtering**
    - Generate random complete filter criteria and tree sets
    - Verify results satisfy all individual filters

### Integration Testing

Integration tests will verify end-to-end wizard flows:

1. Complete wizard flow from start to results
2. Back navigation and value preservation
3. API integration with backend
4. Error handling and recovery

## Performance Considerations

1. **Frontend Performance**
   - Lazy load tree images
   - Debounce price slider updates
   - Virtualize long result lists
   - Cache API responses in memory

2. **Backend Performance**
   - DynamoDB query optimization with appropriate indexes
   - Lambda cold start mitigation (provisioned concurrency if needed)
   - Response caching for common queries
   - Pagination for large result sets

3. **Data Loading**
   - Progressive loading of tree images
   - Skeleton loaders during API calls
   - Optimistic UI updates where appropriate

## Security Considerations

1. **Input Validation**
   - Sanitize all user inputs on frontend and backend
   - Validate location inputs against known Texas zones
   - Enforce price range limits

2. **API Security**
   - CORS configuration for frontend domain
   - Rate limiting on API Gateway
   - Input validation on all Lambda functions

3. **Data Privacy**
   - No personal data collection required
   - Session data stored only in browser localStorage
   - No authentication required for MVP

## Deployment Architecture

1. **Frontend Deployment**
   - Next.js application deployed to AWS S3 + CloudFront
   - Static site generation for optimal performance
   - Environment variables for API endpoint configuration

2. **Backend Deployment**
   - SAM template for infrastructure as code
   - Lambda functions with appropriate IAM roles
   - DynamoDB table with on-demand billing
   - API Gateway HTTP API with CORS

3. **CI/CD Pipeline**
   - Automated deployment on git push
   - Separate staging and production environments
   - Automated testing before deployment
