import { render, screen } from '@testing-library/react';
import BookingDetailsPage from '../pages/booking/[id]';
import { useRouter } from 'next/router';
import React from 'react';
import '@testing-library/jest-dom';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

describe('BookingDetailsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading initially', () => {
    useRouter.mockReturnValue({ query: { id: '123abc' }, isReady: true });

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}), // dummy response
      })
    );

    render(<BookingDetailsPage />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test('renders booking details when fetched', async () => {
    useRouter.mockReturnValue({ query: { id: '123abc' }, isReady: true });

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            phone: '12345678',
            specialRequests: 'None',
            billingAddress: '123 Street',
            cardNumber: '4111111111111111',
          }),
      })
    );

    render(<BookingDetailsPage />);
    expect(await screen.findByText(/Booking Details/i)).toBeInTheDocument();
    expect(await screen.findByText(/John Doe/i)).toBeInTheDocument();
    expect(await screen.findByText(/john@example.com/i)).toBeInTheDocument();
  });

  test('renders error message when fetch fails', async () => {
    useRouter.mockReturnValue({ query: { id: 'bad-id' }, isReady: true });

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Booking not found' }),
      })
    );

    render(<BookingDetailsPage />);
    
    // This is what is shown in your component when fetch fails
    expect(await screen.findByText(/Error fetching booking/i)).toBeInTheDocument();
  });
});
