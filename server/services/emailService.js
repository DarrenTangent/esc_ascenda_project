
// server/services/emailService.js
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
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  const testAcc = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: testAcc.smtp.host,
    port: testAcc.smtp.port,
    secure: testAcc.smtp.secure,
    auth: { user: testAcc.user, pass: testAcc.pass },
  });
}

async function sendBookingConfirmation(to, booking, confirmationUrl) {
  const transporter = await buildTransport();
  const from = process.env.SMTP_FROM || 'Bookings <no-reply@example.com>';

  const html = `
    <h2>Thanks for your booking!</h2>
    <p><b>Booking ID:</b> ${booking._id}</p>
    <p><b>Hotel:</b> ${booking.hotelName || '-'}</p>
    <p><b>Address:</b> ${booking.hotelAddress || '-'}</p>
    <p><b>Dates:</b> ${booking.checkIn || '?'} → ${booking.checkOut || '?'}</p>
    <p><b>Guests/Rooms:</b> ${booking.guests || '-'} / ${booking.rooms || '-'}</p>
    <p><b>Total:</b> ${booking.totalPrice != null ? 'SGD ' + booking.totalPrice : '-'}</p>
    <p>You can view your booking here:</p>
    <a href="${confirmationUrl}">${confirmationUrl}</a>
  `;

  // IMPORTANT: send ONLY to the guest (no BCC)
  const info = await transporter.sendMail({
    from,
    to,
    subject: `Booking Confirmation #${booking._id}`,
    html,
  });

  const preview = nodemailer.getTestMessageUrl?.(info);
  if (preview) console.log('Email preview URL:', preview);
  return { ok: true, messageId: info.messageId, preview };
}

async function sendSupportMessage({ fromEmail, bookingId, message }) {
  const transporter = await buildTransport();
  const from = process.env.SMTP_FROM || 'Support <no-reply@example.com>';
  const to = process.env.SUPPORT_INBOX || process.env.SMTP_USER; // admin inbox only

  const html = `
    <h3>New Support Request</h3>
    <p><b>From:</b> ${fromEmail}</p>
    <p><b>Booking ID:</b> ${bookingId || '-'}</p>
    <p><b>Message:</b></p>
    <pre style="white-space:pre-wrap">${message}</pre>
  `;

  await transporter.sendMail({
    from,
    to,                 // ONLY the support inbox
    replyTo: fromEmail, // makes “Reply” go to the guest
    subject: `Support request ${bookingId ? `for #${bookingId}` : ''}`,
    html,
  });

  return { ok: true };
}

module.exports = { sendBookingConfirmation, sendSupportMessage };
