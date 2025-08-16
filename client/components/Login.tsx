'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData((s) => ({ ...s, [e.target.name]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await login(formData.email, formData.password);
    setLoading(false);

    if (!res.ok) {
      setError(res.error || 'Login failed');
      return;
    }
    router.push('/'); // go home (or /account) after login
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-[#EFF6FF] to-white py-10">
      <div className="mx-auto max-w-xl px-6">
        <h2 className="text-4xl font-bold text-[#1E3A8A]">Sign in to your account</h2>
        <p className="mt-2 text-slate-600">
          Don’t have an account?{' '}
          <Link href="/signup" className="text-[#2563EB] underline hover:text-[#1E40AF]">
            Sign up
          </Link>
        </p>

        <div className="mt-8 rounded-2xl bg-white/70 p-6 shadow-xl ring-1 ring-black/5 backdrop-blur-md">
          <form className="space-y-6" onSubmit={onSubmit}>
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
                placeholder="Enter your password"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-[#3B82F6]" />
                Remember me
              </label>
              <button
                type="button"
                onClick={() => alert('Forgot password flow')}
                className="text-sm text-[#2563EB] underline hover:text-[#1E40AF]"
              >
                Forgot your password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#3B82F6] py-2 font-semibold text-white hover:bg-[#2563EB] disabled:opacity-60"
            >
              {loading ? 'Signing In…' : 'Sign In'}
            </button>

            {error && <div className="rounded-md bg-red-100 p-3 text-red-700">{error}</div>}
          </form>
        </div>
      </div>
    </div>
  );
}
