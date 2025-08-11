const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');

// POST /api/bookings
router.post('/', async (req, res) => {
  try {
    // Reject XML or non-JSON
    if (!req.is('application/json')) {
      return res.status(415).json({ error: 'Only JSON requests are supported' });
    }

    // Very simple SQL-ish injection guard
    const sqlLike = /('|--|;|\/\*|\*\/|\bor\s*1\s*=\s*1\b|\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|EXEC)\b)/i;
    for (const [, v] of Object.entries(req.body)) {
      if (typeof v === 'string' && sqlLike.test(v)) {
        return res.status(400).json({ error: 'Invalid characters detected' });
      }
    }

    const booking = new Booking(req.body);
    await booking.validate();          // trigger Mongoose validators (maps to 400 below)
    await booking.save();

    return res.status(201).json({ message: 'Booking created', booking });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation failed' });
    }
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
