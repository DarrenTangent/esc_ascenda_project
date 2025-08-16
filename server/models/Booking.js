
const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  // Guest
  firstName: { type: String, required: true, trim: true },
  lastName:  { type: String, required: true, trim: true },
  email:     { type: String, required: true, match: /\S+@\S+\.\S+/ },
  phone:     { type: String, required: true },
  specialRequests: String,
  billingAddress: { type: String, required: true },

  // Hotel / stay
  hotelId: String,
  hotelName: String,
  hotelAddress: String,
  checkIn: { type: Date },
  checkOut: { type: Date },
  nights: Number,
  guests: String,     // keep as String to match your UI (it calls parseInt on it)
  rooms: String,      // keep as String to match your UI
  totalPrice: Number,
  roomDescription: { type: String, required: false }, // ✅ new

  // Payment (no raw card fields)
  paymentIntentId: String,
  cardLast4: String,
  cardBrand: String,
  paid: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);
