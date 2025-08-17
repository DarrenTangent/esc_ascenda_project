import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock Next.js App Router hooks
jest.mock('next/navigation', () => ({
  useRouter: jest.fn().mockReturnValue({ push: jest.fn() }),
  useParams: jest.fn(),
  useSearchParams: jest.fn(),
}));

import { useRouter, useParams, useSearchParams } from 'next/navigation';

// The page that renders your BookingForm
import BookingForm from '../app/booking/[id]/page';

// Helpers
const mockParams = { id: 'hotel123' };
const makeSearchParams = (map: Record<string, string | null>) => ({
  get: (k: string) => (k in map ? map[k] : null),
});

// Fill by label; if label isn’t found, fall back to name
function fillByLabelOrName(label: RegExp, name: string, value: string) {
  const labeled = screen.queryByLabelText(label);
  if (labeled) {
    fireEvent.change(labeled, { target: { value } });
    return;
  }
  const el = document.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
    `input[name="${name}"], textarea[name="${name}"], select[name="${name}"]`
  );
  if (!el) throw new Error(`Could not find input for ${name}`);
  fireEvent.change(el, { target: { value } });
}

describe('BookingForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });
    (useParams as jest.Mock).mockReturnValue(mockParams);
    (useSearchParams as jest.Mock).mockReturnValue(
      makeSearchParams({
        destination_id: 'dest1',
        checkin: '2025-08-29',
        checkout: '2025-08-30',
        guests: '2',
        rooms: '1',
        room_desc: 'Family Room, Window', // description passed from hotel page
        // room_price can be omitted; component will fall back to fetched price
      })
    );

    // Reset fetch mock
    global.fetch = jest.fn();
    // silence jsdom alert error logs in failure test
    // @ts-ignore
    window.alert = jest.fn();
  });

  test('renders booking summary after hotel + price load', async () => {
    // 1) GET hotel details
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'hotel123',
          name: 'Test Hotel',
          address: '123 Street',
          rating: 4,
        }),
      })
      // 2) GET price data
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          price: 200,
          rooms: [{ roomDescription: 'Family Room, Window', price: 200 }],
          freeCancellation: true,
        }),
      });

    render(<BookingForm />);

    expect(await screen.findByText(/Booking Summary/i)).toBeInTheDocument();
    expect(screen.getByText(/Test Hotel/i)).toBeInTheDocument();
    expect(screen.getByText(/Total:/i)).toBeInTheDocument();
  });

  test('submits: sends bookingDraft to Stripe session endpoint', async () => {
    // 1) GET hotel details
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'hotel123',
          name: 'Test Hotel',
          address: '123 Street',
          rating: 4,
        }),
      })
      // 2) GET price data
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          price: 150,
          rooms: [{ roomDescription: 'Family Room, Window', price: 150 }],
        }),
      })
      // 3) POST /api/payments/create-checkout-session -> returns stripe URL
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ url: 'https://stripe.test/session/xyz' }),
      });

    render(<BookingForm />);

    // Wait for form button to appear before typing
    await screen.findByRole('button', { name: /Book Now/i });

    // Fill only the fields that exist in the form
    fillByLabelOrName(/First Name/i, 'firstName', 'John');
    fillByLabelOrName(/Last Name/i, 'lastName', 'Doe');
    fillByLabelOrName(/Email/i, 'email', 'john@example.com');
    fillByLabelOrName(/Phone/i, 'phone', '12345678');
    fillByLabelOrName(/Special Requests/i, 'specialRequests', 'N/A');

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /Book Now/i }));

    // Expect 3 calls in total (hotel, price, stripe session)
    await waitFor(() => {
      expect((global.fetch as jest.Mock).mock.calls.length).toBe(3);
    });

    const stripeCall = (global.fetch as jest.Mock).mock.calls[2];
    expect(stripeCall[0]).toMatch(/\/api\/payments\/create-checkout-session$/);

    const postedBody = JSON.parse(stripeCall[1].body);
    expect(postedBody).toEqual(
      expect.objectContaining({
        amount: expect.any(Number),
        email: 'john@example.com',
        hotelName: 'Test Hotel',
      })
    );
    // bookingDraft is included now
    expect(postedBody.bookingDraft).toEqual(
      expect.objectContaining({
        roomDescription: 'Family Room, Window',
      })
    );

    // Optional: also assert the returned URL shape
    const stripeRes = await (global.fetch as jest.Mock).mock.results[2].value;
    expect((await stripeRes.json()).url).toBe('https://stripe.test/session/xyz');
  });

  test('handles Stripe creation failure gracefully', async () => {
    // hotel
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'hotel123',
          name: 'Test Hotel',
          address: '123 Street',
        }),
      })
      // price
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          price: 200,
          rooms: [{ roomDescription: 'X', price: 200 }],
        }),
      })
      // stripe (fail)
      .mockResolvedValueOnce({ ok: false, text: async () => 'bad' });

    render(<BookingForm />);

    // Wait for form
    await screen.findByRole('button', { name: /Book Now/i });

    // Fill minimal required fields
    fillByLabelOrName(/First Name/i, 'firstName', 'J');
    fillByLabelOrName(/Last Name/i, 'lastName', 'D');
    fillByLabelOrName(/Email/i, 'email', 'j@d.com');
    fillByLabelOrName(/Phone/i, 'phone', '1');

    fireEvent.click(screen.getByRole('button', { name: /Book Now/i }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(expect.stringMatching(/Payment initiation failed/i));
    });
  });
});
