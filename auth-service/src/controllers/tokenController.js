import { verifyRefresh, signAccessToken } from '../utils/jwt.js';

export async function refreshAccessToken(req, res) {
  try {
    const cookieName = process.env.REFRESH_COOKIE_NAME || 'ascenda_auth';
    const refreshToken = req.cookies?.[cookieName];
    if (!refreshToken) {
      return res.status(401).json({ message: 'Missing refresh token' });
    }

    let payload;
    try {
      payload = verifyRefresh(refreshToken); // { sub, email, iat, exp }
    } catch {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const accessToken = signAccessToken({ sub: payload.sub, email: payload.email });
    return res.json({ accessToken });
  } catch (e) {
    console.error('refresh error', e);
    return res.status(500).json({ message: 'Refresh failed' });
  }
}
