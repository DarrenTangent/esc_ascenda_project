const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Mock ONLY the email sender
jest.mock('../services/emailService', () => ({
  sendBookingConfirmation: jest.fn(() => Promise.resolve({ ok: true })),
}));
const { sendBookingConfirmation } = require('../services/emailService');

let mongo;
let app;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.FRONTEND_BASE_URL = 'http://localhost:3000';

  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());

  // Import app AFTER env + DB are ready
  app = require('../index');
});

afterEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();
  for (const c of collections) await c.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongo.stop();
});

describe('Bookings API - validation & flow', () => {
  test('201 creates booking, saves roomDescription, default status Confirmed, sends email', async () => {
    const payload = {
      firstName: 'B',
      lastName: 'Singh',
      email: 'balraj@example.com',
      phone: '96275026',
      specialRequests: 'High floor',

      hotelId: 'EgHh',
      hotelName: 'Test Hotel',
      hotelAddress: '123 Road',
      checkIn: '2025-08-29',
      checkOut: '2025-08-31',
      nights: 2,
      guests: '2',
      rooms: '1',
      totalPrice: 1631.09,

      roomDescription: 'Courtyard Room',
    };

    const res = await request(app)
      .post('/api/bookings')
      .set('Content-Type', 'application/json')
      .send(payload);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('bookingId');
    expect(res.body).toHaveProperty('booking');

    const b = res.body.booking;
    expect(b).toEqual(
      expect.objectContaining({
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        phone: payload.phone,
        hotelId: payload.hotelId,
        hotelName: payload.hotelName,
        hotelAddress: payload.hotelAddress,
        nights: payload.nights,
        guests: payload.guests,
        rooms: payload.rooms,
        totalPrice: payload.totalPrice,
        roomDescription: payload.roomDescription,
        status: 'Confirmed',
        paid: false,
      })
    );
    expect(b).toHaveProperty('_id');

    // Email sent with correct link
    expect(sendBookingConfirmation).toHaveBeenCalledTimes(1);
    const [toEmail, bookingObj, url] = sendBookingConfirmation.mock.calls[0];
    expect(toEmail).toBe(payload.email);

    // bookingObj._id may be an ObjectId; compare as strings
    const sentId = String(bookingObj?._id || '');
    expect(sentId).toBe(String(b._id));

    expect(url).toContain(`/booking/confirmation?bookingId=${b._id}`);
  });

  test('400 when email is invalid (schema validation)', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Content-Type', 'application/json')
      .send({
        firstName: 'A',
        lastName: 'B',
        email: 'not-an-email',
        phone: '1',
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

  test('cancel either soft-cancels or hard-deletes and reflects in GET', async () => {
    // create
    const create = await request(app)
      .post('/api/bookings')
      .set('Content-Type', 'application/json')
      .send({
        firstName: 'C',
        lastName: 'D',
        email: 'c@example.com',
        phone: '999',
        hotelId: 'H1',
        hotelName: 'Hotel One',
        hotelAddress: 'Somewhere',
        checkIn: '2025-02-01',
        checkOut: '2025-02-03',
        nights: 2,
        guests: '2',
        rooms: '1',
        totalPrice: 200,
        roomDescription: 'Standard',
      });

    const id = create.body.bookingId;
    expect(id).toBeTruthy();

    // cancel
    const cancel = await request(app)
      .post(`/api/bookings/${id}/cancel`)
      .set('Content-Type', 'application/json')
      .send();

    expect(cancel.statusCode).toBe(200);

    if (cancel.body?.deleted) {
      // Hard delete path
      expect(cancel.body).toEqual(expect.objectContaining({ ok: true, deleted: true }));

      const get = await request(app).get(`/api/bookings/${id}`);
      expect(get.statusCode).toBe(404);
    } else {
      // Soft cancel path
      expect(cancel.body).toHaveProperty('booking.status', 'Cancelled');

      const get = await request(app).get(`/api/bookings/${id}`);
      expect(get.statusCode).toBe(200);
      expect(get.body).toHaveProperty('status', 'Cancelled');
    }
  });
});
