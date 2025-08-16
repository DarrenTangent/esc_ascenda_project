// server/tests/validation.test.js
const request = require('supertest');

// --- mock email service (must be before requiring the app) ---
jest.mock('../services/emailService', () => ({
  sendBookingConfirmation: jest.fn(() => Promise.resolve({ ok: true })),
}));
const { sendBookingConfirmation } = require('../services/emailService');

// Ensure frontend base URL for confirmation links
process.env.FRONTEND_BASE_URL = 'http://localhost:3000';

// --- mock Booking model (factory; no out-of-scope variables) ---
jest.mock('../models/Booking', () => {
  return class Booking {
    constructor(doc) {
      this._doc = { ...doc };
      Object.assign(this, this._doc);
      // mirror route’s paid inference when paymentIntentId present
      this.paid = !!this._doc.paymentIntentId;
    }

    async validate() {
      const required = ['firstName', 'lastName', 'email', 'phone', 'billingAddress'];
      for (const k of required) {
        if (!this._doc[k]) {
          const err = new Error(`Validation failed: ${k}`);
          err.name = 'ValidationError';
          throw err;
        }
      }
      const emailRe = /\S+@\S+\.\S+/;
      if (!emailRe.test(this._doc.email)) {
        const err = new Error('Validation failed: email');
        err.name = 'ValidationError';
        throw err;
      }
    }

    async save() {
      if (!this._id) this._id = 'mock_bkg_123';
      return this;
    }

    // Express JSON uses this to serialize
    toJSON() {
      return { ...this._doc, _id: this._id, paid: this.paid };
    }

    // used by GET /api/bookings/:id (if you add tests for it)
    static async findById(id) {
      return { _id: id };
    }
  };
});

// now import the Express app (which uses the mocks above)
const app = require('../app');

describe('Bookings API - Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('201 when payload is valid; strips sensitive fields; saves roomDescription; sends email with link', async () => {
    const payload = {
      // Guest
      firstName: 'B',
      lastName: 'Singh',
      email: 'balraj@example.com',
      phone: '96275026',
      specialRequests: 'dsffsdf',
      billingAddress: '8 Somapah Road, #03-27',

      // Hotel / stay
      hotelId: 'nPbT',
      hotelName: 'AMOY by Far East Hospitality',
      hotelAddress: '76 Telok Ayer Street',
      checkIn: '2025-08-29T00:00:00.000Z',
      checkOut: '2025-08-30T00:00:00.000Z',
      nights: 1,
      guests: '2',
      rooms: '1',
      totalPrice: 379.29,

      // Room
      roomDescription: 'Family Room, Window',

      // Payment fields that must be stripped in response
      cardNumber: '4111 1111 1111 1111',
      expiry: '12/25',
      cvv: '123',
      // no paymentIntentId => paid should be false
    };

    const res = await request(app)
      .post('/api/bookings')
      .set('Content-Type', 'application/json')
      .send(payload);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('booking');

    const b = res.body.booking;

    // Core fields preserved
    expect(b).toMatchObject({
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      phone: payload.phone,
      billingAddress: payload.billingAddress,
      hotelId: payload.hotelId,
      hotelName: payload.hotelName,
      hotelAddress: payload.hotelAddress,
      checkIn: payload.checkIn,
      checkOut: payload.checkOut,
      nights: payload.nights,
      guests: payload.guests,
      rooms: payload.rooms,
      totalPrice: payload.totalPrice,
      roomDescription: payload.roomDescription,
      paid: false,
    });
    expect(b).toHaveProperty('_id');

    // Sensitive fields NOT returned
    expect(b.cardNumber).toBeUndefined();
    expect(b.cvv).toBeUndefined();
    expect(b.expiry).toBeUndefined();

    // Email was sent with a confirmation URL containing bookingId
    expect(sendBookingConfirmation).toHaveBeenCalledTimes(1);
    const [toEmail, bookingObj, url] = sendBookingConfirmation.mock.calls[0];
    expect(toEmail).toBe(payload.email);
    expect(bookingObj).toEqual(expect.objectContaining({ hotelName: payload.hotelName }));
    expect(url).toContain(`/booking/confirmation?bookingId=${b._id}`);
  });

  test('400 when email invalid', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Content-Type', 'application/json')
      .send({
        firstName: 'A',
        lastName: 'B',
        email: 'not-an-email',
        phone: '1',
        billingAddress: 'x',
        hotelId: 'H',
        hotelName: 'N',
        hotelAddress: 'A',
        checkIn: '2025-01-01',
        checkOut: '2025-01-02',
        nights: 1,
        guests: '1',
        rooms: '1',
        totalPrice: 1,
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('415 when Content-Type is not JSON', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Content-Type', 'text/plain')
      .send('not-json');

    expect(res.statusCode).toBe(415);
    expect(res.body).toHaveProperty('error');
  });

  test('400 rejects obvious SQL injection patterns', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Content-Type', 'application/json')
      .send({
        firstName: "A'; DROP TABLE users;--",
        lastName: 'B',
        email: 'a@b.com',
        phone: '1',
        billingAddress: 'x',
        hotelId: 'H',
        hotelName: 'N',
        hotelAddress: 'A',
        checkIn: '2025-01-01',
        checkOut: '2025-01-02',
        nights: 1,
        guests: '1',
        rooms: '1',
        totalPrice: 1,
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'Invalid characters detected');
  });
});
