import { storage } from './storage.js';

export const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL)
  ? import.meta.env.VITE_API_URL.replace(/\/$/, '')
  : '';

export async function syncWithServer(dispatch, currentUser) {
  if (!currentUser) {
    return { success: false, reason: 'guest_mode' };
  }

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    dispatch({ type: 'SET_SYNC_STATUS', payload: 'offline' });
    return { success: false, reason: 'offline' };
  }

  dispatch({ type: 'SET_SYNC_STATUS', payload: 'pending' });

  try {
    const localSankalps = Object.values(storage.getSankalps());
    const localDayEntries = Object.values(storage.getDayEntries());
    const localSettings = storage.getSettings();

    const res = await fetch(`${API_BASE}/api/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        sankalps: localSankalps,
        dayEntries: localDayEntries,
        settings: localSettings,
      }),
    });

    if (!res.ok) {
      if (res.status === 401) {
        // Session expired
        dispatch({ type: 'SET_USER', payload: null });
        dispatch({ type: 'SET_SYNC_STATUS', payload: 'synced' });
        return { success: false, reason: 'unauthorized' };
      }
      throw new Error(`Sync HTTP ${res.status}`);
    }

    const data = await res.json();

    // Map merged results back to storage and state
    const mergedSankalps = {};
    (data.sankalps || []).forEach(s => {
      mergedSankalps[s.id] = s;
    });

    const mergedEntries = {};
    (data.dayEntries || []).forEach(e => {
      mergedEntries[e.date] = e;
    });

    storage.setSankalps(mergedSankalps);
    storage.setDayEntries(mergedEntries);
    if (data.settings) {
      storage.setSettings(data.settings);
    }

    dispatch({
      type: 'INIT_STATE',
      payload: {
        sankalps: mergedSankalps,
        dayEntries: mergedEntries,
        settings: data.settings || localSettings,
        syncStatus: 'synced',
      },
    });

    return { success: true };
  } catch (err) {
    console.warn('[sync error]', err);
    dispatch({ type: 'SET_SYNC_STATUS', payload: 'offline' });
    return { success: false, error: err.message };
  }
}
