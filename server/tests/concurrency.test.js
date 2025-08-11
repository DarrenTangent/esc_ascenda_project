const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
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

describe('Bookings API - Concurrency', () => {
  test('should handle multiple concurrent submissions and persist all', async () => {
    const mk = (i) => ({
      firstName: `User${i}`,
      lastName: `Test${i}`,
      email: `user${i}@example.com`,
      phone: `9000000${i}`,
      specialRequests: '',
      cardNumber: '4111111111111111',
      expiry: '11/27',
      cvv: '123',
      billingAddress: `Blk ${i} Example, Singapore`,
    });

    const payloads = [1,2,3,4,5].map(mk);

    const results = await Promise.all(
      payloads.map(p => request(app).post('/api/bookings').send(p))
    );

    results.forEach(r => expect([200, 201]).toContain(r.statusCode));

    const count = await Booking.countDocuments({});
    expect(count).toBe(payloads.length);
  });
});
