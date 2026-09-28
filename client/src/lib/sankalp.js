/**
 * PURE SANKALP BUSINESS LOGIC
 * 
 * Rules:
 * - Pure functions, no React, no localStorage, no network.
 * - Entirely testable with Vitest.
 * - Handles day calculations, completion status, streaks, missed-day policies, and late logging.
 */

import { addDays, diffDays, isBeforeDay, isAfterDay, isSameDay } from './dates.js';

/**
 * Calculates the day number of a target date relative to the sankalp start date.
 * Day 1 is the start date itself.
 * @param {string} startDate - "YYYY-MM-DD"
 * @param {string} targetDate - "YYYY-MM-DD"
 * @returns {number} 1-based day index (can be <= 0 if target is before start date)
 */
export function calculateDayNumber(startDate, targetDate) {
  return diffDays(startDate, targetDate) + 1;
}

/**
 * Computes the scheduled end date of a sankalp given its start date and duration in days.
 * E.g., start 2026-10-06 with 40 days -> ends on 2026-11-14.
 * @param {string} startDate - "YYYY-MM-DD"
 * @param {number} durationDays - total days (e.g. 40)
 * @returns {string} "YYYY-MM-DD"
 */
export function calculateEndDate(startDate, durationDays) {
  return addDays(startDate, durationDays - 1);
}

/**
 * Checks whether an entry meets all completion criteria for that day.
 * On the final day, extra practices are also required.
 * @param {import('../types/model.js').Sankalp} sankalp
 * @param {number} dayNumber
 * @param {import('../types/model.js').DayEntry|null} entry
 * @returns {boolean}
 */
export function isDayComplete(sankalp, dayNumber, entry) {
  if (!entry) return false;

  const practices = sankalp.practices || [];
  for (const p of practices) {
    if (p.kind === 'count') {
      const target = p.target || 0;
      const done = (entry.counts && entry.counts[p.id]) || 0;
      if (done < target) return false;
    } else if (p.kind === 'check') {
      const checked = (entry.checks && entry.checks[p.id]) || false;
      if (!checked) return false;
    }
  }

  // Check final day extra practices
  if (dayNumber === sankalp.durationDays && sankalp.finalDayPractices?.length > 0) {
    for (const fp of sankalp.finalDayPractices) {
      if (fp.kind === 'count') {
        const target = fp.target || 0;
        const done = (entry.counts && entry.counts[fp.id]) || 0;
        if (done < target) return false;
      } else if (fp.kind === 'check') {
        const checked = (entry.checks && entry.checks[fp.id]) || false;
        if (!checked) return false;
      }
    }
  }

  return true;
}

/**
 * Counts how many practices remain incomplete for the current day.
 * Used for dynamic button copy: "1 practice left", "2 practices left", or "Complete today’s practice".
 * @param {import('../types/model.js').Sankalp} sankalp
 * @param {number} dayNumber
 * @param {import('../types/model.js').DayEntry|null} entry
 * @returns {number}
 */
export function countRemainingPractices(sankalp, dayNumber, entry) {
  let remaining = 0;
  const practices = sankalp.practices || [];

  for (const p of practices) {
    if (p.kind === 'count') {
      const target = p.target || 0;
      const done = (entry?.counts && entry.counts[p.id]) || 0;
      if (done < target) remaining++;
    } else if (p.kind === 'check') {
      const checked = (entry?.checks && entry.checks[p.id]) || false;
      if (!checked) remaining++;
    }
  }

  if (dayNumber === sankalp.durationDays && sankalp.finalDayPractices?.length > 0) {
    for (const fp of sankalp.finalDayPractices) {
      if (fp.kind === 'count') {
        const target = fp.target || 0;
        const done = (entry?.counts && entry.counts[fp.id]) || 0;
        if (done < target) remaining++;
      } else if (fp.kind === 'check') {
        const checked = (entry?.checks && entry.checks[fp.id]) || false;
        if (!checked) remaining++;
      }
    }
  }

  return remaining;
}

/**
 * Determines the visual and functional state of a specific day in the journey.
 * States: 'completed' | 'missed' | 'today' | 'upcoming' | 'final'
 * @param {import('../types/model.js').Sankalp} sankalp
 * @param {string} dateStr - "YYYY-MM-DD"
 * @param {string} todayStr - "YYYY-MM-DD"
 * @param {import('../types/model.js').DayEntry|null} entry
 * @returns {'completed'|'missed'|'today'|'upcoming'|'final'}
 */
export function getDayState(sankalp, dateStr, todayStr, entry) {
  const dayNum = calculateDayNumber(sankalp.startDate, dateStr);
  const complete = isDayComplete(sankalp, dayNum, entry);

  if (complete) {
    return 'completed';
  }

  if (isSameDay(dateStr, todayStr)) {
    return 'today';
  }

  if (isBeforeDay(dateStr, todayStr)) {
    // Past day not completed -> missed
    return 'missed';
  }

  // Future day
  if (dayNum === sankalp.durationDays) {
    return 'final';
  }

  return 'upcoming';
}

/**
 * Calculates current streak and best streak.
 * Spec rule:
 * - Number of consecutive completed days ending today (if today is complete)
 *   or yesterday (if today is not yet done).
 * - A pending "today" must not break the streak until the day ends.
 * @param {import('../types/model.js').Sankalp} sankalp
 * @param {string} todayStr - effective local today date
 * @param {Object<string, import('../types/model.js').DayEntry>} entriesMap - key: dateStr -> DayEntry
 * @returns {{ currentStreak: number, bestStreak: number }}
 */
export function calculateStreaks(sankalp, todayStr, entriesMap = {}) {
  const { startDate, durationDays } = sankalp;
  if (!startDate || durationDays <= 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  // Find the evaluation anchor
  // If today is completed, streak runs up to today.
  // If today is not completed, streak runs up to yesterday.
  const todayEntry = entriesMap[todayStr];
  const todayDayNum = calculateDayNumber(startDate, todayStr);
  const isTodayDone = isDayComplete(sankalp, todayDayNum, todayEntry);

  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;

  // Scan all elapsed days from Day 1 up to durationDays
  for (let n = 1; n <= durationDays; n++) {
    const curDate = addDays(startDate, n - 1);
    if (isAfterDay(curDate, todayStr)) {
      break; // Future days not counted
    }

    const entry = entriesMap[curDate];
    const done = isDayComplete(sankalp, n, entry);

    if (done) {
      tempStreak++;
      if (tempStreak > bestStreak) {
        bestStreak = tempStreak;
      }
    } else {
      // If curDate is today, it does NOT reset bestStreak
      if (!isSameDay(curDate, todayStr)) {
        tempStreak = 0;
      }
    }
  }

  // Compute current streak ending at anchor
  let anchorDate = isTodayDone ? todayStr : addDays(todayStr, -1);
  while (!isBeforeDay(anchorDate, startDate)) {
    const dayNum = calculateDayNumber(startDate, anchorDate);
    const entry = entriesMap[anchorDate];
    if (isDayComplete(sankalp, dayNum, entry)) {
      currentStreak++;
      anchorDate = addDays(anchorDate, -1);
    } else {
      break;
    }
  }

  return { currentStreak, bestStreak };
}

/**
 * Scans past days within the journey and finds any missed days.
 * @param {import('../types/model.js').Sankalp} sankalp
 * @param {string} todayStr
 * @param {Object<string, import('../types/model.js').DayEntry>} entriesMap
 * @returns {Array<{ date: string, dayNumber: number }>}
 */
export function detectMissedDays(sankalp, todayStr, entriesMap = {}) {
  const missed = [];
  const { startDate, durationDays } = sankalp;
  if (!startDate) return missed;

  // Scan from Day 1 to yesterday
  const yesterdayStr = addDays(todayStr, -1);
  for (let n = 1; n <= durationDays; n++) {
    const d = addDays(startDate, n - 1);
    if (isAfterDay(d, yesterdayStr)) break;

    const entry = entriesMap[d];
    if (!isDayComplete(sankalp, n, entry)) {
      missed.push({ date: d, dayNumber: n });
    }
  }
  return missed;
}

/**
 * Validates whether a day can be logged right now.
 * Spec rule:
 * - Can log today
 * - Can log past days within the late-logging window (default 2 days back)
 * - CANNOT log future days
 * - CANNOT log days older than lateLoggingDays window
 * @param {string} targetDate
 * @param {string} todayStr
 * @param {number} lateLoggingDays
 * @returns {{ allowed: boolean, reason?: string, loggedLate?: boolean }}
 */
export function validateCanLogDay(targetDate, todayStr, lateLoggingDays = 2) {
  if (isAfterDay(targetDate, todayStr)) {
    return { allowed: false, reason: 'Future days cannot be logged ahead of time.' };
  }

  if (isSameDay(targetDate, todayStr)) {
    return { allowed: true, loggedLate: false };
  }

  const daysBack = diffDays(targetDate, todayStr);
  if (daysBack <= lateLoggingDays) {
    return { allowed: true, loggedLate: true };
  }

  return {
    allowed: false,
    reason: `Late logging is permitted only up to ${lateLoggingDays} days back.`,
  };
}

/**
 * Applies a missed day resolution policy:
 * - 'restart': starts fresh from today
 * - 'resume': keeps count as is, missed day stays noted
 * - 'makeup': appends 1 day to durationDays
 * @param {import('../types/model.js').Sankalp} sankalp
 * @param {'restart'|'resume'|'makeup'} policy
 * @param {string} todayStr
 * @returns {import('../types/model.js').Sankalp} updated sankalp object
 */
export function applyMissedDayPolicy(sankalp, policy, todayStr) {
  const updated = { ...sankalp, updatedAt: new Date().toISOString() };

  if (policy === 'makeup') {
    updated.durationDays = (sankalp.durationDays || 40) + 1;
    updated.missedDayPolicy = 'makeup';
  } else if (policy === 'restart') {
    updated.startDate = todayStr;
    updated.missedDayPolicy = 'restart';
  } else {
    // 'resume'
    updated.missedDayPolicy = 'resume';
  }

  return updated;
}
