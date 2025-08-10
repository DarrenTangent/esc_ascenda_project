import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import BookingDetailsPage from '../pages/booking/[id]';
import { useRouter } from 'next/router';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));

const mockRouter = (id) => useRouter.mockReturnValue({ isReady: true, query: { id } });

describe('BookingDetailsPage', () => {
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {}); // silence act() warning
  });
  afterAll(() => console.error.mockRestore());

  test('renders booking details on success', async () => {
    mockRouter('123abc');
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({
          firstName: 'John', lastName: 'Doe', email: 'john@example.com',
          phone: '12345678', specialRequests: 'None', billingAddress: '123 Street',
          cardNumber: '4111111111111111',
        }),
      })
    );

    render(<BookingDetailsPage />);
    expect(await screen.findByText(/Booking Details/i)).toBeInTheDocument();
    expect(screen.getByText(/John Doe/)).toBeInTheDocument();
    expect(screen.getByText(/john@example.com/)).toBeInTheDocument();
  });

  test('shows error when booking not found', async () => {
    mockRouter('bad-id');
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: false, status: 404, json: async () => ({ error: 'Booking not found' }) })
    );

    render(<BookingDetailsPage />);
    await waitFor(() => expect(screen.getByText(/Error fetching booking/i)).toBeInTheDocument());
  });
});
