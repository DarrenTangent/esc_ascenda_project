


// server/routes/support.js
const express = require('express');
const router = express.Router();
const { sendSupportMessage } = require('../services/emailService');

router.post('/', async (req, res) => {
  try {
    const { email, bookingId, message } = req.body || {};
    if (!email || !message) {
      return res.status(400).json({ error: 'Email and message are required' });
    }

    await sendSupportMessage({ fromEmail: email, bookingId, message });
    return res.json({ ok: true });
  } catch (e) {
    console.error('Support send error:', e);
    return res.status(500).json({ error: 'Failed to send support message' });
  }
});

module.exports = router;
