


const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const { sendBookingConfirmation } = require('../services/emailService');

// POST /api/bookings
router.post('/', async (req, res) => {
  try {
    if (!req.is('application/json')) {
      return res.status(415).json({ error: 'Only JSON requests are supported' });
    }

    // simple injection guard (kept from your version)
    const sqlLike = /('|--|;|\/\*|\*\/|\bor\s*1\s*=\s*1\b|\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|EXEC)\b)/i;
    for (const [, v] of Object.entries(req.body)) {
      if (typeof v === 'string' && sqlLike.test(v)) {
        return res.status(400).json({ error: 'Invalid characters detected' });
      }
    }

    // Strip raw card, keep last4 + meta
    const {
      cardNumber, expiry, cvv,
      paymentIntentId, cardBrand,
      ...rest
    } = req.body;

    const cardLast4 = typeof cardNumber === 'string'
      ? cardNumber.replace(/[\s-]/g, '').slice(-4)
      : undefined;

    const booking = new Booking({
      ...rest,
      hotelName: rest.hotelName,
      hotelAddress: rest.hotelAddress,
      checkIn: rest.checkIn ? new Date(rest.checkIn) : null,
      checkOut: rest.checkOut ? new Date(rest.checkOut) : null,
      nights: rest.nights,
      totalPrice: rest.totalPrice,
      paymentIntentId,
      cardBrand,
      cardLast4,
      paid: !!paymentIntentId,
    });


    await booking.validate();
    await booking.save();

    // Fire-and-forget email (don’t fail request on email error)
    sendBookingConfirmation(booking.email, booking).catch(() => {});

    res.status(201).json({ message: 'Booking created', booking });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation failed' });
    }
    console.error('Create booking error:', err);
    res.status(500).json({ error: 'Failed to save booking' });
  }
});
// GET /api/bookings/:id
router.get('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.json(booking);
  } catch (err) {
    console.error('Error fetching booking:', err);
    res.status(500).json({ error: 'Server error, please try again later' });
  }
});


module.exports = router;
