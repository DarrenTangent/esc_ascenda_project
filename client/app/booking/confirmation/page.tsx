'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001/api';

interface BookingInfo {
  bookingId: string;
  hotelName: string;
  checkIn: string;
  checkOut: string;
  guests: string;
  rooms: string;
  totalPrice: number;
  nights: number;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  bookingDate: string;
}

export default function BookingConfirmationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [booking, setBooking] = useState<BookingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const bookingId = searchParams?.get('bookingId');
  const sessionId = searchParams?.get('session_id');

  useEffect(() => {
    async function verifyIfNeeded() {
      if (bookingId && sessionId) {
        try {
          await fetch(`${API_BASE_URL}/payments/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookingId, session_id: sessionId }),
          });
        } catch {}
      }
    }
    verifyIfNeeded();
  }, [bookingId, sessionId]);


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
        setBooking({
          bookingId: bookingData._id, // map _id -> bookingId for UI
          hotelName: bookingData.hotelName,
          checkIn: bookingData.checkIn,
          checkOut: bookingData.checkOut,
          guests: bookingData.guests,
          rooms: bookingData.rooms,
          totalPrice: bookingData.totalPrice,
          nights: bookingData.nights,
          firstName: bookingData.firstName,
          lastName: bookingData.lastName,
          email: bookingData.email,
          status: bookingData.paid ? 'paid' : 'unpaid',
          bookingDate: bookingData.createdAt,
        });
      } else {
        setError('Booking not found');
      }
    } catch (err) {
      console.error('Error fetching booking:', err);
      setError('Failed to load booking details');
    } finally {
      setLoading(false);
    }
  }

  fetchBooking();
}, [bookingId]);


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: 'SGD'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-red-900 mb-4">Booking Error</h2>
            <p className="text-red-600 mb-4">{error || 'Booking not found'}</p>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-lg text-gray-600">Your reservation has been successfully processed.</p>
        </div>

        {/* Booking Details Card */}
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-indigo-600 text-white px-6 py-4">
            <h2 className="text-xl font-semibold">Booking Confirmation</h2>
            <p className="text-indigo-200">Booking ID: {booking.bookingId}</p>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            {/* Hotel Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Hotel Details</h3>
              <p className="text-xl font-medium text-gray-800">{booking.hotelName}</p>
            </div>

            {/* Guest Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Guest Information</h3>
              <p className="text-gray-700">{booking.firstName} {booking.lastName}</p>
              <p className="text-gray-600">{booking.email}</p>
            </div>

            {/* Stay Details */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Stay Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Check-in</p>
                  <p className="font-medium">{formatDate(booking.checkIn)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Check-out</p>
                  <p className="font-medium">{formatDate(booking.checkOut)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Duration</p>
                  <p className="font-medium">{booking.nights} night{booking.nights > 1 ? 's' : ''}</p>
                </div>
                <div>
                  <p className="text-gray-500">Guests</p>
                  <p className="font-medium">{booking.guests} guest{parseInt(booking.guests) > 1 ? 's' : ''}</p>
                </div>
                <div>
                  <p className="text-gray-500">Rooms</p>
                  <p className="font-medium">{booking.rooms} room{parseInt(booking.rooms) > 1 ? 's' : ''}</p>
                </div>
                <div>
                  <p className="text-gray-500">Status</p>
                  <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                    {booking.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                <span className="text-2xl font-bold text-indigo-600">
                  {formatPrice(booking.totalPrice)}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Payment processed on {new Date(booking.bookingDate).toLocaleDateString()}
              </p>
            </div>

            {/* Important Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-blue-900 mb-2">Important Information</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Please bring a valid ID and this confirmation for check-in</li>
                <li>• Check-in time is typically 3:00 PM, check-out is 11:00 AM</li>
                <li>• A confirmation email has been sent to {booking.email}</li>
                <li>• For changes or cancellations, contact the hotel directly</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 transition"
              >
                Print Confirmation
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
