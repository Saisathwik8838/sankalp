import React from 'react';

/**
 * Stepper count row for chanting / recitations.
 * Source of Truth: line 70 in Sankalp — design board.html
 */
export function PracticeCountRow({
  name,
  targetLabel,
  currentCount = 0,
  targetCount = 11,
  onIncrement,
  onDecrement,
  onQuickDone,
}) {
  const isDone = currentCount >= targetCount;

  return (
    <div className="flex items-center justify-between min-h-[52px] py-1 border-b border-[var(--ln)] last:border-b-0">
      <div>
        <b className="text-[15px] text-[var(--tx)] font-medium">{name}</b>
        <div className="text-[13px] text-[var(--mt)]">{targetLabel}</div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onDecrement}
          className="stp"
          aria-label={`Decrease ${name}`}
        >
          −
        </button>
        <button
          type="button"
          onClick={onQuickDone}
          title="Click to toggle full target"
          className="min-w-[56px] text-center font-bold text-[14px] text-[var(--tx)] hover:text-[var(--pr)] cursor-pointer py-1 px-1 rounded transition-colors"
        >
          {currentCount} / {targetCount}
        </button>
        <button
          type="button"
          onClick={onIncrement}
          className="stp"
          aria-label={`Increase ${name}`}
        >
          +
        </button>
      </div>
    </div>
  );
}
