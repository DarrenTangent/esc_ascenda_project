// // server/routes/destinations.js
// const express = require('express');
// const router = express.Router();
// const destinationService = require('../services/destinationService');
// const { validatePagination } = require('../middleware/validation');

// // GET /api/destinations/search
// router.get('/search', validatePagination, async (req, res) => {
//   try {
//     const { q, limit = 10 } = req.query;

//     if (!q || q.trim().length < 2) {
//       return res.json({ destinations: [], count: 0, query: q || '' });
//     }

//     const destinations = await destinationService.searchDestinations(q.trim(), parseInt(limit, 10));
//     res.json({ destinations, count: destinations.length, query: q });
//   } catch (error) {
//     console.error('Destination search error:', error);
//     res.status(500).json({ error: 'Failed to search destinations', message: error.message });
//   }
// });

// // GET /api/destinations/popular
// router.get('/popular', validatePagination, async (req, res) => {
//   try {
//     const { limit = 20 } = req.query;
//     const destinations = await destinationService.getPopularDestinations(parseInt(limit, 10));
//     res.json({ destinations, count: destinations.length });
//   } catch (error) {
//     console.error('Popular destinations error:', error);
//     res.status(500).json({ error: 'Failed to get popular destinations', message: error.message });
//   }
// });

// // GET /api/destinations/:id
// router.get('/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const destination = await destinationService.getDestinationById(id);
//     if (!destination) return res.status(404).json({ error: 'Destination not found' });
//     res.json({ destination });
//   } catch (error) {
//     console.error('Get destination error:', error);
//     res.status(500).json({ error: 'Failed to get destination', message: error.message });
//   }
// });

// module.exports = router;




const express = require('express');
const router = express.Router();
const Fuse = require('fuse.js');
const destinationService = require('../services/destinationService');
const { validateDestinationSearch, validatePagination } = require('../middleware/validation');

// GET /api/destinations/search
// Query params: q (search query), limit (optional, default 10)
router.get('/search', validatePagination, async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.json({ destinations: [] });
    }

    const destinations = await destinationService.searchDestinations(q.trim(), parseInt(limit));
    
    res.json({
      destinations,
      count: destinations.length,
      query: q
    });
  } catch (error) {
    console.error('Destination search error:', error);
    res.status(500).json({ 
      error: 'Failed to search destinations',
      message: error.message 
    });
  }
});

// GET /api/destinations/popular
// Get popular destinations
router.get('/popular', validatePagination, async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const destinations = await destinationService.getPopularDestinations(parseInt(limit));
    
    res.json({
      destinations,
      count: destinations.length
    });
  } catch (error) {
    console.error('Popular destinations error:', error);
    res.status(500).json({ 
      error: 'Failed to get popular destinations',
      message: error.message 
    });
  }
});

// GET /api/destinations/:id
// Get destination details by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const destination = await destinationService.getDestinationById(id);
    
    if (!destination) {
      return res.status(404).json({ error: 'Destination not found' });
    }
    
    res.json({ destination });
  } catch (error) {
    console.error('Get destination error:', error);
    res.status(500).json({ 
      error: 'Failed to get destination',
      message: error.message 
    });
  }
});

module.exports = router;
