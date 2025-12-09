# Design Document

## Overview

This design outlines the systematic removal of all features built outside the core workflow. The cleanup will focus on removing Python Lambda functions, the dashboard UI component, and associated infrastructure while preserving the core image upload → egg analysis → chick generation workflow.

## Architecture

### Current State
The application currently has:
- 9 Python Lambda functions (rogue features)
- 8 Node.js Lambda functions (core workflow + supporting)
- Complex dashboard UI with multiple tabs
- Shared infrastructure (DynamoDB, S3, SQS, EventBridge)

### Target State
After cleanup:
- 0 Python Lambda functions
- 8 Node.js Lambda functions (core workflow only)
- Simple image upload interface
- Shared infrastructure (preserved)

### Core Workflow Functions to Preserve
1. **GeneratePresignedUrlFunction** - Image upload
2. **EggStreamForwarder** - DynamoDB stream processor
3. **EggAnalysisAgent** - Egg image analysis
4. **AnalysisResultForwarder** - Analysis result processor
5. **ChickMediaGenerator** - Chick image and music generation
6. **ListClutchesFunction** - List clutches
7. **GetClutchFunction** - Get clutch details
8. **ConsolidateFindingsFunction** - Consolidate egg findings (if exists)

## Components and Interfaces

### SAM Template Cleanup

**Functions to Remove:**
- EggRegistrationFunction (Python)
- EnvironmentalMonitoringFunction (Python)
- RotationOptimizationFunction (Python)
- HatchPredictionFunction (Python)
- EmergenceMonitoringFunction (Python)
- BlockchainIntegrationFunction (Python)
- MaternalSimulationFunction (Python)
- AnalyticsReportingFunction (Python)
- MusicGenerationFunction (Python)

**Resources to Preserve:**
- HttpApi (API Gateway)
- DataTable (DynamoDB)
- ImageUploadBucket (S3)
- EggDataQueue (SQS)
- AnalyzedEggQueue (SQS)
- All Node.js Lambda functions

### Frontend Cleanup

**Files to Remove:**
- `frontend/src/components/ChickenHatchingDashboard.tsx`
- `frontend/src/app/dashboard/page.tsx` (if it uses the dashboard)

**Files to Update:**
- `frontend/src/app/page.js` - Remove dashboard references
- Any other pages that import ChickenHatchingDashboard

### Backend Cleanup

**Directories to Remove:**
- `backend/functions/egg-registration/`
- `backend/functions/environmental-monitoring/`
- `backend/functions/rotation-optimization/`
- `backend/functions/hatch-prediction/`
- `backend/functions/emergence-monitoring/`
- `backend/functions/blockchain-integration/`
- `backend/functions/maternal-simulation/`
- `backend/functions/analytics-reporting/`
- `backend/functions/music-generation/`

## Data Models

No changes to data models. The DynamoDB schema remains the same to support the core workflow.

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Property 1: Template validity after cleanup
*For any* SAM template cleanup operation, the resulting template should be valid YAML and pass SAM validation
**Validates: Requirements 4.5**

Property 2: Core workflow preservation
*For any* cleanup operation, all Node.js functions in the core workflow should remain in the template with their configurations intact
**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

Property 3: Complete function removal
*For any* Python function removed from the template, its corresponding directory should also be deleted from the filesystem
**Validates: Requirements 1.3**

Property 4: API route cleanup
*For any* removed Lambda function, all associated API Gateway routes should also be removed from the template
**Validates: Requirements 1.4**

## Error Handling

### File Not Found Errors
- If a function directory doesn't exist, log a warning and continue
- Don't fail the entire cleanup if one directory is missing

### Template Parsing Errors
- Validate YAML syntax before writing changes
- Create backup of original template before modifications
- If validation fails, restore from backup

### Frontend Build Errors
- After removing dashboard, verify frontend builds successfully
- If build fails, identify and fix remaining references

## Testing Strategy

### Manual Verification Steps
1. Review SAM template diff to confirm only Python functions removed
2. Verify all Node.js functions still present
3. Check that shared resources (DynamoDB, S3, SQS) are preserved
4. Confirm frontend builds without errors
5. Deploy and test core workflow end-to-end

### Validation Checks
- SAM template YAML syntax validation
- Frontend TypeScript compilation
- Verify no broken imports in frontend
- Check for orphaned API routes

## Implementation Notes

### Cleanup Order
1. Remove Python function definitions from SAM template
2. Remove Python function directories from filesystem
3. Remove dashboard component from frontend
4. Update frontend pages to remove dashboard references
5. Verify frontend builds
6. Validate SAM template
7. Test deployment

### Backup Strategy
- Create git commit before starting cleanup
- Keep backup of original template.yaml
- Document all removed functions for potential restoration
