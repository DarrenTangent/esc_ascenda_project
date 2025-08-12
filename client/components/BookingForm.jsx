// 'use client';

// import React, { useState, useEffect } from 'react';
// import { useRouter, useParams, useSearchParams } from 'next/navigation';
// import { startStripeCheckout } from '@/utils/stripeCheckout';


// export default function BookingForm() {
//   const router = useRouter();
//   const params = useParams();
//   const searchParams = useSearchParams();
  
//   const hotelId = params?.id;
//   const destination_id = searchParams?.get('destination_id');
//   const checkin = searchParams?.get('checkin');
//   const checkout = searchParams?.get('checkout');
//   const guests = searchParams?.get('guests');
//   const rooms = searchParams?.get('rooms');

//   const [hotelDetails, setHotelDetails] = useState(null);
//   const [hotelPrice, setHotelPrice] = useState(null);
//   const [formData, setFormData] = useState({
//     hotelId: hotelId || '',
//     destination_id: destination_id || '',
//     checkin: checkin || '',
//     checkout: checkout || '',
//     guests: guests || '',
//     rooms: rooms || '',
//     firstName: '', 
//     lastName: '', 
//     email: '', 
//     phone: '',
//     specialRequests: '', 
//     cardNumber: '', 
//     expiry: '', 
//     cvv: '', 
//     billingAddress: ''
//   });
//   const [submitting, setSubmitting] = useState(false);
//   const [loading, setLoading] = useState(true);

//   const API_BASE =
//     process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:5001';

//   // Fetch hotel details and pricing when component loads
//   useEffect(() => {
//     async function fetchBookingData() {
//       if (!hotelId || !destination_id || !checkin || !checkout || !guests) {
//         setLoading(false);
//         return;
//       }

//       try {
//         // Fetch hotel details
//         const hotelRes = await fetch(`${API_BASE}/api/hotels/${hotelId}`);
//         if (hotelRes.ok) {
//           const hotelData = await hotelRes.json();
//           setHotelDetails(hotelData);
//         }

//         // Fetch hotel pricing
//         const priceRes = await fetch(
//           `${API_BASE}/api/hotels/${hotelId}/price?destination_id=${destination_id}&checkin=${checkin}&checkout=${checkout}&guests=${guests}`
//         );
//         if (priceRes.ok) {
//           const priceData = await priceRes.json();
//           setHotelPrice(priceData);
//         }
//       } catch (error) {
//         console.error('Error fetching booking data:', error);
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchBookingData();
//   }, [hotelId, destination_id, checkin, checkout, guests, API_BASE]);

//   const handleChange = (e) =>
//     setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

//     const handleSubmit = async (e) => {
//   e.preventDefault();
//   if (submitting) return;

//   try {
//     setSubmitting(true);

//     const nights = calculateNights();
//     const payload = {
//       firstName: formData.firstName,
//       lastName: formData.lastName,
//       email: formData.email,
//       phone: formData.phone,
//       specialRequests: formData.specialRequests,
//       billingAddress: formData.billingAddress,
//       hotelId,
//       hotelName: hotelDetails?.name || '',
//       hotelAddress: hotelDetails?.address || '',
//       checkIn: checkin,
//       checkOut: checkout,
//       guests,
//       rooms,
//       nights,
//       totalPrice: getTotalPrice(),
//     };

//     // 1. Create booking (correct endpoint)
//     const bookingRes = await fetch(`${API_BASE}/api/bookings`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(payload),
//     });

//     if (!bookingRes.ok) {
//       const errorText = await bookingRes.text();
//       console.error('Booking API error:', errorText);
//       throw new Error('Booking creation failed');
//     }

//     const bookingData = await bookingRes.json();
//     const bookingId = bookingData?.booking?._id || bookingData?._id;
//     if (!bookingId) throw new Error('No booking id returned');

//     // 2. Create Stripe session
//     const totalCents = Math.round(getTotalPrice() * 100);
//     const stripeRes = await fetch(`${API_BASE}/api/payments/create-checkout-session`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         amount: totalCents,
//         hotelName: hotelDetails?.name || 'Hotel Booking',
//         email: formData.email,
//         bookingId,
//       }),
//     });

//     if (!stripeRes.ok) {
//       const errorText = await stripeRes.text();
//       console.error('Stripe API error:', errorText);
//       throw new Error('Stripe session creation failed');
//     }

//     const stripeData = await stripeRes.json();
//     window.location.href = stripeData.url;

//   } catch (err) {
//     console.error(err);
//     alert('Error submitting booking. Please try again.');
//   } finally {
//     setSubmitting(false);
//   }
// };







//   const inputStyle = {
//     width: '100%', padding: '10px', marginBottom: '12px',
//     borderRadius: '5px', border: '1px solid #ccc', fontSize: '14px'
//   };
//   const labelStyle = { fontWeight: 'bold', marginBottom: '4px', display: 'block' };

//   const formatPrice = (price) => {
//     return new Intl.NumberFormat('en-SG', {
//       style: 'currency',
//       currency: 'SGD'
//     }).format(price);
//   };

//   const calculateNights = () => {
//     if (!checkin || !checkout) return 0;
//     const start = new Date(checkin);
//     const end = new Date(checkout);
//     return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
//   };

//   const getTotalPrice = () => {
//     if (!hotelPrice) return 0;
//     return hotelPrice.price * calculateNights();
//   };

//   if (loading) {
//     return (
//       <div style={{ textAlign: 'center', padding: '40px' }}>
//         <div style={{ fontSize: '18px' }}>Loading booking details...</div>
//       </div>
//     );
//   }

//   return (
//     <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px' }}>
//       {/* Booking Summary */}
//       {hotelDetails && (
//         <div style={{
//           marginBottom: '30px', padding: '20px', border: '1px solid #eee',
//           borderRadius: '10px', backgroundColor: '#f8f9fa'
//         }}>
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
//               <p style={{ margin: '5px 0' }}><strong>Check-in:</strong> {checkin}</p>
//               <p style={{ margin: '5px 0' }}><strong>Check-out:</strong> {checkout}</p>
//               <p style={{ margin: '5px 0' }}><strong>Guests:</strong> {guests}</p>
//               <p style={{ margin: '5px 0' }}><strong>Rooms:</strong> {rooms}</p>
//               <p style={{ margin: '5px 0' }}><strong>Nights:</strong> {calculateNights()}</p>
//             </div>
//           </div>
//           {hotelPrice && (
//             <div style={{
//               marginTop: '15px', padding: '15px', backgroundColor: '#e8f5e8',
//               borderRadius: '5px', textAlign: 'center'
//             }}>
//               <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2d5a2d' }}>
//                 Total: {formatPrice(getTotalPrice())}
//               </div>
//               <div style={{ fontSize: '14px', color: '#5a7a5a' }}>
//                 ({formatPrice(hotelPrice.price)} per night × {calculateNights()} nights)
//               </div>
//               {hotelPrice.freeCancellation && (
//                 <div style={{ fontSize: '12px', color: '#2d5a2d', marginTop: '5px' }}>
//                   ✓ Free Cancellation Available
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       )}

//       {/* Booking Form */}
//       <div style={{
//         padding: '20px', border: '1px solid #eee', borderRadius: '10px',
//         backgroundColor: '#f9f9f9', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
//         fontFamily: 'Arial, sans-serif'
//       }}>
//         <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Guest Information</h2>

//       <form onSubmit={handleSubmit}>
//         <label style={labelStyle}>First Name</label>
//         <input name="firstName" onChange={handleChange} placeholder="First Name" style={inputStyle} />

//         <label style={labelStyle}>Last Name</label>
//         <input name="lastName" onChange={handleChange} placeholder="Last Name" style={inputStyle} />

//         <label style={labelStyle}>Email</label>
//         <input name="email" type="text" onChange={handleChange} placeholder="Email" style={inputStyle} />

//         <label style={labelStyle}>Phone</label>
//         <input name="phone" onChange={handleChange} placeholder="Phone" style={inputStyle} />

//         <label style={labelStyle}>Special Requests</label>
//         <textarea
//           name="specialRequests"
//           onChange={handleChange}
//           placeholder="Special Requests"
//           style={{ ...inputStyle, height: '80px' }}
//         />

//         <label style={labelStyle}>Card Number</label>
//         <input name="cardNumber" onChange={handleChange} placeholder="Card Number" style={inputStyle} />

//         <label style={labelStyle}>Expiry</label>
//         <input name="expiry" onChange={handleChange} placeholder="MM/YY" style={inputStyle} />

//         <label style={labelStyle}>CVV</label>
//         <input name="cvv" onChange={handleChange} placeholder="CVV" style={inputStyle} />

//         <label style={labelStyle}>Billing Address</label>
//         <input name="billingAddress" onChange={handleChange} placeholder="Billing Address" style={inputStyle} />

//         <button
//           type="submit"
//           disabled={submitting}
//           style={{
//             width: '100%', padding: '12px',
//             backgroundColor: submitting ? '#6c757d' : '#007BFF',
//             color: '#fff', fontSize: '16px', border: 'none',
//             borderRadius: '5px', cursor: submitting ? 'not-allowed' : 'pointer'
//           }}
//         >
//           {submitting ? 'Processing...' : `Book Now - ${hotelPrice ? formatPrice(getTotalPrice()) : 'Calculating...'}`}
//         </button>
//       </form>
//       </div>
//     </div>
//   );
// }

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { startStripeCheckout } from '@/utils/stripeCheckout';

export default function BookingForm() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const hotelId = params?.id;
  const destination_id = searchParams?.get('destination_id');
  const checkin = searchParams?.get('checkin');
  const checkout = searchParams?.get('checkout');
  const guests = searchParams?.get('guests');
  const rooms = searchParams?.get('rooms');

  const [hotelDetails, setHotelDetails] = useState(null);
  const [hotelPrice, setHotelPrice] = useState(null);
  const [formData, setFormData] = useState({
    hotelId: hotelId || '',
    destination_id: destination_id || '',
    checkin: checkin || '',
    checkout: checkout || '',
    guests: guests || '',
    rooms: rooms || '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialRequests: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
    billingAddress: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const API_BASE =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:5001';

const calculateNights = () => {
  if (!checkin || !checkout) return 0;
  const start = new Date(checkin);
  const end = new Date(checkout);
  return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000));
};

const getTotalPrice = () => {
  const nightly = Number(hotelPrice?.price ?? 0);
  return nightly * calculateNights();
};


  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: 'SGD'
    }).format(price);
  };

  // ===== Event handlers =====
  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    try {
      setSubmitting(true);

      const nights = calculateNights();
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        specialRequests: formData.specialRequests,
        billingAddress: formData.billingAddress,
        hotelId,
        hotelName: hotelDetails?.name || '',
        hotelAddress: hotelDetails?.address || '',
        checkIn: checkin,
        checkOut: checkout,
        guests,
        rooms,
        nights,
        totalPrice: getTotalPrice(),
      };

      // 1. Create booking
      const bookingRes = await fetch(`${API_BASE}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      console.log('hotelPrice ->', hotelPrice);
console.log('nights ->', calculateNights());
console.log('total ->', getTotalPrice());

      if (!bookingRes.ok) {
        const errorText = await bookingRes.text();
        console.error('Booking API error:', errorText);
        alert('Booking failed — please try again.');
        return;
      }

      const bookingData = await bookingRes.json();
      const bookingId = bookingData?.booking?._id || bookingData?._id;
      if (!bookingId) {
        console.error('Booking API did not return booking id:', bookingData);
        alert('Booking failed — please try again.');
        return;
      }
      console.log("hotelPrice", hotelPrice);
console.log("total price", getTotalPrice());

      // 2. Create Stripe session
      const totalCents = Math.round(getTotalPrice() * 100);
      const stripeRes = await fetch(`${API_BASE}/api/payments/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalCents,
          hotelName: hotelDetails?.name || 'Hotel Booking',
          email: formData.email,
          bookingId,
        }),
      });

      if (!stripeRes.ok) {
        const errorText = await stripeRes.text();
        console.error('Stripe API error:', errorText);
        alert('Payment initiation failed — please try again.');
        return;
      }

      const stripeData = await stripeRes.json();
      if (!stripeData?.url) {
        console.error('Stripe did not return a URL:', stripeData);
        alert('Payment initiation failed — please try again.');
        return;
      }

      // Redirect to Stripe Checkout
      window.location.href = stripeData.url;

    } catch (err) {
      console.error(err);
      alert('Error submitting booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ===== Fetch hotel data =====
  useEffect(() => {
    async function fetchBookingData() {
      if (!hotelId || !destination_id || !checkin || !checkout || !guests) {
        setLoading(false);
        return;
      }

      try {
        // Fetch hotel details
        const hotelRes = await fetch(`${API_BASE}/api/hotels/${hotelId}`);
        if (hotelRes.ok) {
          const hotelData = await hotelRes.json();
          setHotelDetails(hotelData);
        }

        // Fetch hotel pricing
        // replace the old fetch to /price with this:
const priceRes = await fetch(
  `${API_BASE}/api/hotels/${hotelId}/prices?destination_id=${destination_id}&checkin=${checkin}&checkout=${checkout}&guests=${guests}`
);
if (priceRes.ok) {
  const priceData = await priceRes.json();

  // pick a price: prefer top-level price, else first room’s price
  const nightly =
    typeof priceData.price === 'number'
      ? priceData.price
      : Number(priceData?.rooms?.[0]?.price ?? 0);

  setHotelPrice({ price: nightly }); // keep shape { price: number }
}
} catch (error) {
        console.error('Error fetching booking data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchBookingData();
  }, [hotelId, destination_id, checkin, checkout, guests, API_BASE]);

  // ===== Styles =====
  const inputStyle = {
    width: '100%', padding: '10px', marginBottom: '12px',
    borderRadius: '5px', border: '1px solid #ccc', fontSize: '14px'
  };
  const labelStyle = { fontWeight: 'bold', marginBottom: '4px', display: 'block' };

  // ===== Loading state =====
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '18px' }}>Loading booking details...</div>
      </div>
    );
  }

  // ===== Render =====
  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px' }}>
      {/* Booking Summary */}
      {hotelDetails && (
        <div style={{
          marginBottom: '30px', padding: '20px', border: '1px solid #eee',
          borderRadius: '10px', backgroundColor: '#f8f9fa'
        }}>
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
              <p><strong>Nights:</strong> {calculateNights()}</p>
            </div>
          </div>
          {hotelPrice && (
            <div style={{
              marginTop: '15px', padding: '15px', backgroundColor: '#e8f5e8',
              borderRadius: '5px', textAlign: 'center'
            }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2d5a2d' }}>
                Total: {formatPrice(getTotalPrice())}
              </div>
              <div style={{ fontSize: '14px', color: '#5a7a5a' }}>
                ({formatPrice(hotelPrice.price)} per night × {calculateNights()} nights)
              </div>
              {hotelPrice.freeCancellation && (
                <div style={{ fontSize: '12px', color: '#2d5a2d', marginTop: '5px' }}>
                  ✓ Free Cancellation Available
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Booking Form */}
      <div style={{
        padding: '20px', border: '1px solid #eee', borderRadius: '10px',
        backgroundColor: '#f9f9f9', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Guest Information</h2>

        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>First Name</label>
          <input name="firstName" onChange={handleChange} style={inputStyle} />

          <label style={labelStyle}>Last Name</label>
          <input name="lastName" onChange={handleChange} style={inputStyle} />

          <label style={labelStyle}>Email</label>
          <input name="email" type="email" onChange={handleChange} style={inputStyle} />

          <label style={labelStyle}>Phone</label>
          <input name="phone" onChange={handleChange} style={inputStyle} />

          <label style={labelStyle}>Special Requests</label>
          <textarea name="specialRequests" onChange={handleChange}
            style={{ ...inputStyle, height: '80px' }} />

          <label style={labelStyle}>Card Number</label>
          <input name="cardNumber" onChange={handleChange} style={inputStyle} />

          <label style={labelStyle}>Expiry</label>
          <input name="expiry" onChange={handleChange} style={inputStyle} />

          <label style={labelStyle}>CVV</label>
          <input name="cvv" onChange={handleChange} style={inputStyle} />

          <label style={labelStyle}>Billing Address</label>
          <input name="billingAddress" onChange={handleChange} style={inputStyle} />

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%', padding: '12px',
              backgroundColor: submitting ? '#6c757d' : '#007BFF',
              color: '#fff', fontSize: '16px', border: 'none',
              borderRadius: '5px', cursor: submitting ? 'not-allowed' : 'pointer'
            }}
          >
            {submitting
              ? 'Processing...'
              : `Book Now - ${hotelPrice ? formatPrice(getTotalPrice()) : 'Calculating...'}`}
          </button>
        </form>
      </div>
    </div>
  );
}
