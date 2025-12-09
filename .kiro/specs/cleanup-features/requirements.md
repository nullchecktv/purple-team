# Requirements Document

## Introduction

Remove all features built outside the core choreographed workflow. The core workflow is: photo upload → egg image analysis → chick generation. Everything else (Python functions, dashboard UI, analytics, monitoring, etc.) needs to be removed to simplify the application for the hackathon demo.

## Glossary

- **Core Workflow**: The main feature flow consisting of image upload, egg analysis, and chick media generation
- **Rogue Features**: Features built outside the core workflow that add unnecessary complexity
- **Dashboard UI**: The ChickenHatchingDashboard component with tabs for monitoring, analytics, etc.
- **Python Functions**: Lambda functions written in Python that are not part of the core workflow

## Requirements

### Requirement 1

**User Story:** As a developer, I want to remove all Python Lambda functions that are not part of the core workflow, so that the application is simplified and focused on the main demo.

#### Acceptance Criteria

1. WHEN reviewing the SAM template THEN the system SHALL identify all Python Lambda functions
2. WHEN a Python function is not part of the core workflow THEN the system SHALL remove it from the template
3. WHEN a Python function is removed THEN the system SHALL also remove its function directory
4. WHEN all Python functions are removed THEN the system SHALL verify no orphaned API Gateway routes remain

### Requirement 2

**User Story:** As a developer, I want to remove the dashboard UI component, so that the application has a simpler, focused interface.

#### Acceptance Criteria

1. WHEN reviewing frontend components THEN the system SHALL identify the ChickenHatchingDashboard component
2. WHEN the dashboard component is identified THEN the system SHALL remove the component file
3. WHEN the dashboard is removed THEN the system SHALL update any pages that reference it
4. WHEN frontend cleanup is complete THEN the system SHALL verify the application still builds

### Requirement 3

**User Story:** As a developer, I want to keep only the core workflow functions, so that the demo focuses on the main value proposition.

#### Acceptance Criteria

1. WHEN identifying core functions THEN the system SHALL preserve image upload functionality
2. WHEN identifying core functions THEN the system SHALL preserve egg analysis agent functionality
3. WHEN identifying core functions THEN the system SHALL preserve chick media generator functionality
4. WHEN identifying core functions THEN the system SHALL preserve clutch listing and viewing functionality
5. WHEN identifying core functions THEN the system SHALL preserve blockchain integration if used in core flow

### Requirement 4

**User Story:** As a developer, I want to clean up the SAM template, so that it only contains resources for the core workflow.

#### Acceptance Criteria

1. WHEN cleaning the template THEN the system SHALL remove all Python function definitions
2. WHEN cleaning the template THEN the system SHALL remove associated API Gateway events
3. WHEN cleaning the template THEN the system SHALL preserve shared resources like DynamoDB table and S3 bucket
4. WHEN cleaning the template THEN the system SHALL preserve all Node.js functions in the core workflow
5. WHEN template cleanup is complete THEN the system SHALL verify the template is valid YAML
