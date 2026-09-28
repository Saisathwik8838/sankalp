import jwt from 'jsonwebtoken';
import { db } from '../db/index.js';

export function requireAuth(req, res, next) {
  const secret = process.env.JWT_SECRET || 'dev_secret_key_123';
  let token = req.cookies?.token;

  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      token = parts[1];
    }
  }

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const payload = jwt.verify(token, secret);
    const stmt = db.prepare('SELECT id, email, created_at FROM users WHERE id = ?');
    const user = stmt.get(payload.userId);

    if (!user) {
      return res.status(401).json({ error: 'User account not found' });
    }

    req.userId = user.id;
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
}
