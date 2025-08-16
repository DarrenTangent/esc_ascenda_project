'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function SupportForm() {
  const sp = useSearchParams();
  const prefillId = sp.get('bookingId') || '';
  const [email, setEmail] = useState('');
  const [refId, setRefId] = useState(prefillId);
  const [message, setMessage] = useState('');

  const API = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001/api').replace(/\/$/, '');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/support`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, bookingId: refId, message }),
      });
      if (!res.ok) throw new Error(await res.text());
      alert('Support request submitted. Our team will contact you soon.');
      setMessage('');
    } catch (err) {
      console.error('Support submit failed:', err);
      alert('Failed to submit support request.');
    }
  };

  const fieldCls =
    'w-full border rounded px-3 py-2 text-black caret-black placeholder-gray-400 ' +
    'focus:outline-none focus:ring-2 focus:ring-black focus:border-black';

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <div className="container mx-auto px-4 py-8 max-w-xl">
        <h1 className="text-2xl font-bold mb-4">Contact Support</h1>
        <p className="mb-6">
          {prefillId
            ? 'We found your booking reference. Tell us what you need help with.'
            : 'No booking reference detected. You can still send us a general inquiry.'}
        </p>

        <form onSubmit={submit} className="bg-white p-6 rounded-lg shadow space-y-4">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={fieldCls}
              placeholder="your.email@example.com"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Booking Reference (optional)</label>
            <input
              type="text"
              value={refId}
              onChange={(e) => setRefId(e.target.value)}
              className={fieldCls}
              placeholder="Leave blank if no booking"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={5}
              className={fieldCls}
              placeholder="Describe your issue or question..."
            />
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition"
          >
            Send Support Request
          </button>
        </form>
      </div>
    </div>
  );
}
