


const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const Booking = require('../models/Booking');
const { sendBookingConfirmation } = require('../services/emailService');

// CREATE BOOKING
router.post('/', async (req, res) => {
  try {
    if (!req.is('application/json')) {
      return res.status(415).json({ error: 'Only JSON requests are supported' });
    }
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database not connected' });
    }

    const {
      firstName, lastName, email, phone, specialRequests,
      hotelId, hotelName, hotelAddress,
      checkIn, checkOut, nights, guests, rooms, totalPrice,
      roomDescription,
    } = req.body || {};

    const required = { firstName, lastName, email, phone, hotelName, checkIn, checkOut, nights, guests, rooms, totalPrice };
    for (const k of Object.keys(required)) {
      const v = required[k];
      if (v === undefined || v === null || v === '') {
        return res.status(400).json({ error: `Missing required field: ${k}` });
      }
    }

    const ci = new Date(checkIn);
    const co = new Date(checkOut);
    if (Number.isNaN(ci.getTime()) || Number.isNaN(co.getTime())) {
      return res.status(400).json({ error: 'Invalid check-in/check-out dates' });
    }

    const booking = new Booking({
      firstName, lastName, email, phone, specialRequests,
      hotelId, hotelName, hotelAddress,
      checkIn: ci, checkOut: co,
      nights, guests, rooms, totalPrice,
      roomDescription,
      // status defaults in schema; you set it to "Confirmed"
    });

    await booking.save();

    const frontendBaseUrl = process.env.FRONTEND_BASE_URL || process.env.CLIENT_URL || 'http://localhost:3000';
    const confirmationUrl = `${frontendBaseUrl}/booking/confirmation?bookingId=${booking._id}`;
    sendBookingConfirmation(booking.email, booking, confirmationUrl).catch(() => {});

    return res.status(201).json({ message: 'Booking created', bookingId: booking._id, booking });
  } catch (err) {
    console.error('Create booking error:', err);
    const status = err?.name === 'ValidationError' ? 400 : 500;
    return res.status(status).json({ error: err?.message || 'Failed to save booking' });
  }
});

// GET BOOKING BY ID
router.get('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    console.error('Error fetching booking:', err);
    res.status(500).json({ error: 'Server error, please try again later' });
  }
});

// CANCEL BOOKING -> HARD DELETE
router.post('/:id/cancel', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database not connected' });
    }
    const id = req.params.id;
    const existing = await Booking.findById(id);
    if (!existing) return res.status(404).json({ error: 'Booking not found' });

    await Booking.deleteOne({ _id: id });
    return res.json({ ok: true, deleted: true });
  } catch (e) {
    console.error('Cancel/Delete booking error:', e);
    return res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

module.exports = router;
