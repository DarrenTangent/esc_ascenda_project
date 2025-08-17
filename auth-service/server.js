import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { connectDB } from './db.js';
import authRouter from './routes/auth.js';

const app = express();

const ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';
app.use(cors({ origin: ORIGIN, credentials: true }));

app.use(express.json());
app.use(cookieParser());

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'auth' });
});

app.use('/auth', authRouter);

const PORT = Number(process.env.PORT || 4001);

connectDB(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 auth-service running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Mongo connect failed', err);
    process.exit(1);
  });
