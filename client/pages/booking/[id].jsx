// client/pages/booking/[id].jsx
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function BookingDetailsPage() {
  const router = useRouter();
  const { isReady, query } = router;
  const id = query?.id;

  const [booking, setBooking] = useState(null);
  const [error, setError] = useState('');

  const API_BASE =
    (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')) ||
    'http://localhost:5000';

  useEffect(() => {
    if (!isReady || !id) return;

    const ac = new AbortController();
    setError('');
    setBooking(null); // reset when id changes

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/bookings/${id}`, { signal: ac.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        // minimal guard; tests often return plain objects
        if (data?.error) {
          setError(data.error);
        } else {
          setBooking(data);
        }
      } catch (e) {
        if (!ac.signal.aborted) setError('Error fetching booking');
      }
    })();

    return () => ac.abort();
  }, [isReady, id, API_BASE]);

  if (error) return <div>{error}</div>;
  if (!booking) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2>Booking Details</h2>
      <p><strong>Name:</strong> {booking.firstName} {booking.lastName}</p>
      <p><strong>Email:</strong> {booking.email}</p>
      <p><strong>Phone:</strong> {booking.phone}</p>
      <p><strong>Special Requests:</strong> {booking.specialRequests}</p>
      <p><strong>Billing Address:</strong> {booking.billingAddress}</p>
      <p><strong>Card:</strong> **** **** **** {booking.cardNumber?.slice(-4)}</p>
    </div>
  );
}
