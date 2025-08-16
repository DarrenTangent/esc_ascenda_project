// server/routes/bookings.js
const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const { sendBookingConfirmation } = require('../services/emailService');

/**
 * POST /api/bookings
 */
router.post('/', async (req, res) => {
  try {
    if (!req.is('application/json')) {
      return res.status(415).json({ error: 'Only JSON requests are supported' });
    }

    const sqlLike =
      /('|--|;|\/\*|\*\/|\bor\s*1\s*=\s*1\b|\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|EXEC)\b)/i;
    for (const [, v] of Object.entries(req.body || {})) {
      if (typeof v === 'string' && sqlLike.test(v)) {
        return res.status(400).json({ error: 'Invalid characters detected' });
      }
    }

    const {
      cardNumber,
      expiry,
      cvv,

      paymentIntentId,
      cardBrand,

      roomDescription,

      accountUserId,
      accountEmail,

      ...rest
    } = req.body || {};

    const cardLast4 =
      typeof cardNumber === 'string'
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
      paymentIntentId: paymentIntentId || null,
      cardBrand: cardBrand || null,
      cardLast4: cardLast4 || null,
      paid: !!paymentIntentId,
      roomDescription: roomDescription || null,
      accountUserId: accountUserId || null,
      accountEmail: accountEmail || null,
    });

    await booking.validate();
    await booking.save();

    const frontendBaseUrl =
      process.env.FRONTEND_BASE_URL || 'http://localhost:3000';
    const confirmationUrl = `${frontendBaseUrl}/booking/confirmation?bookingId=${booking._id}`;

    sendBookingConfirmation(booking.email, booking, confirmationUrl).catch(() => {});

    return res.status(201).json({ message: 'Booking created', booking });
  } catch (err) {
    if (err && err.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation failed' });
    }
    console.error('Create booking error:', err);
    return res.status(500).json({ error: 'Failed to save booking' });
  }
});

/**
 * GET /api/bookings/by-account?userId=...&email=...
 * NOTE: must come BEFORE '/:id'
 */
router.get('/by-account', async (req, res) => {
  try {
    const { userId, email } = req.query;

    if (!userId && !email) {
      return res.status(400).json({ error: 'userId or email required' });
    }

    const q = {};
    if (userId) q.accountUserId = String(userId);
    if (email) q.accountEmail = String(email);

    const bookings = await Booking.find(q).sort({ createdAt: -1 }).lean();

    return res.json({ bookings });
  } catch (err) {
    console.error('Error fetching bookings by account:', err);
    return res.status(500).json({ error: 'Failed to load bookings' });
  }
});

/**
 * GET /api/bookings/:id
 * (Place AFTER /by-account)
 */
router.get('/:id', async (req, res) => {
  try {
    const id = String(req.params.id);
    const booking = await Booking.findById(id).lean();
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    return res.json(booking);
  } catch (err) {
    console.error('Error fetching booking:', err);
    return res.status(500).json({ error: 'Server error, please try again later' });
  }
});

module.exports = router;
