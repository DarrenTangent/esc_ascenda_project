const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongo;
let app;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  app = require('../index');
});

afterEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (const c of collections) await c.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongo.stop();
});

describe('Bookings API - Concurrency', () => {
  test('handles multiple concurrent submissions and persists all', async () => {
    const mk = (i) => ({
      firstName: `User${i}`,
      lastName: `Test${i}`,
      email: `user${i}@example.com`,
      phone: `9000000${i}`,
      specialRequests: '',
      hotelId: 'EgHh',
      hotelName: 'Test Hotel',
      hotelAddress: '123 Road',
      checkIn: '2025-08-29',
      checkOut: '2025-08-31',
      nights: 2,
      guests: '2',
      rooms: '1',
      totalPrice: 100 + i,
      roomDescription: `Room ${i}`,
    });

    const payloads = [1, 2, 3, 4, 5].map(mk);

    const results = await Promise.all(
      payloads.map((p) =>
        request(app)
          .post('/api/bookings')
          .set('Content-Type', 'application/json')
          .send(p)
      )
    );

    results.forEach((r) => expect([200, 201]).toContain(r.statusCode));

    const Booking = require('../models/Booking');
    const count = await Booking.countDocuments({});
    expect(count).toBe(payloads.length);
  });
});
