// 'use client';

// import React, { useEffect, useState } from 'react';
// import { useSearchParams, useRouter } from 'next/navigation';

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001/api';

// interface BookingInfo {
//   bookingId: string;
//   hotelName: string;
//   checkIn: string;
//   checkOut: string;
//   guests: string;
//   rooms: string;
//   totalPrice: number;
//   nights: number;
//   firstName: string;
//   lastName: string;
//   email: string;
//   status: string;
//   bookingDate: string;
//   roomDescription: string;
// }

// export default function BookingConfirmation() {
//   const searchParams = useSearchParams();
//   const router = useRouter();
  
//   const [booking, setBooking] = useState<BookingInfo | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const bookingId = searchParams?.get('bookingId');
//   const sessionId = searchParams?.get('session_id');

//   useEffect(() => {
//     async function verifyIfNeeded() {
//       if (bookingId && sessionId) {
//         try {
//           await fetch(`${API_BASE_URL}/payments/verify`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ bookingId, session_id: sessionId }),
//           });
//         } catch {
//           /* ignore */
//         }
//       }
//     }
//     verifyIfNeeded();
//   }, [bookingId, sessionId]);

//   useEffect(() => {
//     async function fetchBooking() {
//       if (!bookingId) {
//         setError('No booking ID provided');
//         setLoading(false);
//         return;
//       }

//       try {
//         const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`);
        
//         if (response.ok) {
//           const bookingData = await response.json();
//           setBooking({
//             bookingId: bookingData._id || bookingData.bookingId,
//             hotelName: bookingData.hotelName,
//             checkIn: bookingData.checkIn,
//             checkOut: bookingData.checkOut,
//             guests: bookingData.guests,
//             rooms: bookingData.rooms,
//             totalPrice: bookingData.totalPrice,
//             nights: bookingData.nights,
//             firstName: bookingData.firstName,
//             lastName: bookingData.lastName,
//             email: bookingData.email,
//             status: bookingData.paid ? 'Confirmed' : 'Pending',
//             bookingDate: bookingData.createdAt || bookingData.bookingDate,
//             roomDescription: bookingData.roomDescription || 'N/A',
//           });
//         } else {
//           setError('Booking not found');
//         }
//       } catch (err) {
//         setError('Error loading booking details');
//         console.error('Booking fetch error:', err);
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchBooking();
//   }, [bookingId]);

//   const handlePrint = () => {
//     window.print();
//   };

//   const handleHome = () => {
//     router.push('/');
//   };

//   const formatDate = (dateString: string) =>
//     new Date(dateString).toLocaleDateString('en-US', {
//       weekday: 'long',
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric',
//     });

//   const formatPrice = (price: number) =>
//     new Intl.NumberFormat('en-SG', { 
//       style: 'currency', 
//       currency: 'SGD' 
//     }).format(price);

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading booking details...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
//             <h2 className="text-2xl font-bold text-red-900 mb-4">Error</h2>
//             <p className="text-red-600 mb-4">{error}</p>
//             <button
//               onClick={handleHome}
//               className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
//             >
//               Return Home
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (!booking) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <h2 className="text-2xl font-bold text-gray-900 mb-4">No Booking Found</h2>
//           <button
//             onClick={handleHome}
//             className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
//           >
//             Return Home
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="container mx-auto px-4 py-8">
//         <div className="max-w-2xl mx-auto">
//           {/* Success Message */}
//           <div className="text-center mb-8">
//             <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
//               <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
//               </svg>
//             </div>
//             <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
//             <p className="text-lg text-gray-600">
//               Thank you for your reservation. Your booking details are shown below.
//             </p>
//           </div>

//           {/* Booking Details Card */}
//           <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
//             <div className="bg-indigo-600 text-white px-6 py-4">
//               <h2 className="text-xl font-semibold">Booking Information</h2>
//               <p className="text-indigo-200">Booking ID: {booking.bookingId}</p>
//             </div>
            
//             <div className="px-6 py-6 space-y-6">
//               {/* Guest Information */}
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-900 mb-3">Guest Information</h3>
//                 <div className="grid grid-cols-2 gap-4 text-sm">
//                   <div>
//                     <p className="text-gray-500">Full Name</p>
//                     <p className="font-medium">{booking.firstName} {booking.lastName}</p>
//                   </div>
//                   <div>
//                     <p className="text-gray-500">Email</p>
//                     <p className="font-medium">{booking.email}</p>
//                   </div>
//                 </div>
//               </div>

//               {/* Hotel Details */}
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-900 mb-3">Hotel Details</h3>
//                 <p className="text-xl font-medium text-gray-800">{booking.hotelName}</p>
//               </div>

//               {/* Stay Details */}
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-900 mb-3">Stay Details</h3>
//                 <div className="grid grid-cols-2 gap-4 text-sm">
//                   <div>
//                     <p className="text-gray-500">Check-in</p>
//                     <p className="font-medium">{formatDate(booking.checkIn)}</p>
//                   </div>
//                   <div>
//                     <p className="text-gray-500">Check-out</p>
//                     <p className="font-medium">{formatDate(booking.checkOut)}</p>
//                   </div>
//                   <div>
//                     <p className="text-gray-500">Duration</p>
//                     <p className="font-medium">
//                       {booking.nights} night{booking.nights > 1 ? 's' : ''}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-gray-500">Guests</p>
//                     <p className="font-medium">
//                       {booking.guests} guest{parseInt(booking.guests) > 1 ? 's' : ''}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-gray-500">Rooms</p>
//                     <p className="font-medium">
//                       {booking.rooms} room{parseInt(booking.rooms) > 1 ? 's' : ''}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-gray-500">Room Description</p>
//                     <p className="font-medium">{booking.roomDescription}</p>
//                   </div>
//                 </div>
//               </div>

//               {/* Total Amount */}
//               <div className="border-t pt-4">
//                 <div className="flex justify-between items-center">
//                   <span className="text-lg font-semibold text-gray-900">Total Amount</span>
//                   <span className="text-2xl font-bold text-indigo-600">{formatPrice(booking.totalPrice)}</span>
//                 </div>
//                 <p className="text-sm text-gray-500 mt-1">
//                   Payment processed on{' '}
//                   {new Date(booking.bookingDate).toLocaleDateString()}
//                 </p>
//               </div>

//               {/* Status */}
//               <div className="text-center">
//                 <span className="inline-block px-4 py-2 rounded-full font-medium text-sm bg-green-100 text-green-800">
//                   Status: {booking.status}
//                 </span>
//               </div>

//               {/* Action Buttons */}
//               <div className="flex flex-col sm:flex-row gap-3 pt-4">
//                 <button
//                   onClick={handlePrint}
//                   className="flex-1 bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 transition"
//                 >
//                   Print Confirmation
//                 </button>
//                 <button
//                   onClick={() => router.push('/search')}
//                   className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition"
//                 >
//                   Book Another Stay
//                 </button>
//                 <button
//                   onClick={handleHome}
//                   className="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition"
//                 >
//                   Return Home
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Important Information */}
//           <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
//             <h4 className="font-medium text-blue-900 mb-2">
//               Important Information
//             </h4>
//             <ul className="text-sm text-blue-700 space-y-1 text-left">
//               <li>• Please bring a valid ID and this confirmation for check-in</li>
//               <li>• Check-in time is typically 3:00 PM, check-out is 11:00 AM</li>
//               <li>• A confirmation email has been sent to {booking.email}</li>
//               <li>• For changes or cancellations, contact the hotel directly</li>
//             </ul>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


// components/BookingConfirmation.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001/api';

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
  roomDescription: string;
}

export default function BookingConfirmation() {
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
        } catch {
          /* ignore */
        }
      }
    }
    verifyIfNeeded();
  }, [bookingId, sessionId]);

  useEffect(() => {
    async function fetchBooking() {
      if (!bookingId) {
        setError('No booking ID provided');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`);

        if (response.ok) {
          const bookingData = await response.json();
          setBooking({
            bookingId: bookingData._id || bookingData.bookingId,
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
            status: bookingData.paid ? 'Confirmed' : 'Pending',
            bookingDate: bookingData.createdAt || bookingData.bookingDate,
            roomDescription: bookingData.roomDescription || 'N/A',
          });
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
  }, [bookingId]);

  const handlePrint = () => {
    window.print();
  };

  const handleHome = () => {
    router.push('/');
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: 'SGD',
    }).format(price);

  // Loading (now accessible for tests/AT)
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div
            role="status"
            aria-label="loading"
            className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"
          />
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  // Error (heading text updated to match tests)
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-red-900 mb-4">
              Booking Error
            </h2>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            No Booking Found
          </h2>
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
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Booking Confirmed!
            </h1>
            <p className="text-lg text-gray-600">
              Thank you for your reservation. Your booking details are shown
              below.
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
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Guest Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Full Name</p>
                    <p className="font-medium">
                      {booking.firstName} {booking.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Email</p>
                    <p className="font-medium">{booking.email}</p>
                  </div>
                </div>
              </div>

              {/* Hotel Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Hotel Details
                </h3>
                <p className="text-xl font-medium text-gray-800">
                  {booking.hotelName}
                </p>
              </div>

              {/* Stay Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Stay Details
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Check-in</p>
                    <p className="font-medium">{formatDate(booking.checkIn)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Check-out</p>
                    <p className="font-medium">
                      {formatDate(booking.checkOut)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Duration</p>
                    <p className="font-medium">
                      {booking.nights} night{booking.nights > 1 ? 's' : ''}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Guests</p>
                    <p className="font-medium">
                      {booking.guests} guest
                      {parseInt(booking.guests) > 1 ? 's' : ''}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Rooms</p>
                    <p className="font-medium">
                      {booking.rooms} room
                      {parseInt(booking.rooms) > 1 ? 's' : ''}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Room Description</p>
                    <p className="font-medium">{booking.roomDescription}</p>
                  </div>
                </div>
              </div>

              {/* Total Amount */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">
                    Total Amount
                  </span>
                  <span className="text-2xl font-bold text-indigo-600">
                    {formatPrice(booking.totalPrice)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Payment processed on{' '}
                  {new Date(booking.bookingDate).toLocaleDateString()}
                </p>
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
                  Print Confirmation
                </button>
                <button
                  onClick={() => router.push('/search')}
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

          {/* Important Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <h4 className="font-medium text-blue-900 mb-2">
              Important Information
            </h4>
            <ul className="text-sm text-blue-700 space-y-1 text-left">
              <li>• Please bring a valid ID and this confirmation for check-in</li>
              <li>• Check-in time is typically 3:00 PM, check-out is 11:00 AM</li>
              <li>• A confirmation email has been sent to {booking.email}</li>
              <li>• For changes or cancellations, contact the hotel directly</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
