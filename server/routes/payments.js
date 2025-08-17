
// // module.exports = router;
// const express = require('express');
// const router = express.Router();
// require('dotenv').config();

// // Validate Stripe environment variable
// const stripeSecretKey = process.env.STRIPE_SECRET;
// if (!stripeSecretKey) {
//   console.error('ERROR: STRIPE_SECRET environment variable is not set!');
//   console.error('Please set STRIPE_SECRET in your .env file with your Stripe secret key.');
//   process.exit(1);
// }

// const stripe = require('stripe')(stripeSecretKey);
// const Booking = require('../models/Booking'); // <-- add

// router.post('/create-checkout-session', async (req, res) => {
//   try {
//     const { amount, hotelName, email, bookingId } = req.body;
//     if (!bookingId) return res.status(400).json({ error: 'Missing bookingId' });

//     const session = await stripe.checkout.sessions.create({
//       mode: 'payment',
//       customer_email: email,
//       payment_method_types: ['card'],
//       line_items: [{
//         price_data: {
//           currency: 'sgd',
//           product_data: { name: hotelName || 'Hotel Booking' },
//           unit_amount: amount,
//         },
//         quantity: 1,
//       }],
//       metadata: { bookingId },
//       success_url: `${process.env.CLIENT_URL}/booking/confirmation?bookingId=${encodeURIComponent(bookingId)}&session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `${process.env.CLIENT_URL}/booking/cancelled`,
//     });

//     // store the PI on the booking (paid stays false for now)
//     if (session.payment_intent) {
//       await Booking.findByIdAndUpdate(
//         bookingId,
//         { paymentIntentId: session.payment_intent, $setOnInsert: {} },
//         { new: true }
//       );
//     }

//     res.json({ url: session.url });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Failed to create checkout session' });
//   }
// });

// // (optional) verify & mark paid after redirect
// router.post('/verify', async (req, res) => {
//   try {
//     const { session_id, bookingId } = req.body;
//     if (!session_id || !bookingId) return res.status(400).json({ error: 'Missing params' });

//     const session = await stripe.checkout.sessions.retrieve(session_id);
//     const paid = session.payment_status === 'paid';
//     const amountTotal = session.amount_total ?? null; // cents

//     const update = {
//       paid,
//       paymentIntentId: session.payment_intent || undefined
//     };
//     if (amountTotal != null) update.totalPrice = amountTotal / 100;

//     await Booking.findByIdAndUpdate(bookingId, update);

//     res.json({ ok: true, paid, amount: amountTotal });
//   } catch (e) {
//     console.error(e);
//     res.status(500).json({ error: 'Verify failed' });
//   }
// });


// // server/routes/payments.js
// router.post('/verify', async (req, res) => {
//   try {
//     const { session_id, bookingId } = req.body;
//     if (!session_id || !bookingId) return res.status(400).json({ error: 'Missing params' });

//     const session = await stripe.checkout.sessions.retrieve(session_id);
//     const paid = session.payment_status === 'paid';
//     const amountTotal = session.amount_total ?? null; // cents

//     const update = {
//       paid,
//       paymentIntentId: session.payment_intent || undefined,
//     };
//     // 2-state flow: only set Confirmed when paid (never set Pending)
//     if (paid) update.status = 'Confirmed';
//     if (amountTotal != null) update.totalPrice = amountTotal / 100;

//     await Booking.findByIdAndUpdate(bookingId, update);

//     res.json({ ok: true, paid, amount: amountTotal });
//   } catch (e) {
//     console.error(e);
//     res.status(500).json({ error: 'Verify failed' });
//   }
// });

// module.exports = router;


const express = require('express');
const router = express.Router();
require('dotenv').config();

const stripeSecretKey = process.env.STRIPE_SECRET;
if (!stripeSecretKey) {
  console.error('ERROR: STRIPE_SECRET environment variable is not set!');
  process.exit(1);
}

const stripe = require('stripe')(stripeSecretKey);
const Booking = require('../models/Booking');
const { sendBookingConfirmation } = require('../services/emailService');

// POST /api/payments/create-checkout-session
// - No DB write here.
// - Put a compact booking draft into Stripe metadata.
// - Success URL only carries {CHECKOUT_SESSION_ID}.
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { amount, hotelName, email, bookingDraft } = req.body || {};

    if (!amount || !email || !bookingDraft) {
      return res.status(400).json({ error: 'Missing amount, email, or bookingDraft' });
    }

    // Keep metadata small and serializable
    const draft = {
      firstName: bookingDraft.firstName || '',
      lastName: bookingDraft.lastName || '',
      email: bookingDraft.email || email,
      phone: bookingDraft.phone || '',
      specialRequests: bookingDraft.specialRequests || '',
      hotelId: bookingDraft.hotelId || '',
      hotelName: bookingDraft.hotelName || hotelName || 'Hotel Booking',
      hotelAddress: bookingDraft.hotelAddress || '',
      checkIn: bookingDraft.checkIn,
      checkOut: bookingDraft.checkOut,
      nights: bookingDraft.nights,
      guests: bookingDraft.guests,
      rooms: bookingDraft.rooms,
      totalPrice: bookingDraft.totalPrice, // in dollars
      roomDescription: bookingDraft.roomDescription || '',
    };

    const FRONTEND = process.env.FRONTEND_BASE_URL || process.env.CLIENT_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: email,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'sgd',
            unit_amount: amount, // cents
            product_data: { name: draft.hotelName },
          },
          quantity: 1,
        },
      ],
      metadata: {
        bookingDraft: JSON.stringify(draft),
      },
      success_url: `${FRONTEND}/booking/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONTEND}/booking/cancelled`,
    });

    return res.json({ url: session.url });
  } catch (err) {
    console.error('create-checkout-session error:', err);
    return res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// POST /api/payments/verify
// - Retrieve the Stripe session.
// - If paid, create the Booking now and send the confirmation email.
// - Return booking + bookingId.
router.post('/verify', async (req, res) => {
  try {
    const { session_id } = req.body || {};
    if (!session_id) return res.status(400).json({ error: 'Missing session_id' });

    const session = await stripe.checkout.sessions.retrieve(session_id);
    const paid = session?.payment_status === 'paid';
    if (!paid) {
      return res.status(402).json({ error: 'Payment not completed' });
    }

    let draft = {};
    try {
      draft = JSON.parse(session.metadata?.bookingDraft || '{}');
    } catch (_) {
      draft = {};
    }

    // Create booking AFTER payment succeeded
    const booking = new Booking({
      ...draft,
      paid: true,
      status: 'Confirmed',
      paymentIntentId: session.payment_intent || undefined,
      // Trust total from Stripe if present
      totalPrice:
        typeof session.amount_total === 'number'
          ? session.amount_total / 100
          : draft.totalPrice,
    });

    await booking.save();

    const FRONTEND = process.env.FRONTEND_BASE_URL || process.env.CLIENT_URL || 'http://localhost:3000';
    const confirmationUrl = `${FRONTEND}/booking/confirmation?bookingId=${booking._id}`;

    // Send confirmation email after successful payment
    sendBookingConfirmation(booking.email, booking, confirmationUrl).catch(() => {});

    return res.json({ ok: true, bookingId: booking._id, booking });
  } catch (e) {
    console.error('verify error:', e);
    return res.status(500).json({ error: 'Verify failed' });
  }
});

module.exports = router;
