/**
 * SAFE LOCAL STORAGE & CLIENT PERSISTENCE LAYER
 * 
 * Local-First Principle: The app reads and writes here first.
 * Never throws on storage quota or disabled cookies; gracefully falls back to memory.
 */

const STORAGE_KEYS = {
  ACTIVE_SANKALP_ID: 'sankalp_active_id',
  SANKALPS: 'sankalp_items',
  DAY_ENTRIES: 'sankalp_day_entries',
  SETTINGS: 'sankalp_settings',
  SYNC_QUEUE: 'sankalp_sync_queue',
  AUTH_USER: 'sankalp_auth_user',
  LAST_BACKUP: 'sankalp_last_backup_date',
};

const memoryFallback = new Map();

function isStorageAvailable() {
  try {
    const testKey = '__test__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}

const canUseLocalStorage = typeof window !== 'undefined' && isStorageAvailable();

export function getStoredItem(key, defaultValue = null) {
  try {
    if (canUseLocalStorage) {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : defaultValue;
    }
    return memoryFallback.has(key) ? memoryFallback.get(key) : defaultValue;
  } catch (err) {
    console.warn(`[storage] Failed reading ${key}:`, err);
    return defaultValue;
  }
}

export function setStoredItem(key, value) {
  try {
    if (canUseLocalStorage) {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
    memoryFallback.set(key, value);
    return true;
  } catch (err) {
    console.warn(`[storage] Failed writing ${key}:`, err);
    memoryFallback.set(key, value);
    return false;
  }
}

export function removeStoredItem(key) {
  try {
    if (canUseLocalStorage) {
      window.localStorage.removeItem(key);
    }
    memoryFallback.delete(key);
  } catch (err) {
    console.warn(`[storage] Failed removing ${key}:`, err);
  }
}

/**
 * Request persistent browser storage on first run.
 */
export async function requestPersistentStorage() {
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
    try {
      const isPersisted = await navigator.storage.persist();
      return isPersisted;
    } catch (e) {
      return false;
    }
  }
  return false;
}

// Typed helper accessors
export const storage = {
  getKeys: () => STORAGE_KEYS,

  getActiveSankalpId: () => getStoredItem(STORAGE_KEYS.ACTIVE_SANKALP_ID, null),
  setActiveSankalpId: (id) => setStoredItem(STORAGE_KEYS.ACTIVE_SANKALP_ID, id),

  getSankalps: () => getStoredItem(STORAGE_KEYS.SANKALPS, {}),
  setSankalps: (map) => setStoredItem(STORAGE_KEYS.SANKALPS, map),

  getDayEntries: () => getStoredItem(STORAGE_KEYS.DAY_ENTRIES, {}),
  setDayEntries: (map) => setStoredItem(STORAGE_KEYS.DAY_ENTRIES, map),

  getSettings: () => getStoredItem(STORAGE_KEYS.SETTINGS, {
    theme: 'system',
    fontSize: 'M',
    dayStartTime: '04:00',
    lateLoggingDays: 2,
    hapticsEnabled: true,
    soundEnabled: false,
    conclusionChecklist: [
      { id: 'thanks', label: 'Offer thanks to Maruti', done: false },
      { id: 'prasad', label: 'Share prasad with others', done: false },
      { id: 'donate', label: 'Donate food or clothes', done: false },
    ],
  }),
  setSettings: (settings) => setStoredItem(STORAGE_KEYS.SETTINGS, settings),

  getSyncQueue: () => getStoredItem(STORAGE_KEYS.SYNC_QUEUE, []),
  setSyncQueue: (queue) => setStoredItem(STORAGE_KEYS.SYNC_QUEUE, queue),

  getAuthUser: () => getStoredItem(STORAGE_KEYS.AUTH_USER, null),
  setAuthUser: (user) => setStoredItem(STORAGE_KEYS.AUTH_USER, user),

  getLastBackupDate: () => getStoredItem(STORAGE_KEYS.LAST_BACKUP, null),
  setLastBackupDate: (dateStr) => setStoredItem(STORAGE_KEYS.LAST_BACKUP, dateStr),

  requestPersistentStorage,

  clearAllData: () => {
    Object.values(STORAGE_KEYS).forEach(k => removeStoredItem(k));
  }
};
