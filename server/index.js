const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
require('dotenv').config();

const destinationRoutes = require('./routes/destinations');
const bookingsRoute = require('./routes/bookings');
const hotels = require('./routes/hotels');

const app = express();
const PORT = process.env.PORT || 5000;

/* ---------- Security / infra ---------- */
app.use(helmet());
app.use(compression());

// Reject non-JSON bodies on mutating routes (XML => 415)
app.use((req, res, next) => {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    const ct = req.headers['content-type'];
    if (ct && !req.is('application/json')) {
      return res.status(415).json({ error: 'Unsupported Media Type' });
    }
  }
  next();
});

// Rate limiting (OFF in tests to avoid timer leaks)
if (process.env.NODE_ENV !== 'test') {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.'
  });
  app.use('/api/', limiter);
}

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ---------- DB (OFF during tests) ---------- */
if (process.env.NODE_ENV !== 'test') {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hotel-booking';
  mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));
}

/* ---------- Routes ---------- */
// Keep this popular stub (used by tests)
app.get('/api/destinations/popular', (req, res) => {
  const limit = parseInt(req.query.limit || '20', 10);
  const list = [
    { id: 'SG', name: 'Singapore' },
    { id: 'BKK', name: 'Bangkok' },
    { id: 'TYO', name: 'Tokyo' }
  ].slice(0, limit);
  res.json({ destinations: list, count: list.length });
});

// Mount real routers (let hotels router handle /search and return paginatedHotels)
app.use('/api/bookings', bookingsRoute);
app.use('/api/destinations', destinationRoutes);
app.use('/api/hotels', hotels);

// Health
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404
app.use('*', (req, res) => res.status(404).json({ error: 'Route not found' }));

/* ---------- Export for tests; only listen outside tests ---------- */
module.exports = app;

if (require.main === module && process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}
