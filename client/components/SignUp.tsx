'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const SignUp = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    phoneNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  const [showVerification, setShowVerification] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData((s) => ({ ...s, [e.target.name]: e.target.value }));

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    void handleSubmit(e as any);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('http://localhost:5001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        setSuccess('Registration successful! Please verify your email.');
        setVerificationToken(data.verificationToken);
        setShowVerification(true);
        setFormData({ username: '', email: '', password: '', phoneNumber: '' });
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!verificationToken) return setError('No verification token available');

    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:5001/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verificationToken }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Email verified! You can now log in.');
        setShowVerification(false);
      } else setError(data.error || 'Email verification failed');
    } catch (err) {
      setError('Network error. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5001/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await res.json();
      if (data.success) {
        setVerificationToken(data.verificationToken);
        setSuccess('Verification email sent again!');
      } else setError(data.error || 'Failed to resend verification');
    } catch (err) {
      setError('Network error. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-[#EFF6FF] to-white py-10">
      <div className="mx-auto max-w-2xl px-6">
        <h2 className="text-4xl font-bold text-[#1E3A8A]">Create your account</h2>
        <p className="mt-2 text-slate-600">
          Already have an account?{' '}
          <Link href="/login" className="text-[#2563EB] underline hover:text-[#1E40AF]">
            Sign in
          </Link>
        </p>

        <div className="mt-8 rounded-2xl bg-white/70 p-6 shadow-xl ring-1 ring-black/5 backdrop-blur-md">
          {!showVerification ? (
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#1E3A8A]">Username</label>
                <input
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full rounded-lg border border-[#DBEAFE] bg-white/80 px-3 py-2 outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#93C5FD]"
                  placeholder="Enter your username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1E3A8A]">Email address</label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full rounded-lg border border-[#DBEAFE] bg-white/80 px-3 py-2 outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#93C5FD]"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1E3A8A]">Password</label>
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full rounded-lg border border-[#DBEAFE] bg-white/80 px-3 py-2 outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#93C5FD]"
                  placeholder="At least 8 characters"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Must be at least 8 characters with uppercase, lowercase, and number.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1E3A8A]">Phone Number</label>
                <input
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full rounded-lg border border-[#DBEAFE] bg-white/80 px-3 py-2 outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#93C5FD]"
                  placeholder="Enter your phone number"
                />
              </div>

              <button
                onClick={handleButtonClick}
                disabled={loading}
                className="w-full rounded-lg bg-[#3B82F6] py-2 font-semibold text-white hover:bg-[#2563EB] disabled:opacity-60"
              >
                {loading ? 'Creating Account…' : 'Sign Up'}
              </button>

              {error && <div className="rounded-md bg-red-100 p-3 text-red-700">{error}</div>}
              {success && <div className="rounded-md bg-green-100 p-3 text-green-700">{success}</div>}
            </form>
          ) : (
            <div className="space-y-5">
              <h3 className="text-lg font-semibold text-[#1E3A8A]">Verify Your Email</h3>
              <p className="text-sm text-slate-600">
                We’ve sent a verification link to your email. (Demo: use the button below.)
              </p>

              <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
                <strong>Demo token:</strong>
                <div className="mt-1 break-all text-xs">{verificationToken}</div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={handleVerifyEmail}
                  disabled={loading}
                  className="flex-1 rounded-lg bg-[#10B981] py-2 font-semibold text-white hover:bg-[#059669] disabled:opacity-60"
                >
                  {loading ? 'Verifying…' : 'Verify Email'}
                </button>
                <button
                  onClick={handleResendVerification}
                  disabled={loading}
                  className="flex-1 rounded-lg border border-[#DBEAFE] bg-white/80 py-2 font-semibold text-[#1E3A8A] hover:bg-[#EFF6FF] disabled:opacity-60"
                >
                  {loading ? 'Resending…' : 'Resend Email'}
                </button>
              </div>

              {error && <div className="rounded-md bg-red-100 p-3 text-red-700">{error}</div>}
              {success && <div className="rounded-md bg-green-100 p-3 text-green-700">{success}</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignUp;
