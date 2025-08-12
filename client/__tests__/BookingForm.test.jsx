import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import BookingForm from '../components/BookingForm';

// Mock Next.js navigation hooks for App Router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
  useSearchParams: jest.fn(),
}));

import { useRouter, useParams, useSearchParams } from 'next/navigation';

const mockRouter = {
  push: jest.fn(),
};

const mockParams = {
  id: 'hotel123',
};

const mockSearchParams = {
  get: jest.fn((key) => {
    const params = {
      destination_id: '1234',
      checkin: '2024-01-01',
      checkout: '2024-01-03',
      guests: '2',
      rooms: '1',
    };
    return params[key] || null;
  }),
};

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
    
    // Setup mocks
    useRouter.mockReturnValue(mockRouter);
    useParams.mockReturnValue(mockParams);
    useSearchParams.mockReturnValue(mockSearchParams);
    
    // Mock hotel API calls
    global.fetch = jest.fn();
  });

  test('renders inputs + submit', async () => {
    // Mock successful hotel data fetch
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        id: 'hotel123',
        name: 'Test Hotel',
        address: 'Test Address'
      })
    }).mockResolvedValueOnce({
      ok: true, 
      json: () => Promise.resolve({
        rooms: [{ booking_key: 'test', description: 'Standard Room', price: 100 }]
      })
    });

    render(<BookingForm />);
    
    // Wait for loading to complete
    await waitFor(() => {
      ['First Name','Last Name','Email','Phone','Special Requests','Card Number','MM/YY','CVV','Billing Address']
        .forEach(ph => expect(screen.getByPlaceholderText(ph)).toBeInTheDocument());
    });
    
    expect(screen.getByRole('button', { name: /book now/i })).toBeInTheDocument();
  });

  test('alerts when required fields missing', async () => {
    // Mock successful hotel data fetch
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        id: 'hotel123',
        name: 'Test Hotel',
        address: 'Test Address'
      })
    }).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        rooms: [{ booking_key: 'test', description: 'Standard Room', price: 100 }]
      })
    });

    render(<BookingForm />);
    
    // Wait for form to load
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /book now/i })).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByRole('button', { name: /book now/i }));
    expect(window.alert).toHaveBeenCalledWith('Please fill in all required fields.');
  });

  test('alerts when email invalid', async () => {
    // Mock successful hotel data fetch
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        id: 'hotel123',
        name: 'Test Hotel',
        address: 'Test Address'
      })
    }).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        rooms: [{ booking_key: 'test', description: 'Standard Room', price: 100 }]
      })
    });

    render(<BookingForm />);
    
    // Wait for form to load
    await waitFor(() => {
      expect(screen.getByPlaceholderText('First Name')).toBeInTheDocument();
    });
    
    fillForm({ email: 'bad' });
    fireEvent.click(screen.getByRole('button', { name: /book now/i }));
    expect(window.alert).toHaveBeenCalledWith('Please enter a valid email address.');
  });

  test('redirects to /booking/details/[id] on success', async () => {
    const push = jest.fn();
    useRouter.mockReturnValue({ push });
    
    // Mock hotel data fetch
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        id: 'hotel123',
        name: 'Test Hotel',
        address: 'Test Address'
      })
    }).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        rooms: [{ booking_key: 'test', description: 'Standard Room', price: 100 }]
      })
    }).mockResolvedValueOnce({
      ok: true, 
      json: () => Promise.resolve({ booking: { _id: '123abc' } })
    });

    render(<BookingForm />);
    
    // Wait for form to load
    await waitFor(() => {
      expect(screen.getByPlaceholderText('First Name')).toBeInTheDocument();
    });
    
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: /book now/i }));

    await waitFor(() => expect(push).toHaveBeenCalledWith('/booking/details/123abc'));
    expect(window.alert).not.toHaveBeenCalledWith('Booking submitted');
  });
});