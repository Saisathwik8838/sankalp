import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from './server.js';
import { db, initDb } from './db/index.js';

describe('Backend Server API & Sync', () => {
  beforeAll(() => {
    initDb();
  });

  const userA = {
    email: `devotee_a_${Date.now()}@example.com`,
    password: 'securePassword123',
  };

  const userB = {
    email: `devotee_b_${Date.now()}@example.com`,
    password: 'securePassword456',
  };

  let tokenA = '';
  let tokenB = '';

  it('registers user A and receives token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(userA);

    expect(res.status).toBe(201);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe(userA.email);
    tokenA = res.body.token;
  });

  it('registers user B and receives token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(userB);

    expect(res.status).toBe(201);
    tokenB = res.body.token;
  });

  it('authenticates user A with GET /api/auth/me', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(userA.email);
  });

  it('enforces user isolation: User B cannot access User A records', async () => {
    // User A syncs a sankalp
    await request(app)
      .post('/api/sync')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        sankalps: [{
          id: 'sankalp-private-a',
          title: 'User A Private Vow',
          durationDays: 40,
          updatedAt: new Date().toISOString(),
        }],
      });

    // User B syncs and queries
    const resB = await request(app)
      .get('/api/sync')
      .set('Authorization', `Bearer ${tokenB}`);

    expect(resB.status).toBe(200);
    const hasRecordA = resB.body.sankalps.some(s => s.id === 'sankalp-private-a');
    expect(hasRecordA).toBe(false);
  });

  it('performs conflict resolution merging counts by max and checks by OR', async () => {
    const sankalpId = `sankalp-merge-${Date.now()}`;
    const date = '2026-10-06';

    // Step 1: Device 1 logs 5 recitations and diya unchecked
    await request(app)
      .post('/api/sync')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        sankalps: [{ id: sankalpId, title: 'Merge Test', updatedAt: '2026-10-06T08:00:00Z' }],
        dayEntries: [{
          sankalpId,
          date,
          counts: { chalisa: 5 },
          checks: { diya: false },
          updatedAt: '2026-10-06T08:00:00Z',
        }],
      });

    // Step 2: Device 2 logs 8 recitations and diya checked
    const syncRes = await request(app)
      .post('/api/sync')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        dayEntries: [{
          sankalpId,
          date,
          counts: { chalisa: 8 },
          checks: { diya: true },
          updatedAt: '2026-10-06T08:05:00Z',
        }],
      });

    expect(syncRes.status).toBe(200);
    const mergedEntry = syncRes.body.dayEntries.find(e => e.date === date);
    expect(mergedEntry).toBeDefined();
    // Chalisa count should be merged to Math.max(5, 8) = 8
    expect(mergedEntry.counts.chalisa).toBe(8);
    // Diya check should be merged to false || true = true
    expect(mergedEntry.checks.diya).toBe(true);
  });
});
