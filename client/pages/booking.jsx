import BookingForm from '../components/BookingForm';
import React from 'react';

export default function BookingPage() {
  return (
    <div>
      <h1 style={{ textAlign: 'center', marginTop: '40px' }}>Book Your Stay</h1>
      <BookingForm />
    </div>
  );
}