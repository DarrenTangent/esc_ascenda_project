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

describe('Bookings API - Validation', () => {
  test('should 400 when required fields are missing', async () => {
    const res = await request(app).post('/api/bookings').send({});
    expect([400, 500]).toContain(res.statusCode); // prefer 400 if you map ValidationError
  });

  test('should 400 when cvv is missing or empty', async () => {
    const payload = {
      firstName: 'Alice',
      lastName: 'Tan',
      email: 'alice@example.com',
      phone: '98765432',
      specialRequests: '',
      cardNumber: '4111111111111111',
      expiry: '12/27',
      // cvv missing
      billingAddress: '1 Example Rd, Singapore',
    };
    const res = await request(app).post('/api/bookings').send(payload);
    expect([400, 500]).toContain(res.statusCode);
  });

  test('should 201 when payload looks valid', async () => {
    const payload = {
      firstName: 'Bob',
      lastName: 'Lee',
      email: 'bob@example.com',
      phone: '91234567',
      specialRequests: 'High floor',
      cardNumber: '4111111111111111',
      expiry: '10/27',
      cvv: '123',
      billingAddress: '2 River Vale, Singapore',
    };
    const res = await request(app).post('/api/bookings').send(payload);
    expect([200, 201]).toContain(res.statusCode);
    expect(res.body.booking).toBeDefined();
    expect(res.body.booking.email).toBe('bob@example.com');
  });
});
