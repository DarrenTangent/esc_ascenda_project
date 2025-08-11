const express = require('express');
const router = express.Router();
const hotelService = require('../services/hotelService');
const { validateHotelSearch, validateHotelPrice, validateHotelId } = require('../middleware/validation');

// GET /api/hotels/search - Search hotels with pricing for a destination
router.get('/search', validateHotelSearch, async (req, res) => {
    try {
        console.log('Hotel search request:', req.query);
        const data = await hotelService.getHotels(req);
        res.json(data);
    } catch (error) {
        console.error('Hotel search error:', error);
        res.status(500).json({ 
            error: 'Failed to search hotels',
            message: error.message 
        });
    }
});

// GET /api/hotels/:id - Get static hotel details by ID
router.get('/:id', validateHotelId, async (req, res) => {
    try {
        const hotelId = req.params.id;
        console.log('Fetching hotel details for:', hotelId);
        
        const hotelDetails = await hotelService.getHotelById(hotelId);
        
        if (!hotelDetails) {
            return res.status(404).json({ 
                error: 'Hotel not found',
                message: `Hotel with ID ${hotelId} not found`
            });
        }
        
        res.json(hotelDetails);
    } catch (error) {
        console.error('Get hotel details error:', error);
        res.status(500).json({ 
            error: 'Failed to get hotel details',
            message: error.message 
        });
    }
});

// GET /api/hotels/:id/price - Get price for specific hotel
router.get('/:id/price', validateHotelPrice, async (req, res) => {
    try {
        const hotelId = req.params.id;
        const { destination_id, checkin, checkout, guests, lang, currency, country_code } = req.query;
        
        console.log('Fetching hotel price for:', hotelId, 'with params:', req.query);
        
        const priceData = await hotelService.getHotelPrice(
            hotelId, 
            destination_id, 
            checkin, 
            checkout, 
            guests, 
            lang || 'en_US',
            currency || 'SGD',
            country_code || 'SG'
        );
        
        if (!priceData) {
            return res.status(404).json({ 
                error: 'Price not found',
                message: `Price data for hotel ${hotelId} not found`
            });
        }
        
        res.json(priceData);
    } catch (error) {
        console.error('Get hotel price error:', error);
        res.status(500).json({ 
            error: 'Failed to get hotel price',
            message: error.message 
        });
    }
});

// GET /api/hotels/config/require-completed - Get current requireCompleted flag status
router.get('/config/require-completed', (req, res) => {
    try {
        const status = hotelService.getRequireCompleted();
        res.json({ 
            requireCompleted: status,
            description: 'Flag to ensure API responses are completed before returning results'
        });
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to get flag status',
            message: error.message 
        });
    }
});

// PUT /api/hotels/config/require-completed - Set requireCompleted flag
router.put('/config/require-completed', (req, res) => {
    try {
        const { value } = req.body;
        
        if (typeof value !== 'boolean') {
            return res.status(400).json({ 
                error: 'Invalid value. Must be boolean (true or false)',
                received: typeof value
            });
        }
        
        hotelService.setRequireCompleted(value);
        
        res.json({ 
            requireCompleted: value,
            message: `Require completed flag ${value ? 'enabled' : 'disabled'}`,
            description: 'Flag to ensure API responses are completed before returning results'
        });
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to set flag',
            message: error.message 
        });
    }
});

module.exports = router;