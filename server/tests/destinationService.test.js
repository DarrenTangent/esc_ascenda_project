const destinationService = require('../services/destinationService');
const fs = require('fs');
const path = require('path');

// Mock data for testing
const mockDestinations = [
  {
    "term": "Singapore",
    "uid": "SG001",
    "lat": 1.290270,
    "lng": 103.851959,
    "type": "city",
    "state": "Singapore",
    "country": "Singapore"
  },
  {
    "term": "Singapore Changi Airport",
    "uid": "SG002", 
    "lat": 1.364917,
    "lng": 103.991531,
    "type": "airport",
    "state": "Singapore",
    "country": "Singapore"
  },
  {
    "term": "Paris, France",
    "uid": "FR001",
    "lat": 48.856667,
    "lng": 2.350987,
    "type": "city",
    "state": "Ile-de-France",
    "country": "France"
  },
  {
    "term": "London, England, United Kingdom",
    "uid": "UK001",
    "lat": 51.5082616708,
    "lng": -0.128059387207,
    "type": "city",
    "state": "England",
    "country": "United Kingdom"
  },
  {
    "term": "New York, United States",
    "uid": "US001",
    "lat": 40.7589,
    "lng": -73.9851,
    "type": "city",
    "state": "New York",
    "country": "United States"
  }
];

describe('DestinationService Unit Tests', () => {
  let originalDestinations;
  let originalFuse;

  beforeAll(() => {
    // Store original references
    originalDestinations = destinationService.destinations;
    originalFuse = destinationService.fuse;
  });

  beforeEach(() => {
    // Mock the destinations data for consistent testing
    destinationService.destinations = mockDestinations;
    
    // Recreate Fuse instance with mock data
    const Fuse = require('fuse.js');
    const fuseOptions = {
      keys: [
        { name: 'term', weight: 0.6 },
        { name: 'name', weight: 0.3 },
        { name: 'country', weight: 0.1 }
      ],
      threshold: 0.3,
      distance: 100,
      includeScore: true,
      includeMatches: true,
      useExtendedSearch: true,
    };
    destinationService.fuse = new Fuse(mockDestinations, fuseOptions);
  });

  afterAll(() => {
    // Restore original data
    destinationService.destinations = originalDestinations;
    destinationService.fuse = originalFuse;
  });

  describe('searchDestinations method', () => {
    test('should return results for valid search query', async () => {
      const results = await destinationService.searchDestinations('Singapore');
      
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0]).toHaveProperty('uid');
      expect(results[0]).toHaveProperty('term');
      expect(results[0]).toHaveProperty('relevanceScore');
    });

    test('should return empty array for non-existent destination', async () => {
      const results = await destinationService.searchDestinations('Atlantis');
      
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });

    test('should respect the limit parameter', async () => {
      const limit = 2;
      const results = await destinationService.searchDestinations('Singapore', limit);
      
      expect(results.length).toBeLessThanOrEqual(limit);
    });

    test('should handle case-insensitive search', async () => {
      const resultsLower = await destinationService.searchDestinations('singapore');
      const resultsUpper = await destinationService.searchDestinations('SINGAPORE');
      const resultsMixed = await destinationService.searchDestinations('SiNgApOrE');
      
      expect(resultsLower.length).toBeGreaterThan(0);
      expect(resultsUpper.length).toBeGreaterThan(0);
      expect(resultsMixed.length).toBeGreaterThan(0);
      
      // Should return similar results regardless of case
      expect(resultsLower[0].uid).toBe(resultsUpper[0].uid);
      expect(resultsLower[0].uid).toBe(resultsMixed[0].uid);
    });

    test('should handle partial matches', async () => {
      const results = await destinationService.searchDestinations('Sing');
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.term.toLowerCase().includes('sing'))).toBe(true);
    });

    test('should sort results by relevance score', async () => {
      const results = await destinationService.searchDestinations('Singapore');
      
      if (results.length > 1) {
        for (let i = 1; i < results.length; i++) {
          expect(results[i-1].relevanceScore).toBeLessThanOrEqual(results[i].relevanceScore);
        }
      }
    });

    test('should return unique results based on uid', async () => {
      const results = await destinationService.searchDestinations('Singapore');
      
      const uids = results.map(r => r.uid);
      const uniqueUids = [...new Set(uids)];
      
      expect(uids.length).toBe(uniqueUids.length);
    });

    test('should handle empty query string', async () => {
      const results = await destinationService.searchDestinations('');
      
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });

    test('should handle special characters in query', async () => {
      const results = await destinationService.searchDestinations('Paris, France');
      
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
    });

    test('should handle very long query strings', async () => {
      const longQuery = 'a'.repeat(1000);
      const results = await destinationService.searchDestinations(longQuery);
      
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });

    test('should handle numeric queries', async () => {
      const results = await destinationService.searchDestinations('123456');
      
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });

    test('should throw error when internal search fails', async () => {
      // Mock fuse.search to throw an error
      const originalSearch = destinationService.fuse.search;
      destinationService.fuse.search = jest.fn(() => {
        throw new Error('Fuse search failed');
      });

      await expect(destinationService.searchDestinations('Singapore'))
        .rejects
        .toThrow('Failed to search destinations');

      // Restore original method
      destinationService.fuse.search = originalSearch;
    });
  });

  describe('getDestinationById method', () => {
    test('should return destination for valid uid', async () => {
      const destination = await destinationService.getDestinationById('SG001');
      
      expect(destination).toBeDefined();
      expect(destination.uid).toBe('SG001');
      expect(destination.term).toBe('Singapore');
    });

    test('should return null for non-existent uid', async () => {
      const destination = await destinationService.getDestinationById('INVALID');
      
      expect(destination).toBeNull();
    });

    test('should handle empty uid', async () => {
      const destination = await destinationService.getDestinationById('');
      
      expect(destination).toBeNull();
    });

    test('should handle null uid', async () => {
      const destination = await destinationService.getDestinationById(null);
      
      expect(destination).toBeNull();
    });

    test('should handle undefined uid', async () => {
      const destination = await destinationService.getDestinationById(undefined);
      
      expect(destination).toBeNull();
    });

    test('should throw error when internal search fails', async () => {
      // Mock destinations to throw an error
      const originalDestinations = destinationService.destinations;
      Object.defineProperty(destinationService, 'destinations', {
        get: () => {
          throw new Error('Destinations access failed');
        },
        configurable: true
      });

      await expect(destinationService.getDestinationById('SG001'))
        .rejects
        .toThrow('Failed to get destination');

      // Restore original property
      Object.defineProperty(destinationService, 'destinations', {
        value: originalDestinations,
        configurable: true,
        writable: true
      });
    });
  });

  describe('Service initialization', () => {
    test('should have fuse instance initialized', () => {
      expect(destinationService.fuse).toBeDefined();
      expect(typeof destinationService.fuse.search).toBe('function');
    });

    test('should have destinations data loaded', () => {
      expect(destinationService.destinations).toBeDefined();
      expect(Array.isArray(destinationService.destinations)).toBe(true);
    });
  });
});

describe('DestinationService Integration Tests', () => {
  describe('Real data tests', () => {
    test('should load actual destinations data', () => {
      expect(destinationService.destinations.length).toBeGreaterThan(0);
      
      // Check structure of first destination
      const firstDestination = destinationService.destinations[0];
      expect(firstDestination).toHaveProperty('uid');
      expect(firstDestination).toHaveProperty('term');
      expect(firstDestination).toHaveProperty('lat');
      expect(firstDestination).toHaveProperty('lng');
      expect(firstDestination).toHaveProperty('type');
    });

    test('should search actual destinations data', async () => {
      const results = await destinationService.searchDestinations('London');
      
      expect(results.length).toBeGreaterThan(0);
      expect(results[0]).toHaveProperty('uid');
      expect(results[0]).toHaveProperty('term');
      expect(results[0].term.toLowerCase()).toContain('london');
    });

    test('should find destinations by actual uid', async () => {
      // First, get a destination from search to ensure we have a valid uid
      const searchResults = await destinationService.searchDestinations('Paris');
      expect(searchResults.length).toBeGreaterThan(0);
      
      const firstResult = searchResults[0];
      const foundDestination = await destinationService.getDestinationById(firstResult.uid);
      
      expect(foundDestination).toBeDefined();
      expect(foundDestination.uid).toBe(firstResult.uid);
    });

    test('should handle common city searches', async () => {
      const commonCities = ['Singapore', 'Tokyo', 'New York', 'London', 'Paris'];
      
      for (const city of commonCities) {
        const results = await destinationService.searchDestinations(city);
        expect(results).toBeDefined();
        expect(Array.isArray(results)).toBe(true);
        
        if (results.length > 0) {
          expect(results[0]).toHaveProperty('uid');
          expect(results[0]).toHaveProperty('term');
        }
      }
    });

    test('should handle airport searches', async () => {
      const results = await destinationService.searchDestinations('airport');
      
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      
      // Check if any results are actually airports
      const airportResults = results.filter(r => 
        r.type === 'airport' || 
        r.term.toLowerCase().includes('airport')
      );
      
      expect(airportResults.length).toBeGreaterThan(0);
    });

    test('should maintain consistent response format', async () => {
      const results = await destinationService.searchDestinations('test');
      
      results.forEach(result => {
        expect(result).toHaveProperty('uid');
        expect(result).toHaveProperty('term');
        expect(result).toHaveProperty('lat');
        expect(result).toHaveProperty('lng');
        expect(result).toHaveProperty('type');
        expect(result).toHaveProperty('relevanceScore');
        
        expect(typeof result.uid).toBe('string');
        expect(typeof result.term).toBe('string');
        expect(typeof result.lat).toBe('number');
        expect(typeof result.lng).toBe('number');
        expect(typeof result.type).toBe('string');
        expect(typeof result.relevanceScore).toBe('number');
      });
    });
  });

  describe('Performance tests', () => {
    test('should handle search within reasonable time', async () => {
      const startTime = Date.now();
      await destinationService.searchDestinations('Singapore');
      const endTime = Date.now();
      
      const executionTime = endTime - startTime;
      expect(executionTime).toBeLessThan(3000); // Should complete within 3 seconds for large dataset
    });

    test('should handle multiple concurrent searches', async () => {
      const queries = ['Singapore', 'London', 'Paris', 'Tokyo', 'New York'];
      const promises = queries.map(query => 
        destinationService.searchDestinations(query)
      );
      
      const results = await Promise.all(promises);
      
      expect(results.length).toBe(queries.length);
      results.forEach(result => {
        expect(Array.isArray(result)).toBe(true);
      });
    });

    test('should handle large result sets efficiently', async () => {
      const startTime = Date.now();
      const results = await destinationService.searchDestinations('a', 100);
      const endTime = Date.now();
      
      const executionTime = endTime - startTime;
      expect(executionTime).toBeLessThan(2000); // Should complete within 2 seconds
      expect(results.length).toBeLessThanOrEqual(100);
    });
  });

  describe('Data integrity tests', () => {
    test('should have valid coordinate data', async () => {
      const results = await destinationService.searchDestinations('Singapore', 5);
      
      results.forEach(result => {
        expect(result.lat).toBeGreaterThanOrEqual(-90);
        expect(result.lat).toBeLessThanOrEqual(90);
        expect(result.lng).toBeGreaterThanOrEqual(-180);
        expect(result.lng).toBeLessThanOrEqual(180);
      });
    });

    test('should have valid uid format', async () => {
      const results = await destinationService.searchDestinations('London', 10);
      
      results.forEach(result => {
        expect(result.uid).toBeDefined();
        expect(result.uid.length).toBeGreaterThan(0);
        expect(typeof result.uid).toBe('string');
      });
    });

    test('should have consistent data types', async () => {
      const destination = await destinationService.getDestinationById(
        destinationService.destinations[0].uid
      );
      
      expect(typeof destination.uid).toBe('string');
      expect(typeof destination.term).toBe('string');
      expect(typeof destination.lat).toBe('number');
      expect(typeof destination.lng).toBe('number');
      expect(typeof destination.type).toBe('string');
    });
  });
});
