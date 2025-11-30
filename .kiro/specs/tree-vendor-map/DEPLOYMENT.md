# Tree Vendor Map - Deployment Guide

## Backend Deployment

1. Navigate to backend directory:
```bash
cd backend
```

2. Build and deploy with SAM:
```bash
sam build
sam deploy
```

3. Note the API URL from the outputs

## Frontend Configuration

1. Update `frontend/.env.local` with your API URL:
```
NEXT_PUBLIC_API_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com
```

2. The API URL is already configured in the current `.env.local` file

## Testing

1. Start the frontend development server:
```bash
cd frontend
npm run dev
```

2. Navigate to http://localhost:3000/tree-vendors

3. Allow location permissions when prompted

4. Verify:
   - Map loads with your location
   - Vendor pins appear on the map
   - Clicking a tree pin shows vendor details
   - All vendor information displays correctly

## Features Implemented

✅ Backend Lambda function with hardcoded vendor data
✅ GET /tree-vendors API endpoint
✅ Interactive Leaflet map
✅ Geolocation support with fallback
✅ Custom tree icons for vendors
✅ Vendor info popups with full details
✅ Loading and error states
✅ Responsive design
✅ Navigation link in header

## API Response Format

```json
{
  "vendors": [
    {
      "id": "vendor-1",
      "name": "Pine Tree Farm",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "address": "123 Tree Lane, New York, NY 10001",
      "phone": "555-0123",
      "inventory": "Fraser Fir, Douglas Fir, Blue Spruce",
      "priceRange": "$40-$120"
    }
  ]
}
```

## Troubleshooting

- **Map not loading**: Ensure Leaflet CSS is imported and component is client-side only
- **No vendors showing**: Check API URL in `.env.local` and verify backend is deployed
- **Location not working**: Browser may block geolocation - map will default