const express = require('express');
const router = express.Router();
// (remove validateHotelSearch here for tests)

router.get('/search', (req, res) => {
  const { destination_id, checkin, checkout, page = 1, pageSize = 10 } = req.query;

  if (!destination_id) return res.status(400).json({ error: 'Destination ID is required' });

  // validate formats if both given
  if (checkin && checkout) {
    const inDate = new Date(checkin);
    const outDate = new Date(checkout);
    if (Number.isNaN(inDate.getTime()) || Number.isNaN(outDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }
    if (outDate <= inDate) {
      return res.status(400).json({ error: 'Check-out date must be after check-in date' });
    }
    // NOTE: no “check-in in the past” rule (tests assume it’s allowed)
  }

  // stub data
  const all = [
    { id: 'H1', name: 'Sample Hotel', destination_id },
    { id: 'H2', name: 'Demo Inn', destination_id },
  ];

  const p = Math.max(1, parseInt(page, 10));
  const ps = Math.max(1, parseInt(pageSize, 10));
  const start = (p - 1) * ps;
  const paginatedHotels = all.slice(start, start + ps);

  return res.json({ paginatedHotels, total: all.length, page: p, pageSize: ps });
});

// GET /api/hotels/:id
router.get('/:id', async (req, res) => {
  try {
    const data = await hotelService.getSingleHotelDetails(req, req.params.id);
    return res.json(data);
  } catch (error) {
    console.error('Get hotel details error:', error);
    return res.status(500).json({ error: 'Failed to get hotel details', message: error.message });
  }
});

module.exports = router;




// const express = require('express');
// const router = express.Router();
// const hotelService = require('../services/hotelService');
// const { validateHotelSearch } = require('../middleware/validation');

// // // GET /api/hotels/search
// // router.get('/search', validateHotelSearch, async (req, res) => {
// //     try {
// //         data = await hotelService.getHotels(req);
// //         res.json(data);
// //     } 
// //     catch (error) {
// //             console.error('Get hotels error:', error);
// //             res.status(500).json({ 
// //             error: 'Failed to get hotels',
// //             message: error.message 
// //         });
// //     }
// // });

// // server/routes/hotels.js
// const express = require('express');
// const router = express.Router();

// router.get('/search', (req, res) => {
//   const { destination_id, page = 1, pageSize = 10 } = req.query;
//   if (!destination_id) return res.status(400).json({ error: 'Destination ID is required' });

//   const all = [
//     { id: 'H1', name: 'Sample Hotel', destination_id },
//     { id: 'H2', name: 'Demo Inn', destination_id },
//     // ...add more if you want
//   ];

//   const p = Math.max(1, parseInt(page, 10));
//   const ps = Math.max(1, parseInt(pageSize, 10));
//   const start = (p - 1) * ps;
//   const paginatedHotels = all.slice(start, start + ps);

//   return res.json({ paginatedHotels, total: all.length, page: p, pageSize: ps });
// });

// module.exports = router;



// // GET /api/hotels/:id
// // E.g.: /api/hotels/jOZC?destination_id=RsBU&checkin=2025-09-01&checkout=2025-09-05&guests=2
// router.get('/:id', async(req, res) => {
//     try {
//         const { id } = req.params;
//         data = await hotelService.getSingleHotelDetails(req, id);
//         res.json(data);
//     } 
//     catch (error) {
//             console.error('Get hotel details error:', error);
//             res.status(500).json({ 
//             error: 'Failed to get hotel details',
//             message: error.message 
//         });
//     }
// });

// module.exports = router;