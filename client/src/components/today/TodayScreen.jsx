import React, { useState } from 'react';
import { useSankalp } from '../../context/SankalpContext.jsx';
import { DiyaIcon } from '../common/Icons.jsx';
import { ProgressRing } from './ProgressRing.jsx';
import { PracticeCountRow } from './PracticeCountRow.jsx';
import { PracticeCheckRow } from './PracticeCheckRow.jsx';
import { getEffectiveToday, formatDisplayDate, isBeforeDay, isAfterDay } from '../../lib/dates.js';
import {
  calculateDayNumber,
  isDayComplete,
  countRemainingPractices,
  calculateStreaks,
} from '../../lib/sankalp.js';

const FEELINGS = ['Peaceful', 'Strong', 'Restless', 'Tired', 'Grateful'];

export function TodayScreen({ onShowCompletion }) {
  const { state, dispatch } = useSankalp();
  const { sankalp, dayEntries, settings } = state;

  const [showNiyams, setShowNiyams] = useState(false);
  const [isEditingNote, setIsEditingNote] = useState(false);

  if (!sankalp) return null;

  const todayStr = getEffectiveToday(settings.dayStartTime);
  const todayEntry = dayEntries[todayStr] || {
    counts: {},
    checks: {},
    completed: false,
  };

  const dayNumber = calculateDayNumber(sankalp.startDate, todayStr);
  const isPreStart = isBeforeDay(todayStr, sankalp.startDate);
  const isPostEnd = dayNumber > sankalp.durationDays;
  const isFinalDay = dayNumber === sankalp.durationDays;

  const dayDone = isDayComplete(sankalp, dayNumber, todayEntry);
  const remaining = countRemainingPractices(sankalp, dayNumber, todayEntry);
  const isNotStarted = Object.keys(todayEntry.counts || {}).length === 0 &&
                       Object.values(todayEntry.checks || {}).every(v => !v);

  const { currentStreak } = calculateStreaks(sankalp, todayStr, dayEntries);
  const progressRatio = Math.min(1, Math.max(0, dayNumber / (sankalp.durationDays || 40)));

  // Dynamic status text
  let statusHeadline = `Day ${Math.max(1, Math.min(dayNumber, sankalp.durationDays))} of ${sankalp.durationDays}`;
  let statusSubtext = 'Steady and unhurried.';
  if (isPreStart) {
    statusHeadline = 'Sankalp Awaiting';
    statusSubtext = `Your sankalp begins on ${formatDisplayDate(sankalp.startDate)}.`;
  } else if (dayDone) {
    statusSubtext = 'Your practice for today is complete.';
  } else if (isNotStarted) {
    statusSubtext = 'Begin when you are ready.';
  }

  // Greeting
  const userName = sankalp.userName || 'Arjun';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? `Good morning, ${userName}` : hour < 17 ? `Good afternoon, ${userName}` : `Good evening, ${userName}`;

  // Button text & state
  let buttonLabel = 'Complete today’s practice';
  let buttonClass = 'btn-primary';
  if (dayDone) {
    buttonLabel = 'Your practice is complete ✓';
    buttonClass = 'btn-secondary';
  } else if (remaining > 0 && !isNotStarted) {
    buttonLabel = `${remaining} practice${remaining > 1 ? 's' : ''} left`;
    buttonClass = 'btn-disabled';
  }

  return (
    <div className="flex-1 flex flex-col gap-3 p-4 overflow-y-auto">
      {/* Header Row: Greeting, Intention & Streak Diya */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[13px] text-[var(--mt)]">{greeting}</div>
          <div className="text-[13px] text-[var(--mt)] italic">
            “{sankalp.intention || 'May I remain steady in my sankalp.'}”
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[var(--pr)] font-bold text-[16px] shrink-0">
          <DiyaIcon size={22} />
          <span>{currentStreak > 0 ? currentStreak : sankalp.durationDays}</span>
        </div>
      </div>

      {/* Progress Ring Card */}
      <div className="card flex items-center gap-4 py-4 px-4">
        <ProgressRing
          progress={isPreStart ? 0 : progressRatio}
          size={110}
          strokeWidth={8}
          mainText={isPreStart ? '0' : String(Math.max(1, Math.min(dayNumber, sankalp.durationDays)))}
          subText={`of ${sankalp.durationDays}`}
        />
        <div className="flex-1">
          <div className="serif text-[22px] font-semibold text-[var(--tx)] leading-tight">
            {statusHeadline}
          </div>
          <div className="text-[13px] text-[var(--mt)] mt-1 font-sans">
            {statusSubtext}
          </div>
        </div>
      </div>

      {/* Sankalp Completed Banner */}
      {((isFinalDay && dayDone) || isPostEnd) && (
        <div className="card bg-amber-500/15 border-amber-500/40 p-3 flex items-center justify-between">
          <div>
            <b className="text-[14px] text-[var(--tx)]">Sankalp Completed! 🙏</b>
            <div className="text-[12px] text-[var(--mt)]">Your vow has reached fruition.</div>
          </div>
          <button
            type="button"
            onClick={onShowCompletion}
            className="btn-primary text-[12px] py-1 px-3 min-h-[32px]"
          >
            View Card
          </button>
        </div>
      )}

      {/* Final Day Special Banner */}
      {isFinalDay && !dayDone && (
        <div className="card bg-amber-500/10 border-amber-500/30 p-3 text-[13px] text-[var(--pr)] font-medium">
          🌟 <b>Final Day of Sankalp!</b> Extra observances and closing puja are active today.
        </div>
      )}

      {/* Daily Practices Card */}
      <div className="card py-1 px-4 flex flex-col">
        {sankalp.practices.map((practice) => {
          if (practice.kind === 'count') {
            const count = todayEntry.counts?.[practice.id] || 0;
            return (
              <PracticeCountRow
                key={practice.id}
                name={practice.name}
                targetLabel={practice.unit ? `${practice.unit} · Target ${practice.target}` : `Target ${practice.target}`}
                currentCount={count}
                targetCount={practice.target}
                onIncrement={() => dispatch({
                  type: 'UPDATE_PRACTICE_COUNT',
                  payload: { date: todayStr, practiceId: practice.id, delta: 1 }
                })}
                onDecrement={() => dispatch({
                  type: 'UPDATE_PRACTICE_COUNT',
                  payload: { date: todayStr, practiceId: practice.id, delta: -1 }
                })}
                onQuickDone={() => dispatch({
                  type: 'UPDATE_PRACTICE_COUNT',
                  payload: {
                    date: todayStr,
                    practiceId: practice.id,
                    absolute: count >= practice.target ? 0 : practice.target
                  }
                })}
              />
            );
          } else {
            const checked = !!todayEntry.checks?.[practice.id];
            return (
              <PracticeCheckRow
                key={practice.id}
                label={practice.name}
                checked={checked}
                onToggle={() => dispatch({
                  type: 'TOGGLE_PRACTICE_CHECK',
                  payload: { date: todayStr, practiceId: practice.id }
                })}
              />
            );
          }
        })}

        {/* Final Day Extra Practices */}
        {isFinalDay && sankalp.finalDayPractices?.map((practice) => {
          if (practice.kind === 'count') {
            const count = todayEntry.counts?.[practice.id] || 0;
            return (
              <PracticeCountRow
                key={practice.id}
                name={`🌟 ${practice.name}`}
                targetLabel={`Final Day · Target ${practice.target}`}
                currentCount={count}
                targetCount={practice.target}
                onIncrement={() => dispatch({
                  type: 'UPDATE_PRACTICE_COUNT',
                  payload: { date: todayStr, practiceId: practice.id, delta: 1 }
                })}
                onDecrement={() => dispatch({
                  type: 'UPDATE_PRACTICE_COUNT',
                  payload: { date: todayStr, practiceId: practice.id, delta: -1 }
                })}
              />
            );
          } else {
            const checked = !!todayEntry.checks?.[practice.id];
            return (
              <PracticeCheckRow
                key={practice.id}
                label={`🌟 ${practice.name}`}
                checked={checked}
                onToggle={() => dispatch({
                  type: 'TOGGLE_PRACTICE_CHECK',
                  payload: { date: todayStr, practiceId: practice.id }
                })}
              />
            );
          }
        })}

        {/* Niyams Accordion */}
        {sankalp.niyams?.length > 0 && (
          <div className="border-t border-[var(--ln)] mt-1 pt-2 pb-1">
            <button
              type="button"
              onClick={() => setShowNiyams(!showNiyams)}
              className="text-[13px] text-[var(--mt)] flex items-center justify-between w-full text-left cursor-pointer hover:text-[var(--pr)] py-1"
            >
              <span>Niyams ({sankalp.niyams.length}) {showNiyams ? '▴' : '▾'}</span>
              <span className="text-[11px] text-[var(--mt)]">Optional observances</span>
            </button>
            {showNiyams && (
              <div className="flex flex-col gap-1 mt-2 pl-1 pb-1">
                {sankalp.niyams.map((niyam) => {
                  const checked = !!todayEntry.checks?.[niyam.id];
                  return (
                    <PracticeCheckRow
                      key={niyam.id}
                      label={niyam.label}
                      checked={checked}
                      onToggle={() => dispatch({
                        type: 'TOGGLE_PRACTICE_CHECK',
                        payload: { date: todayStr, practiceId: niyam.id }
                      })}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Feeling Check-in Chips */}
      <div className="flex flex-wrap gap-2">
        {FEELINGS.map((feeling) => {
          const isSelected = todayEntry.feeling === feeling;
          return (
            <button
              key={feeling}
              type="button"
              onClick={() => dispatch({
                type: 'SET_DAY_FEELING',
                payload: { date: todayStr, feeling }
              })}
              className={`chip ${isSelected ? 'on' : ''}`}
            >
              {feeling}
            </button>
          );
        })}
      </div>

      {/* Quiet Note Input Card */}
      <div className="card py-2 px-3">
        {isEditingNote || todayEntry.journal ? (
          <textarea
            value={todayEntry.journal || ''}
            onChange={(e) => dispatch({
              type: 'SET_JOURNAL_NOTE',
              payload: { date: todayStr, note: e.target.value }
            })}
            placeholder="Add a quiet note…"
            rows={2}
            className="w-full bg-transparent text-[14px] text-[var(--tx)] placeholder:text-[var(--mt)] resize-none border-0 focus:outline-none p-1"
          />
        ) : (
          <button
            type="button"
            onClick={() => setIsEditingNote(true)}
            className="text-[13px] text-[var(--mt)] text-left w-full cursor-text py-1"
          >
            Add a quiet note…
          </button>
        )}
      </div>

      {/* Primary Action Button */}
      <div className="mt-auto pt-2">
        <button
          type="button"
          disabled={remaining > 0 && !dayDone}
          onClick={() => {
            if (!dayDone && remaining === 0) {
              // Mark complete
              sankalp.practices.forEach(p => {
                if (p.kind === 'count') {
                  const cur = todayEntry.counts?.[p.id] || 0;
                  if (cur < p.target) {
                    dispatch({
                      type: 'UPDATE_PRACTICE_COUNT',
                      payload: { date: todayStr, practiceId: p.id, absolute: p.target }
                    });
                  }
                } else if (p.kind === 'check') {
                  dispatch({
                    type: 'TOGGLE_PRACTICE_CHECK',
                    payload: { date: todayStr, practiceId: p.id }
                  });
                }
              });
              if (isFinalDay && onShowCompletion) {
                setTimeout(() => onShowCompletion(), 400);
              }
            } else if (dayDone && (isFinalDay || isPostEnd)) {
              onShowCompletion?.();
            }
          }}
          className={`${buttonClass} w-full`}
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  );
}
