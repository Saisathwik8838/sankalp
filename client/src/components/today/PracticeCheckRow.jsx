import React from 'react';
import { CheckIcon } from '../common/Icons.jsx';

/**
 * Single-tap check row for observances / diya lighting.
 * Source of Truth: line 71 in Sankalp — design board.html
 */
export function PracticeCheckRow({ label, checked = false, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center gap-3 min-h-[52px] w-full text-left py-1 cursor-pointer transition-colors"
      role="checkbox"
      aria-checked={checked}
    >
      <span
        className={`chk ${checked ? 'on' : ''}`}
        aria-hidden="true"
      >
        {checked && <CheckIcon size={16} strokeWidth={3} />}
      </span>
      <span className="text-[15px] text-[var(--tx)] font-normal">{label}</span>
    </button>
  );
}
