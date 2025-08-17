import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { signAccessToken, signRefreshToken } from '../utils/jwt.js';

const COOKIE_NAME = process.env.REFRESH_COOKIE_NAME || 'ascenda_auth';
const COOKIE_MAXAGE = Number(process.env.REFRESH_COOKIE_MAXAGE || 604800); // seconds

function setRefreshCookie(res, token) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: COOKIE_MAXAGE * 1000,
    path: '/'
    // secure: true, // enable in production behind HTTPS
  });
}

export async function signup(req, res) {
  const { email, username, password } = req.body || {};
  if (!email || !username || !password) {
    return res.status(400).json({ message: 'email, username, password are required' });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ message: 'Email already in use' });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ email, username, passwordHash });

  const payload = { sub: user._id.toString(), email: user.email };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  setRefreshCookie(res, refreshToken);

  return res.status(201).json({
    user: user.toSafeJSON(),
    accessToken
  });
}

export async function login(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: 'email and password are required' });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const payload = { sub: user._id.toString(), email: user.email };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  setRefreshCookie(res, refreshToken);

  return res.json({
    user: user.toSafeJSON(),
    accessToken
  });
}

export async function logout(req, res) {
  const COOKIE_NAME = process.env.REFRESH_COOKIE_NAME || 'ascenda_auth';
  res.clearCookie(COOKIE_NAME, { path: '/' });
  return res.json({ ok: true });
}
