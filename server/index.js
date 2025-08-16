// server/index.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
require('dotenv').config();

// ---- ROUTES (keep these as separate files under server/routes) ----
const destinationRoutes = require('./routes/destinations');
const hotelsRoute = require('./routes/hotels');
const bookingsRoute = require('./routes/bookings');
const paymentsRoute = require('./routes/payments');
const supportRouter = require('./routes/support');

const app = express();
const PORT = process.env.PORT || 5001;

// ---------- Security / infra ----------
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

// ---------- CORS ----------
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:3000',
  'http://localhost:3001',
];
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        return callback(
          new Error('The CORS policy for this site does not allow access from the specified Origin.'),
          false
        );
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

// ---------- Body parsing ----------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------- DB connect (fail fast if not connected) ----------
if (process.env.NODE_ENV !== 'test') {
  mongoose
    .connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hotel-booking')
    .then(() => console.log('MongoDB connected'))
    .catch((err) => {
      console.error('MongoDB connection failed:', err.message);
      process.exit(1);
    });
}

// ---------- Routes ----------
app.use('/api/payments', paymentsRoute);
app.use('/api/bookings', bookingsRoute);
app.use('/api/destinations', destinationRoutes);
app.use('/api/hotels', hotelsRoute);
app.use('/api/support', supportRouter);

// ---------- SMTP sanity check (optional) ----------
// (async () => {
//   try {
//     const { createTransport } = require('nodemailer');
//     const t = createTransport({
//       host: process.env.SMTP_HOST,
//       port: Number(process.env.SMTP_PORT || 587),
//       secure: false,
//       auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
//     });
//     await t.verify();
//     console.log('SMTP connection verified');
//   } catch (e) {
//     console.error('SMTP verify failed:', e.message);
//   }
// })();

// after routes…
if (process.env.NODE_ENV !== 'test') {
  (async () => {
    try {
      const { createTransport } = require('nodemailer');
      const t = createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: false,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
      await t.verify();
      console.log('SMTP connection verified');
    } catch (e) {
      console.error('SMTP verify failed', e.message);
    }
  })();
}


// ---------- Test/Health ----------
app.get('/test', (req, res) => {
  res.json({ message: 'Basic routing works!', timestamp: new Date().toISOString() });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ---------- Errors ----------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
  });
});

// ---------- 404 ----------
app.use('*', (req, res) => res.status(404).json({ error: 'Route not found' }));

module.exports = app;

// Only listen when running directly (not during tests)
if (require.main === module && process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}
