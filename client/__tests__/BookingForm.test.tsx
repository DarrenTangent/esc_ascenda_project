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

// Import the page that renders the form (adjust if your path differs)
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
      })
    );

    // Reset fetch mock
    global.fetch = jest.fn();
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

  test('submits booking, posts roomDescription, and calls Stripe session', async () => {
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
      // 3) POST /api/bookings -> returns booking id
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ booking: { _id: 'bkg_1' } }),
      })
      // 4) POST /api/payments/create-checkout-session -> returns stripe URL
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ url: 'https://stripe.test/session/xyz' }),
      });

    render(<BookingForm />);

    // Wait for form button to appear before typing
    await screen.findByRole('button', { name: /Book Now/i });

    // Fill only the fields that still exist in the form
    fillByLabelOrName(/First Name/i, 'firstName', 'John');
    fillByLabelOrName(/Last Name/i, 'lastName', 'Doe');
    fillByLabelOrName(/Email/i, 'email', 'john@example.com');
    fillByLabelOrName(/Phone/i, 'phone', '12345678');
    fillByLabelOrName(/Special Requests/i, 'specialRequests', 'N/A');

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /Book Now/i }));

    // Expect the 3rd fetch to be /api/bookings and include roomDescription
    await waitFor(() => {
      expect((global.fetch as jest.Mock).mock.calls.length).toBeGreaterThanOrEqual(3);
    });

    const postBookingCall = (global.fetch as jest.Mock).mock.calls[2]; // 0: hotel, 1: price, 2: bookings
    expect(postBookingCall[0]).toMatch(/\/api\/bookings$/);
    const postedBody = JSON.parse(postBookingCall[1].body);
    expect(postedBody.roomDescription).toBe('Family Room, Window');

    // Expect Stripe session call (4th call)
    const stripeCall = (global.fetch as jest.Mock).mock.calls[3];
    expect(stripeCall[0]).toMatch(/\/api\/payments\/create-checkout-session$/);

    // Optional: also assert the returned URL
    const stripeRes = await (global.fetch as jest.Mock).mock.results[3].value;
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
      // bookings
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ booking: { _id: 'bkg_1' } }),
      })
      // stripe (fail)
      .mockResolvedValueOnce({ ok: false, text: async () => 'bad' });

    // mock alert
    window.alert = jest.fn();

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
