const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../index');

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

describe('Bookings API - Security (XML / SQL-like)', () => {
  test('should 415 for XML payload (reject non-JSON bodies)', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Content-Type', 'application/xml')
      .send(`<booking><firstName>&xxe;</firstName></booking>`);
    expect(res.statusCode).toBe(415);
  });

  test('should reject SQL-like injection in text fields', async () => {
    const payload = {
      firstName: "' OR 1=1 --",
      lastName: "Lee",
      email: "x@example.com",
      phone: "91234567",
      specialRequests: "DROP TABLE bookings;",
      cardNumber: "4111111111111111",
      expiry: "12/27",
      cvv: "123",
      billingAddress: "3 Road, Singapore"
    };
    const res = await request(app).post('/api/bookings').send(payload);
    // Expect 400 if you map validation errors; 500 if you throw generic error
    expect([400, 500]).toContain(res.statusCode);
  });
});
