import { useState, useEffect } from 'react';
import { Habit, Profile, Settings } from './types';
import { INITIAL_HABITS } from './initialData';
import { TopDashboard } from './components/TopDashboard';
import { MiddleStats } from './components/MiddleStats';
import { ProjectionDashboard } from './components/ProjectionDashboard';
import { DailyGrid } from './components/DailyGrid';
import { Logo } from './components/Logo';
import { 
  RotateCcw, 
  Sparkles, 
  Heart, 
  Info, 
  CalendarRange,
  FolderHeart,
  Plus,
  Trash2,
  Edit,
  Sliders,
  BookOpen
} from 'lucide-react';

import { 
  loadProfiles, 
  saveProfiles, 
  loadActiveProfileId, 
  saveActiveProfileId, 
  loadSettings, 
  saveSettings 
} from './storage';

import { 
  playCheckSound, 
  playUncheckSound, 
  playCelebrationSound, 
  setSoundEnabled 
} from './audio';

import { Confetti } from './components/Confetti';
import { PresetCatalog } from './components/PresetCatalog';
import { BackupModal } from './components/BackupModal';

const MONTH_NAMES_MAP = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const YEARS_LIST = [2024, 2025, 2026, 2027, 2028, 2029, 2030];

const THEME_ACCENTS: Record<string, string> = {
  'classic-indigo': '#4f46e5',
  'emerald-forest': '#059669',
  'sunset-glow': '#ea580c',
  'cyberpunk-neon': '#ec4899',
  'midnight-dark': '#6366f1',
};

function App() {
  // 1. Settings & Profiles initialization
  const [settings, setSettings] = useState<Settings>(() => {
    const s = loadSettings();
    setSoundEnabled(s.soundEnabled);
    return s;
  });

  const [profiles, setProfiles] = useState<Profile[]>(() => loadProfiles());
  const [activeProfileId, setActiveProfileId] = useState<string>(() => loadActiveProfileId(profiles));

  // Modals state
  const [presetCatalogOpen, setPresetCatalogOpen] = useState(false);
  const [backupModalOpen, setBackupModalOpen] = useState(false);
  const [confettiTrigger, setConfettiTrigger] = useState(0);

  // Selected Month and Year (defaulting to June 2026)
  const [selectedMonth, setSelectedMonth] = useState<number>(5); // 5 is June
  const [selectedYear, setSelectedYear] = useState<number>(2026);

  // Sync profiles & settings
  useEffect(() => {
    saveProfiles(profiles);
  }, [profiles]);

  useEffect(() => {
    saveActiveProfileId(activeProfileId);
  }, [activeProfileId]);

  // Derived state for current active profile
  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0] || {
    id: 'default-profile',
    name: 'My Habits',
    habits: INITIAL_HABITS
  };
  const habits = activeProfile.habits;

  // Sync settings when modified
  const handleUpdateSettings = (newSettings: Settings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
    setSoundEnabled(newSettings.soundEnabled);
  };

  // Profile-scoped setter helper
  const setHabits = (updater: Habit[] | ((prev: Habit[]) => Habit[])) => {
    setProfiles(prevProfiles => 
      prevProfiles.map(p => {
        if (p.id === activeProfileId) {
          const nextHabits = typeof updater === 'function' ? updater(p.habits) : updater;
          return { ...p, habits: nextHabits };
        }
        return p;
      })
    );
  };

  // Active month key for history lookups (e.g. "June 2026")
  const activeMonthKey = `${MONTH_NAMES_MAP[selectedMonth]} ${selectedYear}`;

  // Dynamically calculate the exact number of days for the selected month and year
  const daysInActiveMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

  // Yearly Facts calculations
  const isLeap = (selectedYear % 4 === 0 && selectedYear % 100 !== 0) || (selectedYear % 400 === 0);
  const totalDaysInYear = isLeap ? 366 : 365;

  const activeAccent = THEME_ACCENTS[settings.theme] || '#4f46e5';

  // Toggle Day Checkbox Handler (with sound & celebration trigger)
  const handleToggleCheckbox = (habitId: string, dayIdx: number) => {
    let isCheckedAfter = false;

    // Check if day was already completed for all habits
    const isCompletedBefore = habits.length > 0 && habits.every(h => {
      const history = h.historyByMonth[activeMonthKey] || [];
      return h.id === habitId ? history[dayIdx] : !!history[dayIdx];
    });

    setProfiles(prevProfiles => 
      prevProfiles.map(p => {
        if (p.id === activeProfileId) {
          const updatedHabits = p.habits.map(habit => {
            if (habit.id === habitId) {
              const currentHistory = habit.historyByMonth[activeMonthKey] || [];
              const updatedHistory = [...currentHistory];
              // Ensure enough spots in array
              while (updatedHistory.length <= dayIdx) {
                updatedHistory.push(false);
              }
              updatedHistory[dayIdx] = !updatedHistory[dayIdx];
              isCheckedAfter = updatedHistory[dayIdx];
              return {
                ...habit,
                historyByMonth: {
                  ...habit.historyByMonth,
                  [activeMonthKey]: updatedHistory,
                },
              };
            }
            return habit;
          });

          // Check if day is fully completed after this toggle
          const isCompletedAfter = updatedHabits.length > 0 && updatedHabits.every(h => {
            const history = h.historyByMonth[activeMonthKey] || [];
            return !!history[dayIdx];
          });

          // Trigger sounds and confetti
          if (isCheckedAfter) {
            if (isCompletedAfter && !isCompletedBefore) {
              playCelebrationSound();
              setConfettiTrigger(c => c + 1);
            } else {
              playCheckSound();
            }
          } else {
            playUncheckSound();
          }

          return { ...p, habits: updatedHabits };
        }
        return p;
      })
    );
  };

  // Add Habit
  const handleAddHabit = (name: string, category: string) => {
    const newHabit: Habit = {
      id: `habit-${Date.now()}`,
      name,
      category,
      goal: daysInActiveMonth,
      historyByMonth: {
        [activeMonthKey]: Array(daysInActiveMonth).fill(false)
      },
    };
    setHabits((prevHabits) => [...prevHabits, newHabit]);
  };

  // Delete Habit
  const handleDeleteHabit = (habitId: string) => {
    setHabits((prevHabits) => prevHabits.filter((h) => h.id !== habitId));
  };

  // Reset Habit Row
  const handleResetHabit = (habitId: string) => {
    setHabits((prevHabits) =>
      prevHabits.map((h) => {
        if (h.id === habitId) {
          return {
            ...h,
            historyByMonth: {
              ...h.historyByMonth,
              [activeMonthKey]: Array(daysInActiveMonth).fill(false),
            },
          };
        }
        return h;
      })
    );
  };

  // Restore starter habits
  const handleRestoreDefaults = () => {
    if (window.confirm('Do you want to restore default starter habits and high-quality 6-month log histories?')) {
      setHabits(INITIAL_HABITS);
      setSelectedMonth(5); // June
      setSelectedYear(2026);
    }
  };

  // Reset Logs
  const handleResetAllLogs = () => {
    if (window.confirm(`Are you sure you want to clear ALL logged checkmarks for ${activeMonthKey}?`)) {
      setHabits((prevHabits) =>
        prevHabits.map((h) => ({
          ...h,
          historyByMonth: {
            ...h.historyByMonth,
            [activeMonthKey]: Array(daysInActiveMonth).fill(false),
          },
        }))
      );
    }
  };

  // Profile management handlers
  const handleCreateProfile = () => {
    const name = prompt('Enter a name for the new profile:');
    if (!name || !name.trim()) return;
    const newId = `profile-${Date.now()}`;
    const newProfile: Profile = {
      id: newId,
      name: name.trim(),
      habits: INITIAL_HABITS, // Start with defaults
    };
    setProfiles(prev => [...prev, newProfile]);
    setActiveProfileId(newId);
  };

  const handleRenameProfile = () => {
    const profile = profiles.find(p => p.id === activeProfileId);
    if (!profile) return;
    const newName = prompt('Enter new profile name:', profile.name);
    if (!newName || !newName.trim()) return;
    setProfiles(prev => prev.map(p => p.id === activeProfileId ? { ...p, name: newName.trim() } : p));
  };

  const handleDeleteProfile = () => {
    if (profiles.length <= 1) {
      alert('You must keep at least one profile.');
      return;
    }
    const profile = profiles.find(p => p.id === activeProfileId);
    if (!profile) return;
    if (window.confirm(`Are you sure you want to delete the profile "${profile.name}"?`)) {
      const remaining = profiles.filter(p => p.id !== activeProfileId);
      setProfiles(remaining);
      setActiveProfileId(remaining[0].id);
    }
  };

  const handleImportProfiles = (importedProfiles: Profile[]) => {
    setProfiles(importedProfiles);
    if (importedProfiles.length > 0) {
      setActiveProfileId(importedProfiles[0].id);
    }
  };

  const handlePurgeData = () => {
    if (window.confirm('WIPE WARNING: This deletes ALL profiles, habits, and history settings from this browser. Continue?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className={`theme-${settings.theme} min-h-screen bg-slate-50 transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-16">
        
        {/* Confetti canvas animation */}
        <Confetti trigger={confettiTrigger} />

        {/* App Header & Branding */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <Logo className="w-14 h-14 shrink-0" />
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                Unbroken <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100">Pro</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Master your consistency. Track, analyze, and build unbreakable habits month by month.
              </p>
            </div>
          </div>

          {/* Profile Switcher & Action Tools */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Profile Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 shadow-sm">
              <FolderHeart size={14} className="text-slate-400 shrink-0" />
              <select
                value={activeProfileId}
                onChange={(e) => setActiveProfileId(e.target.value)}
                className="text-xs font-bold text-slate-700 bg-transparent outline-none border-none pr-5 cursor-pointer"
              >
                {profiles.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              
              <button
                onClick={handleRenameProfile}
                className="text-slate-400 hover:text-indigo-650 p-1 hover:bg-slate-200/50 rounded transition-colors cursor-pointer"
                title="Rename current profile"
              >
                <Edit size={12} />
              </button>
              <button
                onClick={handleCreateProfile}
                className="text-slate-400 hover:text-indigo-650 p-1 hover:bg-slate-200/50 rounded transition-colors cursor-pointer"
                title="Create new profile"
              >
                <Plus size={12} />
              </button>
              <button
                onClick={handleDeleteProfile}
                className="text-rose-400 hover:text-rose-650 p-1 hover:bg-slate-200/50 rounded transition-colors cursor-pointer"
                title="Delete current profile"
              >
                <Trash2 size={12} />
              </button>
            </div>

            {/* Quick Catalog / Add Habit catalog */}
            <button
              onClick={() => setPresetCatalogOpen(true)}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-indigo-650 bg-white border border-slate-200 hover:bg-slate-50 px-3.5 py-2 rounded-lg cursor-pointer transition-all h-9 shadow-sm"
              title="Add preset templates"
            >
              <BookOpen size={13} className="text-indigo-600" />
              Templates
            </button>

            {/* Global restore & clean */}
            <button
              onClick={handleRestoreDefaults}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 bg-white border border-slate-200 hover:bg-slate-50 px-3.5 py-2 rounded-lg cursor-pointer transition-all h-9 shadow-sm"
              title="Reload default sample metrics"
            >
              <Sparkles size={13} />
              Reset Defaults
            </button>
            
            <button
              onClick={handleResetAllLogs}
              className="flex items-center gap-1.5 text-xs font-semibold text-rose-500 hover:text-rose-650 bg-rose-50 hover:bg-rose-100 px-3.5 py-2 rounded-lg cursor-pointer transition-all h-9 shadow-sm"
              title="Clean checkboxes for active tracking period"
            >
              <RotateCcw size={13} />
              Clean Month
            </button>

            {/* Settings Trigger */}
            <button
              onClick={() => setBackupModalOpen(true)}
              className="flex items-center justify-center text-slate-500 hover:text-indigo-650 bg-white border border-slate-200 hover:bg-slate-50 w-9 h-9 rounded-lg cursor-pointer transition-all shadow-sm"
              title="Settings & Backups"
            >
              <Sliders size={15} />
            </button>

          </div>
        </header>

        {/* SECTION 1: Control Panel & Year Info (Top) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mb-8 bg-slate-50 border border-slate-200/80 rounded-xl p-5 shadow-sm">
          
          {/* Left Side: Selectors (Dropdowns) */}
          <div className="md:col-span-5 flex flex-col justify-center gap-3">
            <div className="flex items-center gap-2">
              <CalendarRange size={18} className="text-indigo-600 shrink-0" />
              <span className="text-xs font-extrabold text-slate-600 tracking-wider uppercase">Period Configuration</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Select Month</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="w-full text-xs font-semibold py-2 px-3 border border-slate-300 rounded-lg bg-white text-slate-700 outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {MONTH_NAMES_MAP.map((month, idx) => (
                    <option key={month} value={idx}>{month}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Select Year</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="w-full text-xs font-semibold py-2 px-3 border border-slate-300 rounded-lg bg-white text-slate-700 outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {YEARS_LIST.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Right Side: Yearly Information Panel */}
          <div className="md:col-span-7 bg-white rounded-lg border border-slate-200 p-3.5 flex items-center justify-between">
            <div className="flex items-start gap-3">
              <div className="bg-indigo-50 text-indigo-600 p-2 rounded-lg shrink-0 mt-0.5">
                <Info size={16} />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1 leading-none">
                  {selectedYear} Almanac & Facts
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">
                  Dynamic facts computed in real-time by the tracking kernel
                </p>
                
                {/* Dynamic Fact Badges */}
                <div className="flex flex-wrap gap-2 mt-2.5">
                  <span className="inline-flex items-center text-[10px] font-mono font-bold bg-slate-50 border border-slate-205 text-slate-600 px-2 py-1 rounded">
                    Year: <span className="text-indigo-600 font-extrabold ml-1">{selectedYear}</span>
                  </span>
                  <span className={`inline-flex items-center text-[10px] font-mono font-bold border px-2 py-1 rounded ${
                    isLeap 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                      : 'bg-slate-50 border-slate-205 text-slate-600'
                  }`}>
                    Leap Year: <span className="font-extrabold ml-1">{isLeap ? 'Yes' : 'No'}</span>
                  </span>
                  <span className="inline-flex items-center text-[10px] font-mono font-bold bg-slate-50 border border-slate-205 text-slate-600 px-2 py-1 rounded">
                    Yearly Length: <span className="text-slate-800 font-extrabold ml-1">{totalDaysInYear} days</span>
                  </span>
                  <span className="inline-flex items-center text-[10px] font-mono font-bold bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-1 rounded">
                    {MONTH_NAMES_MAP[selectedMonth]} Length: <span className="font-extrabold ml-1">{daysInActiveMonth} days</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* SECTION 2: The Visual Dashboard (Line Chart & Doughnut) */}
        <TopDashboard 
          habits={habits} 
          activeMonth={activeMonthKey} 
          daysInMonth={daysInActiveMonth} 
          themeAccent={activeAccent}
        />

        {/* SECTION 3: Weekly Overview & Stats Panel (Middle) */}
        <MiddleStats habits={habits} activeMonth={activeMonthKey} daysInMonth={daysInActiveMonth} />

        {/* SECTION 3.5: Predictive Projections and Linear Regression Metrics */}
        <ProjectionDashboard habits={habits} themeAccent={activeAccent} />

        {/* SECTION 4: The Daily Interactive Grid (Bottom spreadsheet tracker) */}
        <DailyGrid
          habits={habits}
          activeMonth={activeMonthKey}
          daysInMonth={daysInActiveMonth}
          onToggleCheckbox={handleToggleCheckbox}
          onAddHabit={handleAddHabit}
          onDeleteHabit={handleDeleteHabit}
          onResetHabit={handleResetHabit}
        />

        {/* Preset Catalog dialog */}
        <PresetCatalog 
          isOpen={presetCatalogOpen}
          onClose={() => setPresetCatalogOpen(false)}
          onAddHabit={handleAddHabit}
        />

        {/* Settings and backup modal */}
        <BackupModal
          isOpen={backupModalOpen}
          onClose={() => setBackupModalOpen(false)}
          profiles={profiles}
          activeMonth={activeMonthKey}
          daysInMonth={daysInActiveMonth}
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onImportProfiles={handleImportProfiles}
          onPurgeData={handlePurgeData}
        />

        {/* Clean Footer */}
        <footer className="mt-12 text-center text-slate-450 text-xs border-t border-slate-100 pt-6">
          <p className="flex items-center justify-center gap-1">
            Designed with <Heart size={12} className="text-rose-500 fill-rose-100" /> to encourage atomic habits and daily consistency.
          </p>
          <p className="text-[10px] text-slate-300 mt-1 font-mono">
            Unbroken Dashboard &copy; 2026. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
