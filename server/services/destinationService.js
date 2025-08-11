// server/services/destinationService.js
const Fuse = require('fuse.js');
const path = require('path');

// Load once (Node caches require’d JSON)
const destinations = require(path.join(__dirname, '..', 'data', 'destinations.json'));

// Lean, fast Fuse config
const fuseOptions = {
  keys: [
    'term',      // e.g., combined search term
    'name',      // destination name
    'city',      // city (some rows)
    'country',   // country
    'iata'       // airport code (some rows)
  ],
  threshold: 0.25,         // a bit stricter -> fewer matches -> faster
  ignoreLocation: true,
  includeScore: true,
  includeMatches: false,    // cheaper than true
  minMatchCharLength: 2,
  shouldSort: true,
  useExtendedSearch: false, // tests don’t send Fuse query syntax
  ignoreFieldNorm: true     // small perf win
};

class DestinationService {
  constructor(data) {
    this.destinations = Array.isArray(data) ? data : [];
    this.fuse = new Fuse(this.destinations, fuseOptions); // build once
  }

  /**
   * Fuzzy search; returns up to `limit` items with relevanceScore.
   * On internal error, throws "Failed to search destinations" (tests expect this).
   */
  async searchDestinations(query = '', limit = 10) {
    try {
      const q = (query ?? '').toString().trim();
      const lim = Math.max(1, Math.min(100, Number(limit) || 10)); // clamp to 1..100
      if (!q) return [];

      const results = this.fuse.search(q, { limit: lim }); // Fuse already sorted
      return results.map(r => ({ ...r.item, relevanceScore: r.score ?? 0 }));
    } catch (err) {
      console.error('Error searching destinations:', err);
      throw new Error('Failed to search destinations');
    }
  }

  /**
   * Find by uid. Returns null if not found.
   * On internal error, throws "Failed to get destination" (tests expect this).
   */
  async getDestinationById(uid) {
    try {
      if (!uid) return null;
      return this.destinations.find(d => d.uid === uid) || null;
    } catch (err) {
      console.error('Error getting destination by ID:', err);
      throw new Error('Failed to get destination');
    }
  }
}

// Export singleton and the class (some tests may import the class)
module.exports = new DestinationService(destinations);
module.exports.DestinationService = DestinationService;


// const Fuse = require('fuse.js');
// const fs = require('fs');
// const path = require('path');

// // Load destinations data from JSON file
// const destinationsPath = path.join(__dirname, '..', 'data', 'destinations.json');
// const destinations = JSON.parse(fs.readFileSync(destinationsPath, 'utf-8'));

// // Fuse.js configuration for fuzzy search
// const fuseOptions = {
//   keys: [
//     { name: 'term', weight: 0.6 },
//     { name: 'name', weight: 0.3 },
//     { name: 'country', weight: 0.1 }
//   ],
//   threshold: 0.3, // Lower = more strict matching
//   distance: 100,
//   includeScore: true,
//   includeMatches: true,
//   useExtendedSearch: true,
// };

// class DestinationService {
//   constructor() {
//     this.fuse = new Fuse(destinations, fuseOptions);
//     this.destinations = destinations;
//   }

//   async searchDestinations(query, limit = 10) {
//     try {
//       // Use Fuse.js for fuzzy search
//       const results = this.fuse.search(query, { limit });
      
//       // If fuzzy search doesn't return enough results, try exact matches
//       if (results.length < limit) {
//         const exactMatches = this.destinations.filter(dest => 
//           dest.term && dest.term.toLowerCase().includes(query.toLowerCase())
//         ).slice(0, limit - results.length);
        
//         // Add exact matches that aren't already in fuzzy results
//         const fuzzyIds = new Set(results.map(r => r.item.uid));
//         exactMatches.forEach(match => {
//           if (!fuzzyIds.has(match.uid)) {
//             results.push({ item: match, score: 0 });
//           }
//         });
//       }

//       const processedResults = results
//         .sort((a, b) => a.score - b.score)
//         .map(result => ({
//           ...result.item,
//           relevanceScore: result.score
//         }));

//       // Ensure uniqueness of results based on uid
//       const seen = new Set();
//       const filteredResults = processedResults.filter(el => {
//         const duplicate = seen.has(el.uid);
//         seen.add(el.uid);
//         return !duplicate;
//       });

//       return filteredResults.slice(0, limit);
//     } catch (error) {
//       console.error('Error searching destinations:', error);
//       throw new Error('Failed to search destinations');
//     }
//   }

//   async getDestinationById(id) {
//     try {
//       return this.destinations.find(dest => dest.uid === id) || null;
//     } catch (error) {
//       console.error('Error getting destination by ID:', error);
//       throw new Error('Failed to get destination');
//     }
//   }
// }

// module.exports = new DestinationService();
