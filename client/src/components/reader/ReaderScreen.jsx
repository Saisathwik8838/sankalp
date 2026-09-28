import React, { useState } from 'react';
import chalisaData from '../../data/texts/chalisa.json';

export function ReaderScreen({ onBack }) {
  const [showTransliteration, setShowTransliteration] = useState(true);
  const [bookmarkedVerse, setBookmarkedVerse] = useState(1);
  const [fontSize, setFontSize] = useState(20);

  return (
    <div className="flex-1 flex flex-col gap-3 p-4 overflow-y-auto">
      {/* Top Header Row (Slide 10) */}
      <div className="flex items-center justify-between">
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
            Reader
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowTransliteration(!showTransliteration)}
          className={`chip min-h-[36px] py-1 px-3 text-[13px] ${showTransliteration ? 'on' : ''}`}
        >
          Aa · Roman {showTransliteration ? '✓' : ''}
        </button>
      </div>

      {/* Font Size Selector */}
      <div className="flex items-center justify-between text-[13px] text-[var(--mt)] px-1">
        <span>{chalisaData.title}</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setFontSize(Math.max(16, fontSize - 2))}
            className="pill min-h-[32px] px-2 py-0 text-[12px]"
          >
            A−
          </button>
          <button
            type="button"
            onClick={() => setFontSize(Math.min(28, fontSize + 2))}
            className="pill min-h-[32px] px-2 py-0 text-[12px]"
          >
            A+
          </button>
        </div>
      </div>

      {/* Verses List (Slide 10) */}
      <div className="flex flex-col gap-3">
        {chalisaData.verses.map((verse) => {
          const isBookmarked = bookmarkedVerse === verse.n;
          return (
            <div
              key={verse.n}
              onClick={() => setBookmarkedVerse(verse.n)}
              className={`card flex flex-col gap-1.5 cursor-pointer transition-all ${
                isBookmarked ? 'border-[var(--pr)] shadow-sm' : ''
              }`}
            >
              <div className="flex items-center justify-between text-[13px] text-[var(--mt)]">
                <span>Verse {verse.n} {isBookmarked ? '· bookmarked' : ''}</span>
                <span className="text-[12px]">{isBookmarked ? '🔖' : 'bookmark'}</span>
              </div>
              <div
                className="dev text-[var(--tx)] leading-relaxed"
                style={{ fontSize: `${fontSize}px` }}
              >
                {verse.devanagari}
              </div>
              {showTransliteration && (
                <div className="text-[13px] text-[var(--mt)] italic">
                  {verse.transliteration}
                </div>
              )}
              {verse.meaning && (
                <div className="text-[12px] text-[var(--tx)] opacity-80 mt-1 pt-1 border-t border-[var(--ln)]">
                  {verse.meaning}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
