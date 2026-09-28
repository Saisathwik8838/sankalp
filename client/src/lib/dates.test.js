import { describe, it, expect } from 'vitest';
import {
  parseLocalDate,
  formatLocalDate,
  getEffectiveToday,
  addDays,
  diffDays,
  getWeekday,
  isTuesdayOrSaturday,
  isBeforeDay,
  isAfterDay,
  isSameDay,
} from './dates.js';

describe('Date Helpers', () => {
  it('parses and formats YYYY-MM-DD accurately without UTC drift', () => {
    const str = '2026-10-06';
    const parsed = parseLocalDate(str);
    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(9); // 0-indexed October
    expect(parsed.getDate()).toBe(6);
    expect(formatLocalDate(parsed)).toBe(str);
  });

  it('handles month ends and leap years correctly', () => {
    // 2024 is a leap year (Feb 29 exists)
    expect(addDays('2024-02-28', 1)).toBe('2024-02-29');
    expect(addDays('2024-02-29', 1)).toBe('2024-03-01');

    // 2025 is not a leap year
    expect(addDays('2025-02-28', 1)).toBe('2025-03-01');

    // Year boundary
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2027-01-01', -1)).toBe('2026-12-31');
  });

  it('calculates diffDays accurately', () => {
    expect(diffDays('2026-10-01', '2026-10-10')).toBe(9);
    expect(diffDays('2026-10-10', '2026-10-01')).toBe(-9);
    expect(diffDays('2026-10-01', '2026-10-01')).toBe(0);
  });

  it('identifies Tuesdays and Saturdays as traditional Hanuman days', () => {
    // 2026-10-06 is Tuesday (2)
    expect(getWeekday('2026-10-06')).toBe(2);
    expect(isTuesdayOrSaturday('2026-10-06')).toBe(true);

    // 2026-10-10 is Saturday (6)
    expect(getWeekday('2026-10-10')).toBe(6);
    expect(isTuesdayOrSaturday('2026-10-10')).toBe(true);

    // 2026-10-07 is Wednesday (3)
    expect(isTuesdayOrSaturday('2026-10-07')).toBe(false);
  });

  it('respects day-start-time cutoff for late night / early morning practice', () => {
    // Current time: Oct 7 at 01:30 AM. Day start cutoff: 04:00 AM.
    // Cutoff not yet reached -> counts for Oct 6!
    const earlyMorning = new Date(2026, 9, 7, 1, 30);
    expect(getEffectiveToday('04:00', earlyMorning)).toBe('2026-10-06');

    // Current time: Oct 7 at 05:00 AM. Cutoff 04:00 passed -> counts for Oct 7!
    const afterCutoff = new Date(2026, 9, 7, 5, 0);
    expect(getEffectiveToday('04:00', afterCutoff)).toBe('2026-10-07');
  });

  it('correctly compares dates', () => {
    expect(isBeforeDay('2026-10-01', '2026-10-02')).toBe(true);
    expect(isAfterDay('2026-10-02', '2026-10-01')).toBe(true);
    expect(isSameDay('2026-10-01', '2026-10-01')).toBe(true);
  });
});
