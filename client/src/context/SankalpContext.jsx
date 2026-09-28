import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { storage } from '../lib/storage.js';
import { getEffectiveToday, addDays, diffDays } from '../lib/dates.js';
import {
  isDayComplete,
  calculateDayNumber,
  applyMissedDayPolicy,
  detectMissedDays,
} from '../lib/sankalp.js';

// Pre-filled defaults from Section 1: MY SANKALP DETAILS
export const DEFAULT_SANKALP = {
  id: 'default-sankalp-1',
  userName: 'Arjun',
  title: 'Hanuman 40-Day Sankalp',
  intention: 'I resolve to complete 40 days of daily Hanuman Chalisa with devotion and discipline.',
  startDate: getEffectiveToday('04:00'),
  durationDays: 40,
  practices: [
    { id: 'chalisa', name: 'Hanuman Chalisa', kind: 'count', target: 11, unit: 'recitations' },
    { id: 'japa', name: 'Hanuman Naam Japa', kind: 'count', target: 108, unit: 'Mala' },
    { id: 'diya', name: 'Lit a diya', kind: 'check' },
  ],
  niyams: [
    { id: 'bath', label: 'Early morning bath' },
    { id: 'satvik', label: 'Satvik food (no non-veg)' },
    { id: 'fast', label: 'Tuesday fast', weekdaysOnly: [2] },
    { id: 'brahmacharya', label: 'Brahmacharya' },
  ],
  finalDayPractices: [
    { id: 'bajrang_baan', name: 'Bajrang Baan recitation', kind: 'count', target: 1 },
    { id: 'closing_puja', name: 'Closing offering & puja', kind: 'check' },
  ],
  missedDayPolicy: 'resume',
  reminderTime: '05:30',
  status: 'active',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  deletedAt: null,
};

const initialState = {
  sankalp: null, // null means show setup wizard on first run
  sankalps: {},
  dayEntries: {},
  settings: storage.getSettings(),
  activeTab: 'today',
  counterPracticeId: 'chalisa',
  selectedJourneyDate: null,
  showMissedPrompt: false,
  user: storage.getAuthUser(),
  syncStatus: 'synced', // 'synced' | 'pending' | 'offline'
  isInitialized: false,
};

function sankalpReducer(state, action) {
  switch (action.type) {
    case 'INIT_STATE': {
      return {
        ...state,
        ...action.payload,
        isInitialized: true,
      };
    }

    case 'SET_ACTIVE_TAB': {
      return { ...state, activeTab: action.payload };
    }

    case 'SET_SANKALP': {
      const sankalp = action.payload;
      const updatedSankalps = { ...state.sankalps, [sankalp.id]: sankalp };
      storage.setActiveSankalpId(sankalp.id);
      storage.setSankalps(updatedSankalps);
      return {
        ...state,
        sankalp,
        sankalps: updatedSankalps,
        activeTab: 'today',
      };
    }

    case 'UPDATE_PRACTICE_COUNT': {
      const { date, practiceId, delta, absolute } = action.payload;
      const sankalp = state.sankalp;
      if (!sankalp) return state;

      const currentEntry = state.dayEntries[date] || {
        sankalpId: sankalp.id,
        date,
        dayNumber: calculateDayNumber(sankalp.startDate, date),
        counts: {},
        checks: {},
        completed: false,
        updatedAt: new Date().toISOString(),
      };

      const prevCount = currentEntry.counts?.[practiceId] || 0;
      const newCount = absolute !== undefined ? Math.max(0, absolute) : Math.max(0, prevCount + delta);

      const updatedCounts = { ...(currentEntry.counts || {}), [practiceId]: newCount };
      const updatedEntry = {
        ...currentEntry,
        counts: updatedCounts,
        updatedAt: new Date().toISOString(),
      };

      // Check if complete
      updatedEntry.completed = isDayComplete(sankalp, updatedEntry.dayNumber, updatedEntry);
      if (updatedEntry.completed && !updatedEntry.completedAt) {
        updatedEntry.completedAt = new Date().toISOString();
      }

      const updatedDayEntries = { ...state.dayEntries, [date]: updatedEntry };
      storage.setDayEntries(updatedDayEntries);

      return {
        ...state,
        dayEntries: updatedDayEntries,
      };
    }

    case 'TOGGLE_PRACTICE_CHECK': {
      const { date, practiceId } = action.payload;
      const sankalp = state.sankalp;
      if (!sankalp) return state;

      const currentEntry = state.dayEntries[date] || {
        sankalpId: sankalp.id,
        date,
        dayNumber: calculateDayNumber(sankalp.startDate, date),
        counts: {},
        checks: {},
        completed: false,
        updatedAt: new Date().toISOString(),
      };

      const prevChecked = !!currentEntry.checks?.[practiceId];
      const updatedChecks = { ...(currentEntry.checks || {}), [practiceId]: !prevChecked };
      const updatedEntry = {
        ...currentEntry,
        checks: updatedChecks,
        updatedAt: new Date().toISOString(),
      };

      updatedEntry.completed = isDayComplete(sankalp, updatedEntry.dayNumber, updatedEntry);
      if (updatedEntry.completed && !updatedEntry.completedAt) {
        updatedEntry.completedAt = new Date().toISOString();
      }

      const updatedDayEntries = { ...state.dayEntries, [date]: updatedEntry };
      storage.setDayEntries(updatedDayEntries);

      return {
        ...state,
        dayEntries: updatedDayEntries,
      };
    }

    case 'SET_DAY_FEELING': {
      const { date, feeling } = action.payload;
      const currentEntry = state.dayEntries[date] || {
        sankalpId: state.sankalp.id,
        date,
        dayNumber: calculateDayNumber(state.sankalp.startDate, date),
        counts: {},
        checks: {},
        completed: false,
        updatedAt: new Date().toISOString(),
      };

      const updatedEntry = {
        ...currentEntry,
        feeling: currentEntry.feeling === feeling ? undefined : feeling,
        updatedAt: new Date().toISOString(),
      };

      const updatedDayEntries = { ...state.dayEntries, [date]: updatedEntry };
      storage.setDayEntries(updatedDayEntries);

      return {
        ...state,
        dayEntries: updatedDayEntries,
      };
    }

    case 'SET_JOURNAL_NOTE': {
      const { date, note } = action.payload;
      const currentEntry = state.dayEntries[date] || {
        sankalpId: state.sankalp.id,
        date,
        dayNumber: calculateDayNumber(state.sankalp.startDate, date),
        counts: {},
        checks: {},
        completed: false,
        updatedAt: new Date().toISOString(),
      };

      const updatedEntry = {
        ...currentEntry,
        journal: note,
        updatedAt: new Date().toISOString(),
      };

      const updatedDayEntries = { ...state.dayEntries, [date]: updatedEntry };
      storage.setDayEntries(updatedDayEntries);

      return {
        ...state,
        dayEntries: updatedDayEntries,
      };
    }

    case 'SET_SETTINGS': {
      const updatedSettings = { ...state.settings, ...action.payload };
      storage.setSettings(updatedSettings);
      return { ...state, settings: updatedSettings };
    }

    case 'APPLY_MISSED_POLICY': {
      const { policy } = action.payload;
      const todayStr = getEffectiveToday(state.settings.dayStartTime);
      const updatedSankalp = applyMissedDayPolicy(state.sankalp, policy, todayStr);
      const updatedSankalps = { ...state.sankalps, [updatedSankalp.id]: updatedSankalp };

      storage.setActiveSankalpId(updatedSankalp.id);
      storage.setSankalps(updatedSankalps);

      return {
        ...state,
        sankalp: updatedSankalp,
        sankalps: updatedSankalps,
        showMissedPrompt: false,
      };
    }

    case 'SELECT_JOURNEY_DATE': {
      return { ...state, selectedJourneyDate: action.payload };
    }

    case 'SET_SHOW_MISSED_PROMPT': {
      return { ...state, showMissedPrompt: action.payload };
    }

    case 'SET_COUNTER_PRACTICE': {
      return { ...state, counterPracticeId: action.payload };
    }

    case 'SET_USER': {
      storage.setAuthUser(action.payload);
      return { ...state, user: action.payload };
    }

    case 'SET_SYNC_STATUS': {
      return { ...state, syncStatus: action.payload };
    }

    case 'RESET_ALL_DATA': {
      storage.clearAllData();
      return {
        ...initialState,
        isInitialized: true,
      };
    }

    default:
      return state;
  }
}

const SankalpContext = createContext(null);

export function SankalpProvider({ children }) {
  const [state, dispatch] = useReducer(sankalpReducer, initialState);

  // Initialize from storage on mount
  useEffect(() => {
    storage.requestPersistentStorage();
    const activeId = storage.getActiveSankalpId();
    const sankalps = storage.getSankalps();
    const dayEntries = storage.getDayEntries();
    const settings = storage.getSettings();
    const user = storage.getAuthUser();

    let activeSankalp = activeId && sankalps[activeId] ? sankalps[activeId] : null;

    dispatch({
      type: 'INIT_STATE',
      payload: {
        sankalp: activeSankalp,
        sankalps,
        dayEntries,
        settings,
        user,
      },
    });

    // Apply theme
    applyThemeToDocument(settings.theme || 'system');
  }, []);

  // Sync theme changes with DOM
  useEffect(() => {
    if (state.settings?.theme) {
      applyThemeToDocument(state.settings.theme);
    }
  }, [state.settings?.theme]);

  // Check missed days when sankalp is active
  useEffect(() => {
    if (state.sankalp && state.sankalp.status === 'active') {
      const todayStr = getEffectiveToday(state.settings.dayStartTime);
      const missed = detectMissedDays(state.sankalp, todayStr, state.dayEntries);
      if (missed.length > 0) {
        // Can trigger missed-day recovery sheet prompt
      }
    }
  }, [state.sankalp, state.settings?.dayStartTime]);

  return (
    <SankalpContext.Provider value={{ state, dispatch }}>
      {children}
    </SankalpContext.Provider>
  );
}

function applyThemeToDocument(theme) {
  if (typeof document === 'undefined') return;
  if (theme === 'system') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', theme);
  }
}

export function useSankalp() {
  const ctx = useContext(SankalpContext);
  if (!ctx) {
    throw new Error('useSankalp must be used within a SankalpProvider');
  }
  return ctx;
}
