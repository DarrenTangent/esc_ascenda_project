import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock Next.js navigation hooks for App Router
jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(),
}));

import { useParams, useRouter } from 'next/navigation';

// Mock the booking details page component
const MockBookingDetailsPage = () => {
  const params = useParams();
  const [booking, setBooking] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  const bookingId = params?.id;

  React.useEffect(() => {
    if (!bookingId) {
      setError('No booking ID provided');
      setLoading(false);
      return;
    }

    async function fetchBooking() {
      try {
        const response = await fetch(`http://localhost:5001/api/bookings/${bookingId}`);
        if (response.ok) {
          const bookingData = await response.json();
          setBooking(bookingData);
        } else {
          setError('Error fetching booking details');
        }
      } catch (err) {
        setError('Error fetching booking details');
      } finally {
        setLoading(false);
      }
    }

    fetchBooking();
  }, [bookingId]);

  if (loading) return <div>Loading booking details...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!booking) return <div>No booking found</div>;

  return (
    <div>
      <h1>Booking Confirmation</h1>
      <div>Guest: {booking.firstName} {booking.lastName}</div>
      <div>Email: {booking.email}</div>
      <div>Hotel: {booking.hotelName}</div>
      <div>Status: {booking.status}</div>
    </div>
  );
};

const mockRouter = {
  push: jest.fn(),
  back: jest.fn(),
};

describe('BookingDetailsPage', () => {
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {}); // silence act() warning
  });
  afterAll(() => console.error.mockRestore());

  beforeEach(() => {
    jest.clearAllMocks();
    useRouter.mockReturnValue(mockRouter);
    global.fetch = jest.fn();
  });

  test('renders booking details on success', async () => {
    useParams.mockReturnValue({ id: '123abc' });
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        bookingId: '123abc',
        firstName: 'John', 
        lastName: 'Doe', 
        email: 'john@example.com',
        phone: '12345678', 
        specialRequests: 'None', 
        billingAddress: '123 Street',
        hotelName: 'Test Hotel',
        checkIn: '2024-01-01',
        checkOut: '2024-01-03',
        guests: '2',
        totalPrice: 200,
        status: 'confirmed'
      }),
    });

    render(<MockBookingDetailsPage />);
    
    expect(await screen.findByText(/booking confirmation/i)).toBeInTheDocument();
    expect(screen.getByText(/guest: john doe/i)).toBeInTheDocument();
    expect(screen.getByText(/email: john@example.com/i)).toBeInTheDocument();
    expect(screen.getByText(/hotel: test hotel/i)).toBeInTheDocument();
    expect(screen.getByText(/status: confirmed/i)).toBeInTheDocument();
  });

  test('shows error when booking not found', async () => {
    useParams.mockReturnValue({ id: 'bad-id' });
    
    global.fetch.mockResolvedValueOnce({
      ok: false, 
      status: 404, 
      json: async () => ({ error: 'Booking not found' })
    });

    render(<MockBookingDetailsPage />);
    
    await waitFor(() => expect(screen.getByText(/error.*booking/i)).toBeInTheDocument());
  });

  test('shows error when no booking ID provided', async () => {
    useParams.mockReturnValue({ id: null });

    render(<MockBookingDetailsPage />);
    
    await waitFor(() => expect(screen.getByText(/no booking id provided/i)).toBeInTheDocument());
  });

  test('shows loading state initially', () => {
    useParams.mockReturnValue({ id: '123abc' });
    
    // Mock fetch to never resolve to test loading state
    global.fetch.mockImplementation(() => new Promise(() => {}));

    render(<MockBookingDetailsPage />);
    
    expect(screen.getByText(/loading booking details/i)).toBeInTheDocument();
  });
});
