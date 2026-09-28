import React, { useState } from 'react';
import { useSankalp, DEFAULT_SANKALP } from './context/SankalpContext.jsx';
import { ThemeToggle } from './components/common/ThemeToggle.jsx';
import { TabBar } from './components/common/TabBar.jsx';
import { SetupWizard } from './components/setup/SetupWizard.jsx';
import { TodayScreen } from './components/today/TodayScreen.jsx';
import { JourneyScreen } from './components/journey/JourneyScreen.jsx';
import { CounterScreen } from './components/counter/CounterScreen.jsx';
import { JournalScreen } from './components/journal/JournalScreen.jsx';
import { SettingsScreen } from './components/settings/SettingsScreen.jsx';
import { InsightsView } from './components/insights/InsightsView.jsx';
import { ReaderScreen } from './components/reader/ReaderScreen.jsx';
import { CompletionScreen } from './components/completion/CompletionScreen.jsx';

export function App() {
  const { state, dispatch } = useSankalp();
  const { sankalp, settings, activeTab, isInitialized } = state;

  const [activeSubView, setActiveSubView] = useState(null); // 'insights' | 'reader' | 'completion'
  const [dualColumnMode, setDualColumnMode] = useState(false);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] text-[var(--tx)]">
        <div className="serif text-[20px] animate-pulse">Lighting the lamp…</div>
      </div>
    );
  }

  // Handle Theme Change
  const handleThemeChange = (newTheme) => {
    dispatch({ type: 'SET_SETTINGS', payload: { theme: newTheme } });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--tx)] antialiased transition-colors duration-200">
      {/* Top Header Theme Controller (Matching Design Board line 43) */}
      <ThemeToggle
        currentTheme={settings.theme || 'system'}
        onChangeTheme={handleThemeChange}
      />

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center justify-center p-0 sm:p-4">
        {!sankalp ? (
          /* Setup Wizard for First Run */
          <div className="w-full max-w-[390px] h-full sm:h-[844px] bg-[var(--bg)] sm:border sm:border-[var(--ln)] sm:rounded-[36px] overflow-hidden flex flex-col shadow-card">
            <SetupWizard onComplete={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: 'today' })} />
          </div>
        ) : activeSubView === 'completion' ? (
          /* Completion Screen */
          <div className="w-full max-w-[390px] h-full sm:h-[844px] bg-[var(--bg)] sm:border sm:border-[var(--ln)] sm:rounded-[36px] overflow-hidden flex flex-col shadow-card">
            <CompletionScreen onClose={() => setActiveSubView(null)} />
          </div>
        ) : dualColumnMode ? (
          /* Tablet / Desktop Centered Column Dual View (~720px adaptation matching tablet_desktop.png) */
          <div className="w-full max-w-[760px] bg-[var(--sf)] border border-[var(--ln)] rounded-[24px] p-6 shadow-card my-auto flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-[var(--ln)] pb-3">
              <div className="serif text-[22px] font-semibold text-[var(--tx)]">
                Sankalp · Tablet Companion
              </div>
              <button
                type="button"
                onClick={() => setDualColumnMode(false)}
                className="chip min-h-[36px] py-1 px-3 text-[13px]"
              >
                Switch to Mobile View
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div className="border border-[var(--ln)] rounded-[20px] p-2 bg-[var(--bg)]">
                <TodayScreen />
              </div>
              <div className="border border-[var(--ln)] rounded-[20px] p-2 bg-[var(--bg)]">
                <JourneyScreen />
              </div>
            </div>
          </div>
        ) : (
          /* Standard Mobile Phone Frame (390×844 content area as specified in Design Board) */
          <div className="w-full max-w-[390px] h-screen sm:h-[844px] bg-[var(--bg)] sm:border sm:border-[var(--ln)] sm:rounded-[36px] overflow-hidden flex flex-col shadow-card relative">
            {/* Viewport content router */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {activeSubView === 'insights' ? (
                <InsightsView onBack={() => setActiveSubView(null)} />
              ) : activeSubView === 'reader' ? (
                <ReaderScreen onBack={() => setActiveSubView(null)} />
              ) : activeTab === 'today' ? (
                <TodayScreen onShowCompletion={() => setActiveSubView('completion')} />
              ) : activeTab === 'journey' ? (
                <JourneyScreen onShowCompletion={() => setActiveSubView('completion')} />
              ) : activeTab === 'counter' ? (
                <CounterScreen />
              ) : activeTab === 'journal' ? (
                <JournalScreen />
              ) : (
                <SettingsScreen
                  onOpenInsights={() => setActiveSubView('insights')}
                  onOpenReader={() => setActiveSubView('reader')}
                  onOpenCompletion={() => setActiveSubView('completion')}
                />
              )}
            </div>

            {/* Bottom Tab Bar */}
            <TabBar
              activeTab={activeTab}
              onSelectTab={(tabId) => {
                setActiveSubView(null);
                dispatch({ type: 'SET_ACTIVE_TAB', payload: tabId });
              }}
            />
          </div>
        )}
      </main>
    </div>
  );
}
export default App;
