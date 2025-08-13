
// client/utils/stripeCheckout.js
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001/api';

export async function startStripeCheckout({ amount, hotelName, email, bookingId }) {
  const res = await fetch(`${API_BASE_URL}/payments/create-checkout-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, hotelName, email, bookingId }),
  });

  const data = await res.json();
  if (data?.url) {
    window.location.href = data.url;
  } else {
    console.error('Stripe session error:', data);
    alert('Error creating Stripe Checkout session');
  }
}
