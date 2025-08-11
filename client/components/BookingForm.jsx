'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';

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

  // Fetch hotel details and pricing when component loads
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
        const priceRes = await fetch(
          `${API_BASE}/api/hotels/${hotelId}/price?destination_id=${destination_id}&checkin=${checkin}&checkout=${checkout}&guests=${guests}`
        );
        if (priceRes.ok) {
          const priceData = await priceRes.json();
          setHotelPrice(priceData);
        }
      } catch (error) {
        console.error('Error fetching booking data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchBookingData();
  }, [hotelId, destination_id, checkin, checkout, guests, API_BASE]);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Basic validation
    const requiredFields = [
      'firstName', 'lastName', 'email', 'phone',
      'specialRequests', 'cardNumber', 'expiry', 'cvv', 'billingAddress'
    ];
    const missing = requiredFields.filter((f) => !formData[f]?.trim());
    if (missing.length) {
      alert('Please fill in all required fields.');
      return;
    }
    if (!emailRegex.test(formData.email)) {
      alert('Please enter a valid email address.');
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch(`${API_BASE}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error(`Submission failed (status ${res.status})`);

      const data = await res.json(); // { message, booking }
      const id = data?.booking?._id || data?._id;
      if (!id) throw new Error('Missing booking id');

      // Redirect to booking details page
      router.push(`/booking/details/${id}`);
    } catch (err) {
      console.error(err);
      alert('Error submitting booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '10px', marginBottom: '12px',
    borderRadius: '5px', border: '1px solid #ccc', fontSize: '14px'
  };
  const labelStyle = { fontWeight: 'bold', marginBottom: '4px', display: 'block' };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: 'SGD'
    }).format(price);
  };

  const calculateNights = () => {
    if (!checkin || !checkout) return 0;
    const start = new Date(checkin);
    const end = new Date(checkout);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  };

  const getTotalPrice = () => {
    if (!hotelPrice) return 0;
    return hotelPrice.price * calculateNights();
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '18px' }}>Loading booking details...</div>
      </div>
    );
  }

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
              <p style={{ margin: '5px 0' }}><strong>Check-in:</strong> {checkin}</p>
              <p style={{ margin: '5px 0' }}><strong>Check-out:</strong> {checkout}</p>
              <p style={{ margin: '5px 0' }}><strong>Guests:</strong> {guests}</p>
              <p style={{ margin: '5px 0' }}><strong>Rooms:</strong> {rooms}</p>
              <p style={{ margin: '5px 0' }}><strong>Nights:</strong> {calculateNights()}</p>
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
        backgroundColor: '#f9f9f9', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        fontFamily: 'Arial, sans-serif'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Guest Information</h2>

      <form onSubmit={handleSubmit}>
        <label style={labelStyle}>First Name</label>
        <input name="firstName" onChange={handleChange} placeholder="First Name" style={inputStyle} />

        <label style={labelStyle}>Last Name</label>
        <input name="lastName" onChange={handleChange} placeholder="Last Name" style={inputStyle} />

        <label style={labelStyle}>Email</label>
        <input name="email" type="text" onChange={handleChange} placeholder="Email" style={inputStyle} />

        <label style={labelStyle}>Phone</label>
        <input name="phone" onChange={handleChange} placeholder="Phone" style={inputStyle} />

        <label style={labelStyle}>Special Requests</label>
        <textarea
          name="specialRequests"
          onChange={handleChange}
          placeholder="Special Requests"
          style={{ ...inputStyle, height: '80px' }}
        />

        <label style={labelStyle}>Card Number</label>
        <input name="cardNumber" onChange={handleChange} placeholder="Card Number" style={inputStyle} />

        <label style={labelStyle}>Expiry</label>
        <input name="expiry" onChange={handleChange} placeholder="MM/YY" style={inputStyle} />

        <label style={labelStyle}>CVV</label>
        <input name="cvv" onChange={handleChange} placeholder="CVV" style={inputStyle} />

        <label style={labelStyle}>Billing Address</label>
        <input name="billingAddress" onChange={handleChange} placeholder="Billing Address" style={inputStyle} />

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
          {submitting ? 'Processing...' : `Book Now - ${hotelPrice ? formatPrice(getTotalPrice()) : 'Calculating...'}`}
        </button>
      </form>
      </div>
    </div>
  );
}
