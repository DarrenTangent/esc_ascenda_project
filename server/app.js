// server/app.js
const express = require('express');
const cors = require('cors');

// Routers
const bookings = require('./routes/bookings');
const hotels = require('./routes/hotels');
const destinations = require('./routes/destinations');
const payments = require('./routes/payments');
const auth = require('./routes/auth');

const app = express();

// Core middleware
app.use(cors());
app.use(express.json());

// Mount API
app.use('/api/bookings', bookings);
app.use('/api/hotels', hotels);
app.use('/api/destinations', destinations);
app.use('/api/payments', payments);
app.use('/api/auth', auth);

// Health check to help tests
app.get('/_health', (_req, res) => res.json({ ok: true }));

module.exports = app;
