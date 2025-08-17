


// 'use client';

// import React, { useEffect, useState } from 'react';
// import { useSearchParams, useRouter } from 'next/navigation';

// const API_BASE_URL =
//   process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001/api';

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
//   status: string; // "Confirmed" | "Cancelled"
//   bookingDate: string;
//   roomDescription: string;
// }

// export default function BookingConfirmation() {
//   const searchParams = useSearchParams();
//   const router = useRouter();

//   const [booking, setBooking] = useState<BookingInfo | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [working, setWorking] = useState(false);

//   const bookingId = searchParams?.get('bookingId');
//   const sessionId = searchParams?.get('session_id');

//   // Verify Stripe session (if present)
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

//   // Fetch booking
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
//           const b = await response.json();
//           setBooking({
//             bookingId: b._id || b.bookingId,
//             hotelName: b.hotelName,
//             checkIn: b.checkIn,
//             checkOut: b.checkOut,
//             guests: b.guests,
//             rooms: b.rooms,
//             totalPrice: b.totalPrice,
//             nights: b.nights,
//             firstName: b.firstName,
//             lastName: b.lastName,
//             email: b.email,
//             status: b.status || 'Confirmed',
//             bookingDate: b.createdAt || b.bookingDate,
//             roomDescription: b.roomDescription || 'N/A',
//           });
//         } else {
//           setError('Booking not found');
//         }
//       } catch (err) {
//         console.error('Booking fetch error:', err);
//         setError('Error loading booking details');
//       } finally {
//         setLoading(false);
//       }
//     }
//     fetchBooking();
//   }, [bookingId]);

//   const handlePrint = () => window.print();
//   const handleHome = () => router.push('/');
//   const goSupport = () =>
//     booking && router.push(`/support?bookingId=${encodeURIComponent(booking.bookingId)}`);

//   // Hard delete cancel: POST /bookings/:id/cancel (server deletes and returns { ok:true, deleted:true })
//   const handleCancel = async () => {
//     if (!booking) return;
//     const ok = window.confirm('This will permanently delete your booking. Continue?');
//     if (!ok) return;

//     try {
//       setWorking(true);
//       const res = await fetch(
//         `${API_BASE_URL}/bookings/${booking.bookingId}/cancel`,
//         { method: 'POST', headers: { 'Content-Type': 'application/json' } }
//       );

//       if (!res.ok) {
//         const t = await res.text();
//         console.error('Cancel error:', t);
//         alert('Unable to cancel booking. Please try again.');
//         return;
//       }

//       const data = await res.json();

//       // If server deleted, send user home. If server soft-cancelled, update status locally.
//       if (data?.deleted) {
//         alert('Booking cancelled and removed.');
//         router.push('/');
//         return;
//       }

//       setBooking(prev =>
//         prev ? { ...prev, status: data?.booking?.status || 'Cancelled' } : prev
//       );
//     } catch (e) {
//       console.error(e);
//       alert('Unable to cancel booking. Please try again.');
//     } finally {
//       setWorking(false);
//     }
//   };

//   const formatDate = (dateString: string) =>
//     new Date(dateString).toLocaleDateString('en-US', {
//       weekday: 'long',
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric',
//     });

//   const formatPrice = (price: number) =>
//     new Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD' }).format(price);

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div
//             role="status"
//             aria-label="loading"
//             className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"
//           />
//           <p className="text-black">Loading booking details...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
//             <h2 className="text-2xl font-bold text-black mb-4">Booking Error</h2>
//             <p className="text-black mb-4">{error}</p>
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

//   if (!booking) return null;

//   const isCancelled = booking.status === 'Cancelled';
//   const headerText = isCancelled ? 'Booking Cancelled' : 'Booking Confirmed!';
//   const headerIconColor = isCancelled ? 'text-red-600' : 'text-green-600';

//   return (
//     <div className="min-h-screen bg-gray-50 text-black">
//       <div className="container mx-auto px-4 py-8">
//         <div className="max-w-2xl mx-auto">
//           {/* Header */}
//           <div className="text-center mb-8">
//             <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
//               <svg className={`w-8 h-8 ${headerIconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
//               </svg>
//             </div>
//             <h1 className="text-3xl font-bold mb-2">{headerText}</h1>
//             <p>Thank you for your reservation. Your booking details are shown below.</p>
//           </div>

//           {/* Card */}
//           <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
//             <div className="bg-indigo-600 text-white px-6 py-4">
//               <h2 className="text-xl font-semibold">Booking Information</h2>
//               <p className="text-white/80">Booking ID: {booking.bookingId}</p>
//             </div>

//             <div className="px-6 py-6 space-y-6">
//               {/* Guest Information */}
//               <div>
//                 <h3 className="text-lg font-semibold mb-3">Guest Information</h3>
//                 <div className="grid grid-cols-2 gap-4 text-sm">
//                   <div>
//                     <p className="opacity-60">Full Name</p>
//                     <p className="font-medium">
//                       {booking.firstName} {booking.lastName}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="opacity-60">Email</p>
//                     <p className="font-medium">{booking.email}</p>
//                   </div>
//                 </div>
//               </div>

//               {/* Hotel Details */}
//               <div>
//                 <h3 className="text-lg font-semibold mb-3">Hotel Details</h3>
//                 <p className="text-xl font-medium">{booking.hotelName}</p>
//               </div>

//               {/* Stay Details */}
//               <div>
//                 <h3 className="text-lg font-semibold mb-3">Stay Details</h3>
//                 <div className="grid grid-cols-2 gap-4 text-sm">
//                   <div>
//                     <p className="opacity-60">Check-in</p>
//                     <p className="font-medium">{formatDate(booking.checkIn)}</p>
//                   </div>
//                   <div>
//                     <p className="opacity-60">Check-out</p>
//                     <p className="font-medium">{formatDate(booking.checkOut)}</p>
//                   </div>
//                   <div>
//                     <p className="opacity-60">Duration</p>
//                     <p className="font-medium">
//                       {booking.nights} night{booking.nights > 1 ? 's' : ''}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="opacity-60">Guests</p>
//                     <p className="font-medium">
//                       {booking.guests} guest{parseInt(booking.guests) > 1 ? 's' : ''}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="opacity-60">Rooms</p>
//                     <p className="font-medium">
//                       {booking.rooms} room{parseInt(booking.rooms) > 1 ? 's' : ''}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="opacity-60">Room Description</p>
//                     <p className="font-medium">{booking.roomDescription}</p>
//                   </div>
//                 </div>
//               </div>

//               {/* Total Amount */}
//               <div className="border-t pt-4">
//                 <div className="flex justify-between items-center">
//                   <span className="text-lg font-semibold">Total Amount</span>
//                   <span className="text-2xl font-bold text-indigo-600">
//                     {formatPrice(booking.totalPrice)}
//                   </span>
//                 </div>
//                 <p className="text-sm mt-1">
//                   Payment processed on {new Date(booking.bookingDate).toLocaleDateString()}
//                 </p>
//               </div>

//               {/* Status */}
//               <div className="text-center">
//                 <span
//                   className={`inline-block px-4 py-2 rounded-full font-medium text-sm ${
//                     isCancelled ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
//                   }`}
//                 >
//                   Status: {booking.status}
//                 </span>
//               </div>

//               {/* Actions */}
//               <div className="flex flex-col sm:flex-row gap-3 pt-4">
//                 <button
//                   onClick={handlePrint}
//                   className="flex-1 bg-gray-800 text-white py-2 px-4 rounded hover:bg-gray-900 transition"
//                 >
//                   Print Confirmation
//                 </button>

//                 <button
//                   onClick={goSupport}
//                   className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
//                 >
//                   Contact Support
//                 </button>

//                 <button
//                   onClick={handleCancel}
//                   disabled={working || isCancelled}
//                   className={`flex-1 py-2 px-4 rounded transition text-white ${
//                     isCancelled ? 'bg-red-300 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
//                   }`}
//                 >
//                   {isCancelled ? 'Cancelled' : working ? 'Cancelling…' : 'Cancel Booking'}
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
//             <h4 className="font-medium mb-2">Important Information</h4>
//             <ul className="text-sm space-y-1 text-left">
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
  roomDescription: string;
}

export default function BookingConfirmation() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [booking, setBooking] = useState<BookingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bookingIdParam = searchParams?.get('bookingId');
  const sessionId = searchParams?.get('session_id');

  // If we have a session_id (from Stripe success URL) but no bookingId, verify and create booking now.
  useEffect(() => {
    async function ensureBooking() {
      try {
        if (sessionId && !bookingIdParam) {
          const res = await fetch(`${API_BASE_URL}/payments/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_id: sessionId }),
          });

          if (!res.ok) {
            const t = await res.text();
            setError(t || 'Payment verification failed');
            setLoading(false);
            return;
          }

          const data = await res.json();
          // Prefer using the booking returned by verify to avoid an immediate re-fetch
          const b = data.booking;
          if (b?._id || data.bookingId) {
            const id = b?._id || data.bookingId;
            setBooking({
              bookingId: id,
              hotelName: b.hotelName,
              checkIn: b.checkIn,
              checkOut: b.checkOut,
              guests: b.guests,
              rooms: b.rooms,
              totalPrice: b.totalPrice,
              nights: b.nights,
              firstName: b.firstName,
              lastName: b.lastName,
              email: b.email,
              status: b.status || 'Confirmed',
              bookingDate: b.createdAt || new Date().toISOString(),
              roomDescription: b.roomDescription || 'N/A',
            });

            // Replace URL to include bookingId (nice for reload / sharing)
            const url = new URL(window.location.href);
            url.searchParams.set('bookingId', id);
            url.searchParams.delete('session_id');
            window.history.replaceState(null, '', url.toString());
          } else {
            setError('Verification did not return a booking');
          }
          setLoading(false);
        }
      } catch (e) {
        console.error('verify page error:', e);
        setError('Error verifying payment');
        setLoading(false);
      }
    }
    ensureBooking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, bookingIdParam]);

  // If bookingId is already in the URL (e.g., after replacing above), fetch the booking.
  useEffect(() => {
    async function fetchBooking() {
      if (!bookingIdParam) {
        // Either waiting for verify, or error already set
        if (!sessionId) {
          setError('No booking or session provided');
          setLoading(false);
        }
        return;
      }
      try {
        const res = await fetch(`${API_BASE_URL}/bookings/${bookingIdParam}`);
        if (!res.ok) {
          setError('Booking not found');
          setLoading(false);
          return;
        }
        const b = await res.json();
        setBooking({
          bookingId: b._id || b.bookingId,
          hotelName: b.hotelName,
          checkIn: b.checkIn,
          checkOut: b.checkOut,
          guests: b.guests,
          rooms: b.rooms,
          totalPrice: b.totalPrice,
          nights: b.nights,
          firstName: b.firstName,
          lastName: b.lastName,
          email: b.email,
          status: b.status || 'Confirmed',
          bookingDate: b.createdAt || b.bookingDate,
          roomDescription: b.roomDescription || 'N/A',
        });
      } catch (e) {
        console.error('Booking fetch error:', e);
        setError('Error loading booking details');
      } finally {
        setLoading(false);
      }
    }

    // Only fetch if we don't already have a booking from verify
    if (!booking && bookingIdParam) fetchBooking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingIdParam]);

  const handlePrint = () => window.print();
  const handleHome = () => router.push('/');
  const goSupport = () => booking && router.push(`/support?bookingId=${encodeURIComponent(booking.bookingId)}`);

  const handleCancel = async () => {
    if (!booking) return;
    const ok = window.confirm('This will permanently delete your booking. Continue?');
    if (!ok) return;

    try {
      setWorking(true);
      const res = await fetch(`${API_BASE_URL}/bookings/${booking.bookingId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        alert('Unable to cancel booking. Please try again.');
        return;
      }

      const data = await res.json();
      if (data?.deleted) {
        alert('Booking cancelled and removed.');
        router.push('/');
        return;
      }

      setBooking((prev) => (prev ? { ...prev, status: data?.booking?.status || 'Cancelled' } : prev));
    } catch (e) {
      console.error(e);
      alert('Unable to cancel booking. Please try again.');
    } finally {
      setWorking(false);
    }
  };

  const formatDate = (s: string) =>
    new Date(s).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD' }).format(price);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div role="status" aria-label="loading" className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
          <p className="text-black">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-black mb-4">Booking Error</h2>
            <p className="text-black mb-4">{error || 'No booking available'}</p>
            <button onClick={handleHome} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isCancelled = booking.status === 'Cancelled';
  const headerText = isCancelled ? 'Booking Cancelled' : 'Booking Confirmed!';
  const headerIconColor = isCancelled ? 'text-red-600' : 'text-green-600';

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <svg className={`w-8 h-8 ${headerIconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-2">{headerText}</h1>
            <p>Thank you for your reservation. Your booking details are shown below.</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
            <div className="bg-indigo-600 text-white px-6 py-4">
              <h2 className="text-xl font-semibold">Booking Information</h2>
              <p className="text-white/80">Booking ID: {booking.bookingId}</p>
            </div>

            <div className="px-6 py-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Guest Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="opacity-60">Full Name</p>
                    <p className="font-medium">
                      {booking.firstName} {booking.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="opacity-60">Email</p>
                    <p className="font-medium">{booking.email}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Hotel Details</h3>
                <p className="text-xl font-medium">{booking.hotelName}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Stay Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="opacity-60">Check-in</p>
                    <p className="font-medium">{formatDate(booking.checkIn)}</p>
                  </div>
                  <div>
                    <p className="opacity-60">Check-out</p>
                    <p className="font-medium">{formatDate(booking.checkOut)}</p>
                  </div>
                  <div>
                    <p className="opacity-60">Duration</p>
                    <p className="font-medium">
                      {booking.nights} night{booking.nights > 1 ? 's' : ''}
                    </p>
                  </div>
                  <div>
                    <p className="opacity-60">Guests</p>
                    <p className="font-medium">{booking.guests}</p>
                  </div>
                  <div>
                    <p className="opacity-60">Rooms</p>
                    <p className="font-medium">{booking.rooms}</p>
                  </div>
                  <div>
                    <p className="opacity-60">Room Description</p>
                    <p className="font-medium">{booking.roomDescription}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total Amount</span>
                  <span className="text-2xl font-bold text-indigo-600">
                    {new Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD' }).format(booking.totalPrice)}
                  </span>
                </div>
                <p className="text-sm mt-1">
                  Payment processed on {new Date(booking.bookingDate).toLocaleDateString()}
                </p>
              </div>

              <div className="text-center">
                <span
                  className={`inline-block px-4 py-2 rounded-full font-medium text-sm ${
                    isCancelled ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}
                >
                  Status: {booking.status}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button onClick={handlePrint} className="flex-1 bg-gray-800 text-white py-2 px-4 rounded hover:bg-gray-900 transition">
                  Print Confirmation
                </button>

                <button
                  onClick={() => router.push(`/support?bookingId=${encodeURIComponent(booking.bookingId)}`)}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
                >
                  Contact Support
                </button>

                <button
                  onClick={handleCancel}
                  disabled={working || isCancelled}
                  className={`flex-1 py-2 px-4 rounded transition text-white ${
                    isCancelled ? 'bg-red-300 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {isCancelled ? 'Cancelled' : working ? 'Cancelling…' : 'Cancel Booking'}
                </button>

                <button onClick={() => router.push('/')} className="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition">
                  Return Home
                </button>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <h4 className="font-medium mb-2">Important Information</h4>
            <ul className="text-sm space-y-1 text-left">
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

