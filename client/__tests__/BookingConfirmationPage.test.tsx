import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock next/navigation (App Router)
jest.mock('next/navigation', () => ({
  useRouter: jest.fn().mockReturnValue({ push: jest.fn() }),
  useSearchParams: jest.fn(),
}));

import { useSearchParams } from 'next/navigation';

// Import (or inline-mock) your actual page component
// If your file path differs, adjust the import:
import BookingConfirmationPage from '../app/booking/confirmation/page';

describe('BookingConfirmationPage', () => {
  const makeSearchParams = (map: Record<string, string | null>) => ({
    get: (k: string) => (k in map ? map[k] : null),
    // minimal shape for what the component uses
  });

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  test('loads and renders booking details with roomDescription', async () => {
    // Provide bookingId only (no session_id)
    (useSearchParams as jest.Mock).mockReturnValue(
      makeSearchParams({ bookingId: 'abc123', session_id: null })
    );

    // Mock GET /bookings/:id
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        _id: 'abc123',
        hotelName: 'AMOY by Far East Hospitality',
        checkIn: '2025-08-29T00:00:00.000Z',
        checkOut: '2025-08-30T00:00:00.000Z',
        guests: '2',
        rooms: '1',
        totalPrice: 379.29,
        nights: 1,
        firstName: 'B',
        lastName: 'Singh',
        email: 'balrajthetanker0@gmail.com',
        paid: true,
        createdAt: '2025-08-12T19:28:27.759Z',
        roomDescription: 'Family Room, Window',
      }),
    });

    render(<BookingConfirmationPage />);

    // header
    expect(await screen.findByText(/Booking Confirmed!/i)).toBeInTheDocument();

    // key fields
    expect(screen.getByText(/AMOY by Far East Hospitality/i)).toBeInTheDocument();
    expect(screen.getByText(/Family Room, Window/i)).toBeInTheDocument(); // roomDescription
    expect(screen.getByText(/Total Amount/i)).toBeInTheDocument();
  });

  test('posts verify if session_id present, then fetches booking', async () => {
    (useSearchParams as jest.Mock).mockReturnValue(
      makeSearchParams({ bookingId: 'abc123', session_id: 'sess_789' })
    );

    // 1st fetch: POST /payments/verify
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true }) });
    // 2nd fetch: GET /bookings/:id
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ _id: 'abc123', hotelName: 'Test', firstName: 'A', lastName: 'B', email: 'a@b.c', guests: '1', rooms: '1', totalPrice: 1, nights: 1, createdAt: '2025-08-12T00:00:00.000Z', paid: true, checkIn: '2025-08-29', checkOut: '2025-08-30', roomDescription: 'Std' }),
    });

    render(<BookingConfirmationPage />);

    await waitFor(() => expect(screen.getByText(/Booking Confirmed!/i)).toBeInTheDocument());
    // verify was called
    expect((global.fetch as jest.Mock).mock.calls[0][0]).toMatch(/\/payments\/verify$/);
  });

  test('shows error when no booking ID provided', async () => {
    (useSearchParams as jest.Mock).mockReturnValue(makeSearchParams({ bookingId: null, session_id: null }));

    render(<BookingConfirmationPage />);

    expect(await screen.findByText(/Booking Error/i)).toBeInTheDocument();
    expect(screen.getByText(/No booking ID provided/i)).toBeInTheDocument();
  });

  test('shows error when booking fetch fails', async () => {
    (useSearchParams as jest.Mock).mockReturnValue(makeSearchParams({ bookingId: 'bad', session_id: null }));

    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, json: async () => ({ error: 'Booking not found' }) });

    render(<BookingConfirmationPage />);

    expect(await screen.findByText(/Booking Error/i)).toBeInTheDocument();
  });

  test('shows loading spinner initially', async () => {
    (useSearchParams as jest.Mock).mockReturnValue(
        makeSearchParams({ bookingId: 'abc123', session_id: null })
    );

    // keep the promise pending to simulate loading
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(<BookingConfirmationPage />);

    expect(await screen.findByRole('status')).toBeInTheDocument();
    });

});
