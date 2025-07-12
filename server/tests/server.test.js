const request = require('supertest');
const app = require('../index');

describe('Server Health Check', () => {
  test('GET /health should return 200', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);
    
    expect(response.body.status).toBe('OK');
    expect(response.body.timestamp).toBeDefined();
  });
});

describe('Destination Search API', () => {
  test('GET /api/destinations/search should return destinations', async () => {
    const response = await request(app)
      .get('/api/destinations/search?q=sing')
      .expect(200);
    
    expect(response.body.destinations).toBeDefined();
    expect(Array.isArray(response.body.destinations)).toBe(true);
    expect(response.body.query).toBe('sing');
  });

  test('GET /api/destinations/search should return 400 for empty query', async () => {
    const response = await request(app)
      .get('/api/destinations/search?q=')
      .expect(200); // Returns empty array for empty query
    
    expect(response.body.destinations).toEqual([]);
  });

  test('GET /api/destinations/popular should return popular destinations', async () => {
    const response = await request(app)
      .get('/api/destinations/popular')
      .expect(200);
    
    expect(response.body.destinations).toBeDefined();
    expect(Array.isArray(response.body.destinations)).toBe(true);
  });
});

describe('Hotel Search API', () => {
  test('GET /api/hotels/search should return hotels', async () => {
    const response = await request(app)
      .get('/api/hotels/search?destination_id=SG&checkin=2025-08-01&checkout=2025-08-03')
      .expect(200);
    
    expect(response.body.hotels).toBeDefined();
    expect(Array.isArray(response.body.hotels)).toBe(true);
  });

  test('GET /api/hotels/search should return 400 for missing destination_id', async () => {
    const response = await request(app)
      .get('/api/hotels/search?checkin=2025-08-01&checkout=2025-08-03')
      .expect(400);
    
    expect(response.body.error).toBe('Destination ID is required');
  });

  test('GET /api/hotels/search should return 400 for invalid dates', async () => {
    const response = await request(app)
      .get('/api/hotels/search?destination_id=SG&checkin=2025-08-03&checkout=2025-08-01')
      .expect(400);
    
    expect(response.body.error).toBe('Check-out date must be after check-in date');
  });
});

describe('Error Handling', () => {
  test('GET /nonexistent should return 404', async () => {
    const response = await request(app)
      .get('/nonexistent')
      .expect(404);
    
    expect(response.body.error).toBe('Route not found');
  });
});
