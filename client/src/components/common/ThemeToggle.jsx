import React from 'react';

export function ThemeToggle({ currentTheme, onChangeTheme }) {
  const themes = [
    { id: 'light', label: 'Light' },
    { id: 'dark', label: 'Dark' },
    { id: 'system', label: 'System' },
  ];

  return (
    <div
      className="flex gap-2 items-center justify-center p-2 bg-[var(--bg)] border-b border-[var(--ln)] sticky top-0 z-30"
      role="group"
      aria-label="Theme"
    >
      {themes.map(({ id, label }) => {
        const isSelected = currentTheme === id;
        return (
          <button
            key={id}
            type="button"
            className="pill"
            aria-pressed={isSelected}
            onClick={() => onChangeTheme(id)}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
