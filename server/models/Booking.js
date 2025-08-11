const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName:  { type: String, required: true, trim: true },
  email:     { type: String, required: true, match: /\S+@\S+\.\S+/ },
  phone:     { type: String, required: true },
  specialRequests: String,
  cardNumber: { type: String, required: true, match: /^\d{13,19}$/ }, // basic check
  expiry:     { type: String, required: true, match: /^(0[1-9]|1[0-2])\/\d{2}$/ },
  cvv:        { type: String, required: true, match: /^\d{3,4}$/ },
  billingAddress: { type: String, required: true },
  createdAt:  { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', BookingSchema);
