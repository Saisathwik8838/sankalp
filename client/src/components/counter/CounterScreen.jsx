import React, { useState, useEffect, useRef } from 'react';
import { useSankalp } from '../../context/SankalpContext.jsx';
import { getEffectiveToday } from '../../lib/dates.js';

export function CounterScreen() {
  const { state, dispatch } = useSankalp();
  const { sankalp, dayEntries, settings, counterPracticeId } = state;

  const [counterMode, setCounterMode] = useState('ring'); // 'ring' | 'beads'
  const [haptics, setHaptics] = useState(settings.hapticsEnabled ?? true);
  const [sound, setSound] = useState(settings.soundEnabled ?? false);
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const [lastCount, setLastCount] = useState(null);

  const wakeLockRef = useRef(null);

  // Screen Wake Lock API
  useEffect(() => {
    let released = false;
    async function requestWakeLock() {
      if ('wakeLock' in navigator) {
        try {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
          setWakeLockActive(true);
          wakeLockRef.current.addEventListener('release', () => {
            if (!released) setWakeLockActive(false);
          });
        } catch (err) {
          console.warn('[wakelock] Not available:', err.message);
        }
      }
    }
    requestWakeLock();

    return () => {
      released = true;
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
      }
    };
  }, []);

  if (!sankalp) return null;

  const todayStr = getEffectiveToday(settings.dayStartTime);
  const todayEntry = dayEntries[todayStr] || { counts: {} };

  // Current practice being counted
  const countPractices = sankalp.practices.filter(p => p.kind === 'count');
  const activePractice = countPractices.find(p => p.id === counterPracticeId) || countPractices[0] || {
    id: 'default',
    name: 'Hanuman Chalisa',
    target: 11,
    unit: 'recitations',
  };

  const currentCount = todayEntry.counts?.[activePractice.id] || 0;
  const target = activePractice.target || 11;

  // Gentle audio chime using Web Audio API
  const playGentleChime = () => {
    if (!sound || typeof window === 'undefined') return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(432, ctx.currentTime); // 432 Hz healing tone
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {}
  };

  const handleTap = () => {
    setLastCount(currentCount);
    // Haptics vibration
    if (haptics && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(25);
    }
    playGentleChime();

    dispatch({
      type: 'UPDATE_PRACTICE_COUNT',
      payload: {
        date: todayStr,
        practiceId: activePractice.id,
        delta: 1,
      },
    });
  };

  const handleUndo = () => {
    if (currentCount > 0) {
      dispatch({
        type: 'UPDATE_PRACTICE_COUNT',
        payload: {
          date: todayStr,
          practiceId: activePractice.id,
          delta: -1,
        },
      });
    }
  };

  const handleReset = () => {
    if (window.confirm(`Reset count for ${activePractice.name} back to 0?`)) {
      dispatch({
        type: 'UPDATE_PRACTICE_COUNT',
        payload: {
          date: todayStr,
          practiceId: activePractice.id,
          absolute: 0,
        },
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 overflow-hidden select-none">
      {/* Top Bar (Slide 5) */}
      <div className="flex items-center justify-between text-[13px] text-[var(--mt)] py-1">
        <select
          value={activePractice.id}
          onChange={(e) => dispatch({ type: 'SET_COUNTER_PRACTICE', payload: e.target.value })}
          className="bg-transparent border-0 font-medium text-[var(--tx)] text-[14px] cursor-pointer focus:outline-none"
        >
          {countPractices.map(p => (
            <option key={p.id} value={p.id} className="bg-[var(--sf)] text-[var(--tx)]">
              {p.name}
            </option>
          ))}
        </select>
        <span className="flex items-center gap-1 font-mono text-[12px]">
          ☼ {wakeLockActive ? 'Screen stays on' : 'Screen on'}
        </span>
      </div>

      {/* Main Center Tap Area (Slide 5: 260px ring with 88px numeral) */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        {counterMode === 'ring' ? (
          <button
            type="button"
            onClick={handleTap}
            aria-label={`Count one recitation for ${activePractice.name}. Current count ${currentCount}`}
            className="tap-counter cursor-pointer shadow-sm active:scale-95 transition-transform"
          >
            <div>
              <div className="serif text-[88px] font-semibold text-[var(--tx)] leading-none">
                {currentCount}
              </div>
              <div className="text-[14px] text-[var(--mt)] mt-1 font-sans">
                of {target} {activePractice.unit || 'recitations'}
              </div>
            </div>
          </button>
        ) : (
          /* 108 Beads Mala Variant */
          <button
            type="button"
            onClick={handleTap}
            className="tap-counter cursor-pointer shadow-sm active:scale-95 transition-transform relative p-4"
          >
            <div className="absolute inset-2 border-2 border-dashed border-[var(--pr)] rounded-full opacity-40 animate-spin-slow" />
            <div>
              <div className="serif text-[72px] font-semibold text-[var(--tx)] leading-none">
                {currentCount}
              </div>
              <div className="text-[13px] text-[var(--mt)] mt-1 font-sans">
                Bead {currentCount % 108} of 108
              </div>
            </div>
          </button>
        )}

        {/* Counter Mode Selector (Slide 5) */}
        <div className="flex gap-2 justify-center">
          <button
            type="button"
            onClick={() => setCounterMode('ring')}
            className={`chip min-h-[36px] py-1 px-4 text-[13px] ${counterMode === 'ring' ? 'on' : ''}`}
          >
            Ring
          </button>
          <button
            type="button"
            onClick={() => setCounterMode('beads')}
            className={`chip min-h-[36px] py-1 px-4 text-[13px] ${counterMode === 'beads' ? 'on' : ''}`}
          >
            108 beads
          </button>
        </div>
      </div>

      {/* Bottom Controls Pills Row (Slide 5) */}
      <div className="flex items-center justify-between gap-1 pt-2">
        <button
          type="button"
          onClick={handleUndo}
          className="pill flex-1 text-[13px]"
        >
          ↶ Undo
        </button>
        <button
          type="button"
          onClick={() => setHaptics(!haptics)}
          className={`pill flex-1 text-[13px] ${haptics ? 'on' : ''}`}
        >
          Haptics {haptics ? '✓' : ''}
        </button>
        <button
          type="button"
          onClick={() => setSound(!sound)}
          className={`pill flex-1 text-[13px] ${sound ? 'on' : ''}`}
        >
          Sound {sound ? '✓' : ''}
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="pill flex-1 text-[13px]"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
