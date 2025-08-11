# Ascenda Hotel Search API Integration

This server implements a comprehensive integration with Ascenda's hotel search APIs, providing a performant destination and hotel search service.

## Features

- **Polling-based price search** with automatic retries
- **Comprehensive hotel data** combining pricing and static information
- **Advanced caching** to improve performance and reduce API calls
- **Robust error handling** with fallback to local data
- **Validation middleware** ensuring API requirements are met
- **Flexible guest/room configuration** supporting multiple room bookings

## API Endpoints

### 1. Hotel Search
**GET** `/api/hotels/search`

Search for hotels in a destination with pricing information.

**Query Parameters:**
- `destination_id` (required) - Destination ID from destinations search
- `checkin` (required) - Check-in date in YYYY-MM-DD format (min 3 days in advance)
- `checkout` (required) - Check-out date in YYYY-MM-DD format
- `guests` (optional) - Number of guests per room (default: 2)
- `lang` (optional) - Language code (default: en_US)
- `currency` (optional) - Currency code (default: SGD)
- `country_code` (optional) - Country code (default: SG)
- `page` (optional) - Page number for pagination (default: 1)
- `pageSize` (optional) - Number of results per page (default: 30)
- `minCost` (optional) - Minimum price filter
- `maxCost` (optional) - Maximum price filter

**Example:**
```bash
GET /api/hotels/search?destination_id=RsBU&checkin=2025-10-01&checkout=2025-10-07&guests=2
```

**Response:**
```json
{
  "page": 1,
  "pageSize": 30,
  "totalPages": 5,
  "totalHotels": 142,
  "hotels": [
    {
      "id": "jOZC",
      "searchRank": 1,
      "price": 285.50,
      "marketRates": [...],
      "freeCancellation": true,
      "roomsAvailable": 5,
      "name": "Marina Bay Sands",
      "latitude": 1.2834,
      "longitude": 103.8607,
      "address": "10 Bayfront Avenue",
      "rating": 5,
      "categories": ["Luxury"],
      "description": "Iconic luxury resort...",
      "amenities": ["Pool", "Spa", "WiFi"],
      "imageDetails": {...},
      "imageUrl": "https://example.com/hotel-image.jpg"
    }
  ]
}
```

### 2. Hotel Details
**GET** `/api/hotels/:id`

Get static information for a specific hotel.

**Parameters:**
- `id` (required) - Hotel ID

**Example:**
```bash
GET /api/hotels/jOZC
```

### 3. Hotel Pricing
**GET** `/api/hotels/:id/price`

Get detailed pricing information for a specific hotel.

**Parameters:**
- `id` (required) - Hotel ID

**Query Parameters:**
- Same as hotel search endpoint

**Example:**
```bash
GET /api/hotels/jOZC/price?destination_id=RsBU&checkin=2025-10-01&checkout=2025-10-07&guests=2
```

**Response:**
```json
{
  "rooms": [
    {
      "key": "booking_key_123",
      "roomNormalizedDescription": "Deluxe Room",
      "freeCancellation": true,
      "description": "Spacious deluxe room with city view",
      "longDescription": "...",
      "images": [...],
      "amenities": [...],
      "price": 285.50,
      "marketRates": [...]
    }
  ]
}
```

### 4. Destination Search
**GET** `/api/destinations/search`

Search for destinations by name.

**Query Parameters:**
- `q` (required) - Search query (min 2 characters)

**Example:**
```bash
GET /api/destinations/search?q=singapore
```

## Multiple Rooms Support

The API supports multiple rooms using pipe-separated guest counts:

- Single room, 2 guests: `guests=2`
- 2 rooms, 2 guests each: `guests=2|2`
- 3 rooms, varying guests: `guests=2|3|2`

## Error Handling

The API includes comprehensive error handling:

- **Validation Errors** (400) - Invalid parameters or missing required fields
- **Not Found Errors** (404) - Hotel or destination not found
- **Server Errors** (500) - API failures with fallback to cached/local data

## Caching Strategy

- **Price data**: Cached for 10 minutes
- **Hotel details**: Cached for 10 minutes
- **Destinations**: Cached indefinitely (static data)

## Rate Limiting

- 100 requests per IP per 15 minutes on API endpoints
- Automatic retry mechanism for Ascenda API calls (up to 10 retries)

## Configuration

### Environment Variables

```bash
PORT=5001
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

### Ascenda API Configuration

The integration uses the following fixed parameters for Ascenda API compatibility:
- `partner_id`: 1089
- `landing_page`: wl-acme-earn
- `product_type`: earn

## Testing

Run the comprehensive API test suite:

```bash
# Start the server first
npm run dev

# In another terminal, run the test suite
node examples/ascenda-api-test.js
```

The test suite includes:
- Direct Ascenda API endpoint testing
- Server API endpoint testing
- Error handling and validation testing

## Local Development

### Start the server:
```bash
npm run dev
```

### Test individual endpoints:
```bash
# Test hotel search
curl "http://localhost:5001/api/hotels/search?destination_id=RsBU&checkin=2025-10-01&checkout=2025-10-07&guests=2"

# Test destination search
curl "http://localhost:5001/api/destinations/search?q=singapore"
```

## Performance Features

1. **Concurrent API calls** - Price and detail data fetched in parallel
2. **Intelligent caching** - Reduces duplicate API calls
3. **Fallback data** - Uses local data when APIs are unavailable
4. **Pagination** - Efficient handling of large result sets
5. **Request timeout handling** - Prevents hanging requests

## API Requirements Compliance

✅ **3-day advance booking** - Enforced in validation  
✅ **Polling mechanism** - Retries until `completed: true`  
✅ **Required parameters** - All Ascenda requirements included  
✅ **Guest formatting** - Supports single/multiple rooms  
✅ **Error fallbacks** - Graceful degradation  

## Next Steps

1. **Authentication** - Add API key management for production
2. **Monitoring** - Add logging and metrics for API performance
3. **Load balancing** - Scale for high-traffic scenarios
4. **Database integration** - Store search history and user preferences
