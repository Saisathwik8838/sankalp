/**
 * PURE LOCAL DATE HELPERS
 * 
 * Strict Rule: Never parse "YYYY-MM-DD" directly via new Date("YYYY-MM-DD")
 * because standard JS parses date-only strings as UTC, causing off-by-one
 * timezone bugs. Always parse parts and construct local Date(y, m - 1, d).
 */

/**
 * Parses YYYY-MM-DD string into a local Date object.
 * @param {string} dateStr - "YYYY-MM-DD"
 * @returns {Date}
 */
export function parseLocalDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') {
    throw new Error(`Invalid date string: ${dateStr}`);
  }
  const parts = dateStr.split('-');
  if (parts.length !== 3) {
    throw new Error(`Expected YYYY-MM-DD format, got: ${dateStr}`);
  }
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  return new Date(year, month, day, 0, 0, 0, 0);
}

/**
 * Formats a local Date object to "YYYY-MM-DD".
 * @param {Date} date
 * @returns {string}
 */
export function formatLocalDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Computes today's effective local date string, respecting the user's "Day starts at" setting.
 * Example: If now is 01:30 and dayStartTime is "04:00", the day counts as yesterday.
 * @param {string} [dayStartTime="00:00"] - "HH:mm" 24h format
 * @param {Date} [now=new Date()]
 * @returns {string} "YYYY-MM-DD"
 */
export function getEffectiveToday(dayStartTime = '00:00', now = new Date()) {
  const [startH, startM] = (dayStartTime || '00:00').split(':').map(Number);
  const cutoffMinutes = (startH || 0) * 60 + (startM || 0);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const effectiveDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (currentMinutes < cutoffMinutes) {
    // Current time is before the day start cutoff -> counts for previous calendar day
    effectiveDate.setDate(effectiveDate.getDate() - 1);
  }
  return formatLocalDate(effectiveDate);
}

/**
 * Adds (or subtracts) a whole number of days to a YYYY-MM-DD string.
 * @param {string} dateStr
 * @param {number} days
 * @returns {string} "YYYY-MM-DD"
 */
export function addDays(dateStr, days) {
  const d = parseLocalDate(dateStr);
  d.setDate(d.getDate() + days);
  return formatLocalDate(d);
}

/**
 * Returns whole days between dateA and dateB: (dateB - dateA).
 * Positive if dateB is after dateA.
 * @param {string} dateStrA
 * @param {string} dateStrB
 * @returns {number}
 */
export function diffDays(dateStrA, dateStrB) {
  const a = parseLocalDate(dateStrA);
  const b = parseLocalDate(dateStrB);
  const msDiff = b.getTime() - a.getTime();
  return Math.round(msDiff / (1000 * 60 * 60 * 24));
}

/**
 * Returns weekday index: 0 = Sunday, 1 = Monday, ..., 6 = Saturday.
 * @param {string} dateStr
 * @returns {number}
 */
export function getWeekday(dateStr) {
  return parseLocalDate(dateStr).getDay();
}

/**
 * Checks whether the date is a traditional Tuesday (2) or Saturday (6).
 * @param {string} dateStr
 * @returns {boolean}
 */
export function isTuesdayOrSaturday(dateStr) {
  const wd = getWeekday(dateStr);
  return wd === 2 || wd === 6;
}

/**
 * Human-friendly date display string: e.g. "Tuesday, 6 Oct"
 * @param {string} dateStr
 * @returns {string}
 */
export function formatDisplayDate(dateStr) {
  const d = parseLocalDate(dateStr);
  const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${weekdayNames[d.getDay()]}, ${d.getDate()} ${monthNames[d.getMonth()]}`;
}

/**
 * Short date format: e.g. "Wed, 9 Sep"
 * @param {string} dateStr
 * @returns {string}
 */
export function formatShortDate(dateStr) {
  const d = parseLocalDate(dateStr);
  const weekdayShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${weekdayShort[d.getDay()]}, ${d.getDate()} ${monthNames[d.getMonth()]}`;
}

export function isBeforeDay(dateA, dateB) {
  return dateA < dateB;
}

export function isAfterDay(dateA, dateB) {
  return dateA > dateB;
}

export function isSameDay(dateA, dateB) {
  return dateA === dateB;
}
