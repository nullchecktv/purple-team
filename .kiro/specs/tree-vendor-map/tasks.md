# Implementation Plan

- [ ] 1. Set up backend Lambda function for vendor API
- [x] 1.1 Create Python Lambda function with hardcoded vendor data


  - Create `backend/functions/tree-vendors/get.py`
  - Define hardcoded vendor list with 5-7 vendors around New York area
  - Implement handler that returns vendors in JSON format
  - Add basic error handling with try-catch
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 1.2 Update SAM template with tree-vendors endpoint


  - Add TreeVendorsFunction resource to `backend/template.yaml`
  - Configure GET /tree-vendors API Gateway route
  - Set Python 3.13 runtime
  - Configure CORS for frontend access
  - _Requirements: 3.1_

- [ ]* 1.3 Write unit tests for Lambda function
  - Create `backend/functions/tree-vendors/test_get.py`
  - Test successful 200 response
  - Test response format matches schema
  - Test all vendors have required fields
  - _Requirements: 3.2, 3.3_

- [ ]* 1.4 Write property-based test for vendor data
  - **Property 4: Vendor data parsing**
  - **Validates: Requirements 3.2**
  - Test that for any valid vendor data structure, parsing succeeds
  - Use Hypothesis to generate vendor data variations
  - Run minimum 100 iterations

- [ ]* 1.5 Write property-based test for coordinate extraction
  - **Property 5: Coordinate extraction**
  - **Validates: Requirements 3.3**
  - Test that coordinates are extracted from any vendor record
  - Use Hypothesis to generate vendor records with lat/long
  - Run minimum 100 iterations

- [ ] 2. Create frontend map component with Leaflet
- [x] 2.1 Install Leaflet dependencies


  - Add react-leaflet and leaflet packages to frontend
  - Add Leaflet CSS imports
  - Configure Next.js for Leaflet (client-side only)
  - _Requirements: 1.1_

- [x] 2.2 Create map page component


  - Create `frontend/src/app/tree-vendors/page.tsx`
  - Set up basic map container with Leaflet
  - Configure OpenStreetMap tile layer
  - Add loading state with spinner
  - Add error state display
  - Use Tailwind for styling with theme colors
  - _Requirements: 1.1, 5.1_

- [x] 2.3 Implement geolocation functionality

  - Request customer location on component mount
  - Center map on customer coordinates when obtained
  - Set zoom level to 12 for appropriate view
  - Display customer location marker on map
  - Fall back to default NYC coordinates if denied
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 2.4 Fetch and display vendor data

  - Call GET /tree-vendors API on component mount
  - Parse vendor response data
  - Extract coordinates from each vendor
  - Render vendor pins on map at correct locations
  - Use custom tree icon for vendor markers
  - Handle loading state during fetch
  - Handle error state if API fails
  - _Requirements: 3.1, 3.2, 3.3, 1.2, 3.4, 3.5_

- [x] 2.5 Implement vendor pin click interaction

  - Add click handler to vendor markers
  - Display vendor info panel on pin click
  - Show vendor name, address, phone, inventory, price range
  - Style info panel with Tailwind theme colors
  - Add smooth transition animation for panel
  - Close panel when clicking outside or on map
  - Update panel when clicking different vendor pin
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 2.6 Add visual polish and responsive design


  - Add hover effects to vendor pins
  - Ensure responsive layout for mobile/desktop
  - Use consistent spacing (p-4, space-y-4, gap-6)
  - Add smooth transitions (transition-all duration-200)
  - Ensure proper contrast and accessibility
  - Add empty state if no vendors found
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ]* 2.7 Write unit tests for map component
  - Create `frontend/src/app/tree-vendors/page.test.tsx`
  - Test map component renders
  - Test geolocation API called on mount
  - Test vendor API called on mount
  - Test loading indicator displays
  - Test zoom level set correctly
  - Test clicking outside closes info panel
  - _Requirements: 1.1, 2.1, 3.1, 3.5, 2.3, 4.4, 5.1_

- [ ] 3. Integration and final testing
- [x] 3.1 Deploy and test end-to-end flow


  - Deploy backend with `sam build && sam deploy`
  - Update frontend API URL to deployed endpoint
  - Test complete user flow: load map → see location → see vendors → click pin
  - Verify all vendor data displays correctly
  - Test on different screen sizes
  - _Requirements: All_

- [x] 3.2 Add navigation link to main app


  - Add "Find Tree Vendors" link to main navigation
  - Ensure routing works correctly
  - Test navigation flow
  - _Requirements: 1.1_
