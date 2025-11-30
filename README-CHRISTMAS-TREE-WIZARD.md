# Christmas Tree Wizard

An interactive web application that helps users in Texas find and purchase the perfect Christmas tree through a personalized shopping experience.

## Features

- **Location-Based Search**: Filter trees by Texas delivery zones
- **Price Range Selection**: Set budget from $20-$500
- **Quality Ratings**: Filter by star ratings (1-5 stars)
- **Delivery Options**: Choose delivery requirements
- **Return Policies**: Select minimum return window (7-30 days)
- **Social Popularity**: Find trending trees on social media
- **Smart Matching**: Get match scores and perfect match indicators
- **Detailed Views**: See full specifications and vendor information

## Architecture

### Frontend (Next.js + React + TypeScript)
- Multi-step wizard interface
- Responsive design with Tailwind CSS
- Real-time validation
- Local storage for state persistence

### Backend (AWS Lambda + Python)
- **Tree Search API**: Filter and rank trees by criteria
- **Tree Detail API**: Get detailed tree information
- **Delivery Zones API**: Validate Texas locations

### Database (DynamoDB)
- Tree listings with full specifications
- Vendor information
- Delivery zone mappings

## Setup

### Prerequisites
- Node.js 18+
- Python 3.13
- AWS CLI configured
- SAM CLI installed

### Backend Deployment

1. Navigate to backend directory:
```bash
cd backend
```

2. Build and deploy:
```bash
sam build
sam deploy --guided
```

3. Seed the database:
```bash
export TABLE_NAME=<your-table-name>
python scripts/seed-trees.py
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local`:
```
NEXT_PUBLIC_API_URL=<your-api-gateway-url>
```

4. Run development server:
```bash
npm run dev
```

5. Open http://localhost:3000

## API Endpoints

### GET /trees/search
Search and filter trees by criteria.

**Query Parameters:**
- `deliveryZone`: Texas delivery zone
- `minPrice`: Minimum price
- `maxPrice`: Maximum price
- `minQuality`: Minimum quality rating
- `deliveryRequired`: Boolean for delivery requirement
- `minReturnDays`: Minimum return window
- `popularityLevel`: high | medium | low | any

**Response:**
```json
[
  {
    "tree": { ... },
    "score": 95,
    "matchDetails": {
      "priceMatch": true,
      "qualityMatch": true,
      "deliveryMatch": true,
      "returnMatch": true,
      "popularityMatch": true
    },
    "matchPercentage": 100
  }
]
```

### GET /trees/{treeId}
Get detailed information for a specific tree.

**Response:**
```json
{
  "id": "tree-001",
  "treeName": "Premium Fraser Fir",
  "vendorName": "Texas Tree Co",
  "price": 89,
  "qualityRating": 4.8,
  "deliveryZones": ["North Texas", "Central Texas"],
  ...
}
```

### GET /delivery-zones
Get all Texas delivery zones or validate a location.

**Query Parameters (optional):**
- `location`: City name or zip code to validate

**Response:**
```json
{
  "zones": ["North Texas", "Central Texas", "South Texas", "West Texas"],
  "details": { ... }
}
```

## Texas Delivery Zones

- **North Texas**: Dallas, Fort Worth, Plano, etc.
- **Central Texas**: Austin, San Antonio, Waco, etc.
- **South Texas**: Houston, Corpus Christi, etc.
- **West Texas**: El Paso, Lubbock, Amarillo, etc.

## Development

### Project Structure
```
.
├── backend/
│   ├── functions/
│   │   ├── tree-search/
│   │   ├── tree-detail/
│   │   └── delivery-zones/
│   ├── shared/
│   │   └── delivery_zones.py
│   ├── scripts/
│   │   └── seed-trees.py
│   └── template.yaml
├── frontend/
│   └── src/
│       ├── app/
│       ├── components/
│       │   ├── wizard/
│       │   └── ui/
│       ├── types/
│       └── utils/
```

### Adding New Trees

Edit `backend/scripts/seed-trees.py` and add tree objects to the `trees` array, then run the seed script.

### Customizing Delivery Zones

Edit `backend/shared/delivery_zones.py` to add or modify Texas delivery zones and their associated cities/zip codes.

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: AWS Lambda (Python 3.13), API Gateway
- **Database**: DynamoDB
- **Infrastructure**: AWS SAM
- **Deployment**: AWS CloudFormation

## License

MIT
