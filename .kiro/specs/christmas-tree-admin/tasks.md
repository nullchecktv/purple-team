# Implementation Plan

- [x] 1. Set up project structure and Lambda functions
  - Check for .env file and create if needed (ask runtime preference and team member name)
  - Create backend/functions/christmas-trees/ directory
  - Copy from examples based on runtime preference (Node.js or Python)
  - Set up basic Lambda handler structure for CRUD operations
  - _Requirements: 1.1, 2.1, 3.1, 4.1_

- [x] 2. Implement Create Tree Lambda function
  - Generate unique tree ID (UUID)
  - Validate required attributes (species, height, price, storeLocation)
  - Add creation and update timestamps
  - Persist tree to DynamoDB with pk=TREE#{id}, sk=METADATA
  - Return created tree object with 201 status
  - _Requirements: 1.1, 1.2, 1.3, 1.5_

- [ ]* 2.1 Write property test for tree creation persistence
  - **Property 1: Tree creation persistence**
  - **Validates: Requirements 1.1, 5.1, 5.2, 5.3**

- [ ]* 2.2 Write property test for unique ID assignment
  - **Property 2: Unique ID assignment**
  - **Validates: Requirements 1.2**

- [ ]* 2.3 Write property test for invalid creation rejection
  - **Property 3: Invalid creation rejection**
  - **Validates: Requirements 1.3, 6.1**

- [x] 3. Implement List Trees Lambda function
  - Query DynamoDB for all items with pk starting with TREE#
  - Support optional storeLocation query parameter for filtering
  - Return array of tree objects with 200 status
  - Handle empty results gracefully
  - _Requirements: 2.1, 6.3_

- [ ]* 3.1 Write property test for store location filtering
  - **Property 10: Store location filtering**
  - **Validates: Requirements 6.3, 6.5**

- [x] 4. Implement Update Tree Lambda function
  - Validate tree ID exists in DynamoDB
  - Validate updated attributes
  - Preserve original createdAt timestamp
  - Update updatedAt timestamp
  - Persist changes to DynamoDB
  - Return updated tree object with 200 status
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ]* 4.1 Write property test for update persistence
  - **Property 7: Update persistence**
  - **Validates: Requirements 3.1, 3.5**

- [ ]* 4.2 Write property test for timestamp management
  - **Property 5: Timestamp management**
  - **Validates: Requirements 1.5, 3.2, 3.3**

- [ ]* 4.3 Write property test for invalid update rejection
  - **Property 8: Invalid update rejection**
  - **Validates: Requirements 3.4, 5.5**

- [x] 5. Implement Delete Tree Lambda function
  - Validate tree ID exists in DynamoDB
  - Remove tree from DynamoDB
  - Return success confirmation with 200 status
  - Return 404 if tree not found
  - _Requirements: 4.1, 4.5_

- [ ]* 5.1 Write property test for deletion completeness
  - **Property 9: Deletion completeness**
  - **Validates: Requirements 4.1, 4.5**

- [x] 6. Update SAM template with API Gateway routes
  - Add CreateTreeFunction resource with POST /trees endpoint
  - Add ListTreesFunction resource with GET /trees endpoint
  - Add UpdateTreeFunction resource with PUT /trees/{treeId} endpoint
  - Add DeleteTreeFunction resource with DELETE /trees/{treeId} endpoint
  - Configure DynamoDB permissions for all functions
  - Set TABLE_NAME environment variable for all functions
  - _Requirements: 1.1, 2.1, 3.1, 4.1_

- [x] 7. Create frontend UI components
  - Create LoadingSpinner component with Tailwind animations
  - Create ErrorMessage component with styled error display
  - Create EmptyState component for empty inventory
  - Create Card component for tree items with hover effects
  - Create Button component with consistent styling and disabled states
  - _Requirements: 7.1, 7.5, 2.3_

- [x] 8. Implement TreeForm component
  - Create form with fields: species, height, price, condition, description, storeLocation
  - Add client-side validation for required fields
  - Implement submit handler that calls API
  - Show loading state during submission (disable button, show spinner)
  - Display success/error messages after submission
  - Clear form after successful creation
  - Support both create and update modes
  - _Requirements: 1.1, 1.3, 3.1, 3.4, 7.4_

- [x] 9. Implement TreeList component
  - Fetch trees from GET /trees endpoint on mount
  - Display loading skeleton during fetch
  - Show empty state when no trees exist
  - Render trees in grid layout with Card components
  - Display all tree attributes: species, height, price, condition, store location
  - Add edit button for each tree (opens TreeForm in edit mode)
  - Add delete button for each tree (shows confirmation dialog)
  - Implement store location filter dropdown
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 6.2, 6.3_

- [ ]* 9.1 Write property test for UI list synchronization
  - **Property 4: UI list synchronization**
  - **Validates: Requirements 1.4, 2.1, 4.2**

- [ ]* 9.2 Write property test for complete attribute rendering
  - **Property 6: Complete attribute rendering**
  - **Validates: Requirements 2.2, 5.4, 6.2**

- [x] 10. Implement TreeAdminPanel main component
  - Manage state for tree list and selected tree for editing
  - Coordinate between TreeList and TreeForm components
  - Handle create tree flow (show form, call API, refresh list)
  - Handle update tree flow (populate form, call API, refresh list)
  - Handle delete tree flow (show confirmation, call API, refresh list)
  - Implement error handling with ErrorMessage component
  - Add smooth transitions between views
  - _Requirements: 1.4, 3.5, 4.2, 4.3, 7.2, 7.3_

- [ ]* 10.1 Write property test for loading state visibility
  - **Property 11: Loading state visibility**
  - **Validates: Requirements 7.1, 7.4, 7.5**

- [ ]* 10.2 Write property test for error handling
  - **Property 12: Error handling**
  - **Validates: Requirements 2.5, 4.4, 7.3**

- [x] 11. Add Christmas Tree Admin page to Next.js app
  - Create /trees route in Next.js app
  - Import and render TreeAdminPanel component
  - Add navigation link in Header component
  - Apply consistent page layout and styling
  - _Requirements: All UI requirements_

- [x] 12. Polish UI with animations and visual feedback
  - Add fade-in animations for tree cards
  - Add smooth transitions for form state changes
  - Ensure all buttons have hover states
  - Verify consistent Tailwind theme colors throughout
  - Add success toast/message after successful operations
  - Test responsive design on different screen sizes
  - _Requirements: 7.1, 7.2, 7.5_

- [x] 13. Final checkpoint - Ensure all functionality works
  - Test create tree flow end-to-end
  - Test list trees with and without filters
  - Test update tree flow end-to-end
  - Test delete tree flow with confirmation
  - Verify all loading states appear correctly
  - Verify all error states display properly
  - Ensure all tests pass, ask the user if questions arise
