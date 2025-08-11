import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import BookingForm from '../components/BookingForm';
import { useRouter } from 'next/router';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));

const fillForm = (overrides = {}) => {
  const vals = {
    firstName: 'John', lastName: 'Doe', email: 'john@example.com', phone: '12345678',
    specialRequests: 'None', cardNumber: '4111111111111111', expiry: '12/25', cvv: '123',
    billingAddress: '123 Street', ...overrides,
  };
  const type = (ph, v) => fireEvent.change(screen.getByPlaceholderText(ph), { target: { value: v } });
  type('First Name', vals.firstName);
  type('Last Name', vals.lastName);
  type('Email', vals.email);
  type('Phone', vals.phone);
  type('Special Requests', vals.specialRequests);
  type('Card Number', vals.cardNumber);
  type('MM/YY', vals.expiry);
  type('CVV', vals.cvv);
  type('Billing Address', vals.billingAddress);
};

describe('BookingForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.alert = jest.fn();
    useRouter.mockReturnValue({ push: jest.fn() });
  });

  test('renders inputs + submit', () => {
    render(<BookingForm />);
    ['First Name','Last Name','Email','Phone','Special Requests','Card Number','MM/YY','CVV','Billing Address']
      .forEach(ph => expect(screen.getByPlaceholderText(ph)).toBeInTheDocument());
    expect(screen.getByRole('button', { name: /book now/i })).toBeInTheDocument();
  });

  test('alerts when required fields missing', () => {
    render(<BookingForm />);
    fireEvent.click(screen.getByRole('button', { name: /book now/i }));
    expect(window.alert).toHaveBeenCalledWith('Please fill in all required fields.');
  });

  test('alerts when email invalid', () => {
    render(<BookingForm />);
    fillForm({ email: 'bad' });
    fireEvent.click(screen.getByRole('button', { name: /book now/i }));
    expect(window.alert).toHaveBeenCalledWith('Please enter a valid email address.');
  });

  test('redirects to /booking/[id] on success', async () => {
    const push = jest.fn();
    useRouter.mockReturnValue({ push });
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({ booking: { _id: '123abc' } }) })
    );

    render(<BookingForm />);
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: /book now/i }));

    await waitFor(() => expect(push).toHaveBeenCalledWith('/booking/123abc'));
    expect(window.alert).not.toHaveBeenCalledWith('Booking submitted');
  });
});