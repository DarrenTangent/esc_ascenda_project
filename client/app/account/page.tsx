// app/account/page.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type StoredUser = {
  id?: string;
  _id?: string;
  email?: string;
  username?: string;
};

function readStoredUser(): StoredUser | null {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;

    // Parse as unknown and validate minimally to avoid `any`
    const parsed: unknown = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === 'object' &&
      (
        'id' in parsed ||
        '_id' in parsed ||
        'email' in parsed ||
        'username' in parsed
      )
    ) {
      const u = parsed as StoredUser;
      return {
        id: typeof u.id === 'string' ? u.id : undefined,
        _id: typeof u._id === 'string' ? u._id : undefined,
        email: typeof u.email === 'string' ? u.email : undefined,
        username: typeof u.username === 'string' ? u.username : undefined,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export default function AccountPage() {
  const [user, setUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    setUser(readStoredUser());
  }, []);

  const displayName = useMemo(() => {
    if (!user) return 'Guest';
    return user.username || user.email || 'Account';
  }, [user]);

  const initials = useMemo(() => {
    const base = displayName.trim();
    if (!base) return 'A';
    const parts = base.split(/\s+/).slice(0, 2);
    return parts.map((p) => p[0]?.toUpperCase()).join('') || 'A';
  }, [displayName]);

  const handleLogout = () => {
    try {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      setUser(null);
    } catch {
      // ignore
    }
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      {/* Top row: title + Book another stay */}
      <div className="mb-8 flex items-end justify-between">
        <h1 className="text-3xl font-bold tracking-tight">My account</h1>

        <Link
          href="/"
          className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        >
          Book another stay
        </Link>
      </div>

      {/* Card */}
      <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
            {initials}
          </div>
          <div>
            <div className="text-lg font-semibold text-neutral-900">{displayName}</div>
            <div className="text-sm text-neutral-600">
              {user?.email ? user.email : 'Not signed in'}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link
            href="/bookings"
            className="rounded-lg border border-neutral-200 px-4 py-3 text-sm font-medium text-neutral-800 hover:bg-neutral-50"
          >
            My Bookings
          </Link>

          {user ? (
            <button
              onClick={handleLogout}
              className="rounded-lg border border-neutral-200 px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Log out
            </button>
          ) : (
            <div className="flex gap-2">
              <Link
                href="/login"
                className="flex-1 rounded-lg border border-neutral-200 px-4 py-3 text-center text-sm font-medium text-neutral-800 hover:bg-neutral-50"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="flex-1 rounded-lg bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-blue-700"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>

        <div className="mt-6 rounded-lg bg-neutral-50 p-4 text-sm text-neutral-700">
          <p className="font-medium text-neutral-900">Tip</p>
          <p className="mt-1">
            Sign in before booking to automatically link new reservations to your account.
          </p>
        </div>
      </section>
    </main>
  );
}
