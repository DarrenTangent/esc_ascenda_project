# ESC Ascenda Project - Server

This is the backend server for the ESC Ascenda project, handling destination search and hotel booking functionality.

## Features

- **Fast Destination Search**: Text-based autocomplete with fuzzy search capabilities
- **Hotel Search**: Search for hotels based on destination, dates, guests, and rooms
- **Input Validation**: Comprehensive validation for all API endpoints
- **Rate Limiting**: Protection against excessive API calls
- **CORS Support**: Configured for frontend integration
- **Error Handling**: Centralized error handling with proper HTTP status codes

## API Endpoints

### Destinations

#### GET /api/destinations/search
Search for destinations with autocomplete functionality.

**Query Parameters:**
- `q` (required): Search query (minimum 2 characters)
- `limit` (optional): Number of results to return (default: 10, max: 100)

**Example:**
```
GET /api/destinations/search?q=sing&limit=5
```

**Response:**
```json
{
  "destinations": [
    {
      "uid": "WG9E",
      "term": "Singapore",
      "relevanceScore": 0.1
    }
  ],
  "count": 1,
  "query": "sing"
}
```

#### GET /api/destinations/:id
Get destination details by ID.


### Health Check

#### GET /health
Server health check endpoint.

## Installation

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
cp .env.example .env
```

4. Update the `.env` file with your API keys and configuration.

## Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

The server will run on port 5000 by default (or the port specified in the PORT environment variable).

## Environment Variables

Create a `.env` file in the server directory with the following variables:

```
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

# API Keys (add your actual API keys)
ASCENDA_API_KEY=hotelapi.loyalty.dev

```

## Project Structure

```
server/
├── index.js                 # Main server file
├── package.json             # Dependencies and scripts
├── .env                     # Environment variables
├── routes/                  # API route handlers
│   ├── destinations.js      # Destination search routes
│   └── hotels.js           # Hotel search routes
├── services/               # Business logic
│   ├── destinationService.js # Destination search logic
│   └── hotelService.js     # Hotel search logic
├── middleware/             # Custom middleware
│   └── validation.js       # Input validation
└── utils/                  # Utility functions
    └── helpers.js          # Helper functions
```

## Features & Technologies

- **Express.js**: Web framework
- **Fuse.js**: Fuzzy search for destination autocomplete
- **Helmet**: Security middleware
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: API rate limiting
- **Compression**: Response compression
- **Input Validation**: Comprehensive request validation

## Integration with External APIs

The server is designed to integrate with external APIs like Ascenda's hotel booking API. Currently using mock data, but the structure is in place to easily integrate real APIs by updating the service files.

## Testing

Run tests with:
```bash
npm test
```

## Contributing

1. Follow the existing code structure
2. Add proper error handling
3. Include input validation for new endpoints
4. Update this README for any new features
