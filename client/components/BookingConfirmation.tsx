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

export default function BookingConfirmation() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [booking, setBooking] = useState<BookingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBooking() {
      try {
        const bookingId = searchParams?.get('bookingId');
        
        if (!bookingId) {
          setError('No booking ID provided');
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`);
        
        if (response.ok) {
          const bookingData = await response.json();
          setBooking(bookingData);
        } else {
          setError('Booking not found');
        }
      } catch (err) {
        setError('Error loading booking details');
        console.error('Booking fetch error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchBooking();
  }, [searchParams]);

  const handlePrint = () => {
    window.print();
  };

  const handleNewBooking = () => {
    router.push('/');
  };

  const handleHome = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking details...</p>
        </div>
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
              onClick={handleHome}
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Booking Found</h2>
          <button
            onClick={handleHome}
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
        <div className="max-w-2xl mx-auto">
          {/* Success Message */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
            <p className="text-lg text-gray-600">
              Thank you for your reservation. Your booking details are shown below.
            </p>
          </div>

          {/* Booking Details Card */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
            <div className="bg-indigo-600 text-white px-6 py-4">
              <h2 className="text-xl font-semibold">Booking Information</h2>
              <p className="text-indigo-200">Booking ID: {booking.bookingId}</p>
            </div>
            
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
                </div>
              </div>

              {/* Hotel Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Hotel Details</h3>
                <p className="text-xl font-medium text-gray-800">{booking.hotelName}</p>
              </div>

              {/* Stay Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Stay Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Check-in</p>
                    <p className="font-medium">{new Date(booking.checkIn).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Check-out</p>
                    <p className="font-medium">{new Date(booking.checkOut).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Guests</p>
                    <p className="font-medium">{booking.guests}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Rooms</p>
                    <p className="font-medium">{booking.rooms}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Nights</p>
                    <p className="font-medium">{booking.nights}</p>
                  </div>
                </div>
              </div>

              {/* Total Amount */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                  <span className="text-2xl font-bold text-indigo-600">${booking.totalPrice.toFixed(2)}</span>
                </div>
              </div>

              {/* Status */}
              <div className="text-center">
                <span className="inline-block px-4 py-2 rounded-full font-medium text-sm bg-green-100 text-green-800">
                  Status: {booking.status}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  onClick={handlePrint}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 transition"
                >
                  Print Details
                </button>
                <button
                  onClick={handleNewBooking}
                  className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition"
                >
                  Book Another Stay
                </button>
                <button
                  onClick={handleHome}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition"
                >
                  Return Home
                </button>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <p className="text-sm text-blue-800">
              A confirmation email has been sent to {booking.email}. 
              Please present this confirmation at check-in.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
