import React, { useState } from 'react';
import { useSankalp, DEFAULT_SANKALP } from '../../context/SankalpContext.jsx';
import {
  getEffectiveToday,
  addDays,
  getWeekday,
  formatDisplayDate,
  isTuesdayOrSaturday,
} from '../../lib/dates.js';

const PRESET_DURATIONS = [
  { value: 11, label: '11 days' },
  { value: 21, label: '21 days' },
  { value: 40, label: '40 days' },
  { value: 41, label: '41 days' },
  { value: 'custom', label: 'Custom' },
];

export function SetupWizard({ onComplete }) {
  const { dispatch } = useSankalp();

  // Wizard state pre-filled with Section 1 defaults
  const [step, setStep] = useState(2); // Start on Step 2 (as shown in design board Slide 1) or Step 1
  const [userName, setUserName] = useState('Arjun');
  const [intention, setIntention] = useState(
    'I resolve to complete 40 days of daily Hanuman Chalisa with devotion and discipline.'
  );
  const [duration, setDuration] = useState(40);
  const [customDays, setCustomDays] = useState(40);

  // Compute upcoming Tuesday or today as initial start date
  const todayStr = getEffectiveToday('04:00');
  const [startDate, setStartDate] = useState(() => {
    // Find next Tuesday if today is not Tue/Sat
    for (let i = 0; i < 7; i++) {
      const d = addDays(todayStr, i);
      if (isTuesdayOrSaturday(d)) return d;
    }
    return todayStr;
  });

  const [practices, setPractices] = useState(DEFAULT_SANKALP.practices);
  const [niyams, setNiyams] = useState(DEFAULT_SANKALP.niyams);
  const [finalDayPractices, setFinalDayPractices] = useState(DEFAULT_SANKALP.finalDayPractices);
  const [missedPolicy, setMissedPolicy] = useState('resume');
  const [reminderTime, setReminderTime] = useState('05:30');

  const totalSteps = 6;

  const handleFinish = () => {
    const finalDuration = duration === 'custom' ? parseInt(customDays, 10) || 40 : duration;
    const newSankalp = {
      id: `sankalp-${Date.now()}`,
      userName,
      title: `Hanuman ${finalDuration}-Day Sankalp`,
      intention,
      startDate,
      durationDays: finalDuration,
      practices,
      niyams,
      finalDayPractices,
      missedDayPolicy: missedPolicy,
      reminderTime,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    };
    dispatch({ type: 'SET_SANKALP', payload: newSankalp });
    if (onComplete) onComplete();
  };

  // Generate 14 calendar dates starting from today
  const calendarDays = Array.from({ length: 14 }).map((_, i) => addDays(todayStr, i));
  const selectedIsTraditional = isTuesdayOrSaturday(startDate);

  return (
    <div className="flex-1 flex flex-col p-4 overflow-y-auto">
      {/* Step Indicator (Slide 1) */}
      <div className="flex justify-center items-center gap-2 mb-4" aria-label={`Step ${step} of ${totalSteps}`}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <i
            key={i}
            className="h-2 rounded-full transition-all duration-200"
            style={{
              width: i + 1 === step ? '24px' : '8px',
              backgroundColor: i + 1 <= step ? 'var(--pr)' : 'var(--ln)',
            }}
          />
        ))}
      </div>

      {/* Step 1: Intention & Name */}
      {step === 1 && (
        <div className="flex-1 flex flex-col gap-4">
          <div className="serif text-[24px] font-semibold text-[var(--tx)]">
            Who is undertaking this sankalp?
          </div>
          <p className="text-[13px] text-[var(--mt)]">
            A quiet vow between you and Maruti. Enter your name and devotional resolve.
          </p>

          <div className="card flex flex-col gap-3">
            <div>
              <label className="text-[13px] text-[var(--mt)] block mb-1">Your Name</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full border border-[var(--ln)] rounded-xl px-3 py-2 text-[15px] bg-[var(--sf)] text-[var(--tx)]"
                placeholder="e.g. Arjun"
              />
            </div>
            <div>
              <label className="text-[13px] text-[var(--mt)] block mb-1">Sankalp Statement / Intention</label>
              <textarea
                value={intention}
                onChange={(e) => setIntention(e.target.value)}
                rows={3}
                className="w-full border border-[var(--ln)] rounded-xl px-3 py-2 text-[15px] bg-[var(--sf)] text-[var(--tx)] resize-none"
                placeholder="May I remain steady in my sankalp."
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Duration & Start Date (Exact replica of Slide 1) */}
      {step === 2 && (
        <div className="flex-1 flex flex-col gap-3">
          <div className="serif text-[24px] font-semibold text-[var(--tx)]">
            How long is your sankalp?
          </div>
          <p className="text-[13px] text-[var(--mt)]">
            Choose a count of days. You can change it later.
          </p>

          {/* Duration Chips */}
          <div className="flex flex-wrap gap-2">
            {PRESET_DURATIONS.map((preset) => {
              const isSelected = duration === preset.value;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setDuration(preset.value)}
                  className={`chip ${isSelected ? 'on' : ''}`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          {duration === 'custom' && (
            <div className="mt-1">
              <input
                type="number"
                min={1}
                max={1000}
                value={customDays}
                onChange={(e) => setCustomDays(e.target.value)}
                className="border border-[var(--ln)] rounded-xl px-3 py-2 text-[15px] bg-[var(--sf)] text-[var(--tx)] w-36"
                placeholder="Custom days"
              />
            </div>
          )}

          {/* Start Date Card (Slide 1 Calendar) */}
          <div className="card flex flex-col gap-2 mt-2">
            <b className="text-[15px] text-[var(--tx)]">Start date</b>
            <div className="text-[13px] text-[var(--mt)]">
              {formatDisplayDate(startDate)}
              {selectedIsTraditional ? ' · a traditional day' : ''}
            </div>

            {/* 7-column Calendar Header */}
            <div className="grid grid-cols-7 gap-1 text-center text-[12px] font-bold mt-2">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                <span
                  key={i}
                  style={{ color: i === 1 || i === 5 ? 'var(--pr)' : 'var(--mt)' }}
                >
                  {day}
                </span>
              ))}
            </div>

            {/* 14-day Calendar Grid */}
            <div className="grid grid-cols-7 gap-1.5 text-center mt-1">
              {calendarDays.map((dStr, idx) => {
                const dayNum = parseInt(dStr.split('-')[2], 10);
                const isSelected = dStr === startDate;
                const isTrad = isTuesdayOrSaturday(dStr);
                return (
                  <button
                    key={dStr}
                    type="button"
                    onClick={() => setStartDate(dStr)}
                    className={`d-tile min-h-[44px] ${isSelected ? 'today' : ''}`}
                    style={{
                      background: 'none',
                      color: isSelected ? 'var(--pr)' : isTrad ? 'var(--pr)' : 'var(--tx)',
                      fontWeight: isSelected ? 700 : isTrad ? 600 : 400,
                    }}
                  >
                    {dayNum}
                  </button>
                );
              })}
            </div>

            <div className="text-[12px] text-[var(--mt)] mt-2">
              Tuesdays and Saturdays are highlighted. Any date works.
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Daily Practices */}
      {step === 3 && (
        <div className="flex-1 flex flex-col gap-3">
          <div className="serif text-[24px] font-semibold text-[var(--tx)]">
            Daily practices
          </div>
          <p className="text-[13px] text-[var(--mt)]">
            Define the practices you resolve to observe each day.
          </p>

          <div className="card flex flex-col gap-2">
            {practices.map((p, idx) => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-[var(--ln)] last:border-b-0">
                <div>
                  <b className="text-[15px] text-[var(--tx)]">{p.name}</b>
                  <div className="text-[13px] text-[var(--mt)]">
                    {p.kind === 'count' ? `Target: ${p.target} ${p.unit || ''}` : 'Daily Checkmark'}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {p.kind === 'count' && (
                    <input
                      type="number"
                      value={p.target}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 1;
                        const copy = [...practices];
                        copy[idx].target = val;
                        setPractices(copy);
                      }}
                      className="w-16 border border-[var(--ln)] rounded-lg px-2 py-1 text-center text-[14px]"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 4: Niyams & Final Day Extras */}
      {step === 4 && (
        <div className="flex-1 flex flex-col gap-3">
          <div className="serif text-[24px] font-semibold text-[var(--tx)]">
            Observances & Final Day
          </div>
          <p className="text-[13px] text-[var(--mt)]">
            Optional daily niyams and concluding rites for Day {duration}.
          </p>

          <div className="card flex flex-col gap-2">
            <b className="text-[15px] text-[var(--tx)]">Daily Niyams (Rules)</b>
            {niyams.map((n) => (
              <div key={n.id} className="text-[14px] text-[var(--tx)] flex items-center gap-2 py-1">
                <span className="text-[var(--pr)]">✦</span>
                <span>{n.label}</span>
              </div>
            ))}
          </div>

          <div className="card flex flex-col gap-2">
            <b className="text-[15px] text-[var(--tx)]">Final-Day Extra Practices</b>
            {finalDayPractices.map((fp) => (
              <div key={fp.id} className="text-[14px] text-[var(--tx)] flex items-center gap-2 py-1">
                <span className="text-[var(--pr)]">🌟</span>
                <span>{fp.name} ({fp.kind === 'count' ? `Target ${fp.target}` : 'Puja'})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 5: Missed-Day Policy & Reminder Time */}
      {step === 5 && (
        <div className="flex-1 flex flex-col gap-3">
          <div className="serif text-[24px] font-semibold text-[var(--tx)]">
            Missed-day rule & timing
          </div>
          <p className="text-[13px] text-[var(--mt)]">
            Traditions handle interruptions with different vows. Choose what aligns with your tradition.
          </p>

          <div className="flex flex-col gap-2">
            {[
              { id: 'resume', title: 'Continue as is', desc: 'Carry on; the day stays noted in clay.' },
              { id: 'makeup', title: 'Add a make-up day', desc: 'Append one day to the end for each missed day.' },
              { id: 'restart', title: 'Restart from Day 1', desc: 'Begin the count afresh from today.' },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setMissedPolicy(opt.id)}
                className={`opt text-left cursor-pointer ${missedPolicy === opt.id ? 'on' : ''}`}
              >
                <b className="text-[15px] text-[var(--tx)]">{opt.title}</b>
                <div className="text-[13px] text-[var(--mt)]">{opt.desc}</div>
              </button>
            ))}
          </div>

          <div className="card mt-2">
            <b className="text-[15px] text-[var(--tx)] block mb-1">Preferred Practice Time</b>
            <input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="border border-[var(--ln)] rounded-xl px-3 py-2 text-[15px] bg-[var(--sf)] text-[var(--tx)]"
            />
          </div>
        </div>
      )}

      {/* Step 6: Summary & Begin */}
      {step === 6 && (
        <div className="flex-1 flex flex-col gap-3">
          <div className="serif text-[24px] font-semibold text-[var(--tx)]">
            Summary & Dedication
          </div>
          <p className="text-[13px] text-[var(--mt)]">
            Review your resolve before lighting the first quiet lamp.
          </p>

          <div className="card flex flex-col gap-2">
            <div>
              <div className="text-[12px] text-[var(--mt)]">Sankalp Statement</div>
              <div className="serif text-[18px] text-[var(--tx)] italic">“{intention}”</div>
            </div>
            <div className="border-t border-[var(--ln)] pt-2 grid grid-cols-2 gap-2 text-[13px]">
              <div>
                <span className="text-[var(--mt)]">Duration: </span>
                <b>{duration} days</b>
              </div>
              <div>
                <span className="text-[var(--mt)]">Starts: </span>
                <b>{formatDisplayDate(startDate)}</b>
              </div>
              <div>
                <span className="text-[var(--mt)]">Daily target: </span>
                <b>11 Chalisa · 108 Japa</b>
              </div>
              <div>
                <span className="text-[var(--mt)]">Missed policy: </span>
                <b>{missedPolicy}</b>
              </div>
            </div>
          </div>

          <div className="card text-[13px] text-[var(--mt)] bg-amber-500/5">
            🔒 <b>Privacy assurance:</b> Everything is stored privately on this device. You can optionally sign in later to backup across devices.
          </div>
        </div>
      )}

      {/* Bottom Navigation Buttons (Slide 1: Back 35%, Continue primary) */}
      <div className="mt-auto pt-4 flex items-center gap-3">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="btn-ghost w-[35%]"
          >
            Back
          </button>
        ) : (
          <div className="w-[35%]" />
        )}

        {step < totalSteps ? (
          <button
            type="button"
            onClick={() => setStep(step + 1)}
            className="btn-primary flex-1"
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFinish}
            className="btn-primary flex-1"
          >
            Begin Sankalp
          </button>
        )}
      </div>
    </div>
  );
}
