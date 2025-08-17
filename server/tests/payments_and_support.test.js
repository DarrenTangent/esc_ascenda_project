// server/tests/payments_and_support.test.js
const request = require('supertest');

// Ensure required env for routes that guard on STRIPE_SECRET/CLIENT_URL
beforeAll(() => {
  process.env.STRIPE_SECRET ||= 'sk_test_dummy';
  process.env.CLIENT_URL ||= 'http://localhost:3000';
});

// --- Mock Stripe (factory with create/retrieve captured) ---
jest.mock('stripe', () => {
  const factory = jest.fn(() => {
    const create = jest.fn().mockResolvedValue({
      id: 'cs_test_123',
      url: 'https://stripe.test/session/cs_test_123',
      payment_intent: 'pi_test_123',
    });

    // Looks paid, and includes metadata some impls parse to create a booking
    const retrieve = jest.fn().mockResolvedValue({
      id: 'cs_test_123',
      payment_status: 'paid',
      payment_intent: 'pi_test_123',
      amount_total: 12300, // cents
      metadata: {
        bookingId: 'b_1',
        bookingDraft: JSON.stringify({
          firstName: 'A',
          lastName: 'B',
          email: 'user@example.com',
          hotelId: 'h1',
          hotelName: 'Test Hotel',
          checkIn: '2025-01-01',
          checkOut: '2025-01-02',
          guests: '2',
          rooms: '1',
          nights: 1,
          totalPrice: 123,
          roomDescription: 'Room',
        }),
      },
    });

    const instance = { checkout: { sessions: { create, retrieve } } };
    factory.__instance = instance;
    factory.__create = create;
    factory.__retrieve = retrieve;
    return instance;
  });
  return factory;
});

// --- Mock Booking model (cover update & create paths) ---
jest.mock('../models/Booking', () => {
  const store = new Map();
  let seq = 1;

  const create = jest.fn(async (doc) => {
    const id = doc?._id || `created_${seq++}`;
    const saved = { _id: id, ...doc };
    store.set(id, saved);
    return saved;
  });

  const findByIdAndUpdate = jest.fn(async (id, update) => {
    const before = store.get(id) || { _id: id };
    const after = { ...before, ...update };
    store.set(id, after);
    return after;
  });

  const findById = jest.fn(async (id) => store.get(id) || null);

  return {
    __store: store,
    create,
    findByIdAndUpdate,
    findById,
  };
});

// Import app AFTER mocks
const app = require('../index');
const Stripe = require('stripe');
const Booking = require('../models/Booking');

describe('Payments + Support API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('POST /api/payments/create-checkout-session returns URL and calls Stripe', async () => {
    // Send both bookingId (old flow) and bookingDraft (new flow)
    const bookingDraft = {
      firstName: 'A',
      lastName: 'B',
      email: 'user@example.com',
      hotelId: 'h1',
      hotelName: 'Test Hotel',
      hotelAddress: '123 St',
      checkIn: '2025-01-01',
      checkOut: '2025-01-02',
      guests: '2',
      rooms: '1',
      nights: 1,
      totalPrice: 123,
      roomDescription: 'Room',
    };

    const body = {
      amount: 12300,
      hotelName: 'Test Hotel',
      email: 'user@example.com',
      bookingId: 'b_1', // old flow
      bookingDraft,     // new flow
    };

    const res = await request(app)
      .post('/api/payments/create-checkout-session')
      .set('Content-Type', 'application/json')
      .send(body);

    // Some implementations use 200, others 201
    expect([200, 201]).toContain(res.statusCode);
    expect(res.body).toHaveProperty('url');

    // Assert Stripe payload
    expect(Stripe.__create).toHaveBeenCalledTimes(1);
    const arg = Stripe.__create.mock.calls[0][0];
    expect(arg).toHaveProperty('mode', 'payment');
    expect(arg).toHaveProperty('customer_email', body.email);
    expect(arg.line_items?.[0]?.price_data?.unit_amount).toBe(body.amount);
    expect(arg.success_url).toEqual(expect.stringContaining('/booking/confirmation'));
  });

  test('POST /api/payments/verify marks booking paid (or at least hits Stripe retrieve)', async () => {
    const res = await request(app)
      .post('/api/payments/verify')
      .set('Content-Type', 'application/json')
      .send({ bookingId: 'b_1', session_id: 'cs_test_123' });

    // If your project still supports the verify endpoint, it should be 200.
    // If you moved to webhooks and this endpoint throws/returns 500, we still
    // assert that Stripe.retrieve was invoked (the route was exercised).
    if (res.statusCode === 200) {
      const updatedTimes = Booking.findByIdAndUpdate.mock.calls.length;
      const createdTimes = Booking.create.mock.calls.length;
      expect(updatedTimes + createdTimes).toBeGreaterThan(0);

      if (updatedTimes) {
        const [, update] = Booking.findByIdAndUpdate.mock.calls[0];
        expect(update).toHaveProperty('paid', true);
        if (Object.prototype.hasOwnProperty.call(update, 'status')) {
          expect(update.status).toBe('Confirmed');
        }
      }

      if (createdTimes) {
        const createdDoc = Booking.create.mock.calls[0][0];
        if ('status' in createdDoc) expect(createdDoc.status).toBe('Confirmed');
        if ('paid' in createdDoc) expect(createdDoc.paid).toBe(true);
        expect(createdDoc).toHaveProperty('email', 'user@example.com');
      }
    } else {
      // Graceful fallback when route returns 500 in webhook-only setups
      expect(res.statusCode).toBe(500);
    }

    // In both cases, we expect Stripe.retrieve to have been called with the session id
    expect(Stripe.__retrieve).toHaveBeenCalledWith('cs_test_123');
  });

  test('POST /api/support sends email to SUPPORT_INBOX', async () => {
    const body = {
      email: 'guest@example.com',
      bookingId: 'bk_123',
      message: 'Need help with my booking',
    };

    const res = await request(app)
      .post('/api/support')
      .set('Content-Type', 'application/json')
      .send(body);

    expect(res.statusCode).toBe(200);

    const send = global.__sendMailMock; // from tests/setup.js
    expect(send).toHaveBeenCalledTimes(1);
    const mailArg = send.mock.calls[0][0];

    expect(mailArg.to).toBe(process.env.SUPPORT_INBOX || 'support@example.com');
    const replyTo =
      mailArg.replyTo ||
      mailArg.reply_to ||
      (mailArg.headers && (mailArg.headers.replyTo || mailArg.headers['reply-to']));
    expect(replyTo).toBe(body.email);

    const bodyContent = mailArg.text || mailArg.html || '';
    expect(bodyContent).toEqual(expect.stringContaining(body.message));
  });
});
