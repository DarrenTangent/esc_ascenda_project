
import { useState } from 'react';
import React from 'react';


export default function BookingForm() {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    specialRequests: '', cardNumber: '', expiry: '', cvv: '', billingAddress: ''
  });

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();

    // Basic validation (add more if needed)
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.cardNumber || !formData.phone || !formData.specialRequests || !formData.expiry || !formData.cvv || !formData.billingAddress) {
      alert('Please fill in all required fields.');
      return;
    }

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Submission failed');
      }

      alert('Booking submitted');
    } catch (err) {
      alert('Error submitting booking. Please try again.');
      console.error(err);
    }
  };
  const inputStyle = {
    width: '100%',
    padding: '10px',
    marginBottom: '12px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '14px'
  };

  const labelStyle = {
    fontWeight: 'bold',
    marginBottom: '4px',
    display: 'block'
  };

  return (
    <div style={{
      maxWidth: '500px',
      margin: '40px auto',
      padding: '20px',
      border: '1px solid #eee',
      borderRadius: '10px',
      backgroundColor: '#f9f9f9',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Booking Form</h2>
      <form onSubmit={handleSubmit}>
        <label style={labelStyle}>First Name</label>
        <input name="firstName" onChange={handleChange} placeholder="First Name" style={inputStyle} />

        <label style={labelStyle}>Last Name</label>
        <input name="lastName" onChange={handleChange} placeholder="Last Name" style={inputStyle} />

        <label style={labelStyle}>Email</label>
        <input name="email" type="email" onChange={handleChange} placeholder="Email" style={inputStyle} />

        <label style={labelStyle}>Phone</label>
        <input name="phone" onChange={handleChange} placeholder="Phone" style={inputStyle} />

        <label style={labelStyle}>Special Requests</label>
        <textarea name="specialRequests" onChange={handleChange} placeholder="Special Requests" style={{ ...inputStyle, height: '80px' }} />

        <label style={labelStyle}>Card Number</label>
        <input name="cardNumber" onChange={handleChange} placeholder="Card Number" style={inputStyle} />

        <label style={labelStyle}>Expiry</label>
        <input name="expiry" onChange={handleChange} placeholder="MM/YY" style={inputStyle} />

        <label style={labelStyle}>CVV</label>
        <input name="cvv" onChange={handleChange} placeholder="CVV" style={inputStyle} />

        <label style={labelStyle}>Billing Address</label>
        <input name="billingAddress" onChange={handleChange} placeholder="Billing Address" style={inputStyle} />

        <button type="submit" style={{
          width: '100%',
          padding: '12px',
          backgroundColor: '#007BFF',
          color: '#fff',
          fontSize: '16px',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}>
          Book Now
        </button>
      </form>
    </div>
  );
}
