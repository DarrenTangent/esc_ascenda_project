const express = require('express');
const router = express.Router();
const hotelService = require('../services/hotelService');
const { validateHotelSearch } = require('../middleware/validation');

// GET /api/hotels/search
router.get('/search', validateHotelSearch, async (req, res) => {
    try {
        data = await hotelService.getHotels(req);
        console.log(data);
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

module.exports = router;