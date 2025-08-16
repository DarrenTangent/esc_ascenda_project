'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

type User = {
  id: string;
  email: string;
  username?: string;
};

type AuthContextType = {
  user: User | null;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signup: (email: string, username: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  setUserDirect: (u: User | null) => void; // optional helper if you need to set after profile calls
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:4001';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // hydrate from localStorage on first mount
  useEffect(() => {
    try {
      const u = localStorage.getItem('user');
      const t = localStorage.getItem('accessToken');
      if (u) setUser(JSON.parse(u));
      if (t) setAccessToken(t);
    } catch {}
  }, []);

  // persist when user/token changes
  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  }, [user]);

  useEffect(() => {
    if (accessToken) localStorage.setItem('accessToken', accessToken);
    else localStorage.removeItem('accessToken');
  }, [accessToken]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch(`${AUTH_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // include credentials so the HttpOnly cookie set by auth-service is saved
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, error: data?.error || 'Login failed' };

      // auth-service returns: { user, accessToken }
      setUser(data.user);
      setAccessToken(data.accessToken ?? null);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: 'Network error' };
    }
  }, []);

  const signup = useCallback(async (email: string, username: string, password: string) => {
    try {
      const res = await fetch(`${AUTH_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, username, password }),
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, error: data?.error || 'Sign up failed' };

      // You can choose to auto-login here because the service returns {user, accessToken}
      setUser(data.user);
      setAccessToken(data.accessToken ?? null);
      return { ok: true };
    } catch {
      return { ok: false, error: 'Network error' };
    }
  }, []);

  const logout = useCallback(() => {
    // We don’t have a /logout endpoint right now; we just clear client state.
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    // (Optional) If you add a /auth/logout server route that clears cookie, call it here.
  }, []);

  const setUserDirect = useCallback((u: User | null) => setUser(u), []);

  return (
    <AuthContext.Provider value={{ user, accessToken, login, signup, logout, setUserDirect }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
