import React, { useState } from 'react';
import { useSankalp } from '../../context/SankalpContext.jsx';
import { DiyaIcon } from '../common/Icons.jsx';
import { formatShortDate } from '../../lib/dates.js';

export function JournalScreen() {
  const { state, dispatch } = useSankalp();
  const { sankalp, dayEntries } = state;

  const [searchQuery, setSearchQuery] = useState('');
  const [editingDate, setEditingDate] = useState(null);
  const [editText, setEditText] = useState('');

  if (!sankalp) return null;

  // Filter entries that have journal notes or feelings
  const allEntries = Object.values(dayEntries)
    .filter(e => e.journal || e.feeling)
    .sort((a, b) => b.date.localeCompare(a.date));

  const filteredEntries = allEntries.filter(e => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const noteMatch = e.journal?.toLowerCase().includes(query);
    const feelingMatch = e.feeling?.toLowerCase().includes(query);
    return noteMatch || feelingMatch;
  });

  const handleStartEdit = (entry) => {
    setEditingDate(entry.date);
    setEditText(entry.journal || '');
  };

  const handleSaveEdit = (date) => {
    dispatch({
      type: 'SET_JOURNAL_NOTE',
      payload: { date, note: editText },
    });
    setEditingDate(null);
  };

  return (
    <div className="flex-1 flex flex-col gap-3 p-4 overflow-y-auto">
      <div className="serif text-[22px] font-semibold text-[var(--tx)]">
        Journal
      </div>

      {/* Search Input Card (Slide 6) */}
      <div className="card py-2.5 px-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search entries…"
          className="w-full bg-transparent text-[14px] text-[var(--tx)] placeholder:text-[var(--mt)] border-0 focus:outline-none"
        />
      </div>

      {/* Entry Cards List (Slide 6) */}
      {filteredEntries.length > 0 ? (
        <div className="flex flex-col gap-3">
          {filteredEntries.map((entry) => {
            const isEditing = editingDate === entry.date;
            return (
              <div key={entry.date} className="card flex flex-col gap-1.5 transition-shadow">
                <div className="flex items-center justify-between">
                  <b className="text-[15px] text-[var(--tx)]">
                    Day {entry.dayNumber}{' '}
                    <span className="text-[var(--mt)] text-[13px] font-normal">
                      · {formatShortDate(entry.date)}
                    </span>
                  </b>
                  {entry.feeling && (
                    <span className="chip py-0.5 px-2.5 min-h-[30px] text-[12px] capitalize">
                      {entry.feeling}
                    </span>
                  )}
                </div>

                {isEditing ? (
                  <div className="flex flex-col gap-2 mt-1">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={3}
                      className="w-full border border-[var(--ln)] rounded-xl p-2 text-[14px] bg-[var(--bg)] text-[var(--tx)] resize-none"
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setEditingDate(null)}
                        className="text-[12px] text-[var(--mt)] px-2 py-1"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(entry.date)}
                        className="text-[12px] text-[var(--pr)] font-semibold px-3 py-1 bg-[var(--sf)] border border-[var(--pr)] rounded-full"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => handleStartEdit(entry)}
                    className="text-[13px] text-[var(--mt)] line-clamp-2 cursor-pointer hover:text-[var(--tx)]"
                    title="Click to edit reflection"
                  >
                    {entry.journal || <span className="italic">No text note recorded. Click to write.</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State (Slide 6) */
        <div className="card text-center text-[13px] text-[var(--mt)] py-8 flex flex-col items-center justify-center gap-2">
          <DiyaIcon size={32} className="text-[var(--pr)] opacity-75" />
          <div className="max-w-[260px] leading-relaxed">
            No entries yet.<br />Your first note will rest here.
          </div>
        </div>
      )}
    </div>
  );
}
