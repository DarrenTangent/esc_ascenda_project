


// 'use client';

// import React, { useState, useEffect, useMemo } from 'react';
// import { useRouter, useParams, useSearchParams } from 'next/navigation';

// type HotelDetails = {
//   name?: string;
//   address?: string;
//   rating?: number;
//   roomDescription?: string;
// };

// type PriceInfo = {
//   price?: number;
//   roomDescription?: string;
//   freeCancellation?: boolean;
// };

// type BookingFormData = {
//   hotelId: string;
//   destination_id: string;
//   checkin: string;
//   checkout: string;
//   guests: string;
//   rooms: string | null;
//   firstName: string;
//   lastName: string;
//   email: string;
//   phone: string;
//   specialRequests: string;
// };

// export default function BookingForm() {
//   const router = useRouter();
//   const params = useParams<{ id: string }>();
//   const searchParams = useSearchParams();

//   const hotelId = params?.id;
//   const destination_id = searchParams?.get('destination_id') ?? '';
//   const checkin = searchParams?.get('checkin') ?? '';
//   const checkout = searchParams?.get('checkout') ?? '';
//   const guests = searchParams?.get('guests') ?? '';
//   const rooms = searchParams?.get('rooms');

//   const roomDescFromQuery = searchParams?.get('room_desc') || '';
//   const roomPriceFromQuery = searchParams?.get('room_price') || '';

//   const [hotelDetails, setHotelDetails] = useState<HotelDetails | null>(null);
//   const [hotelPrice, setHotelPrice] = useState<PriceInfo | null>(null);

//   const [formData, setFormData] = useState<BookingFormData>({
//     hotelId: hotelId || '',
//     destination_id,
//     checkin,
//     checkout,
//     guests,
//     rooms,
//     firstName: '',
//     lastName: '',
//     email: '',
//     phone: '',
//     specialRequests: '',
//   });

//   const [submitting, setSubmitting] = useState(false);
//   const [loading, setLoading] = useState(true);

//   const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001/api').replace(
//     /\/$/,
//     ''
//   );

//   const selectedRoomDescription = useMemo(() => {
//     return roomDescFromQuery || hotelPrice?.roomDescription || hotelDetails?.roomDescription || '';
//   }, [roomDescFromQuery, hotelPrice, hotelDetails]);

//   const selectedNightly = useMemo(() => {
//     const q = Number(roomPriceFromQuery);
//     if (Number.isFinite(q) && q > 0) return q;
//     return Number(hotelPrice?.price ?? 0);
//   }, [roomPriceFromQuery, hotelPrice]);

//   const calculateNights = () => {
//     if (!checkin || !checkout) return 0;
//     const start = new Date(checkin);
//     const end = new Date(checkout);
//     return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000));
//   };

//   const getTotalPrice = () => selectedNightly * calculateNights();

//   const formatPrice = (price: number) =>
//     new Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD' }).format(price);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     if (submitting) return;

//     try {
//       setSubmitting(true);

//       const nights = calculateNights();
//       const payload = {
//         firstName: formData.firstName,
//         lastName: formData.lastName,
//         email: formData.email,
//         phone: formData.phone,
//         specialRequests: formData.specialRequests,
//         hotelId,
//         hotelName: hotelDetails?.name || '',
//         hotelAddress: hotelDetails?.address || '',
//         checkIn: checkin,
//         checkOut: checkout,
//         guests,
//         rooms,
//         nights,
//         totalPrice: getTotalPrice(),
//         roomDescription: selectedRoomDescription,
//       };

//       const bookingRes = await fetch(`${API_BASE}/bookings`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       });

//       if (!bookingRes.ok) {
//         const errorText = await bookingRes.text();
//         console.error('Booking API error:', errorText);
//         alert(`Booking failed — ${errorText || 'please try again.'}`);
//         return;
//       }

//       const bookingData: any = await bookingRes.json();
//       const bookingId: string | undefined =
//         bookingData?.booking?._id || bookingData?._id || bookingData?.bookingId;

//       if (!bookingId) {
//         console.error('Booking API did not return booking id:', bookingData);
//         alert('Booking failed — please try again.');
//         return;
//       }

//       const totalCents = Math.round(getTotalPrice() * 100);
//       const stripeRes = await fetch(`${API_BASE}/payments/create-checkout-session`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           amount: totalCents,
//           hotelName: hotelDetails?.name || 'Hotel Booking',
//           email: formData.email,
//           bookingId,
//         }),
//       });

//       if (!stripeRes.ok) {
//         const errorText = await stripeRes.text();
//         console.error('Stripe API error:', errorText);
//         alert(`Payment initiation failed — ${errorText || 'please try again.'}`);
//         return;
//       }

//       const stripeData: { url?: string } = await stripeRes.json();
//       if (!stripeData?.url) {
//         console.error('Stripe did not return a URL:', stripeData);
//         alert('Payment initiation failed — please try again.');
//         return;
//       }

//       window.location.href = stripeData.url;
//     } catch (err) {
//       console.error(err);
//       alert('Error submitting booking. Please try again.');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   useEffect(() => {
//     async function fetchBookingData() {
//       if (!hotelId || !destination_id || !checkin || !checkout || !guests) {
//         setLoading(false);
//         return;
//       }
//       try {
//         const hotelRes = await fetch(`${API_BASE}/hotels/${hotelId}`);
//         if (hotelRes.ok) {
//           const hotelData: HotelDetails = await hotelRes.json();
//           setHotelDetails(hotelData);
//         }

//         const priceRes = await fetch(
//           `${API_BASE}/hotels/${hotelId}/prices?destination_id=${destination_id}&checkin=${checkin}&checkout=${checkout}&guests=${guests}`
//         );
//         if (priceRes.ok) {
//           const priceData: any = await priceRes.json();

//           const nightly: number =
//             typeof priceData.price === 'number'
//               ? priceData.price
//               : Number(priceData?.rooms?.[0]?.price ?? 0);

//           const inferredRoomDesc: string =
//             priceData?.rooms?.[0]?.roomDescription ||
//             priceData?.roomDescription ||
//             roomDescFromQuery ||
//             '';

//           setHotelPrice({
//             price: nightly,
//             roomDescription: inferredRoomDesc,
//             freeCancellation: Boolean(priceData?.freeCancellation),
//           });
//         }
//       } catch (error) {
//         console.error('Error fetching booking data:', error);
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchBookingData();
//   }, [hotelId, destination_id, checkin, checkout, guests, API_BASE, roomDescFromQuery]);

//   const inputStyle: React.CSSProperties = {
//     width: '100%',
//     padding: '10px',
//     marginBottom: '12px',
//     borderRadius: '5px',
//     border: '1px solid #ccc',
//     fontSize: '14px',
//   };
//   const labelStyle: React.CSSProperties = { fontWeight: 'bold', marginBottom: '4px', display: 'block' };

//   if (loading) {
//     return (
//       <div style={{ textAlign: 'center', padding: '40px' }}>
//         <div style={{ fontSize: '18px' }}>Loading booking details...</div>
//       </div>
//     );
//   }

//   return (
//     <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px' }}>
//       {hotelDetails && (
//         <div
//           style={{
//             marginBottom: '30px',
//             padding: '20px',
//             border: '1px solid #eee',
//             borderRadius: '10px',
//             backgroundColor: '#f8f9fa',
//           }}
//         >
//           <h2 style={{ marginBottom: '15px', color: '#333' }}>Booking Summary</h2>
//           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
//             <div>
//               <h3 style={{ margin: '0 0 10px 0', color: '#555' }}>{hotelDetails.name}</h3>
//               <p style={{ margin: '5px 0', color: '#666' }}>{hotelDetails.address}</p>
//               <p style={{ margin: '5px 0', color: '#666' }}>
//                 {'★'.repeat(hotelDetails.rating || 0)} ({hotelDetails.rating} star)
//               </p>
//             </div>
//             <div>
//               <p><strong>Check-in:</strong> {checkin}</p>
//               <p><strong>Check-out:</strong> {checkout}</p>
//               <p><strong>Guests:</strong> {guests}</p>
//               <p><strong>Rooms:</strong> {rooms ?? '1'}</p>
//               <p><strong>Nights:</strong> {calculateNights()}</p>
//               <p><strong>Room:</strong> {selectedRoomDescription || '—'}</p>
//             </div>
//           </div>
//           <div
//             style={{
//               marginTop: '15px',
//               padding: '15px',
//               backgroundColor: '#e8f5e8',
//               borderRadius: '5px',
//               textAlign: 'center',
//             }}
//           >
//             <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2d5a2d' }}>
//               Total: {formatPrice(getTotalPrice())}
//             </div>
//             <div style={{ fontSize: '14px', color: '#5a7a5a' }}>
//               ({formatPrice(selectedNightly)} per night × {calculateNights()} nights)
//             </div>
//             {hotelPrice?.freeCancellation && (
//               <div style={{ fontSize: '12px', color: '#2d5a2d', marginTop: '5px' }}>
//                 ✓ Free Cancellation Available
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       <div
//         style={{
//           padding: '20px',
//           border: '1px solid #eee',
//           borderRadius: '10px',
//           backgroundColor: '#f9f9f9',
//           boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
//         }}
//       >
//         <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Guest Information</h2>

//         <form onSubmit={handleSubmit}>
//           <label style={labelStyle}>First Name</label>
//           <input name="firstName" onChange={handleChange} style={inputStyle} required />

//           <label style={labelStyle}>Last Name</label>
//           <input name="lastName" onChange={handleChange} style={inputStyle} required />

//           <label style={labelStyle}>Email</label>
//           <input name="email" type="email" onChange={handleChange} style={inputStyle} required />

//           <label style={labelStyle}>Phone</label>
//           <input name="phone" onChange={handleChange} style={inputStyle} required />

//           <label style={labelStyle}>Special Requests</label>
//           <textarea
//             name="specialRequests"
//             onChange={handleChange}
//             style={{ ...inputStyle, height: '80px' }}
//             placeholder="Optional"
//           />

//           <button
//             type="submit"
//             disabled={submitting}
//             style={{
//               width: '100%',
//               padding: '12px',
//               backgroundColor: submitting ? '#6c757d' : '#007BFF',
//               color: '#fff',
//               fontSize: '16px',
//               border: 'none',
//               borderRadius: '5px',
//               cursor: submitting ? 'not-allowed' : 'pointer',
//             }}
//           >
//             {submitting ? 'Processing...' : `Book Now - ${formatPrice(getTotalPrice())}`}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }

// 'use client';

// import React, { useState, useEffect, useMemo } from 'react';
// import { useRouter, useParams, useSearchParams } from 'next/navigation';

// type HotelDetails = {
//   name?: string;
//   address?: string;
//   rating?: number;
//   roomDescription?: string;
// };

// type PriceInfo = {
//   price?: number;
//   roomDescription?: string;
//   freeCancellation?: boolean;
// };

// type BookingFormData = {
//   firstName: string;
//   lastName: string;
//   email: string;
//   phone: string;
//   specialRequests: string;
// };

// export default function BookingForm() {
//   const router = useRouter();
//   const params = useParams<{ id: string }>();
//   const searchParams = useSearchParams();

//   const hotelId = params?.id || '';
//   const destination_id = searchParams?.get('destination_id') ?? '';
//   const checkin = searchParams?.get('checkin') ?? '';
//   const checkout = searchParams?.get('checkout') ?? '';
//   const guests = searchParams?.get('guests') ?? '';
//   const rooms = searchParams?.get('rooms') ?? '1';

//   const roomDescFromQuery = searchParams?.get('room_desc') || '';
//   const roomPriceFromQuery = searchParams?.get('room_price') || '';

//   const [hotelDetails, setHotelDetails] = useState<HotelDetails | null>(null);
//   const [hotelPrice, setHotelPrice] = useState<PriceInfo | null>(null);
//   const [formData, setFormData] = useState<BookingFormData>({
//     firstName: '',
//     lastName: '',
//     email: '',
//     phone: '',
//     specialRequests: '',
//   });
//   const [submitting, setSubmitting] = useState(false);
//   const [loading, setLoading] = useState(true);

//   const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001/api').replace(/\/$/, '');

//   const selectedRoomDescription = useMemo(
//     () => roomDescFromQuery || hotelPrice?.roomDescription || hotelDetails?.roomDescription || '',
//     [roomDescFromQuery, hotelPrice, hotelDetails]
//   );

//   const selectedNightly = useMemo(() => {
//     const q = Number(roomPriceFromQuery);
//     if (Number.isFinite(q) && q > 0) return q;
//     return Number(hotelPrice?.price ?? 0);
//   }, [roomPriceFromQuery, hotelPrice]);

//   const calculateNights = () => {
//     if (!checkin || !checkout) return 0;
//     const start = new Date(checkin);
//     const end = new Date(checkout);
//     return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000));
//   };

//   const getTotalPrice = () => selectedNightly * calculateNights();

//   const formatPrice = (price: number) =>
//     new Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD' }).format(price);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   // New flow: only create Stripe session with booking draft in metadata (no DB write here)
//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     if (submitting) return;

//     try {
//       setSubmitting(true);

//       const nights = calculateNights();
//       const bookingDraft = {
//         firstName: formData.firstName,
//         lastName: formData.lastName,
//         email: formData.email,
//         phone: formData.phone,
//         specialRequests: formData.specialRequests,
//         hotelId,
//         hotelName: hotelDetails?.name || '',
//         hotelAddress: hotelDetails?.address || '',
//         checkIn: checkin,
//         checkOut: checkout,
//         guests,
//         rooms,
//         nights,
//         totalPrice: getTotalPrice(),
//         roomDescription: selectedRoomDescription,
//       };

//       const totalCents = Math.round(getTotalPrice() * 100);

//       const stripeRes = await fetch(`${API_BASE}/payments/create-checkout-session`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           amount: totalCents,
//           hotelName: hotelDetails?.name || 'Hotel Booking',
//           email: formData.email,
//           bookingDraft,
//         }),
//       });

//       if (!stripeRes.ok) {
//         const errorText = await stripeRes.text();
//         console.error('Stripe API error:', errorText);
//         alert(`Payment initiation failed — ${errorText || 'please try again.'}`);
//         return;
//       }

//       const { url } = (await stripeRes.json()) as { url?: string };
//       if (!url) {
//         console.error('Stripe did not return a URL');
//         alert('Payment initiation failed — please try again.');
//         return;
//       }

//       window.location.href = url;
//     } catch (err) {
//       console.error(err);
//       alert('Error submitting booking. Please try again.');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   useEffect(() => {
//     async function fetchBookingData() {
//       if (!hotelId || !destination_id || !checkin || !checkout || !guests) {
//         setLoading(false);
//       } else {
//         try {
//           const hotelRes = await fetch(`${API_BASE}/hotels/${hotelId}`);
//           if (hotelRes.ok) setHotelDetails(await hotelRes.json());

//           const priceRes = await fetch(
//             `${API_BASE}/hotels/${hotelId}/prices?destination_id=${destination_id}&checkin=${checkin}&checkout=${checkout}&guests=${guests}`
//           );
//           if (priceRes.ok) {
//             const priceData: any = await priceRes.json();
//             const nightly: number =
//               typeof priceData.price === 'number'
//                 ? priceData.price
//                 : Number(priceData?.rooms?.[0]?.price ?? 0);

//             const inferredRoomDesc: string =
//               priceData?.rooms?.[0]?.roomDescription ||
//               priceData?.roomDescription ||
//               roomDescFromQuery ||
//               '';

//             setHotelPrice({
//               price: nightly,
//               roomDescription: inferredRoomDesc,
//               freeCancellation: Boolean(priceData?.freeCancellation),
//             });
//           }
//         } catch (error) {
//           console.error('Error fetching booking data:', error);
//         } finally {
//           setLoading(false);
//         }
//       }
//     }

//     fetchBookingData();
//   }, [hotelId, destination_id, checkin, checkout, guests, API_BASE, roomDescFromQuery]);

//   const inputStyle: React.CSSProperties = {
//     width: '100%',
//     padding: '10px',
//     marginBottom: '12px',
//     borderRadius: '5px',
//     border: '1px solid #ccc',
//     fontSize: '14px',
//   };
//   const labelStyle: React.CSSProperties = { fontWeight: 'bold', marginBottom: '4px', display: 'block' };

//   if (loading) {
//     return (
//       <div style={{ textAlign: 'center', padding: '40px' }}>
//         <div style={{ fontSize: '18px' }}>Loading booking details...</div>
//       </div>
//     );
//   }

//   return (
//     <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px' }}>
//       {hotelDetails && (
//         <div
//           style={{
//             marginBottom: '30px',
//             padding: '20px',
//             border: '1px solid #eee',
//             borderRadius: '10px',
//             backgroundColor: '#f8f9fa',
//           }}
//         >
//           <h2 style={{ marginBottom: '15px', color: '#333' }}>Booking Summary</h2>
//           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
//             <div>
//               <h3 style={{ margin: '0 0 10px 0', color: '#555' }}>{hotelDetails.name}</h3>
//               <p style={{ margin: '5px 0', color: '#666' }}>{hotelDetails.address}</p>
//               <p style={{ margin: '5px 0', color: '#666' }}>
//                 {'★'.repeat(hotelDetails.rating || 0)} ({hotelDetails.rating} star)
//               </p>
//             </div>
//             <div>
//               <p><strong>Check-in:</strong> {checkin}</p>
//               <p><strong>Check-out:</strong> {checkout}</p>
//               <p><strong>Guests:</strong> {guests}</p>
//               <p><strong>Rooms:</strong> {rooms}</p>
//               <p><strong>Nights:</strong> {calculateNights()}</p>
//               <p><strong>Room:</strong> {selectedRoomDescription || '—'}</p>
//             </div>
//           </div>
//           <div
//             style={{
//               marginTop: '15px',
//               padding: '15px',
//               backgroundColor: '#e8f5e8',
//               borderRadius: '5px',
//               textAlign: 'center',
//             }}
//           >
//             <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2d5a2d' }}>
//               Total: {formatPrice(getTotalPrice())}
//             </div>
//             <div style={{ fontSize: '14px', color: '#5a7a5a' }}>
//               ({formatPrice(selectedNightly)} per night × {calculateNights()} nights)
//             </div>
//             {hotelPrice?.freeCancellation && (
//               <div style={{ fontSize: '12px', color: '#2d5a2d', marginTop: '5px' }}>
//                 ✓ Free Cancellation Available
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       <div
//         style={{
//           padding: '20px',
//           border: '1px solid #eee',
//           borderRadius: '10px',
//           backgroundColor: '#f9f9f9',
//           boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
//         }}
//       >
//         <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Guest Information</h2>

//         <form onSubmit={handleSubmit}>
//           <label style={labelStyle}>First Name</label>
//           <input name="firstName" onChange={handleChange} style={inputStyle} required />

//           <label style={labelStyle}>Last Name</label>
//           <input name="lastName" onChange={handleChange} style={inputStyle} required />

//           <label style={labelStyle}>Email</label>
//           <input name="email" type="email" onChange={handleChange} style={inputStyle} required />

//           <label style={labelStyle}>Phone</label>
//           <input name="phone" onChange={handleChange} style={inputStyle} required />

//           <label style={labelStyle}>Special Requests</label>
//           <textarea
//             name="specialRequests"
//             onChange={handleChange}
//             style={{ ...inputStyle, height: '80px' }}
//             placeholder="Optional"
//           />

//           <button
//             type="submit"
//             disabled={submitting}
//             style={{
//               width: '100%',
//               padding: '12px',
//               backgroundColor: submitting ? '#6c757d' : '#007BFF',
//               color: '#fff',
//               fontSize: '16px',
//               border: 'none',
//               borderRadius: '5px',
//               cursor: submitting ? 'not-allowed' : 'pointer',
//             }}
//           >
//             {submitting ? 'Processing...' : `Book Now - ${formatPrice(getTotalPrice())}`}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }


'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';

type HotelDetails = {
  name?: string;
  address?: string;
  rating?: number;
  roomDescription?: string;
};

type PriceInfo = {
  price?: number;
  roomDescription?: string;
  freeCancellation?: boolean;
};

type BookingFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialRequests: string;
};

export default function BookingForm() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();

  const hotelId = params?.id || '';
  const destination_id = searchParams?.get('destination_id') ?? '';
  const checkin = searchParams?.get('checkin') ?? '';
  const checkout = searchParams?.get('checkout') ?? '';
  const guests = searchParams?.get('guests') ?? '';
  const rooms = searchParams?.get('rooms') ?? '1';

  const roomDescFromQuery = searchParams?.get('room_desc') || '';
  const roomPriceFromQuery = searchParams?.get('room_price') || '';

  const [hotelDetails, setHotelDetails] = useState<HotelDetails | null>(null);
  const [hotelPrice, setHotelPrice] = useState<PriceInfo | null>(null);
  const [formData, setFormData] = useState<BookingFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialRequests: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001/api').replace(/\/$/, '');

  const selectedRoomDescription = useMemo(
    () => roomDescFromQuery || hotelPrice?.roomDescription || hotelDetails?.roomDescription || '',
    [roomDescFromQuery, hotelPrice, hotelDetails]
  );

  // Parse rooms from query and guard it
  const roomsCount = useMemo(() => {
    const n = parseInt(rooms ?? '1', 10);
    return Number.isFinite(n) && n > 0 ? n : 1;
  }, [rooms]);

  const selectedNightly = useMemo(() => {
    const q = Number(roomPriceFromQuery);
    if (Number.isFinite(q) && q > 0) return q;
    return Number(hotelPrice?.price ?? 0);
  }, [roomPriceFromQuery, hotelPrice]);

  const calculateNights = () => {
    if (!checkin || !checkout) return 0;
    const start = new Date(checkin);
    const end = new Date(checkout);
    return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000));
  };

  // TOTAL = nightly × nights × rooms
  const getTotalPrice = () => selectedNightly * calculateNights() * roomsCount;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD' }).format(price);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Only create Stripe session (no DB write here)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    try {
      setSubmitting(true);

      const nights = calculateNights();
      const bookingDraft = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        specialRequests: formData.specialRequests,
        hotelId,
        hotelName: hotelDetails?.name || '',
        hotelAddress: hotelDetails?.address || '',
        checkIn: checkin,
        checkOut: checkout,
        guests,
        rooms, // keep original query value
        nights,
        totalPrice: getTotalPrice(),
        roomDescription: selectedRoomDescription,
      };

      const totalCents = Math.round(getTotalPrice() * 100);

      const stripeRes = await fetch(`${API_BASE}/payments/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalCents,
          hotelName: hotelDetails?.name || 'Hotel Booking',
          email: formData.email,
          bookingDraft,
        }),
      });

      if (!stripeRes.ok) {
        const errorText = await stripeRes.text();
        console.error('Stripe API error:', errorText);
        alert(`Payment initiation failed — ${errorText || 'please try again.'}`);
        return;
      }

      const { url } = (await stripeRes.json()) as { url?: string };
      if (!url) {
        console.error('Stripe did not return a URL');
        alert('Payment initiation failed — please try again.');
        return;
      }

      window.location.href = url;
    } catch (err) {
      console.error(err);
      alert('Error submitting booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    async function fetchBookingData() {
      if (!hotelId || !destination_id || !checkin || !checkout || !guests) {
        setLoading(false);
      } else {
        try {
          const hotelRes = await fetch(`${API_BASE}/hotels/${hotelId}`);
          if (hotelRes.ok) setHotelDetails(await hotelRes.json());

          const priceRes = await fetch(
            `${API_BASE}/hotels/${hotelId}/prices?destination_id=${destination_id}&checkin=${checkin}&checkout=${checkout}&guests=${guests}`
          );
          if (priceRes.ok) {
            const priceData: any = await priceRes.json();
            const nightly: number =
              typeof priceData.price === 'number'
                ? priceData.price
                : Number(priceData?.rooms?.[0]?.price ?? 0);

            const inferredRoomDesc: string =
              priceData?.rooms?.[0]?.roomDescription ||
              priceData?.roomDescription ||
              roomDescFromQuery ||
              '';

            setHotelPrice({
              price: nightly,
              roomDescription: inferredRoomDesc,
              freeCancellation: Boolean(priceData?.freeCancellation),
            });
          }
        } catch (error) {
          console.error('Error fetching booking data:', error);
        } finally {
          setLoading(false);
        }
      }
    }

    fetchBookingData();
  }, [hotelId, destination_id, checkin, checkout, guests, API_BASE, roomDescFromQuery]);

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px',
    marginBottom: '12px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '14px',
  };
  const labelStyle: React.CSSProperties = { fontWeight: 'bold', marginBottom: '4px', display: 'block' };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '18px' }}>Loading booking details...</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px' }}>
      {hotelDetails && (
        <div
          style={{
            marginBottom: '30px',
            padding: '20px',
            border: '1px solid #eee',
            borderRadius: '10px',
            backgroundColor: '#f8f9fa',
          }}
        >
          <h2 style={{ marginBottom: '15px', color: '#333' }}>Booking Summary</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <h3 style={{ margin: '0 0 10px 0', color: '#555' }}>{hotelDetails.name}</h3>
              <p style={{ margin: '5px 0', color: '#666' }}>{hotelDetails.address}</p>
              <p style={{ margin: '5px 0', color: '#666' }}>
                {'★'.repeat(hotelDetails.rating || 0)} ({hotelDetails.rating} star)
              </p>
            </div>
            <div>
              <p><strong>Check-in:</strong> {checkin}</p>
              <p><strong>Check-out:</strong> {checkout}</p>
              <p><strong>Guests:</strong> {guests}</p>
              <p><strong>Rooms:</strong> {rooms}</p>
              {/* New line directly below the existing Rooms row */}
              <p><strong>Number of rooms:</strong> {roomsCount}</p>
              <p><strong>Nights:</strong> {calculateNights()}</p>
              <p><strong>Room:</strong> {selectedRoomDescription || '—'}</p>
            </div>
          </div>
          <div
            style={{
              marginTop: '15px',
              padding: '15px',
              backgroundColor: '#e8f5e8',
              borderRadius: '5px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2d5a2d' }}>
              Total: {formatPrice(getTotalPrice())}
            </div>
            <div style={{ fontSize: '14px', color: '#5a7a5a' }}>
              ({formatPrice(selectedNightly)} per night × {calculateNights()} nights × {roomsCount} room{roomsCount > 1 ? 's' : ''})
            </div>
            {hotelPrice?.freeCancellation && (
              <div style={{ fontSize: '12px', color: '#2d5a2d', marginTop: '5px' }}>
                ✓ Free Cancellation Available
              </div>
            )}
          </div>
        </div>
      )}

      <div
        style={{
          padding: '20px',
          border: '1px solid #eee',
          borderRadius: '10px',
          backgroundColor: '#f9f9f9',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Guest Information</h2>

        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>First Name</label>
          <input name="firstName" onChange={handleChange} style={inputStyle} required />

          <label style={labelStyle}>Last Name</label>
          <input name="lastName" onChange={handleChange} style={inputStyle} required />

          <label style={labelStyle}>Email</label>
          <input name="email" type="email" onChange={handleChange} style={inputStyle} required />

          <label style={labelStyle}>Phone</label>
          <input name="phone" onChange={handleChange} style={inputStyle} required />

          <label style={labelStyle}>Special Requests</label>
          <textarea
            name="specialRequests"
            onChange={handleChange}
            style={{ ...inputStyle, height: '80px' }}
            placeholder="Optional"
          />

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: submitting ? '#6c757d' : '#007BFF',
              color: '#fff',
              fontSize: '16px',
              border: 'none',
              borderRadius: '5px',
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? 'Processing...' : `Book Now - ${formatPrice(getTotalPrice())}`}
          </button>
        </form>
      </div>
    </div>
  );
}