import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { db } from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';

export const authRouter = express.Router();

function issueCookie(res, userId) {
  const secret = process.env.JWT_SECRET || 'dev_secret_key_123';
  const token = jwt.sign({ userId }, secret, { expiresIn: '30d' });
  const isProd = process.env.NODE_ENV === 'production';

  res.cookie('token', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  return token;
}

// POST /api/auth/register
authRouter.post('/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Valid email and password are required' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const userId = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    db.prepare('INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)').run(
      userId,
      normalizedEmail,
      passwordHash,
      createdAt
    );

    const token = issueCookie(res, userId);
    return res.status(201).json({
      user: { id: userId, email: normalizedEmail, createdAt },
      token,
    });
  } catch (err) {
    console.error('[auth/register error]', err);
    return res.status(500).json({ error: 'Server error registering account' });
  }
});

// POST /api/auth/login
authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(normalizedEmail);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = issueCookie(res, user.id);
    return res.json({
      user: { id: user.id, email: user.email, createdAt: user.created_at },
      token,
    });
  } catch (err) {
    console.error('[auth/login error]', err);
    return res.status(500).json({ error: 'Server error during login' });
  }
});

// POST /api/auth/logout
authRouter.post('/logout', (req, res) => {
  res.clearCookie('token');
  return res.json({ message: 'Logged out successfully' });
});

// GET /api/auth/me
authRouter.get('/me', requireAuth, (req, res) => {
  return res.json({ user: req.user });
});

// DELETE /api/account
authRouter.delete('/account', requireAuth, async (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ error: 'Password confirmation required' });
  }

  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    // Delete user and cascade data
    db.prepare('DELETE FROM sankalps WHERE user_id = ?').run(req.userId);
    db.prepare('DELETE FROM day_entries WHERE user_id = ?').run(req.userId);
    db.prepare('DELETE FROM settings WHERE user_id = ?').run(req.userId);
    db.prepare('DELETE FROM users WHERE id = ?').run(req.userId);

    res.clearCookie('token');
    return res.json({ message: 'Account and all data permanently deleted' });
  } catch (err) {
    console.error('[auth/delete error]', err);
    return res.status(500).json({ error: 'Server error deleting account' });
  }
});
