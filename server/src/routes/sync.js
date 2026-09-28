import express from 'express';
import { db } from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';

export const syncRouter = express.Router();

syncRouter.use(requireAuth);

// GET /api/sync?since=<ISO timestamp>
syncRouter.get('/sync', (req, res) => {
  const { since } = req.query;
  const userId = req.userId;

  try {
    let sankalpsQuery = 'SELECT id, data, updated_at, deleted_at FROM sankalps WHERE user_id = ?';
    let entriesQuery = 'SELECT sankalp_id, date, data, updated_at FROM day_entries WHERE user_id = ?';
    let params = [userId];

    if (since) {
      sankalpsQuery += ' AND updated_at > ?';
      entriesQuery += ' AND updated_at > ?';
      params.push(since);
    }

    const sankalpsRows = db.prepare(sankalpsQuery).all(...params);
    const entriesRows = db.prepare(entriesQuery).all(...params);
    const settingsRow = db.prepare('SELECT data, updated_at FROM settings WHERE user_id = ?').get(userId);

    const sankalps = sankalpsRows.map(r => {
      const obj = JSON.parse(r.data);
      obj.updatedAt = r.updated_at;
      obj.deletedAt = r.deleted_at;
      return obj;
    });

    const dayEntries = entriesRows.map(r => {
      const obj = JSON.parse(r.data);
      obj.updatedAt = r.updated_at;
      return obj;
    });

    const settings = settingsRow ? JSON.parse(settingsRow.data) : null;

    return res.json({
      sankalps,
      dayEntries,
      settings,
      serverTime: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[sync/get error]', err);
    return res.status(500).json({ error: 'Server error pulling sync data' });
  }
});

// POST /api/sync
syncRouter.post('/sync', (req, res) => {
  const userId = req.userId;
  const { sankalps = [], dayEntries = [], settings = null } = req.body;

  try {
    // 1. Process Sankalps (Last write wins by updatedAt)
    const getSankalpStmt = db.prepare('SELECT updated_at, data FROM sankalps WHERE id = ? AND user_id = ?');
    const upsertSankalpStmt = db.prepare(`
      INSERT INTO sankalps (id, user_id, data, updated_at, deleted_at)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        user_id = excluded.user_id,
        data = excluded.data,
        updated_at = excluded.updated_at,
        deleted_at = excluded.deleted_at
    `);

    for (const item of sankalps) {
      if (!item.id) continue;
      const existing = getSankalpStmt.get(item.id, userId);
      const incomingUpdated = item.updatedAt || new Date().toISOString();

      if (!existing || incomingUpdated >= existing.updated_at) {
        upsertSankalpStmt.run(
          item.id,
          userId,
          JSON.stringify(item),
          incomingUpdated,
          item.deletedAt || null
        );
      }
    }

    // 2. Process Day Entries (Merge conflict rule: max counts, OR checks)
    const getEntryStmt = db.prepare('SELECT data, updated_at FROM day_entries WHERE sankalp_id = ? AND date = ? AND user_id = ?');
    const upsertEntryStmt = db.prepare(`
      INSERT INTO day_entries (sankalp_id, date, user_id, data, updated_at)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(sankalp_id, date) DO UPDATE SET
        user_id = excluded.user_id,
        data = excluded.data,
        updated_at = excluded.updated_at
    `);

    for (const entry of dayEntries) {
      if (!entry.sankalpId || !entry.date) continue;
      const existing = getEntryStmt.get(entry.sankalpId, entry.date, userId);
      const incomingUpdated = entry.updatedAt || new Date().toISOString();

      if (!existing) {
        upsertEntryStmt.run(
          entry.sankalpId,
          entry.date,
          userId,
          JSON.stringify(entry),
          incomingUpdated
        );
      } else {
        const existingData = JSON.parse(existing.data);

        // Conflict merge rule: max count per practice, OR boolean checks
        const mergedCounts = { ...(existingData.counts || {}) };
        if (entry.counts) {
          for (const [k, v] of Object.entries(entry.counts)) {
            mergedCounts[k] = Math.max(mergedCounts[k] || 0, v || 0);
          }
        }

        const mergedChecks = { ...(existingData.checks || {}) };
        if (entry.checks) {
          for (const [k, v] of Object.entries(entry.checks)) {
            mergedChecks[k] = !!mergedChecks[k] || !!v;
          }
        }

        const merged = {
          ...existingData,
          ...entry,
          counts: mergedCounts,
          checks: mergedChecks,
          // If either was completed, it is completed
          completed: existingData.completed || entry.completed,
          journal: entry.journal || existingData.journal,
          feeling: entry.feeling || existingData.feeling,
          updatedAt: incomingUpdated > existing.updated_at ? incomingUpdated : existing.updated_at,
        };

        upsertEntryStmt.run(
          entry.sankalpId,
          entry.date,
          userId,
          JSON.stringify(merged),
          merged.updatedAt
        );
      }
    }

    // 3. Process Settings
    if (settings) {
      const getSettingsStmt = db.prepare('SELECT updated_at FROM settings WHERE user_id = ?');
      const existing = getSettingsStmt.get(userId);
      const incomingUpdated = settings.updatedAt || new Date().toISOString();

      if (!existing || incomingUpdated >= existing.updated_at) {
        db.prepare(`
          INSERT INTO settings (user_id, data, updated_at)
          VALUES (?, ?, ?)
          ON CONFLICT(user_id) DO UPDATE SET
            data = excluded.data,
            updated_at = excluded.updated_at
        `).run(userId, JSON.stringify(settings), incomingUpdated);
      }
    }

    // Return the current full dataset for the user
    const allSankalps = db.prepare('SELECT data FROM sankalps WHERE user_id = ?').all(userId).map(r => JSON.parse(r.data));
    const allEntries = db.prepare('SELECT data FROM day_entries WHERE user_id = ?').all(userId).map(r => JSON.parse(r.data));
    const currentSettings = db.prepare('SELECT data FROM settings WHERE user_id = ?').get(userId);

    return res.json({
      sankalps: allSankalps,
      dayEntries: allEntries,
      settings: currentSettings ? JSON.parse(currentSettings.data) : null,
      serverTime: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[sync/post error]', err);
    return res.status(500).json({ error: 'Server error processing batch sync' });
  }
});

// GET /api/export
syncRouter.get('/export', (req, res) => {
  const userId = req.userId;
  try {
    const sankalps = db.prepare('SELECT data FROM sankalps WHERE user_id = ?').all(userId).map(r => JSON.parse(r.data));
    const dayEntries = db.prepare('SELECT data FROM day_entries WHERE user_id = ?').all(userId).map(r => JSON.parse(r.data));
    const settingsRow = db.prepare('SELECT data FROM settings WHERE user_id = ?').get(userId);

    const exportData = {
      exportedAt: new Date().toISOString(),
      user: { id: req.user.id, email: req.user.email },
      sankalps,
      dayEntries,
      settings: settingsRow ? JSON.parse(settingsRow.data) : null,
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="sankalp-backup.json"');
    return res.send(JSON.stringify(exportData, null, 2));
  } catch (err) {
    console.error('[sync/export error]', err);
    return res.status(500).json({ error: 'Server error generating export file' });
  }
});
