# Requirements Document

## Introduction

This feature implements a real-time polling and display system for clutch analysis results in the UI. After a user uploads an egg image, the system analyzes the clutch and generates chick images for viable eggs. The UI needs to poll for analysis completion, display how many eggs will hatch, show individual chick images as they become available, and display a full portrait of all chicks that will hatch from the clutch.

## Glossary

- **Clutch_Results_Display**: The React component that polls for and displays clutch analysis results
- **Clutch**: A group of eggs from a single image upload, identified by a unique clutchId
- **Viable_Egg**: An egg with hatchLikelihood >= 70%, eligible for chick image generation
- **Chick_Image**: An AI-generated image of the predicted chick for a viable egg
- **Full_Portrait**: A composite display showing all chicks that will hatch from a clutch
- **Polling_Interval**: The time between API calls to check for updated clutch data
- **Processing_Status**: The current state of clutch analysis (pending, analyzing, generating_images, complete)

## Requirements

### Requirement 1

**User Story:** As a poultry farm operator, I want to see the analysis results after uploading an egg image, so that I can understand which eggs are viable for hatching.

#### Acceptance Criteria

1. WHEN an image upload completes THEN the Clutch_Results_Display SHALL begin polling the get-clutch API endpoint for results
2. WHEN the Clutch_Results_Display polls for results THEN the system SHALL display a loading state with progress indication
3. WHEN clutch data becomes available THEN the Clutch_Results_Display SHALL display the total number of eggs detected in the clutch
4. WHEN clutch data includes viability information THEN the Clutch_Results_Display SHALL prominently display how many eggs will hatch (hatchLikelihood >= 70%)

### Requirement 2

**User Story:** As a poultry farm operator, I want to see individual chick images as they are generated, so that I can preview what each viable egg will produce.

#### Acceptance Criteria

1. WHEN a Viable_Egg has a chickImageUrl THEN the Clutch_Results_Display SHALL display the chick image for that egg
2. WHEN a Viable_Egg does not yet have a chickImageUrl THEN the Clutch_Results_Display SHALL display a placeholder with loading animation
3. WHEN displaying a chick image THEN the Clutch_Results_Display SHALL show the predicted breed and hatch likelihood alongside the image
4. WHEN multiple chick images are available THEN the Clutch_Results_Display SHALL arrange them in a responsive grid layout

### Requirement 3

**User Story:** As a poultry farm operator, I want to see a full portrait of all chicks that will hatch, so that I can visualize my expected flock.

#### Acceptance Criteria

1. WHEN all Viable_Eggs have chickImageUrl populated THEN the Clutch_Results_Display SHALL display a Full_Portrait section
2. WHEN displaying the Full_Portrait THEN the system SHALL show all viable chick images together in a visually appealing layout
3. WHEN the Full_Portrait is displayed THEN the system SHALL include a summary showing total viable eggs and predicted breeds

### Requirement 4

**User Story:** As a poultry farm operator, I want the UI to automatically update as analysis progresses, so that I can see results without manually refreshing.

#### Acceptance Criteria

1. WHEN the clutch page loads THEN the Clutch_Results_Display SHALL poll the get-clutch API every 5 seconds
2. WHEN polling detects new data THEN the Clutch_Results_Display SHALL update the display with the latest information
3. WHEN all eggs have been analyzed and all viable eggs have chick images THEN the Clutch_Results_Display SHALL stop polling
4. WHEN a polling request fails THEN the Clutch_Results_Display SHALL display an error message and continue polling

### Requirement 5

**User Story:** As a poultry farm operator, I want clear visual feedback on the analysis progress, so that I understand what stage the system is at.

#### Acceptance Criteria

1. WHEN clutch metadata exists but no eggs are analyzed THEN the Clutch_Results_Display SHALL show "Analyzing eggs..." status
2. WHEN eggs are analyzed but chick images are pending THEN the Clutch_Results_Display SHALL show "Generating chick images..." status with a count of completed images
3. WHEN all processing is complete THEN the Clutch_Results_Display SHALL show "Analysis complete" status
4. WHEN displaying progress THEN the Clutch_Results_Display SHALL show a progress bar indicating percentage of completion

