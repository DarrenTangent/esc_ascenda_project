const express = require('express');
const router = express.Router();
const NodeCache = require("node-cache");
const myCache = new NodeCache({ stdTTL: 6000 });

// GET /api/hotels/search
router.get('/search', async (req, res) => {
    try {
        let hotelPrices = {};
        const page = parseInt(req.query.page) || 1;
        const maxCost = parseInt(req.query.maxCost) || null;
        const minCost = parseInt(req.query.minCost) || null;
        const pageSize = 30;

        const query = "https://hotelapi.loyalty.dev/api/hotels/prices?destination_id=RsBU&checkin=2025-08-05&checkout=2025-08-09&currency=SGD&guests=2&partner_id=1";
    
        // caching
        const cachedData = myCache.get(query);
        if (cachedData) {
            hotelPrices = cachedData;
        }
        else {
            // TODO: TRY AT LEAST 3 TIMES CAUSE QUERY TAKES SOME TIME TO LOAD
            // OH ACTUALLY CAN KEEP TRYING UNTIL THE "completed" PARAM IN THE REQUEST IS "true"
            const rawPricesData = await fetch(query);
            const jsonPricesData = await rawPricesData.json();
            hotelPrices = jsonPricesData.hotels;
            myCache.set(query, hotelPrices);
        }
        // filtering
        if (minCost != null) hotelPrices = hotelPrices.filter(hotel => minCost <= hotel.price);
        if (maxCost != null) hotelPrices = hotelPrices.filter(hotel => hotel.price <= maxCost);
        // console.log(hotelPrices);
    
        // pagination
        const totalPages = Math.ceil(hotelPrices.length / pageSize);
        const paginatedHotels = hotelPrices.slice((page - 1) * pageSize, page * pageSize);

        res.json({"page": page, "totalPages": totalPages, "paginatedHotels": paginatedHotels});
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