import React, { useState } from 'react';
import { useSankalp } from '../../context/SankalpContext.jsx';
import { CheckIcon, DiyaIcon } from '../common/Icons.jsx';
import {
  getEffectiveToday,
  addDays,
  formatShortDate,
  isBeforeDay,
  isSameDay,
  isAfterDay,
} from '../../lib/dates.js';
import {
  calculateDayNumber,
  getDayState,
  calculateStreaks,
  isDayComplete,
} from '../../lib/sankalp.js';

export function JourneyScreen({ onShowCompletion }) {
  const { state, dispatch } = useSankalp();
  const { sankalp, dayEntries, settings } = state;

  const [selectedDay, setSelectedDay] = useState(null); // for Day detail bottom sheet
  const [showMissedSheet, setShowMissedSheet] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(sankalp?.missedDayPolicy || 'resume');

  if (!sankalp) return null;

  const todayStr = getEffectiveToday(settings.dayStartTime);
  const { currentStreak, bestStreak } = calculateStreaks(sankalp, todayStr, dayEntries);

  const duration = sankalp.durationDays || 40;
  const daysArray = Array.from({ length: duration }, (_, i) => {
    const dStr = addDays(sankalp.startDate, i);
    const dayNum = i + 1;
    const entry = dayEntries[dStr] || null;
    const state = getDayState(sankalp, dStr, todayStr, entry);
    return { dayNum, date: dStr, entry, state };
  });

  const completedCount = daysArray.filter(d => d.state === 'completed').length;
  const remainingCount = Math.max(0, duration - completedCount);
  const percentComplete = Math.round((completedCount / duration) * 100);

  const handleTileClick = (dayItem) => {
    if (dayItem.state === 'missed') {
      setSelectedDay(dayItem);
      setShowMissedSheet(true);
    } else {
      setSelectedDay(dayItem);
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-3 p-4 overflow-y-auto relative">
      <div className="serif text-[22px] font-semibold text-[var(--tx)]">
        Your journey
      </div>

      {/* Progress & Streak Summary Card (Slide 3) */}
      <div className="card flex flex-col gap-2">
        <div className="flex items-center justify-between text-[15px]">
          <b className="text-[var(--tx)]">{percentComplete}% complete</b>
          <span className="text-[13px] text-[var(--mt)]">
            {completedCount} done · {remainingCount} to go
          </span>
        </div>

        {/* Milestone Progress Bar */}
        <div className="relative my-1">
          <div className="bar w-full h-2 rounded-full bg-[var(--ln)] overflow-hidden">
            <div
              className="h-full bg-[var(--pr)] rounded-full transition-all duration-300"
              style={{ width: `${percentComplete}%` }}
            />
          </div>
          {/* Milestone markers at 25%, 50%, 75% */}
          <div className="flex justify-between text-[11px] text-[var(--mt)] mt-1 px-1">
            <span style={{ opacity: percentComplete >= 25 ? 1 : 0.6 }}>25%</span>
            <span style={{ opacity: percentComplete >= 50 ? 1 : 0.6 }}>50%</span>
            <span style={{ opacity: percentComplete >= 75 ? 1 : 0.6 }}>75%</span>
          </div>
        </div>

        {/* Streaks Row */}
        <div className="flex items-center gap-4 text-[13px] text-[var(--tx)] mt-1 pt-2 border-t border-[var(--ln)]">
          <span>Streak <b className="text-[15px] font-bold">{currentStreak}</b></span>
          <span>Best <b className="text-[15px] font-bold">{bestStreak}</b></span>
        </div>
      </div>

      {/* 40-Day Calendar Grid (Slide 3 g7) */}
      <div className="grid grid-cols-7 gap-1.5 mt-1">
        {daysArray.map((item) => {
          const { dayNum, state } = item;
          const isSelected = selectedDay?.date === item.date;

          return (
            <button
              key={dayNum}
              type="button"
              onClick={() => handleTileClick(item)}
              aria-label={`Day ${dayNum}, ${state}`}
              className={`d-tile cursor-pointer ${state} ${isSelected ? 'ring-2 ring-[var(--pr)] ring-offset-1' : ''}`}
            >
              {state === 'completed' ? (
                <>
                  <CheckIcon size={16} strokeWidth={3} />
                  <small className="absolute bottom-0.5 text-[9px] font-medium leading-none">{dayNum}</small>
                </>
              ) : state === 'missed' ? (
                <>
                  <span className="text-[16px] leading-none font-bold">–</span>
                  <small className="absolute bottom-0.5 text-[9px] font-medium leading-none">{dayNum}</small>
                </>
              ) : state === 'final' ? (
                <DiyaIcon size={16} />
              ) : (
                <span className="leading-none">{dayNum}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Visual Legend (Slide 3) */}
      <div className="text-[13px] text-[var(--mt)] flex items-center gap-3 flex-wrap mt-1">
        <span className="flex items-center gap-1">✓ done</span>
        <span className="flex items-center gap-1">– missed</span>
        <span className="flex items-center gap-1">○ today</span>
        <span className="flex items-center gap-1">◠ final day</span>
      </div>

      {/* Day Detail Bottom Sheet (Slide 3) */}
      {selectedDay && !showMissedSheet && (
        <div className="fixed inset-0 z-40 flex flex-col justify-end bg-black/40 backdrop-blur-[2px]">
          <div className="sheet relative max-w-[420px] mx-auto w-full animate-in slide-in-from-bottom duration-200">
            <div className="sheet-handle" />
            <div className="flex items-center justify-between">
              <b className="serif text-[20px] text-[var(--tx)]">Day {selectedDay.dayNum}</b>
              <div className="flex items-center gap-2">
                {selectedDay.entry?.loggedLate && (
                  <span className="chip py-0.5 px-2 text-[12px] min-h-[28px]">logged late</span>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedDay(null)}
                  className="text-[var(--mt)] hover:text-[var(--tx)] p-1 text-[18px]"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="text-[13px] text-[var(--mt)] mt-0.5 mb-2">
              {formatShortDate(selectedDay.date)}
            </div>

            {selectedDay.entry ? (
              <div className="flex flex-col gap-2">
                <div className="text-[14px] text-[var(--tx)] bg-[var(--bg)] p-2 rounded-xl">
                  {sankalp.practices.map(p => {
                    if (p.kind === 'count') {
                      return `${p.name} ${selectedDay.entry.counts?.[p.id] || 0}/${p.target}`;
                    } else {
                      return `${p.name} ${selectedDay.entry.checks?.[p.id] ? '✓' : '—'}`;
                    }
                  }).join(' · ')}
                </div>
                {selectedDay.entry.journal && (
                  <p className="text-[13px] text-[var(--mt)] italic m-0 bg-[var(--bg)] p-2 rounded-xl">
                    “{selectedDay.entry.journal}”
                  </p>
                )}
              </div>
            ) : (
              <div className="text-[13px] text-[var(--mt)] py-2">
                {selectedDay.state === 'upcoming' ? 'This day is in the future.' : 'No practice recorded for this day.'}
              </div>
            )}

            {selectedDay.dayNum === duration && (
              <button
                type="button"
                onClick={() => {
                  setSelectedDay(null);
                  onShowCompletion?.();
                }}
                className="btn-primary text-[13px] py-2 px-3 w-full mt-2"
              >
                View Completion Card & Rituals
              </button>
            )}
          </div>
        </div>
      )}

      {/* Missed-Day Recovery Prompt Bottom Sheet (Slide 4) */}
      {showMissedSheet && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/45 backdrop-blur-[2px]">
          <div className="sheet relative max-w-[420px] mx-auto w-full animate-in slide-in-from-bottom duration-200">
            <div className="sheet-handle" />
            <div className="serif text-[20px] text-[var(--tx)] font-semibold">
              A day was missed.
            </div>
            <div className="text-[13px] text-[var(--mt)] mb-3">
              How would you like to continue?
            </div>

            <div className="flex flex-col gap-2 mb-4">
              <button
                type="button"
                onClick={() => setSelectedPolicy('restart')}
                className={`opt text-left cursor-pointer ${selectedPolicy === 'restart' ? 'on' : ''}`}
              >
                <b className="text-[15px] text-[var(--tx)]">Restart from Day 1</b>
                <div className="text-[13px] text-[var(--mt)]">Begin the count afresh.</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPolicy('resume')}
                className={`opt text-left cursor-pointer ${selectedPolicy === 'resume' ? 'on' : ''}`}
              >
                <b className="text-[15px] text-[var(--tx)]">Continue as is</b>
                <div className="text-[13px] text-[var(--mt)]">Carry on; the day stays noted.</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPolicy('makeup')}
                className={`opt text-left cursor-pointer ${selectedPolicy === 'makeup' ? 'on' : ''}`}
              >
                <b className="text-[15px] text-[var(--tx)]">Add a make-up day</b>
                <div className="text-[13px] text-[var(--mt)]">
                  Sankalp now ends on Day {duration + 1}.
                </div>
              </button>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowMissedSheet(false)}
                className="btn-ghost flex-1"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  dispatch({ type: 'APPLY_MISSED_POLICY', payload: { policy: selectedPolicy } });
                  setShowMissedSheet(false);
                  setSelectedDay(null);
                }}
                className="btn-primary flex-1"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
