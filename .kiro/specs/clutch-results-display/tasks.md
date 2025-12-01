# Implementation Plan

- [x] 1. Create ClutchResultsPage component with routing
  - [x] 1.1 Create the ClutchResultsPage component file at `frontend/src/components/ClutchResultsPage.tsx`
    - Create component with clutchId prop
    - Set up state for clutch data, loading, error, and polling status
    - Implement useEffect for initial data fetch
    - _Requirements: 1.1, 1.2_
  - [x] 1.2 Add route for clutch results page in Next.js app
    - Create `frontend/src/app/clutch/[id]/page.tsx` dynamic route
    - Pass clutchId from URL params to ClutchResultsPage component
    - _Requirements: 1.1_

- [x] 2. Implement polling logic and data fetching
  - [x] 2.1 Create fetchClutchData function and implement 5-second polling
    - Call GET /api/clutch/:id endpoint
    - Set up setInterval for polling every 5 seconds
    - Clear interval on component unmount
    - Stop polling when processing is complete
    - _Requirements: 1.1, 1.3, 4.1, 4.2, 4.3, 4.4_

- [x] 3. Implement viability calculation and display
  - [x] 3.1 Create viability calculation and display UI
    - Filter eggs where hatchLikelihood >= 70
    - Show total eggs detected
    - Prominently display "X eggs will hatch" count
    - _Requirements: 1.3, 1.4_

- [x] 4. Implement processing status and progress display
  - [x] 4.1 Create processing status and progress UI
    - Show 'Analyzing eggs...' when eggs.length === 0
    - Show 'Generating chick images...' when some viable eggs lack images
    - Show 'Analysis complete' when all viable eggs have images
    - Display progress bar with percentage
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 5. Implement individual chick image display
  - [x] 5.1 Create ChickCard component and grid layout
    - Show chick image when chickImageUrl exists
    - Show loading placeholder when image is pending
    - Display predicted breed and hatch likelihood
    - Arrange cards in responsive grid
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 6. Implement full portrait section
  - [x] 6.1 Create FullPortrait component
    - Display all viable chick images together
    - Show summary with total viable eggs and breed list
    - Only render when all viable eggs have images
    - Add celebratory styling for completion state
    - _Requirements: 3.1, 3.2, 3.3_

- [x] 7. Integrate with ImageUpload component
  - [x] 7.1 Update ImageUpload to navigate to clutch results page after upload
    - After successful upload, extract clutchId from response
    - Navigate to /clutch/[clutchId] page
    - _Requirements: 1.1_

