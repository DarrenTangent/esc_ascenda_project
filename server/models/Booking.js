// server/models/Booking.js
const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema(
  {
    // Guest
    firstName: { type: String, required: true, trim: true },
    lastName:  { type: String, required: true, trim: true },
    email:     { type: String, required: true, match: /\S+@\S+\.\S+/ },
    phone:     { type: String, required: true },
    specialRequests: String,
    // billingAddress: { type: String, required: true }, // removed

    // Hotel / stay
    hotelId: String,
    hotelName: { type: String, required: true },
    hotelAddress: String,
    checkIn:  { type: Date, required: true },
    checkOut: { type: Date, required: true },
    nights:   { type: Number, required: true },
    guests:   { type: String, required: true },
    rooms:    { type: String, required: true },
    totalPrice: { type: Number, required: true },
    roomDescription: { type: String },

    // Payment (Stripe meta only)
    paymentIntentId: String,
    cardLast4: String,
    cardBrand: String,

    // Status
    status: { type: String, enum: ['Confirmed', 'Cancelled'], default: 'Confirmed' },
    paid: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', BookingSchema);
