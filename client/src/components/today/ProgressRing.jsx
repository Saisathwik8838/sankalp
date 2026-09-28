import React from 'react';

/**
 * PROGRESS RING COMPONENT
 * Source of Truth: lines 25 & 69 in Sankalp — design board.html
 * r = 56, strokeWidth = 8, circumference L = 2 * Math.PI * 56 = 351.858
 */
export function ProgressRing({
  progress = 0, // 0 to 1
  size = 132,
  strokeWidth = 8,
  mainText = '',
  subText = '',
  className = '',
}) {
  const radius = (size / 2) - (strokeWidth / 2) - 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - Math.min(1, Math.max(0, progress)));

  return (
    <div
      className={`relative shrink-0 flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={Math.round(progress * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Progress: ${Math.round(progress * 100)}%`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {/* Track ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--ln)"
          strokeWidth={strokeWidth}
        />
        {/* Progress fill */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--pr)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 0.4s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
        <div className="serif text-[36px] font-semibold leading-none text-[var(--tx)]">
          {mainText}
        </div>
        {subText && (
          <div className="text-[13px] text-[var(--mt)] mt-0.5 font-sans">
            {subText}
          </div>
        )}
      </div>
    </div>
  );
}
