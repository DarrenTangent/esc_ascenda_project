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
          dest.term && dest.term.toLowerCase().includes(query.toLowerCase())
        ).slice(0, limit - results.length);
        
        // Add exact matches that aren't already in fuzzy results
        const fuzzyIds = new Set(results.map(r => r.item.uid));
        exactMatches.forEach(match => {
          if (!fuzzyIds.has(match.uid)) {
            results.push({ item: match, score: 0 });
          }
        });
      }

      const processedResults = results
        .sort((a, b) => a.score - b.score)
        .map(result => ({
          ...result.item,
          relevanceScore: result.score
        }));

      // Ensure uniqueness of results based on uid
      const seen = new Set();
      const filteredResults = processedResults.filter(el => {
        const duplicate = seen.has(el.uid);
        seen.add(el.uid);
        return !duplicate;
      });

      return filteredResults.slice(0, limit);
    } catch (error) {
      console.error('Error searching destinations:', error);
      throw new Error('Failed to search destinations');
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
}

module.exports = new DestinationService();
