# Requirements Document

## Introduction

This feature enhances the user interface to provide real-time status tracking for clutch processing. When a user uploads an egg image, the system processes it through multiple stages (egg detection, viability analysis, and chick image generation). Currently, users have no visibility into this processing pipeline. This feature will implement polling-based status updates that display the current processing stage and final results including total egg count, viable egg count, and the generated chicken image.

## Glossary

- **Clutch**: A collection of eggs uploaded together in a single image
- **Clutch Processing Pipeline**: The multi-stage workflow that processes uploaded egg images through detection, analysis, and image generation
- **Status Field**: A database field tracking the current processing stage of a clutch
- **Polling**: A technique where the client repeatedly requests data from the server at regular intervals
- **Viable Egg**: An egg with sufficient hatch likelihood to be counted toward the flock
- **Processing Stage**: A distinct phase in the clutch processing pipeline (Detecting Eggs, Determining Egg Viability, Calculating Flock Numbers, Completed)

## Requirements

### Requirement 1

**User Story:** As a user, I want to see real-time status updates after uploading an egg image, so that I understand what the system is doing and when processing is complete.

#### Acceptance Criteria

1. WHEN a user uploads an egg image THEN the system SHALL display a status indicator showing the current processing stage
2. WHEN the clutch status changes THEN the system SHALL update the displayed status within 10 seconds
3. WHEN processing is complete THEN the system SHALL display the final results including total egg count, viable egg count, and chicken image
4. WHEN an error occurs during processing THEN the system SHALL display an error message to the user
5. WHEN the user navigates away from the status view THEN the system SHALL stop polling for updates

### Requirement 2

**User Story:** As a backend system, I want to update clutch status at each processing stage, so that the frontend can display accurate progress information.

#### Acceptance Criteria

1. WHEN the egg detector Lambda function starts THEN the system SHALL update the clutch status to "Detecting Eggs"
2. WHEN the egg detector completes and stores egg count THEN the system SHALL update the clutch status to "Determining Egg Viability"
3. WHEN the gather-egg-findings Lambda function starts THEN the system SHALL update the clutch status to "Calculating Flock Numbers"
4. WHEN the chick image is generated and viable egg count is stored THEN the system SHALL update the clutch status to "Completed"
5. WHEN any processing stage fails THEN the system SHALL update the clutch status to "Error" with error details

### Requirement 3

**User Story:** As a frontend developer, I want a polling mechanism that efficiently checks clutch status, so that users see timely updates without overwhelming the backend.

#### Acceptance Criteria

1. WHEN status polling begins THEN the system SHALL poll the get-clutch endpoint every 10 seconds
2. WHEN the clutch status is "Completed" or "Error" THEN the system SHALL stop polling
3. WHEN the component unmounts THEN the system SHALL clean up the polling interval
4. WHEN a network error occurs during polling THEN the system SHALL retry the request without stopping the polling cycle
5. WHEN the maximum polling duration (5 minutes) is reached THEN the system SHALL stop polling and display a timeout message

### Requirement 4

**User Story:** As a user, I want to see the final results prominently displayed, so that I can quickly understand the outcome of my egg analysis.

#### Acceptance Criteria

1. WHEN processing completes successfully THEN the system SHALL display the total egg count in a prominent card
2. WHEN processing completes successfully THEN the system SHALL display the viable egg count with percentage
3. WHEN processing completes successfully THEN the system SHALL display the generated chicken image
4. WHEN the chicken image is displayed THEN the system SHALL show it with smooth fade-in animation
5. WHEN no viable eggs are found THEN the system SHALL display an appropriate message explaining the result
