const mongoose = require('mongoose');
// the contents of the Booking form
const BookingSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  specialRequests: String,
  cardNumber: String,       // ⚠️ Don't store this in production (use Stripe)
  expiry: String,
  cvv: String,
  billingAddress: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', BookingSchema);
