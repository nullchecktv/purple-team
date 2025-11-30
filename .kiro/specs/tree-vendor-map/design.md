# Design Document

## Overview

The Christmas tree vendor map feature provides an interactive map interface that displays vendor locations and allows customers to discover nearby Christmas tree sellers. The system consists of a React frontend component using Leaflet for map rendering, a Python Lambda function to serve vendor data, and DynamoDB for vendor storage. The map automatically centers on the customer's location and displays vendor pins that can be clicked to reveal detailed information.

## Architecture

### High-Level Architecture

```
Customer Browser
    ↓
React Map Component (Leaflet)
    ↓
API Gateway (/tree-vendors)
    ↓
Lambda Function (Python - returns hardcoded data)
```

### Component Interaction Flow

1. Customer opens the map page
2. Browser requests geolocation permission
3. React component fetches vendor data from API
4. Lambda returns hardcoded vendor data
5. Map renders with customer location and vendor pins
6. Customer clicks vendor pin to view details

## Components and Interfaces

### Frontend Component

**File**: `frontend/src/app/tree-vendors/page.tsx`

**Responsibilities**:
- Render interactive map using Leaflet
- Request and handle customer geolocation
- Fetch vendor data from API
- Display vendor pins on map
- Show vendor details on pin click
- Handle loading and error states

**Key Functions**:
- `useEffect` hook for geolocation and data fetching
- `handlePinClick(vendor)` - Display vendor information
- `renderVendorMarkers()` - Create map markers for vendors

### Backend Lambda Function

**File**: `backend/functions/tree-vendors/get.py`

**Responsibilities**:
- Return hardcoded vendor data (no database queries for MVP)
- Format vendor data for frontend consumption
- Handle errors and return appropriate status codes

**API Endpoint**: `GET /tree-vendors`

**Response Format**:
```json
{
  "vendors": [
    {
      "id": "vendor-123",
      "name": "Pine Tree Farm",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "address": "123 Tree Lane, New York, NY",
      "phone": "555-0123",
      "inventory": "Fraser Fir, Douglas Fir, Blue Spruce",
      "priceRange": "$40-$120"
    }
  ]
}
```

**Note**: For hackathon MVP, vendor data is hardcoded in the Lambda function. This eliminates DynamoDB dependency and speeds up development.

### Data Models

**Hardcoded Vendor Data (Python)**:
```python
VENDORS = [
    {
        "id": "vendor-1",
        "name": "Pine Tree Farm",
        "latitude": 40.7128,
        "longitude": -74.0060,
        "address": "123 Tree Lane, New York, NY",
        "phone": "555-0123",
        "inventory": "Fraser Fir, Douglas Fir, Blue Spruce",
        "priceRange": "$40-$120"
    },
    # Additional vendors...
]
```

**Frontend Vendor Interface (TypeScript)**:
```typescript
interface Vendor {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  phone: string;
  inventory: string;
  priceRange: string;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Acceptance Criteria Testing Prework

1.1 WHEN the map loads THEN the Map System SHALL display an interactive map interface
Thoughts: This is about the initial rendering of the map component. We can test that the map container element exists and is rendered with proper dimensions.
Testable: yes - example

1.2 WHEN vendor data is retrieved from the Vendor API THEN the Map System SHALL render vendor pins at their geographic coordinates
Thoughts: This is a property that should hold for all vendor data. For any set of vendors with valid coordinates, the map should render a corresponding pin for each vendor.
Testable: yes - property

1.3 WHEN multiple vendors exist in the same area THEN the Map System SHALL display all vendor pins without overlap
Thoughts: This is about visual rendering behavior which is difficult to test programmatically without visual regression testing.
Testable: no

1.4 WHEN the map is displayed THEN the Map System SHALL allow pan and zoom interactions
Thoughts: This is testing that the map library's built-in functionality works, which is already tested by Leaflet itself.
Testable: no

1.5 WHEN vendor pins are rendered THEN the Map System SHALL use distinct visual markers for vendor locations
Thoughts: This is about visual styling which is not easily testable as a property.
Testable: no

2.1 WHEN the map initializes THEN the Map System SHALL request the Customer Location from the browser
Thoughts: This is testing that the geolocation API is called during initialization. We can test this specific behavior.
Testable: yes - example

2.2 WHEN the Customer Location is obtained THEN the Map System SHALL center the map view on those coordinates
Thoughts: For any valid customer coordinates, the map should center on those coordinates. This is a property.
Testable: yes - property

2.3 WHEN the Customer Location is obtained THEN the Map System SHALL set an appropriate zoom level to show nearby vendors
Thoughts: This is testing a specific zoom level is set, which is an example test.
Testable: yes - example

2.4 IF the Customer Location cannot be obtained THEN the Map System SHALL center the map on a default location
Thoughts: This is testing the error case behavior, which is an edge case.
Testable: edge-case

2.5 WHEN the map centers on Customer Location THEN the Map System SHALL display a marker indicating the customer's position
Thoughts: For any customer location, a marker should be displayed. This is a property.
Testable: yes - property

3.1 WHEN the map component mounts THEN the Map System SHALL send a request to the Vendor API
Thoughts: This tests that an API call is made on mount, which is a specific example.
Testable: yes - example

3.2 WHEN the Vendor API responds successfully THEN the Map System SHALL parse the vendor data
Thoughts: For any valid API response, the system should successfully parse it. This is a property.
Testable: yes - property

3.3 WHEN vendor data is parsed THEN the Map System SHALL extract location coordinates for each vendor
Thoughts: For any vendor data, coordinates should be extracted. This is a property.
Testable: yes - property

3.4 IF the Vendor API request fails THEN the Map System SHALL display an error message to the customer
Thoughts: This is testing error handling behavior, which is an edge case.
Testable: edge-case

3.5 WHEN vendor data is loading THEN the Map System SHALL display a loading indicator
Thoughts: This tests that a loading state is shown during data fetch, which is a specific example.
Testable: yes - example

4.1 WHEN a customer clicks a vendor pin THEN the Map System SHALL display the Vendor Data for that vendor
Thoughts: For any vendor pin clicked, the corresponding vendor data should be displayed. This is a property.
Testable: yes - property

4.2 WHEN Vendor Data is displayed THEN the Map System SHALL show the vendor name, address, and contact information
Thoughts: For any vendor data displayed, all required fields should be present. This is a property.
Testable: yes - property

4.3 WHEN Vendor Data is displayed THEN the Map System SHALL show inventory or tree availability information
Thoughts: This is redundant with 4.2 - both test that vendor data fields are displayed.
Testable: yes - property (redundant)

4.4 WHEN a customer clicks outside the Vendor Data display THEN the Map System SHALL close the information panel
Thoughts: This tests specific UI interaction behavior, which is an example.
Testable: yes - example

4.5 WHEN a customer clicks a different vendor pin THEN the Map System SHALL replace the current Vendor Data with the new vendor's information
Thoughts: For any sequence of vendor pin clicks, the displayed data should match the most recently clicked vendor. This is a property.
Testable: yes - property

5.1 WHEN the map is loading THEN the Map System SHALL display a loading state with visual feedback
Thoughts: This is testing that a loading state exists, which is an example test.
Testable: yes - example

5.2 WHEN map interactions occur THEN the Map System SHALL provide smooth transitions and animations
Thoughts: This is about visual smoothness which is subjective and not easily testable.
Testable: no

5.3 WHEN the map is displayed on different screen sizes THEN the Map System SHALL adapt the layout responsively
Thoughts: This is about responsive design which is difficult to test programmatically.
Testable: no

5.4 WHEN vendor pins are hovered THEN the Map System SHALL provide visual feedback indicating interactivity
Thoughts: This is about hover states which is a visual behavior.
Testable: no

5.5 WHEN the map interface is rendered THEN the Map System SHALL use consistent theme colors and spacing
Thoughts: This is about visual consistency which is not easily testable as a property.
Testable: no

### Property Reflection

After reviewing the testable properties, I identify the following redundancies:

- **Property 4.2 and 4.3** are redundant: Both test that vendor data fields are displayed. These can be combined into a single property that checks all required fields (name, address, contact, inventory) are present.

The remaining properties provide unique validation value and should be kept.



### Correctness Properties

Property 1: Vendor pin rendering completeness
*For any* set of vendors with valid latitude and longitude coordinates, the map should render exactly one pin for each vendor at the correct geographic location
**Validates: Requirements 1.2**

Property 2: Map centering on customer location
*For any* valid customer coordinates obtained from geolocation, the map should center its view on those coordinates
**Validates: Requirements 2.2**

Property 3: Customer location marker display
*For any* customer location coordinates, the map should display a marker indicating the customer's position
**Validates: Requirements 2.5**

Property 4: Vendor data parsing
*For any* valid API response containing vendor data, the system should successfully parse all vendor records without errors
**Validates: Requirements 3.2**

Property 5: Coordinate extraction
*For any* parsed vendor data, the system should extract latitude and longitude coordinates for each vendor record
**Validates: Requirements 3.3**

Property 6: Pin click displays vendor data
*For any* vendor pin clicked by the customer, the system should display the complete vendor data associated with that pin
**Validates: Requirements 4.1**

Property 7: Vendor data completeness
*For any* vendor data displayed, all required fields (name, address, phone, inventory) should be present and visible to the customer
**Validates: Requirements 4.2, 4.3**

Property 8: Sequential pin click updates
*For any* sequence of vendor pin clicks, the displayed vendor data should always match the most recently clicked vendor
**Validates: Requirements 4.5**

## Error Handling

### Frontend Error Scenarios

1. **Geolocation Denied**: If customer denies location permission, center map on default coordinates (e.g., New York City: 40.7128, -74.0060)
2. **API Request Failure**: Display error message "Unable to load vendors. Please try again later."
3. **Empty Vendor List**: Display message "No vendors found in this area"
4. **Invalid Vendor Coordinates**: Skip vendors with missing or invalid lat/long values
5. **Network Timeout**: Show retry button after 10-second timeout

### Backend Error Scenarios

1. **Exception in Lambda**: Return 500 status with error message
2. **Malformed Request**: Return 400 status with validation error (minimal for MVP)

## Testing Strategy

### Unit Testing

We will use **Jest** and **React Testing Library** for frontend unit tests, and **pytest** for backend unit tests.

**Frontend Unit Tests** (`frontend/src/app/tree-vendors/page.test.tsx`):
- Map component renders successfully
- Geolocation API is called on mount (example test for 2.1)
- Vendor API is called on mount (example test for 3.1)
- Loading indicator displays during data fetch (example test for 3.5)
- Appropriate zoom level is set when location obtained (example test for 2.3)
- Clicking outside vendor info panel closes it (example test for 4.4)
- Loading state displays on initial render (example test for 5.1)

**Backend Unit Tests** (`backend/functions/tree-vendors/test_get.py`):
- Successful request returns 200 status
- Response contains hardcoded vendor data
- Response format matches expected schema
- All vendors have required fields

### Property-Based Testing

We will use **Hypothesis** for Python property-based tests. Each property-based test will run a minimum of 100 iterations.

**Property-Based Tests** (`backend/functions/tree-vendors/test_properties.py`):

Each test must be tagged with the format: `**Feature: tree-vendor-map, Property {number}: {property_text}**`

1. **Property 1**: Test that for any list of vendors with valid coordinates, all vendors are included in the response
   - Tag: `**Feature: tree-vendor-map, Property 1: Vendor pin rendering completeness**`

2. **Property 4**: Test that for any valid vendor data structure, parsing succeeds without exceptions
   - Tag: `**Feature: tree-vendor-map, Property 4: Vendor data parsing**`

3. **Property 5**: Test that for any vendor record with lat/long fields, coordinates are successfully extracted
   - Tag: `**Feature: tree-vendor-map, Property 5: Coordinate extraction**`

**Frontend Property-Based Tests** (if time permits):
- Property 2, 3, 6, 7, 8 would require more complex UI testing setup and may be deferred for hackathon speed

### Integration Testing

- End-to-end test: Load map page, verify vendors display, click pin, verify info panel shows
- API integration: Test Lambda function returns hardcoded data correctly

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Leaflet** (react-leaflet) for map rendering
- **Tailwind CSS** for styling
- **Next.js** for routing and SSR

### Backend
- **Python 3.13** Lambda function
- **AWS Lambda** runtime
- **Hardcoded data** (no database for MVP)

### Infrastructure
- **API Gateway** (HTTP API) for REST endpoint
- **SAM** for infrastructure as code

### External Dependencies
- **Leaflet.js** - Open-source map library
- **OpenStreetMap** - Map tile provider (free)

## Implementation Notes

### Map Library Choice

Leaflet was chosen over Google Maps because:
- Free and open-source (no API key required)
- Lightweight and fast
- Excellent React integration via react-leaflet
- Perfect for hackathon speed

### Default Location

If geolocation fails, default to New York City coordinates (40.7128, -74.0060) with zoom level 12.

### Vendor Pin Styling

Use custom tree icon for vendor pins to make them visually distinct and thematic.

### Performance Considerations

- Fetch all vendors on initial load (acceptable for hackathon with limited data)
- No pagination needed for MVP
- Client-side filtering if needed in future

## Future Enhancements (Out of Scope for MVP)

- Search/filter vendors by tree type
- Directions to vendor location
- Vendor ratings and reviews
- Real-time inventory updates
- Clustering for dense vendor areas
