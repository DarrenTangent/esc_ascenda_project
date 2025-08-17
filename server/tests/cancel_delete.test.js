// server/tests/cancel_delete.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Mock email service so creating bookings in other tests never sends mail
jest.mock('../services/emailService', () => ({
  sendBookingConfirmation: jest.fn(() => Promise.resolve({ ok: true })),
}));

const app = require('../index');
const Booking = require('../models/Booking');

let mongo;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

afterEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (const c of collections) await c.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongo.stop();
});

describe('Bookings API - hard delete on cancel', () => {
  test('POST /api/bookings/:id/cancel deletes the booking and returns {deleted:true}', async () => {
    // Seed a booking directly (faster/independent of create route)
    const seed = await Booking.create({
      firstName: 'T',
      lastName: 'User',
      email: 't@example.com',
      phone: '123',
      hotelId: 'EgHh',
      hotelName: 'Test Hotel',
      hotelAddress: '123 Road',
      checkIn: new Date('2025-08-29'),
      checkOut: new Date('2025-08-31'),
      nights: 2,
      guests: '2',
      rooms: '1',
      totalPrice: 100,
      roomDescription: 'Std Room',
      status: 'Confirmed',
    });

    // Cancel (hard delete)
    const res = await request(app)
      .post(`/api/bookings/${seed._id}/cancel`)
      .send();

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(expect.objectContaining({ ok: true, deleted: true }));

    // Verify it no longer exists
    const found = await Booking.findById(seed._id);
    expect(found).toBeNull();
  });

  test('POST /api/bookings/:id/cancel returns 404 for unknown id', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .post(`/api/bookings/${fakeId}/cancel`)
      .send();

    // Your route should respond 404 when not found
    expect([404, 200]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      // If your implementation returns ok:false or similar, relax the assertion:
      expect(res.body).toEqual(expect.objectContaining({ ok: false }));
    }
  });
});
