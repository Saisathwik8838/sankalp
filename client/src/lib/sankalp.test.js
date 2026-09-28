import { describe, it, expect } from 'vitest';
import {
  calculateDayNumber,
  calculateEndDate,
  isDayComplete,
  countRemainingPractices,
  getDayState,
  calculateStreaks,
  detectMissedDays,
  validateCanLogDay,
  applyMissedDayPolicy,
} from './sankalp.js';

const mockSankalp = {
  id: 'sankalp-1',
  title: 'Hanuman 40-Day Sankalp',
  intention: 'May I remain steady in my sankalp.',
  startDate: '2026-10-01',
  durationDays: 40,
  practices: [
    { id: 'chalisa', name: 'Hanuman Chalisa', kind: 'count', target: 11 },
    { id: 'japa', name: 'Hanuman Naam Japa', kind: 'count', target: 108 },
    { id: 'diya', name: 'Lit a diya', kind: 'check' },
  ],
  finalDayPractices: [
    { id: 'bajrang_baan', name: 'Bajrang Baan recitation', kind: 'count', target: 1 },
    { id: 'closing_puja', name: 'Closing offering & puja', kind: 'check' },
  ],
  missedDayPolicy: 'resume',
  status: 'active',
};

describe('Sankalp Core Logic', () => {
  describe('1. Day Number Calculation', () => {
    it('calculates start day, mid-journey, last day, and beyond', () => {
      // Start day (2026-10-01) is Day 1
      expect(calculateDayNumber('2026-10-01', '2026-10-01')).toBe(1);

      // Mid journey: 2026-10-12 is Day 12
      expect(calculateDayNumber('2026-10-01', '2026-10-12')).toBe(12);

      // Final day of 40-day sankalp is 2026-11-09 (Day 40)
      const endDate = calculateEndDate('2026-10-01', 40);
      expect(endDate).toBe('2026-11-09');
      expect(calculateDayNumber('2026-10-01', endDate)).toBe(40);

      // After journey ends (Day 41)
      expect(calculateDayNumber('2026-10-01', '2026-11-10')).toBe(41);
    });
  });

  describe('2. Day Completion Logic', () => {
    it('returns true only when all required counts and checks are met', () => {
      const incompleteEntry = {
        counts: { chalisa: 7, japa: 108 },
        checks: { diya: true },
      };
      expect(isDayComplete(mockSankalp, 5, incompleteEntry)).toBe(false);
      expect(countRemainingPractices(mockSankalp, 5, incompleteEntry)).toBe(1);

      const completeEntry = {
        counts: { chalisa: 11, japa: 108 },
        checks: { diya: true },
      };
      expect(isDayComplete(mockSankalp, 5, completeEntry)).toBe(true);
      expect(countRemainingPractices(mockSankalp, 5, completeEntry)).toBe(0);
    });

    it('requires final-day extra practices on the last day', () => {
      const regularCompleteEntry = {
        counts: { chalisa: 11, japa: 108 },
        checks: { diya: true },
      };
      // On regular day 39, this is complete
      expect(isDayComplete(mockSankalp, 39, regularCompleteEntry)).toBe(true);

      // On final day 40, this is INCOMPLETE because finalDayPractices are missing
      expect(isDayComplete(mockSankalp, 40, regularCompleteEntry)).toBe(false);
      expect(countRemainingPractices(mockSankalp, 40, regularCompleteEntry)).toBe(2);

      // Complete with final-day practices
      const finalCompleteEntry = {
        counts: { chalisa: 11, japa: 108, bajrang_baan: 1 },
        checks: { diya: true, closing_puja: true },
      };
      expect(isDayComplete(mockSankalp, 40, finalCompleteEntry)).toBe(true);
      expect(countRemainingPractices(mockSankalp, 40, finalCompleteEntry)).toBe(0);
    });
  });

  describe('3. Streak Calculation & Retention', () => {
    it('calculates unbroken run with today pending without breaking the streak', () => {
      // Days 1, 2, 3 completed. Today is Day 4 (pending). Streak should be 3!
      const entries = {
        '2026-10-01': { counts: { chalisa: 11, japa: 108 }, checks: { diya: true } },
        '2026-10-02': { counts: { chalisa: 11, japa: 108 }, checks: { diya: true } },
        '2026-10-03': { counts: { chalisa: 11, japa: 108 }, checks: { diya: true } },
      };
      const { currentStreak, bestStreak } = calculateStreaks(mockSankalp, '2026-10-04', entries);
      expect(currentStreak).toBe(3);
      expect(bestStreak).toBe(3);
    });

    it('increments streak when today is completed', () => {
      const entries = {
        '2026-10-01': { counts: { chalisa: 11, japa: 108 }, checks: { diya: true } },
        '2026-10-02': { counts: { chalisa: 11, japa: 108 }, checks: { diya: true } },
        '2026-10-03': { counts: { chalisa: 11, japa: 108 }, checks: { diya: true } },
        '2026-10-04': { counts: { chalisa: 11, japa: 108 }, checks: { diya: true } },
      };
      const { currentStreak, bestStreak } = calculateStreaks(mockSankalp, '2026-10-04', entries);
      expect(currentStreak).toBe(4);
      expect(bestStreak).toBe(4);
    });

    it('retains best streak after a missed day break', () => {
      // Days 1-5 done (streak 5). Day 6 missed. Days 7-8 done (current streak 2).
      const entries = {};
      for (let i = 1; i <= 5; i++) {
        entries[`2026-10-0${i}`] = { counts: { chalisa: 11, japa: 108 }, checks: { diya: true } };
      }
      // Day 6 missing
      entries['2026-10-07'] = { counts: { chalisa: 11, japa: 108 }, checks: { diya: true } };
      entries['2026-10-08'] = { counts: { chalisa: 11, japa: 108 }, checks: { diya: true } };

      const { currentStreak, bestStreak } = calculateStreaks(mockSankalp, '2026-10-09', entries);
      expect(currentStreak).toBe(2);
      expect(bestStreak).toBe(5);
    });

    it('fixes streak gap when a missed day is logged late', () => {
      const entries = {
        '2026-10-01': { counts: { chalisa: 11, japa: 108 }, checks: { diya: true } },
        // Day 2 (2026-10-02) originally missing
        '2026-10-03': { counts: { chalisa: 11, japa: 108 }, checks: { diya: true } },
      };
      // Before late log: current streak is 1
      let res = calculateStreaks(mockSankalp, '2026-10-03', entries);
      expect(res.currentStreak).toBe(1);

      // Now user logs Day 2 late
      entries['2026-10-02'] = { counts: { chalisa: 11, japa: 108 }, checks: { diya: true } };
      res = calculateStreaks(mockSankalp, '2026-10-03', entries);
      expect(res.currentStreak).toBe(3);
      expect(res.bestStreak).toBe(3);
    });
  });

  describe('4. Missed Day Detection and Policies', () => {
    it('detects missed days in past journey', () => {
      const entries = {
        '2026-10-01': { counts: { chalisa: 11, japa: 108 }, checks: { diya: true } },
        // 2026-10-02 missed
        '2026-10-03': { counts: { chalisa: 11, japa: 108 }, checks: { diya: true } },
      };
      const missed = detectMissedDays(mockSankalp, '2026-10-04', entries);
      expect(missed).toHaveLength(1);
      expect(missed[0].date).toBe('2026-10-02');
      expect(missed[0].dayNumber).toBe(2);
    });

    it('applies makeup policy by extending durationDays', () => {
      const updated = applyMissedDayPolicy(mockSankalp, 'makeup', '2026-10-05');
      expect(updated.durationDays).toBe(41);
      expect(updated.missedDayPolicy).toBe('makeup');
    });

    it('applies restart policy by resetting startDate', () => {
      const updated = applyMissedDayPolicy(mockSankalp, 'restart', '2026-10-05');
      expect(updated.startDate).toBe('2026-10-05');
      expect(updated.missedDayPolicy).toBe('restart');
    });
  });

  describe('5. Late Logging Validation Rules', () => {
    it('allows logging today', () => {
      const res = validateCanLogDay('2026-10-05', '2026-10-05', 2);
      expect(res.allowed).toBe(true);
      expect(res.loggedLate).toBe(false);
    });

    it('rejects logging future days', () => {
      const res = validateCanLogDay('2026-10-06', '2026-10-05', 2);
      expect(res.allowed).toBe(false);
      expect(res.reason).toContain('Future days');
    });

    it('allows logging yesterday within 2-day window with loggedLate flag', () => {
      const res = validateCanLogDay('2026-10-04', '2026-10-05', 2);
      expect(res.allowed).toBe(true);
      expect(res.loggedLate).toBe(true);
    });

    it('rejects logging days beyond the late-logging window', () => {
      // 3 days back when window is 2
      const res = validateCanLogDay('2026-10-01', '2026-10-05', 2);
      expect(res.allowed).toBe(false);
      expect(res.reason).toContain('Late logging is permitted only up to 2 days back');
    });
  });

  describe('6. Day States for UI', () => {
    it('assigns correct visual states', () => {
      const entryDone = { counts: { chalisa: 11, japa: 108 }, checks: { diya: true } };

      // Past done
      expect(getDayState(mockSankalp, '2026-10-01', '2026-10-05', entryDone)).toBe('completed');

      // Past not done -> missed
      expect(getDayState(mockSankalp, '2026-10-02', '2026-10-05', null)).toBe('missed');

      // Today not done -> today
      expect(getDayState(mockSankalp, '2026-10-05', '2026-10-05', null)).toBe('today');

      // Today done -> completed
      expect(getDayState(mockSankalp, '2026-10-05', '2026-10-05', entryDone)).toBe('completed');

      // Future regular day -> upcoming
      expect(getDayState(mockSankalp, '2026-10-08', '2026-10-05', null)).toBe('upcoming');

      // Final day -> final
      expect(getDayState(mockSankalp, '2026-11-09', '2026-10-05', null)).toBe('final');
    });
  });
});
