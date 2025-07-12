const express = require('express');
const router = express.Router();
const hotelService = require('../services/hotelService');
const { validateHotelSearch, validatePagination } = require('../middleware/validation');

// GET /api/hotels/search
// Query params: destination_id, checkin, checkout, guests, rooms, limit
router.get('/search', validateHotelSearch, validatePagination, async (req, res) => {
  try {
    const { 
      destination_id, 
      checkin, 
      checkout, 
      guests = 2, 
      rooms = 1, 
      limit = 20 
    } = req.query;
    
    // Validate required parameters
    if (!destination_id) {
      return res.status(400).json({ error: 'destination_id is required' });
    }
    
    if (!checkin || !checkout) {
      return res.status(400).json({ error: 'checkin and checkout dates are required' });
    }

    const searchParams = {
      destination_id,
      checkin,
      checkout,
      guests: parseInt(guests),
      rooms: parseInt(rooms),
      limit: parseInt(limit)
    };

    const hotels = await hotelService.searchHotels(searchParams);
    
    res.json({
      hotels,
      count: hotels.length,
      searchParams
    });
  } catch (error) {
    console.error('Hotel search error:', error);
    res.status(500).json({ 
      error: 'Failed to search hotels',
      message: error.message 
    });
  }
});

// GET /api/hotels/:id
// Get hotel details by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const hotel = await hotelService.getHotelById(id);
    
    if (!hotel) {
      return res.status(404).json({ error: 'Hotel not found' });
    }
    
    res.json({ hotel });
  } catch (error) {
    console.error('Get hotel error:', error);
    res.status(500).json({ 
      error: 'Failed to get hotel',
      message: error.message 
    });
  }
});

module.exports = router;
