import React, { useState } from 'react';
import { useRouter } from 'next/router';

export default function BookingForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    specialRequests: '', cardNumber: '', expiry: '', cvv: '', billingAddress: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const API_BASE =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:5000';

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

      // Redirect to details page
      router.push(`/booking/${id}`);
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

  return (
    <div style={{
      maxWidth: '500px', margin: '40px auto', padding: '20px',
      border: '1px solid #eee', borderRadius: '10px', backgroundColor: '#f9f9f9',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)', fontFamily: 'Arial, sans-serif'
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Booking Form</h2>

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
          {submitting ? 'Submitting...' : 'Book Now'}
        </button>
      </form>
    </div>
  );
}
