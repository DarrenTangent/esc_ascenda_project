import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 4001,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  cookieName: process.env.COOKIE_NAME || 'ascenda_auth',
  cookieSecure: process.env.COOKIE_SECURE === 'true',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
};
