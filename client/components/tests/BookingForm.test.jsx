import { render, screen, fireEvent } from '@testing-library/react';
import BookingForm from '../BookingForm';
import React from 'react';


describe('BookingForm Component', () => {
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
    window.alert = jest.fn(); // mock alert
    render(<BookingForm />);
    fireEvent.click(screen.getByRole('button', { name: /book now/i }));
    expect(window.alert).toHaveBeenCalledWith('Please fill in all required fields.');
  });

  test('submits form when all fields are filled', async () => {
    window.alert = jest.fn();
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: true })
    );

    render(<BookingForm />);

    fireEvent.change(screen.getByPlaceholderText('First Name'), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText('Last Name'), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Phone'), { target: { value: '12345678' } });
    fireEvent.change(screen.getByPlaceholderText('Special Requests'), { target: { value: 'None' } });
    fireEvent.change(screen.getByPlaceholderText('Card Number'), { target: { value: '4111111111111111' } });
    fireEvent.change(screen.getByPlaceholderText('MM/YY'), { target: { value: '12/25' } });
    fireEvent.change(screen.getByPlaceholderText('CVV'), { target: { value: '123' } });
    fireEvent.change(screen.getByPlaceholderText('Billing Address'), { target: { value: '123 Street' } });

    fireEvent.click(screen.getByRole('button', { name: /book now/i }));
    
    // Wait for async call
    await screen.findByText('Booking Form');
    expect(window.alert).toHaveBeenCalledWith('Booking submitted');
  });
});
