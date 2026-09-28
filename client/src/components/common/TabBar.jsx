import React from 'react';
import {
  TodayIcon,
  GridIcon,
  CounterIcon,
  JournalIcon,
  MoreIcon
} from './Icons.jsx';

const TABS = [
  { id: 'today', label: 'Today', icon: TodayIcon },
  { id: 'journey', label: 'Journey', icon: GridIcon },
  { id: 'counter', label: 'Counter', icon: CounterIcon },
  { id: 'journal', label: 'Journal', icon: JournalIcon },
  { id: 'more', label: 'More', icon: MoreIcon },
];

export function TabBar({ activeTab, onSelectTab }) {
  return (
    <nav
      className="flex border-t border-[var(--ln)] bg-[var(--sf)] px-1 pt-1.5 pb-2.5 z-20 shrink-0"
      aria-label="Main"
    >
      {TABS.map(({ id, label, icon: Icon }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onSelectTab(id)}
            aria-current={isActive ? 'page' : undefined}
            className={`flex-1 text-center text-[11px] min-h-[44px] flex flex-col items-center justify-center transition-colors ${
              isActive ? 'text-[var(--pr)] font-semibold' : 'text-[var(--mt)] font-normal'
            }`}
          >
            <Icon size={24} className="mb-0.5" />
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
