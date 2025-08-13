// server/index.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
require('dotenv').config();

const destinationRoutes = require('./routes/destinations');
const hotels = require('./routes/hotels');
const bookingsRoute = require('./routes/bookings');
const paymentsRoute = require('./routes/payments');

console.log('Routes loaded successfully');

const app = express();
const PORT = process.env.PORT || 5001;

// Security / infra
app.use(helmet());
app.use(compression());

// Rate limit (off during tests)
if (process.env.NODE_ENV !== 'test') {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
  });
  app.use('/api/', limiter);
}

// CORS
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:3000',
  'http://localhost:3001',
];
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// DB connect (skip in tests)
if (process.env.NODE_ENV !== 'test') {
  mongoose
    .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hotel-booking')
    .then(() => console.log('MongoDB connected'))
    .catch((err) => {
      console.warn('MongoDB connection failed:', err.message);
      console.log('Continuing without MongoDB - some features may be limited');
    });
}

// Routes
app.use('/api/payments', paymentsRoute);
app.use('/api/bookings', bookingsRoute);
app.use('/api/destinations', destinationRoutes);
app.use('/api/hotels', hotels);

// Simple test route (kept from origin)
app.get('/test', (req, res) => {
  res.json({ message: 'Basic routing works!', timestamp: new Date().toISOString() });
});

// Health
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
  });
});

// 404
app.use('*', (req, res) => res.status(404).json({ error: 'Route not found' }));

module.exports = app;

// Only listen when running directly (not during tests)
if (require.main === module && process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}
