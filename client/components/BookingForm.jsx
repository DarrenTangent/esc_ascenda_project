import { useState } from 'react';

export default function BookingForm() {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    specialRequests: '', cardNumber: '', expiry: '', cvv: '', billingAddress: ''
  });

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    // to send the bookings to mongoDB database
    await fetch('http://localhost:5000/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    alert('Booking submitted');
  };


  return (
    <form onSubmit={handleSubmit}>
      <input name="firstName" onChange={handleChange} placeholder="First Name" />
      <input name="lastName" onChange={handleChange} placeholder="Last Name" />
      <input name="email" type="email" onChange={handleChange} placeholder="Email" />
      <input name="phone" onChange={handleChange} placeholder="Phone" />
      <textarea name="specialRequests" onChange={handleChange} placeholder="Special Requests" />
      <input name="cardNumber" onChange={handleChange} placeholder="Card Number" />
      <input name="expiry" onChange={handleChange} placeholder="MM/YY" />
      <input name="cvv" onChange={handleChange} placeholder="CVV" />
      <input name="billingAddress" onChange={handleChange} placeholder="Billing Address" />
      <button type="submit">Book Now</button>
    </form>
  );
}
