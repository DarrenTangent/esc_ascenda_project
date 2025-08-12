
// module.exports = router;
const express = require('express');
const router = express.Router();
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET);
const Booking = require('../models/Booking'); // <-- add

router.post('/create-checkout-session', async (req, res) => {
  try {
    const { amount, hotelName, email, bookingId } = req.body;
    if (!bookingId) return res.status(400).json({ error: 'Missing bookingId' });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: email,
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'sgd',
          product_data: { name: hotelName || 'Hotel Booking' },
          unit_amount: amount,
        },
        quantity: 1,
      }],
      metadata: { bookingId },
      success_url: `${process.env.CLIENT_URL}/booking/confirmation?bookingId=${encodeURIComponent(bookingId)}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/booking/cancelled`,
    });

    // store the PI on the booking (paid stays false for now)
    if (session.payment_intent) {
      await Booking.findByIdAndUpdate(
        bookingId,
        { paymentIntentId: session.payment_intent, $setOnInsert: {} },
        { new: true }
      );
    }

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// (optional) verify & mark paid after redirect
router.post('/verify', async (req, res) => {
  try {
    const { session_id, bookingId } = req.body;
    if (!session_id || !bookingId) return res.status(400).json({ error: 'Missing params' });

    const session = await stripe.checkout.sessions.retrieve(session_id);
    const paid = session.payment_status === 'paid';
    const amountTotal = session.amount_total ?? null; // cents

    const update = {
      paid,
      paymentIntentId: session.payment_intent || undefined
    };
    if (amountTotal != null) update.totalPrice = amountTotal / 100;

    await Booking.findByIdAndUpdate(bookingId, update);

    res.json({ ok: true, paid, amount: amountTotal });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Verify failed' });
  }
});

module.exports = router;
