import React, { useState } from 'react';
import { useSankalp } from '../../context/SankalpContext.jsx';
import { DiyaIcon, CheckIcon } from '../common/Icons.jsx';
import { formatShortDate } from '../../lib/dates.js';
import { calculateStreaks, calculateDayNumber } from '../../lib/sankalp.js';

export function CompletionScreen({ onClose }) {
  const { state } = useSankalp();
  const { sankalp, dayEntries } = state;

  const [checklist, setChecklist] = useState([
    { id: 'thanks', label: 'Offer thanks', done: false },
    { id: 'prasad', label: 'Share prasad', done: false },
    { id: 'donate', label: 'Donate', done: false },
  ]);

  if (!sankalp) return null;

  const entriesList = Object.values(dayEntries);
  const completedDays = entriesList.filter(e => e.completed).length;

  let totalRecitations = 0;
  entriesList.forEach(e => {
    if (e.counts?.chalisa) totalRecitations += e.counts.chalisa;
  });

  const { bestStreak } = calculateStreaks(sankalp, new Date().toISOString().split('T')[0], dayEntries);

  const toggleCheck = (id) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, done: !item.done } : item));
  };

  // Generate 1080x1350 Portrait Summary Card via Canvas
  const handleDownloadShareCard = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1350;
    const ctx = canvas.getContext('2d');

    // Background Warm Ivory
    ctx.fillStyle = '#FFF8EE';
    ctx.fillRect(0, 0, 1080, 1350);

    // Border Frame
    ctx.strokeStyle = '#EBD9C5';
    ctx.lineWidth = 12;
    ctx.strokeRect(40, 40, 1000, 1270);

    // Inner Accent Border
    ctx.strokeStyle = '#E8590C';
    ctx.lineWidth = 3;
    ctx.strokeRect(60, 60, 960, 1230);

    // Diya Flame Graphic
    ctx.fillStyle = '#E8590C';
    ctx.beginPath();
    ctx.arc(540, 280, 140, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(232, 89, 12, 0.08)';
    ctx.fill();

    // Sacred Title
    ctx.fillStyle = '#4A1D12';
    ctx.font = 'bold 56px "Noto Serif", serif';
    ctx.textAlign = 'center';
    ctx.fillText('Your Sankalp is complete.', 540, 480);

    ctx.fillStyle = '#8A6A5C';
    ctx.font = '32px Inter, sans-serif';
    ctx.fillText(`${sankalp.durationDays} days, held with steadiness.`, 540, 540);

    // Devotee Name & Intention
    ctx.fillStyle = '#4A1D12';
    ctx.font = 'italic 34px "Noto Serif", serif';
    ctx.fillText(`“${sankalp.intention}”`, 540, 640);
    ctx.font = '28px Inter, sans-serif';
    ctx.fillStyle = '#8A6A5C';
    ctx.fillText(`— Observed by ${sankalp.userName || 'Devotee'}`, 540, 700);

    // Stats Box
    ctx.fillStyle = '#FFFFFF';
    ctx.roundRect(140, 780, 800, 260, 24);
    ctx.fill();
    ctx.strokeStyle = '#EBD9C5';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#4A1D12';
    ctx.font = 'bold 32px Inter, sans-serif';
    ctx.fillText(`${completedDays} Days Completed · ${bestStreak} Best Streak`, 540, 870);
    ctx.fillStyle = '#8A6A5C';
    ctx.font = '28px Inter, sans-serif';
    ctx.fillText(`${totalRecitations} Recitations Offered with Devotion`, 540, 940);
    ctx.fillText(`Begun on ${formatShortDate(sankalp.startDate)}`, 540, 990);

    // Footer
    ctx.fillStyle = '#C2410C';
    ctx.font = 'bold 26px "Noto Serif", serif';
    ctx.fillText('॥ श्री हनुमते नमः ॥', 540, 1180);

    // Download image
    const link = document.createElement('a');
    link.download = `sankalp-completion-card.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="flex-1 flex flex-col p-4 overflow-y-auto items-center text-center gap-3">
      {/* Radiant Diya Glow (Slide 8) */}
      <div className="w-full flex items-center justify-center py-6 relative">
        <div
          className="w-[220px] h-[220px] rounded-full flex items-center justify-center text-[var(--pr)]"
          style={{
            background: 'radial-gradient(circle, color-mix(in srgb, var(--pr) 30%, transparent), transparent 65%)',
          }}
        >
          <svg
            width="110"
            height="110"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            className="animate-pulse"
          >
            <path d="M12 2c2.6 3 3 5 0 7.5C9 7 9.4 5 12 2z" />
            <path d="M3 13h18c0 4-3.5 7-9 7s-9-3-9-7z" />
          </svg>
        </div>
      </div>

      {/* Headline & Subtitle (Slide 8) */}
      <div className="serif text-[26px] font-semibold text-[var(--tx)]">
        Your Sankalp is complete.
      </div>
      <p className="text-[13px] text-[var(--mt)] m-0">
        {sankalp.durationDays} days, held with steadiness.
      </p>

      {/* Summary Stat Card (Slide 8) */}
      <div className="card w-full text-[13px] text-[var(--tx)] py-3 px-4 text-center mt-1">
        {formatShortDate(sankalp.startDate)} – Today · {completedDays} days completed · {totalRecitations} recitations · best streak {bestStreak}
      </div>

      {/* Closing Steps Card (Slide 8) */}
      <div className="card w-full text-left py-3 px-4 mt-1">
        <b className="text-[14px] text-[var(--tx)] block mb-2">Closing steps</b>
        <div className="flex items-center gap-4 flex-wrap">
          {checklist.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => toggleCheck(item.id)}
              className="flex items-center gap-1.5 text-[13px] text-[var(--tx)] cursor-pointer"
            >
              <span className={`chk min-h-[22px] min-w-[22px] w-[22px] h-[22px] ${item.done ? 'on' : ''}`}>
                {item.done && <CheckIcon size={13} strokeWidth={3} />}
              </span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons (Slide 8) */}
      <div className="w-full flex flex-col gap-2 mt-auto pt-4">
        <button
          type="button"
          onClick={handleDownloadShareCard}
          className="btn-secondary w-full"
        >
          Share summary card
        </button>
        <button
          type="button"
          onClick={onClose}
          className="btn-primary w-full"
        >
          Done
        </button>
      </div>
    </div>
  );
}
