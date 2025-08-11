const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');

// // POST /api/bookings
// router.post('/', async (req, res) => {
//   try {
//     if (!req.is('application/json')) {
//       return res.status(415).json({ error: 'Only JSON requests are supported' });
//     }

//     console.log('POST /api/bookings CT:', req.headers['content-type']);
//     console.log('POST /api/bookings BODY:', req.body);

//     // TEMP: comment out the injection guard to rule it out
//     // const sqlLike = /('|--|;|\/\*|\*\/|\bor\s*1\s*=\s*1\b|\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|EXEC)\b)/i;
//     // for (const [k, v] of Object.entries(req.body)) {
//     //   if (typeof v === 'string' && sqlLike.test(v)) {
//     //     return res.status(400).json({ error: `Invalid characters in ${k}` });
//     //   }
//     // }

//     const booking = new Booking(req.body);
//     await booking.validate();
//     await booking.save();
//     return res.status(201).json({ message: 'Booking created', booking });

//   } catch (err) {
//     if (err.name === 'ValidationError') {
//       const details = Object.values(err.errors || {}).map(e => e.message);
//       return res.status(400).json({ error: 'Validation failed', details });
//     }
//     console.error('BOOKING SAVE ERROR:', err);
//     return res.status(500).json({ error: 'Failed to save booking' });
//   }
// });


// server/routes/bookings.js
router.post('/', async (req, res) => {
  try {
    if (!req.is('application/json')) {
      return res.status(415).json({ error: 'Only JSON requests are supported' });
    }

    console.log('POST /api/bookings CT:', req.headers['content-type']);
    console.log('POST /api/bookings BODY:', req.body);

    const booking = new Booking(req.body);
    await booking.validate();              // triggers Mongoose validators
    await booking.save();

    const saved = booking.toObject();
    delete saved.cardNumber;
    delete saved.cvv;
    return res.status(201).json({ message: 'Booking created', booking: saved });

    
  } catch (err) {
    if (err.name === 'ValidationError') {
      const details = Object.values(err.errors || {}).map(e => e.message);
      console.error('VALIDATION ERRORS:', details);
      return res.status(400).json({ error: 'Validation failed', details });
    }
    console.error('BOOKING SAVE ERROR:', err);
    return res.status(500).json({ error: 'Failed to save booking' });
  }
});

// GET /api/bookings/:id
router.get('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    return res.json(booking);
  } catch (err) {
    return res.status(500).json({ error: 'Server error, please try again later' });
  }
});

module.exports = router;
