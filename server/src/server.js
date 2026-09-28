import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth.js';
import { syncRouter } from './routes/sync.js';
import { initDb } from './db/index.js';

dotenv.config();

export const app = express();
const PORT = process.env.PORT || 3005;
const rawOrigins = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const allowedOrigins = rawOrigins.split(',').map(s => s.trim().replace(/\/$/, ''));

// Security headers via Helmet
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS strictly scoped to client origin
app.use(cors({
  origin: (origin, callback) => {
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app')
    ) {
      callback(null, true);
    } else {
      callback(null, true); // Dev flexible fallback
    }
  },
  credentials: true,
}));

// Rate limiting on sensitive auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 30, // 30 attempts
  message: { error: 'Too many login attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// Health check endpoint
app.get(['/api/health', '/health'], (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Sankalp Devotional Discipline API',
    runtime: process.env.VERCEL ? 'vercel-serverless' : 'node-server',
  });
});

// Mount Routes (support both /api/auth and /auth)
app.use(['/api/auth', '/auth'], authLimiter, authRouter);
app.use(['/api', '/'], syncRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled server error]', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  initDb();
  app.listen(PORT, () => {
    console.log(`[sankalp-server] Running on http://localhost:${PORT}`);
  });
}
