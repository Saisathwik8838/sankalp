import React from 'react';
import { useSankalp } from '../../context/SankalpContext.jsx';
import { getEffectiveToday, getWeekday } from '../../lib/dates.js';
import { calculateStreaks, isDayComplete } from '../../lib/sankalp.js';

export function InsightsView({ onBack }) {
  const { state } = useSankalp();
  const { sankalp, dayEntries, settings } = state;

  if (!sankalp) return null;

  const todayStr = getEffectiveToday(settings.dayStartTime);
  const { currentStreak, bestStreak } = calculateStreaks(sankalp, todayStr, dayEntries);

  const entriesList = Object.values(dayEntries);
  const completedEntries = entriesList.filter(e => isDayComplete(sankalp, e.dayNumber, e));

  // Compute total counts
  let totalRecitations = 0;
  let totalJapa = 0;
  entriesList.forEach(e => {
    if (e.counts) {
      if (e.counts.chalisa) totalRecitations += e.counts.chalisa;
      if (e.counts.japa) totalJapa += e.counts.japa;
    }
  });

  // Weekday distribution (0=Sun..6=Sat mapped to M,T,W,T,F,S,S)
  const weekdayTotals = [0, 0, 0, 0, 0, 0, 0]; // 0=Mon..6=Sun
  completedEntries.forEach(e => {
    const rawWd = getWeekday(e.date); // 0=Sun..6=Sat
    const monIdx = rawWd === 0 ? 6 : rawWd - 1; // 0=Mon..6=Sun
    weekdayTotals[monIdx]++;
  });

  const maxWeekday = Math.max(1, ...weekdayTotals);

  return (
    <div className="flex-1 flex flex-col gap-3 p-4 overflow-y-auto">
      <div className="flex items-center gap-2">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="text-[var(--mt)] hover:text-[var(--tx)] text-[18px] mr-1"
          >
            ←
          </button>
        )}
        <div className="serif text-[22px] font-semibold text-[var(--tx)]">
          Insights
        </div>
      </div>

      {/* 2x2 Stats Grid (Slide 7) */}
      <div className="grid grid-cols-2 gap-2">
        <div className="card py-3 px-3">
          <div className="serif text-[32px] font-semibold text-[var(--tx)] leading-none">
            {completedEntries.length}
          </div>
          <div className="text-[13px] text-[var(--mt)] mt-1 font-sans">
            days completed
          </div>
        </div>

        <div className="card py-3 px-3">
          <div className="serif text-[32px] font-semibold text-[var(--tx)] leading-none">
            {currentStreak} · {bestStreak}
          </div>
          <div className="text-[13px] text-[var(--mt)] mt-1 font-sans">
            current · best streak
          </div>
        </div>

        <div className="card py-3 px-3">
          <div className="serif text-[32px] font-semibold text-[var(--tx)] leading-none">
            {totalRecitations}
          </div>
          <div className="text-[13px] text-[var(--mt)] mt-1 font-sans">
            recitations
          </div>
        </div>

        <div className="card py-3 px-3">
          <div className="serif text-[32px] font-semibold text-[var(--tx)] leading-none">
            {totalJapa.toLocaleString()}
          </div>
          <div className="text-[13px] text-[var(--mt)] mt-1 font-sans">
            japa counts
          </div>
        </div>
      </div>

      {/* Usual Practice Time Bar Chart (Slide 7) */}
      <div className="card py-3 px-4">
        <b className="text-[13px] text-[var(--tx)] block mb-3">Usual practice time</b>
        <div className="flex items-end justify-between gap-3 h-[72px]">
          {[
            { hour: '4 AM', height: 28 },
            { hour: '5 AM', height: 60 },
            { hour: '6 AM', height: 42 },
            { hour: '7 AM', height: 16 },
          ].map((item, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full bg-[var(--pr)] rounded-t-md opacity-85 transition-all duration-300"
                style={{ height: `${item.height}px` }}
              />
              <span className="text-[11px] text-[var(--mt)]">{item.hour}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Completion by Weekday Bar Chart (Slide 7) */}
      <div className="card py-3 px-4">
        <b className="text-[13px] text-[var(--tx)] block mb-3">Completion by weekday</b>
        <div className="flex items-end justify-between gap-2 h-[72px]">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => {
            const count = weekdayTotals[idx];
            const pct = Math.round((count / maxWeekday) * 100);
            const barHeight = Math.max(8, Math.round(pct * 0.6));
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-[var(--pr)] rounded-t-md opacity-85 transition-all duration-300"
                  style={{ height: `${barHeight}px` }}
                />
                <span className="text-[11px] text-[var(--mt)]">{day}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
