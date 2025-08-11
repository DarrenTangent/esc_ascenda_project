const express = require('express');
const router = express.Router();
const hotelService = require('../services/hotelService');
const { validateHotelSearch } = require('../middleware/validation');

// GET /api/hotels/search
router.get('/search', validateHotelSearch, async (req, res) => {
    try {
        data = await hotelService.getHotels(req);
        res.json(data);
    } 
    catch (error) {
            console.error('Get hotels error:', error);
            res.status(500).json({ 
            error: 'Failed to get hotels',
            message: error.message 
        });
    }
});

// GET /api/hotels/:id
// E.g.: /api/hotels/jOZC?destination_id=RsBU&checkin=2025-09-01&checkout=2025-09-05&guests=2
router.get('/:id', async(req, res) => {
    try {
        const { id } = req.params;
        data = await hotelService.getSingleHotelDetails(req, id);
        res.json(data);
    } 
    catch (error) {
            console.error('Get hotel details error:', error);
            res.status(500).json({ 
            error: 'Failed to get hotel details',
            message: error.message 
        });
    }
});

module.exports = router;