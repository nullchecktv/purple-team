# Implementation Plan

- [x] 1. Set up project structure and shared resources
  - Create SAM template resources for API Gateway and DynamoDB table
  - Configure CORS for API Gateway
  - Set up DynamoDB table with pk/sk schema and GSI for delivery zones
  - _Requirements: All_

- [ ] 2. Create data models and seed data
  - [x] 2.1 Define TypeScript interfaces for TreeListing, FilterCriteria, and MatchScore
    - Create type definitions matching design document models
    - Export from shared types file
    - _Requirements: 7.4, 7.5_

  - [x] 2.2 Create seed data script for sample Christmas trees
    - Generate 20-30 sample tree listings with varied attributes
    - Include trees across different price ranges, quality ratings, and delivery zones
    - Populate DynamoDB table with seed data
    - _Requirements: 7.1, 7.2_

  - [x] 2.3 Create Texas delivery zone reference data
    - Define list of valid Texas cities and zip codes with delivery zone mappings
    - Store as constants or in DynamoDB
    - _Requirements: 1.2, 4.2_

- [ ] 3. Implement backend Lambda functions
  - [x] 3.1 Create GET /api/trees/search Lambda function
    - Implement query parameter parsing for all filter criteria
    - Query DynamoDB with location, price, quality, delivery, return, and popularity filters
    - Calculate match scores for each tree
    - Sort results by match score descending
    - Return filtered and sorted tree listings
    - _Requirements: 7.1, 7.2_

  - [ ]* 3.2 Write property test for quality filtering
    - **Property 3: Quality filter correctness**
    - **Validates: Requirements 3.2**

  - [ ]* 3.3 Write property test for delivery zone filtering
    - **Property 4: Delivery zone filter correctness**
    - **Validates: Requirements 4.2**

  - [ ]* 3.4 Write property test for return policy filtering
    - **Property 5: Return policy filter correctness**
    - **Validates: Requirements 5.2**

  - [ ]* 3.5 Write property test for match score ordering
    - **Property 6: Match score ordering**
    - **Validates: Requirements 7.2**

  - [ ]* 3.6 Write property test for multi-criteria filtering
    - **Property 12: Multi-criteria filtering composition**
    - **Validates: Requirements 7.1**

  - [x] 3.7 Create GET /api/trees/{treeId} Lambda function
    - Parse treeId from path parameters
    - Query DynamoDB for specific tree
    - Return detailed tree information with vendor details
    - Handle 404 for invalid tree IDs
    - _Requirements: 7.5_

  - [x] 3.8 Create GET /api/delivery-zones Lambda function
    - Return list of valid Texas delivery zones
    - Used for frontend location validation
    - _Requirements: 1.2_

  - [ ]* 3.9 Write unit tests for Lambda functions
    - Test search endpoint with specific filter combinations
    - Test tree detail endpoint with valid and invalid IDs
    - Test delivery zones endpoint response format
    - _Requirements: 7.1, 7.5, 1.2_

- [ ] 4. Implement core filtering and scoring logic
  - [x] 4.1 Create location validation utility
    - Validate Texas cities and zip codes
    - Map locations to delivery zones
    - Return validation result and delivery zone
    - _Requirements: 1.2, 1.3_

  - [ ]* 4.2 Write property test for location validation
    - **Property 1: Location validation consistency**
    - **Validates: Requirements 1.2**

  - [ ]* 4.3 Write property test for invalid location rejection
    - **Property 2: Invalid location rejection**
    - **Validates: Requirements 1.3**

  - [x] 4.4 Create match score calculation function
    - Calculate individual criterion matches (price, quality, delivery, return, popularity)
    - Compute overall match percentage
    - Return MatchScore object with details
    - _Requirements: 8.3_

  - [ ]* 4.5 Write property test for match percentage calculation
    - **Property 9: Match percentage calculation**
    - **Validates: Requirements 8.3**

  - [ ]* 4.6 Write unit tests for scoring logic
    - Test perfect match scenarios (100% match)
    - Test partial match scenarios
    - Test no match scenarios (0% match)
    - _Requirements: 8.2, 8.3_

- [ ] 5. Build wizard UI components
  - [x] 5.1 Create WizardContainer component
    - Manage wizard state (current step, collected criteria, navigation history)
    - Handle step transitions (next, back, start over)
    - Persist state to localStorage
    - Render current step component
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [ ]* 5.2 Write property test for navigation state preservation
    - **Property 10: Navigation state preservation**
    - **Validates: Requirements 9.2**

  - [ ]* 5.3 Write property test for criteria update propagation
    - **Property 11: Criteria update propagation**
    - **Validates: Requirements 9.3**

  - [x] 5.4 Create LocationStep component
    - Render location input field with autocomplete
    - Validate input against Texas delivery zones
    - Display error messages for invalid locations
    - Store valid location and proceed to next step
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 5.5 Create PriceRangeStep component
    - Render dual-handle price range slider ($20-$500)
    - Display selected range in real-time
    - Store price range and proceed to next step
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 5.6 Create QualityStep component
    - Render star rating selector (1-5 stars)
    - Visual star display with hover effects
    - Store quality preference and proceed to next step
    - _Requirements: 3.1, 3.2, 3.3_

  - [x] 5.7 Create DeliveryStep component
    - Render delivery preference options (required, preferred, not needed)
    - Store delivery preference and proceed to next step
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 5.8 Create ReturnPolicyStep component
    - Render return window options (7, 14, 30 days, no preference)
    - Store return policy preference and proceed to next step
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 5.9 Create SocialPopularityStep component
    - Render popularity level cards (high, medium, low, any)
    - Visual cards with social media icons
    - Store popularity preference and proceed to results
    - _Requirements: 6.1, 6.2, 6.3_

- [ ] 6. Build results display components
  - [x] 6.1 Create ResultsDisplay component
    - Fetch trees from API with collected criteria
    - Display loading state during API call
    - Render grid/list of matching trees
    - Show empty state message when no results
    - Display "Start Over" button
    - _Requirements: 7.1, 7.2, 7.3, 9.4_

  - [x] 6.2 Create TreeCard component
    - Display tree image, vendor name, price, quality rating
    - Show delivery availability, return window, social popularity score
    - Display match percentage badge
    - Highlight matching criteria with visual badges
    - Show "Perfect Match" indicator for 100% matches
    - Handle click to open detail modal
    - _Requirements: 7.4, 8.1, 8.2, 8.3_

  - [ ]* 6.3 Write property test for required field presence
    - **Property 7: Required field presence in results**
    - **Validates: Requirements 7.4**

  - [ ]* 6.4 Write property test for perfect match indicator
    - **Property 8: Perfect match indicator accuracy**
    - **Validates: Requirements 8.2**

  - [x] 6.5 Create TreeDetailModal component
    - Display full tree specifications
    - Show vendor information and contact details
    - Render purchase/inquiry buttons
    - Handle modal open/close
    - _Requirements: 7.5_

  - [ ]* 6.6 Write unit tests for result components
    - Test TreeCard renders all required fields
    - Test perfect match indicator appears correctly
    - Test match percentage display
    - Test empty state rendering
    - _Requirements: 7.3, 7.4, 8.2, 8.3_

- [ ] 7. Add UI polish and responsive design
  - [ ] 7.1 Implement loading states and animations
    - Add loading spinners for API calls
    - Skeleton loaders for tree cards
    - Smooth transitions between wizard steps
    - Fade-in animations for results
    - _Requirements: All_

  - [ ] 7.2 Style components with Tailwind theme
    - Use consistent theme colors (blue-600, gray-100, etc.)
    - Proper spacing using Tailwind scale
    - Hover states on interactive elements
    - Responsive design for mobile devices
    - _Requirements: 10.1, 10.2, 10.3_

  - [ ] 7.3 Add error handling UI
    - Error message components for validation failures
    - Network error displays with retry buttons
    - User-friendly error messages throughout
    - _Requirements: 1.3, 7.3_

- [ ] 8. Wire up API integration
  - [x] 8.1 Create API client utility
    - Fetch wrapper with error handling
    - Base URL configuration from environment variables
    - Type-safe request/response handling
    - _Requirements: 7.1, 7.5_

  - [ ] 8.2 Integrate search API in ResultsDisplay
    - Call /api/trees/search with filter criteria
    - Handle loading, success, and error states
    - Display results or error messages
    - _Requirements: 7.1, 7.2_

  - [ ] 8.3 Integrate detail API in TreeDetailModal
    - Call /api/trees/{treeId} when tree is selected
    - Handle loading and error states
    - Display detailed tree information
    - _Requirements: 7.5_

  - [ ] 8.4 Integrate delivery zones API in LocationStep
    - Call /api/delivery-zones on component mount
    - Use for location validation and autocomplete
    - _Requirements: 1.2_

- [ ] 9. Update SAM template with all resources
  - [x] 9.1 Add all Lambda functions to template.yaml
    - Define search, detail, and delivery-zones functions
    - Configure API Gateway events for each endpoint
    - Set up DynamoDB permissions
    - Add environment variables (TABLE_NAME, API_URL)
    - _Requirements: All_

  - [ ] 9.2 Configure API Gateway CORS
    - Allow frontend domain origin
    - Configure allowed methods and headers
    - _Requirements: All_

  - [ ] 9.3 Add DynamoDB table and GSI
    - Define table with pk/sk keys
    - Add GSI for delivery zone queries
    - Configure on-demand billing
    - _Requirements: 7.1_

- [ ] 10. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Create main application page
  - [x] 11.1 Update frontend/src/app/page.tsx
    - Import and render WizardContainer
    - Add page title and description
    - Style with consistent theme
    - _Requirements: All_

  - [x] 11.2 Update Header component
    - Add "Christmas Tree Wizard" branding
    - Include navigation if needed
    - _Requirements: All_

- [ ] 12. Final integration and testing
  - [ ] 12.1 Test complete wizard flow end-to-end
    - Walk through all wizard steps
    - Verify results display correctly
    - Test back navigation and state preservation
    - Test start over functionality
    - _Requirements: All_

  - [ ] 12.2 Test error scenarios
    - Invalid location input
    - No matching results
    - Network errors
    - Invalid tree ID
    - _Requirements: 1.3, 7.3_

  - [ ] 12.3 Test responsive design on mobile
    - Verify layout on small screens
    - Test touch interactions
    - Ensure readability across viewports
    - _Requirements: 10.1, 10.2, 10.3_

- [ ] 13. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
