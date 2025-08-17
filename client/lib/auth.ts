// lib/auth.ts
const AUTH_BASE = process.env.NEXT_PUBLIC_AUTH_BASE || 'http://localhost:4001';

export type AuthUser = {
  id: string;
  email: string;
  username?: string;
};

export type AuthResponse = {
  user: AuthUser;
  accessToken: string; // JWT
};

const STORAGE_KEY = 'ascenda_access';
const USER_KEY = 'ascenda_user';

export function saveSession(res: AuthResponse) {
  try {
    localStorage.setItem(STORAGE_KEY, res.accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
  } catch {}
}

export function clearSession() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {}
}

export function getStoredSession():
  | { token: string | null; user: AuthUser | null }
  | null {
  try {
    const token = localStorage.getItem(STORAGE_KEY);
    const raw = localStorage.getItem(USER_KEY);
    const user = raw ? (JSON.parse(raw) as AuthUser) : null;
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
}

export async function apiSignup(input: {
  email: string;
  username: string;
  password: string;
}): Promise<AuthResponse> {
  const res = await fetch(`${AUTH_BASE}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // credentials include so the HttpOnly cookie returned by server is stored
    credentials: 'include',
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Sign up failed');
  }
  return res.json();
}

export async function apiLogin(input: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const res = await fetch(`${AUTH_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Login failed');
  }
  return res.json();
}

export async function apiLogout(): Promise<void> {
  // If you later add a /auth/logout route that clears the cookie, call it here:
  // await fetch(`${AUTH_BASE}/auth/logout`, { method: 'POST', credentials: 'include' });
  clearSession();
}

export function getAuthHeader() {
  const token = getStoredSession()?.token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}
