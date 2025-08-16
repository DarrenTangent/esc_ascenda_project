// server/tests/payments_and_support.test.js
const request = require('supertest');

// --- Mock Stripe entirely inside the factory (no out-of-scope refs) ---
jest.mock('stripe', () => {
  const factory = jest.fn(() => {
    const create = jest.fn().mockResolvedValue({
      id: 'cs_test_123',
      url: 'https://stripe.test/session/cs_test_123',
    });
    const retrieve = jest.fn().mockResolvedValue({
      id: 'cs_test_123',
      payment_status: 'paid',
      payment_intent: 'pi_test_123',
    });

    const instance = { checkout: { sessions: { create, retrieve } } };

    // expose for assertions
    factory.__instance = instance;
    factory.__create = create;
    factory.__retrieve = retrieve;

    return instance;
  });
  return factory;
});

// --- Mock Booking model methods used by /payments/verify ---
jest.mock('../models/Booking', () => {
  const store = new Map();
  return {
    __store: store,
    findByIdAndUpdate: jest.fn(async (id, update) => {
      const before = store.get(id) || { _id: id };
      const after = { ...before, ...update };
      store.set(id, after);
      return after;
    }),
    findById: jest.fn(async (id) => store.get(id) || null),
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
    const body = {
      amount: 12300,
      hotelName: 'Test Hotel',
      email: 'user@example.com',
      bookingId: 'b_1',
    };

    const res = await request(app)
      .post('/api/payments/create-checkout-session')
      .set('Content-Type', 'application/json')
      .send(body);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('url');

    // Assert Stripe call payload
    expect(Stripe.__create).toHaveBeenCalledTimes(1);
    const arg = Stripe.__create.mock.calls[0][0];

    expect(arg).toHaveProperty('mode', 'payment');
    expect(arg).toHaveProperty('customer_email', body.email);
    expect(arg.success_url).toContain(`/booking/confirmation?bookingId=${body.bookingId}`);
    expect(arg.line_items?.[0]?.price_data?.unit_amount).toBe(body.amount);
  });

  test('POST /api/payments/verify marks booking paid (and sets Confirmed if route does)', async () => {
    const res = await request(app)
      .post('/api/payments/verify')
      .set('Content-Type', 'application/json')
      .send({ bookingId: 'b_1', session_id: 'cs_test_123' });

    expect(res.statusCode).toBe(200);

    // Booking updated
    expect(Booking.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    const [, update] = Booking.findByIdAndUpdate.mock.calls[0];

    // Always expect paid:true
    expect(update).toHaveProperty('paid', true);

    // Some implementations set status here; if present, it must be Confirmed
    if (Object.prototype.hasOwnProperty.call(update, 'status')) {
      expect(update.status).toBe('Confirmed');
    }

    // Stripe retrieve used
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

    // Nodemailer mock is set in tests/setup.js and exposes sendMail mock globally
    const send = global.__sendMailMock;
    expect(send).toHaveBeenCalledTimes(1);
    const mailArg = send.mock.calls[0][0];

    // To address + reply-to
    expect(mailArg.to).toBe(process.env.SUPPORT_INBOX || 'support@example.com');
    const replyTo =
      mailArg.replyTo ||
      mailArg.reply_to ||
      (mailArg.headers && (mailArg.headers.replyTo || mailArg.headers['reply-to']));
    expect(replyTo).toBe(body.email);

    // Body content can be text or html depending on your route implementation
    const bodyContent = mailArg.text || mailArg.html || '';
    expect(bodyContent).toEqual(expect.stringContaining(body.message));
  });
});
