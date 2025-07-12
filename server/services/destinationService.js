const Fuse = require('fuse.js');
const fs = require('fs');
const path = require('path');

// Load destinations data from JSON file
const destinationsPath = path.join(__dirname, '..', 'data', 'destinations.json');
const destinations = JSON.parse(fs.readFileSync(destinationsPath, 'utf-8'));

// Fuse.js configuration for fuzzy search
const fuseOptions = {
  keys: [
    { name: 'term', weight: 0.6 },
    { name: 'name', weight: 0.3 },
    { name: 'country', weight: 0.1 }
  ],
  threshold: 0.3, // Lower = more strict matching
  distance: 100,
  includeScore: true,
  includeMatches: true,
  useExtendedSearch: true,
};

class DestinationService {
  constructor() {
    this.fuse = new Fuse(destinations, fuseOptions);
    this.destinations = destinations;
  }

  async searchDestinations(query, limit = 10) {
    try {
      // Use Fuse.js for fuzzy search
      const results = this.fuse.search(query, { limit });
      
      // If fuzzy search doesn't return enough results, try exact matches
      if (results.length < limit) {
        const exactMatches = this.destinations.filter(dest => 
          dest.name.toLowerCase().includes(query.toLowerCase()) ||
          dest.country.toLowerCase().includes(query.toLowerCase()) ||
          dest.term.toLowerCase().includes(query.toLowerCase())
        ).slice(0, limit - results.length);
        
        // Add exact matches that aren't already in fuzzy results
        const fuzzyIds = new Set(results.map(r => r.item.uid));
        exactMatches.forEach(match => {
          if (!fuzzyIds.has(match.uid)) {
            results.push({ item: match, score: 0 });
          }
        });
      }

      // Sort by score (lower is better) and popularity
      return results
        .sort((a, b) => {
          if (a.score !== b.score) {
            return a.score - b.score;
          }
          return b.item.popularity - a.item.popularity;
        })
        .slice(0, limit)
        .map(result => ({
          ...result.item,
          relevanceScore: result.score
        }));
    } catch (error) {
      console.error('Error searching destinations:', error);
      throw new Error('Failed to search destinations');
    }
  }

  async getPopularDestinations(limit = 20) {
    try {
      return this.destinations
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting popular destinations:', error);
      throw new Error('Failed to get popular destinations');
    }
  }

  async getDestinationById(id) {
    try {
      return this.destinations.find(dest => dest.uid === id) || null;
    } catch (error) {
      console.error('Error getting destination by ID:', error);
      throw new Error('Failed to get destination');
    }
  }

  // Method to integrate with external APIs (implement as needed)
  async fetchFromExternalAPI(query) {
    try {
      // Example API integration - replace with actual API calls
      // const response = await axios.get(`${process.env.DESTINATION_API_URL}/search`, {
      //   params: { q: query },
      //   headers: { 'Authorization': `Bearer ${process.env.API_KEY}` }
      // });
      // return response.data;
      
      // For now, return empty array as we're using mock data
      return [];
    } catch (error) {
      console.error('External API error:', error);
      return [];
    }
  }
}

module.exports = new DestinationService();
