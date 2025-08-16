import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn().mockReturnValue({ push: jest.fn() }),
  useSearchParams: jest.fn(),
}));
import { useRouter, useSearchParams } from 'next/navigation';

import Page from '../app/booking/confirmation/page'; // adjust path if needed

const makeSearchParams = (m: Record<string, string | null>) => ({
  get: (k: string) => (k in m ? m[k] : null),
});

describe('BookingConfirmation cancel flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });
    (useSearchParams as jest.Mock).mockReturnValue(
      makeSearchParams({ bookingId: 'bkg_123', session_id: null })
    );

    // GET booking, then POST cancel (hard delete)
    global.fetch = jest.fn()
      // GET /bookings/:id
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          _id: 'bkg_123',
          hotelName: 'Test',
          checkIn: '2025-08-29',
          checkOut: '2025-08-30',
          guests: '2',
          rooms: '1',
          totalPrice: 100,
          nights: 1,
          firstName: 'A',
          lastName: 'B',
          email: 'a@b.com',
          status: 'Confirmed',
          createdAt: '2025-06-01T00:00:00.000Z',
          roomDescription: 'X',
        }),
      })
      // POST /bookings/:id/cancel
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true, deleted: true }),
      });

    // confirm dialog
    window.confirm = jest.fn(() => true);
  });

  it('deletes then redirects home', async () => {
    render(<Page />);

    // wait for page
    await screen.findByText(/Booking Information/i);

    fireEvent.click(screen.getByRole('button', { name: /Cancel Booking/i }));

    await waitFor(() => {
      const { push } = useRouter() as any;
      expect(push).toHaveBeenCalledWith('/');
    });
  });
});
