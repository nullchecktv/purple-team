# Christmas Tree Admin Panel

A full-stack serverless application for managing Christmas tree inventory across multiple store locations.

## Features

- ✅ Create new Christmas tree entries with full details
- ✅ View all trees in inventory with filtering by store location
- ✅ Update existing tree information
- ✅ Delete trees from inventory with confirmation
- ✅ Polished UI with loading states, animations, and error handling
- ✅ Responsive design for all screen sizes

## Architecture

### Backend
- **AWS Lambda** (Node.js 22.x) - 4 functions for CRUD operations
- **API Gateway** (HTTP API) - RESTful endpoints
- **DynamoDB** - Single table design for data persistence

### Frontend
- **Next.js 14** - React framework with TypeScript
- **Tailwind CSS** - Utility-first styling
- **Smooth animations** - Fade-in effects and transitions

## API Endpoints

- `POST /trees` - Create a new tree
- `GET /trees` - List all trees (optional `?storeLocation` filter)
- `PUT /trees/{treeId}` - Update a tree
- `DELETE /trees/{treeId}` - Delete a tree

## Data Model

```typescript
interface ChristmasTree {
  id: string;              // UUID
  species: string;         // e.g., "Fraser Fir"
  height: number;          // Height in feet
  price: number;           // Price in dollars
  condition: string;       // "Excellent", "Good", or "Fair"
  description: string;     // Detailed description
  storeLocation: string;   // Store identifier
  createdAt: string;       // ISO 8601 timestamp
  updatedAt: string;       // ISO 8601 timestamp
}
```

## Deployment

### Backend
```bash
cd backend
sam build
sam deploy --guided
```

### Frontend
1. Set the API URL in `.env.local`:
   ```
   NEXT_PUBLIC_API_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com
   ```

2. Run locally:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. Deploy to production:
   ```bash
   npm run build
   # Deploy to your hosting platform
   ```

## Usage

1. Navigate to `/trees` in your browser
2. Click "Add New Tree" to create a tree
3. Fill in the form with tree details
4. View all trees in the grid layout
5. Use the store location filter to view trees by location
6. Click "Edit" to update a tree
7. Click "Delete" to remove a tree (with confirmation)

## Development Notes

- All Lambda functions use Node.js 22.x with ES modules
- DynamoDB uses single table design with `pk=TREE#{id}` and `sk=METADATA`
- Frontend components follow Tailwind theme colors for consistency
- All async operations show loading states
- Form validation happens both client-side and server-side

## Testing

Optional property-based tests are available in the tasks list but marked as optional for faster MVP delivery.

## Future Enhancements

- Authentication and authorization
- Image upload for trees
- Inventory tracking (quantity available)
- Sales history
- Multi-language support
- Export to CSV/PDF
