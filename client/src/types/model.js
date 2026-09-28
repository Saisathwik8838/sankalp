/**
 * DATA MODEL JSDOC TYPEDEFS
 * 
 * Source of Truth: Section 4 of Sankalp Spec.
 */

/**
 * @typedef {Object} Practice
 * @property {string} id
 * @property {string} name
 * @property {'count'|'check'} kind
 * @property {number} [target]            // for kind = 'count'
 * @property {string} [unit]              // "recitations", "chants"
 */

/**
 * @typedef {Object} Niyam
 * @property {string} id
 * @property {string} label
 * @property {number[]} [weekdaysOnly]    // 0=Sun..6=Sat
 */

/**
 * @typedef {Object} Sankalp
 * @property {string} id                 // uuid
 * @property {string} title
 * @property {string} intention          // the sankalp statement, shown on Home
 * @property {string} startDate          // YYYY-MM-DD
 * @property {number} durationDays
 * @property {Practice[]} practices
 * @property {Niyam[]} [niyams]           // optional daily observances
 * @property {Practice[]} [finalDayPractices] // extra items required only on the last day
 * @property {'restart'|'resume'|'makeup'} missedDayPolicy
 * @property {string} [reminderTime]      // "HH:mm"
 * @property {'active'|'completed'|'abandoned'} status
 * @property {string} createdAt           // ISO timestamp
 * @property {string} updatedAt           // ISO timestamp, used for sync
 * @property {string|null} [deletedAt]    // soft delete, used for sync
 */

/**
 * @typedef {Object} DayEntry
 * @property {string} sankalpId
 * @property {string} date                // YYYY-MM-DD
 * @property {number} dayNumber
 * @property {Object<string, number>} counts   // practiceId -> count done
 * @property {Object<string, boolean>} checks  // practiceId / niyamId -> done
 * @property {boolean} completed          // derived: all required practices met
 * @property {string} [completedAt]       // ISO timestamp
 * @property {boolean} [loggedLate]       // true if marked after that day ended
 * @property {string} [journal]
 * @property {'peaceful'|'strong'|'restless'|'tired'|'grateful'} [feeling]
 * @property {string} updatedAt           // ISO timestamp, used for sync
 */

/**
 * @typedef {Object} Settings
 * @property {'system'|'light'|'dark'} theme
 * @property {'S'|'M'|'L'} fontSize
 * @property {string} dayStartTime        // "04:00"
 * @property {number} lateLoggingDays     // 2
 * @property {boolean} hapticsEnabled
 * @property {boolean} soundEnabled
 * @property {Array<{ id: string, label: string, done: boolean }>} conclusionChecklist
 */

export const EMPTY_MODULE = {};
