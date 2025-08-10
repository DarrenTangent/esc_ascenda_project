import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import BookingForm from '../components/BookingForm';
import { useRouter } from 'next/router';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

describe('BookingForm Component', () => {
  beforeEach(() => {
    window.alert = jest.fn();
    jest.clearAllMocks();
  });

  test('renders all input fields and button', () => {
    render(<BookingForm />);

    expect(screen.getByPlaceholderText('First Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Last Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Phone')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Special Requests')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Card Number')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('MM/YY')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('CVV')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Billing Address')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /book now/i })).toBeInTheDocument();
  });

  test('shows alert if fields are missing on submit', () => {
    render(<BookingForm />);
    fireEvent.click(screen.getByRole('button', { name: /book now/i }));
    expect(window.alert).toHaveBeenCalledWith('Please fill in all required fields.');
  });

  test('shows alert if email is invalid', () => {
    render(<BookingForm />);

    fireEvent.change(screen.getByPlaceholderText('First Name'), { target: { value: 'Jane' } });
    fireEvent.change(screen.getByPlaceholderText('Last Name'),  { target: { value: 'Doe' } });
    fireEvent.change(screen.getByPlaceholderText('Email'),      { target: { value: 'invalid-email' } }); // invalid
    fireEvent.change(screen.getByPlaceholderText('Phone'),      { target: { value: '12345678' } });
    fireEvent.change(screen.getByPlaceholderText('Special Requests'), { target: { value: 'No requests' } });
    fireEvent.change(screen.getByPlaceholderText('Card Number'), { target: { value: '4111111111111111' } });
    fireEvent.change(screen.getByPlaceholderText('MM/YY'),       { target: { value: '12/25' } });
    fireEvent.change(screen.getByPlaceholderText('CVV'),         { target: { value: '123' } });
    fireEvent.change(screen.getByPlaceholderText('Billing Address'), { target: { value: '123 Street' } });

    fireEvent.click(screen.getByRole('button', { name: /book now/i }));
    expect(window.alert).toHaveBeenCalledWith('Please enter a valid email address.');
  });

  test('submits form and redirects to /booking/[id]', async () => {
    const mockPush = jest.fn();
    useRouter.mockReturnValue({ push: mockPush });

    // Mock fetch to return the booking id JSON the component expects
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ booking: { _id: '123abc' } }),
      })
    );

    render(<BookingForm />);

    fireEvent.change(screen.getByPlaceholderText('First Name'), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText('Last Name'),  { target: { value: 'Doe' } });
    fireEvent.change(screen.getByPlaceholderText('Email'),      { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Phone'),      { target: { value: '12345678' } });
    fireEvent.change(screen.getByPlaceholderText('Special Requests'), { target: { value: 'None' } });
    fireEvent.change(screen.getByPlaceholderText('Card Number'), { target: { value: '4111111111111111' } });
    fireEvent.change(screen.getByPlaceholderText('MM/YY'),       { target: { value: '12/25' } });
    fireEvent.change(screen.getByPlaceholderText('CVV'),         { target: { value: '123' } });
    fireEvent.change(screen.getByPlaceholderText('Billing Address'), { target: { value: '123 Street' } });

    fireEvent.click(screen.getByRole('button', { name: /book now/i }));

    // Redirect happens after we parse response.json()
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/booking/123abc'));
    // Since we now redirect, we should NOT show a success alert
    expect(window.alert).not.toHaveBeenCalledWith('Booking submitted');
  });
});
