const nodemailer = require('nodemailer');

async function buildTransport() {
  if (process.env.NODE_ENV === 'test') {
    return nodemailer.createTransport({ jsonTransport: true });
  }
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
  }
  const testAcc = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: testAcc.smtp.host,
    port: testAcc.smtp.port,
    secure: testAcc.smtp.secure,
    auth: { user: testAcc.user, pass: testAcc.pass }
  });
}

exports.sendBookingConfirmation = async (to, booking) => {
  try {
    const transporter = await buildTransport();
    const from = process.env.SMTP_FROM || 'Bookings <no-reply@example.com>';

    const info = await transporter.sendMail({
      from, to,
      subject: `Booking Confirmation #${booking._id}`,
      html: `
        <h2>Thanks for your booking!</h2>
        <p>Booking ID: <b>${booking._id}</b></p>
        <p>Hotel: ${booking.hotelName || '-'}</p>
        <p>Address: ${booking.hotelAddress || '-'}</p>
        <p>Dates: ${booking.checkIn || '?'} → ${booking.checkOut || '?'}</p>
        <p>Guests/Rooms: ${booking.guests || '-'} / ${booking.rooms || '-'}</p>
        <p>Total: ${booking.totalPrice ? 'SGD ' + booking.totalPrice : '-'}</p>
      `
    });

    const preview = nodemailer.getTestMessageUrl?.(info);
    if (preview) console.log('Email preview URL:', preview);
    return { ok: true, messageId: info.messageId, preview };
  } catch (e) {
    console.error('Email send failed:', e.message);
    return { ok: false, error: e.message };
  }
};
