import React, { useState } from 'react';
import { useSankalp } from '../../context/SankalpContext.jsx';
import { formatShortDate } from '../../lib/dates.js';
import { downloadIcsFile } from '../../lib/calendar.js';
import { storage } from '../../lib/storage.js';
import { syncWithServer } from '../../lib/sync.js';
import { AuthModal } from '../auth/AuthModal.jsx';

export function SettingsScreen({ onOpenInsights, onOpenReader, onOpenCompletion }) {
  const { state, dispatch } = useSankalp();
  const { sankalp, settings, user, syncStatus } = state;

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'details' | 'appearance' | 'timing' | 'privacy' | 'reset'
  const [resetConfirmStep, setResetConfirmStep] = useState(0);

  if (!sankalp) return null;

  // Export JSON backup
  const handleExportJson = () => {
    const backupData = {
      exportedAt: new Date().toISOString(),
      sankalps: storage.getSankalps(),
      dayEntries: storage.getDayEntries(),
      settings: storage.getSettings(),
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sankalp-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    storage.setLastBackupDate(new Date().toISOString());
    alert('Sankalp backup downloaded safely.');
  };

  // Import JSON backup
  const handleImportJson = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result);
        if (imported.sankalps && imported.dayEntries) {
          storage.setSankalps(imported.sankalps);
          storage.setDayEntries(imported.dayEntries);
          if (imported.settings) storage.setSettings(imported.settings);

          const firstId = Object.keys(imported.sankalps)[0];
          dispatch({
            type: 'INIT_STATE',
            payload: {
              sankalp: imported.sankalps[firstId],
              sankalps: imported.sankalps,
              dayEntries: imported.dayEntries,
              settings: imported.settings || settings,
            }
          });
          alert('Sankalp backup restored successfully!');
        } else {
          alert('Invalid backup file structure.');
        }
      } catch (err) {
        alert('Failed parsing backup file.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    if (resetConfirmStep === 0) {
      setResetConfirmStep(1);
    } else if (resetConfirmStep === 1) {
      dispatch({ type: 'RESET_ALL_DATA' });
      setActiveModal(null);
      setResetConfirmStep(0);
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-3 p-4 overflow-y-auto">
      <div className="serif text-[22px] font-semibold text-[var(--tx)]">
        More
      </div>

      {/* Menu Cards (Slide 9) */}
      <div className="flex flex-col gap-2">
        {/* Sankalp Details */}
        <button
          type="button"
          onClick={() => setActiveModal('details')}
          className="card flex items-center justify-between text-left min-h-[56px] py-2 px-4 cursor-pointer hover:border-[var(--pr)] transition-colors"
        >
          <div>
            <b className="text-[15px] text-[var(--tx)]">Sankalp details</b>
            <div className="text-[13px] text-[var(--mt)]">
              {sankalp.durationDays} days · from {formatShortDate(sankalp.startDate)}
            </div>
          </div>
          <span className="text-[var(--mt)] text-[18px]">›</span>
        </button>

        {/* Appearance */}
        <button
          type="button"
          onClick={() => setActiveModal('appearance')}
          className="card flex items-center justify-between text-left min-h-[56px] py-2 px-4 cursor-pointer hover:border-[var(--pr)] transition-colors"
        >
          <div>
            <b className="text-[15px] text-[var(--tx)]">Appearance</b>
            <div className="text-[13px] text-[var(--mt)] capitalize">
              {settings.theme} · Text size {settings.fontSize || 'M'}
            </div>
          </div>
          <span className="text-[var(--mt)] text-[18px]">›</span>
        </button>

        {/* Day Starts At */}
        <button
          type="button"
          onClick={() => setActiveModal('timing')}
          className="card flex items-center justify-between text-left min-h-[56px] py-2 px-4 cursor-pointer hover:border-[var(--pr)] transition-colors"
        >
          <div>
            <b className="text-[15px] text-[var(--tx)]">Day starts at</b>
            <div className="text-[13px] text-[var(--mt)]">
              {settings.dayStartTime || '04:00 AM'}
            </div>
          </div>
          <span className="text-[var(--mt)] text-[18px]">›</span>
        </button>

        {/* Reminders */}
        <button
          type="button"
          onClick={() => downloadIcsFile(sankalp, sankalp.reminderTime || '05:30')}
          className="card flex items-center justify-between text-left min-h-[56px] py-2 px-4 cursor-pointer hover:border-[var(--pr)] transition-colors"
        >
          <div>
            <b className="text-[15px] text-[var(--tx)]">Reminders</b>
            <div className="text-[13px] text-[var(--mt)]">
              Download calendar reminder (.ics)
            </div>
          </div>
          <span className="text-[var(--mt)] text-[18px]">↓</span>
        </button>

        {/* Insights Subview */}
        <button
          type="button"
          onClick={onOpenInsights}
          className="card flex items-center justify-between text-left min-h-[56px] py-2 px-4 cursor-pointer hover:border-[var(--pr)] transition-colors"
        >
          <div>
            <b className="text-[15px] text-[var(--tx)]">Insights & Analytics</b>
            <div className="text-[13px] text-[var(--mt)]">
              Streaks, practice time & weekday patterns
            </div>
          </div>
          <span className="text-[var(--mt)] text-[18px]">›</span>
        </button>

        {/* Scripture Reader Subview */}
        <button
          type="button"
          onClick={onOpenReader}
          className="card flex items-center justify-between text-left min-h-[56px] py-2 px-4 cursor-pointer hover:border-[var(--pr)] transition-colors"
        >
          <div>
            <b className="text-[15px] text-[var(--tx)]">Scripture Reader</b>
            <div className="text-[13px] text-[var(--mt)]">
              Hanuman Chalisa & Bajrang Baan verses
            </div>
          </div>
          <span className="text-[var(--mt)] text-[18px]">›</span>
        </button>

        {/* Completion Card & Rituals */}
        <button
          type="button"
          onClick={onOpenCompletion}
          className="card flex items-center justify-between text-left min-h-[56px] py-2 px-4 cursor-pointer hover:border-[var(--pr)] transition-colors"
        >
          <div>
            <b className="text-[15px] text-[var(--tx)]">Completion & Rituals</b>
            <div className="text-[13px] text-[var(--mt)]">
              View sacred summary card & closing offerings
            </div>
          </div>
          <span className="text-[var(--mt)] text-[18px]">›</span>
        </button>

        {/* Backup & Sync */}
        <div className="card flex flex-col gap-2 min-h-[56px] py-3 px-4">
          <div className="flex items-center justify-between">
            <div>
              <b className="text-[15px] text-[var(--tx)]">Backup & Sync</b>
              <div className="text-[13px] text-[var(--mt)]">
                {user ? `Signed in as ${user.email}` : 'Guest mode (local device only)'}
              </div>
            </div>
            {user ? (
              <button
                type="button"
                onClick={() => syncWithServer(dispatch, user)}
                className="chip min-h-[32px] py-1 px-3 text-[12px]"
              >
                Sync now
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowAuthModal(true)}
                className="chip min-h-[32px] py-1 px-3 text-[12px] on"
              >
                Sign In
              </button>
            )}
          </div>
          <div className="flex gap-2 pt-2 border-t border-[var(--ln)]">
            <button
              type="button"
              onClick={handleExportJson}
              className="text-[12px] text-[var(--pr)] hover:underline flex-1 text-left"
            >
              Export JSON backup
            </button>
            <label className="text-[12px] text-[var(--pr)] hover:underline cursor-pointer">
              Import backup
              <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
            </label>
          </div>
        </div>

        {/* Privacy Note */}
        <button
          type="button"
          onClick={() => setActiveModal('privacy')}
          className="card flex items-center justify-between text-left min-h-[56px] py-2 px-4 cursor-pointer hover:border-[var(--pr)] transition-colors"
        >
          <div>
            <b className="text-[15px] text-[var(--tx)]">Privacy</b>
            <div className="text-[13px] text-[var(--mt)]">
              Everything stays on this device
            </div>
          </div>
          <span className="text-[var(--mt)] text-[18px]">›</span>
        </button>

        {/* Reset Data */}
        <button
          type="button"
          onClick={() => { setActiveModal('reset'); setResetConfirmStep(0); }}
          className="card flex items-center justify-between text-left min-h-[56px] py-2 px-4 cursor-pointer text-red-600 dark:text-red-400 hover:border-red-500/40 transition-colors"
        >
          <div>
            <b className="text-[15px]">Reset data</b>
            <div className="text-[13px] text-[var(--mt)]">
              Asks twice before erasing
            </div>
          </div>
          <span className="text-[18px]">›</span>
        </button>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      {/* Appearance Modal */}
      {activeModal === 'appearance' && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
          <div className="card w-full max-w-[340px] p-5 relative">
            <b className="text-[18px] text-[var(--tx)] block mb-3">Theme & Display</b>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-[13px] text-[var(--mt)] block mb-1">Theme</label>
                <div className="flex gap-2">
                  {['light', 'dark', 'system'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => dispatch({ type: 'SET_SETTINGS', payload: { theme: t } })}
                      className={`pill flex-1 text-[13px] capitalize ${settings.theme === t ? 'on' : ''}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[13px] text-[var(--mt)] block mb-1">Font Size</label>
                <div className="flex gap-2">
                  {['S', 'M', 'L'].map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => dispatch({ type: 'SET_SETTINGS', payload: { fontSize: sz } })}
                      className={`pill flex-1 text-[13px] ${settings.fontSize === sz ? 'on' : ''}`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="btn-primary mt-4"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Day Start Timing Modal */}
      {activeModal === 'timing' && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
          <div className="card w-full max-w-[340px] p-5 relative">
            <b className="text-[18px] text-[var(--tx)] block mb-1">Day starts at</b>
            <p className="text-[13px] text-[var(--mt)] mb-3">
              If you practice at 1 AM, setting this to 4:00 AM logs it for the preceding calendar day.
            </p>
            <input
              type="time"
              value={settings.dayStartTime || '04:00'}
              onChange={(e) => dispatch({ type: 'SET_SETTINGS', payload: { dayStartTime: e.target.value } })}
              className="w-full border border-[var(--ln)] rounded-xl p-2.5 text-[16px] bg-[var(--bg)] text-[var(--tx)] mb-4"
            />
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="btn-primary"
            >
              Save Timing
            </button>
          </div>
        </div>
      )}

      {/* Privacy Modal */}
      {activeModal === 'privacy' && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
          <div className="card w-full max-w-[340px] p-5 relative">
            <b className="text-[18px] text-[var(--tx)] block mb-2">Privacy & Sanctity</b>
            <div className="text-[13px] text-[var(--mt)] leading-relaxed flex flex-col gap-2">
              <p>• <b>Local-First:</b> All vows, practice counts, notes and timestamps remain on your device.</p>
              <p>• <b>No Trackers:</b> Zero analytics, ads, cookies, or external surveillance.</p>
              <p>• <b>Optional Sync:</b> If you create an account, data is encrypted and transferred solely to synchronize your personal devices.</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="btn-primary mt-4"
            >
              Understood
            </button>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal (Asks twice before erasing) */}
      {activeModal === 'reset' && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px]">
          <div className="card w-full max-w-[340px] p-5 relative border-red-500/30">
            <b className="text-[18px] text-red-600 block mb-1">
              {resetConfirmStep === 0 ? 'Reset All Data?' : 'Final Confirmation'}
            </b>
            <p className="text-[13px] text-[var(--mt)] mb-4">
              {resetConfirmStep === 0
                ? 'This will clear your active sankalp, journey progress, and journal notes from this device. Are you sure?'
                : 'This action cannot be undone. Please confirm to erase all local data.'}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setActiveModal(null); setResetConfirmStep(0); }}
                className="btn-ghost flex-1"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetData}
                className="bg-red-600 text-white rounded-full py-2.5 px-4 font-semibold text-[14px] flex-1"
              >
                {resetConfirmStep === 0 ? 'Yes, Continue' : 'Erase Everything'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
