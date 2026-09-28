import { parseLocalDate, addDays } from './dates.js';

/**
 * Generates an iCalendar (.ics) string for recurring daily sankalp reminders.
 * @param {import('../types/model.js').Sankalp} sankalp
 * @param {string} reminderTime - "HH:mm"
 * @returns {string} ICS file content
 */
export function generateIcsCalendar(sankalp, reminderTime = '05:30') {
  const [hours, minutes] = reminderTime.split(':').map(Number);
  const startDate = parseLocalDate(sankalp.startDate);
  startDate.setHours(hours || 5, minutes || 30, 0, 0);

  const duration = sankalp.durationDays || 40;
  const endDate = parseLocalDate(addDays(sankalp.startDate, duration));
  endDate.setHours(hours || 5, minutes || 30, 0, 0);

  const formatIcsDate = (d) => {
    return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const dtStart = formatIcsDate(startDate);
  const dtEnd = formatIcsDate(new Date(startDate.getTime() + 30 * 60 * 1000)); // 30 min event
  const until = formatIcsDate(endDate);

  const summary = `Hanuman Sankalp Practice (${sankalp.durationDays} Days)`;
  const description = `${sankalp.intention}\\nDaily targets: ${sankalp.practices.map(p => `${p.name} (${p.kind === 'count' ? p.target : 'done'})`).join(', ')}`;

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Sankalp Devotional Tracker//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:sankalp-${sankalp.id}@devotion.local`,
    `DTSTAMP:${formatIcsDate(new Date())}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `RRULE:FREQ=DAILY;COUNT=${duration}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    'STATUS:CONFIRMED',
    'TRANSP:OPAQUE',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder: Hanuman Sankalp Practice',
    'TRIGGER:-PT10M',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  return ics;
}

export function downloadIcsFile(sankalp, reminderTime) {
  const content = generateIcsCalendar(sankalp, reminderTime);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sankalp-daily-reminder.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
