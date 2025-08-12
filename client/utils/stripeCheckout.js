git 
// client/utils/stripeCheckout.js
export async function startStripeCheckout({ amount, hotelName, email, bookingId }) {
  const res = await fetch('http://localhost:5001/api/payments/create-checkout-session', {
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
