'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001/api';

interface BookingInfo {
  bookingId?: string;
  hotelName?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: string;
  rooms?: string;
  totalPrice?: number;
  nights?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  specialRequests?: string;
  billingAddress?: string;
  cardNumber?: string;
  status?: string;
  bookingDate?: string;
}

export default function BookingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  
  const [booking, setBooking] = useState<BookingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const bookingId = params?.id as string;

  useEffect(() => {
    if (!bookingId) {
      setError('No booking ID provided');
      setLoading(false);
      return;
    }

    async function fetchBooking() {
      try {
        const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`);
        if (response.ok) {
          const bookingData = await response.json();
          setBooking(bookingData);
        } else {
          setError('Booking not found');
        }
      } catch (err) {
        console.error('Error fetching booking:', err);
        setError('Error fetching booking');
      } finally {
        setLoading(false);
      }
    }

    fetchBooking();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-red-900 mb-4">Error</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Booking Not Found</h2>
          <button 
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Details</h1>
          <p className="text-lg text-gray-600">Review your booking information</p>
        </div>

        {/* Booking Details Card */}
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-indigo-600 text-white px-6 py-4">
            <h2 className="text-xl font-semibold">Booking Information</h2>
            {booking.bookingId && <p className="text-indigo-200">Booking ID: {booking.bookingId}</p>}
          </div>

          {/* Content */}
          <div className="px-6 py-6 space-y-6">
            {/* Guest Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Guest Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Full Name</p>
                  <p className="font-medium">{booking.firstName} {booking.lastName}</p>
                </div>
                <div>
                  <p className="text-gray-500">Email</p>
                  <p className="font-medium">{booking.email}</p>
                </div>
                <div>
                  <p className="text-gray-500">Phone</p>
                  <p className="font-medium">{booking.phone}</p>
                </div>
                {booking.specialRequests && (
                  <div>
                    <p className="text-gray-500">Special Requests</p>
                    <p className="font-medium">{booking.specialRequests}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Hotel Information */}
            {booking.hotelName && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Hotel Details</h3>
                <p className="text-xl font-medium text-gray-800">{booking.hotelName}</p>
              </div>
            )}

            {/* Stay Details */}
            {(booking.checkIn || booking.checkOut || booking.guests || booking.rooms) && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Stay Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {booking.checkIn && (
                    <div>
                      <p className="text-gray-500">Check-in</p>
                      <p className="font-medium">{new Date(booking.checkIn).toLocaleDateString()}</p>
                    </div>
                  )}
                  {booking.checkOut && (
                    <div>
                      <p className="text-gray-500">Check-out</p>
                      <p className="font-medium">{new Date(booking.checkOut).toLocaleDateString()}</p>
                    </div>
                  )}
                  {booking.guests && (
                    <div>
                      <p className="text-gray-500">Guests</p>
                      <p className="font-medium">{booking.guests}</p>
                    </div>
                  )}
                  {booking.rooms && (
                    <div>
                      <p className="text-gray-500">Rooms</p>
                      <p className="font-medium">{booking.rooms}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Payment Information */}
            {(booking.billingAddress || booking.cardNumber) && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Information</h3>
                <div className="text-sm space-y-2">
                  {booking.billingAddress && (
                    <div>
                      <p className="text-gray-500">Billing Address</p>
                      <p className="font-medium">{booking.billingAddress}</p>
                    </div>
                  )}
                  {booking.cardNumber && (
                    <div>
                      <p className="text-gray-500">Card</p>
                      <p className="font-medium">**** **** **** {booking.cardNumber.slice(-4)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Pricing */}
            {booking.totalPrice && (
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                  <span className="text-2xl font-bold text-indigo-600">
                    {new Intl.NumberFormat('en-SG', {
                      style: 'currency',
                      currency: 'SGD'
                    }).format(booking.totalPrice)}
                  </span>
                </div>
                {booking.bookingDate && (
                  <p className="text-sm text-gray-500 mt-1">
                    Booked on {new Date(booking.bookingDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}

            {/* Status */}
            {booking.status && (
              <div className="text-center">
                <span className={`inline-block px-4 py-2 rounded-full font-medium text-sm ${
                  booking.status === 'confirmed' 
                    ? 'bg-green-100 text-green-800'
                    : booking.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  Status: {booking.status}
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                onClick={() => window.print()}
                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 transition"
              >
                Print Details
              </button>
              <button
                onClick={() => router.push('/search')}
                className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition"
              >
                Book Another Stay
              </button>
              <button
                onClick={() => router.push('/')}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition"
              >
                Return Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
