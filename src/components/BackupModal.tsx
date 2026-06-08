import React, { useRef } from 'react';
import { 
  X, 
  Settings as SettingsIcon, 
  Download, 
  Upload, 
  Volume2, 
  VolumeX, 
  Trash2, 
  FileSpreadsheet, 
  Palette,
  Check
} from 'lucide-react';
import { Profile, Settings } from '../types';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: Profile[];
  activeMonth: string;
  daysInMonth: number;
  settings: Settings;
  onUpdateSettings: (s: Settings) => void;
  onImportProfiles: (profiles: Profile[]) => void;
  onPurgeData: () => void;
}

const THEMES = [
  { id: 'classic-indigo', name: 'Indigo Classic', color: 'bg-indigo-600 border-indigo-200' },
  { id: 'emerald-forest', name: 'Emerald Forest', color: 'bg-emerald-600 border-emerald-200' },
  { id: 'sunset-glow', name: 'Sunset Glow', color: 'bg-orange-600 border-orange-200' },
  { id: 'cyberpunk-neon', name: 'Cyberpunk Neon', color: 'bg-pink-600 border-pink-200' },
  { id: 'midnight-dark', name: 'Midnight Dark', color: 'bg-slate-900 border-slate-700' },
];

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  profiles,
  activeMonth,
  daysInMonth,
  settings,
  onUpdateSettings,
  onImportProfiles,
  onPurgeData,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  // 1. Export JSON Backup
  const handleExportBackup = () => {
    try {
      const backupData = {
        version: '1.0',
        profiles,
        settings,
        timestamp: new Date().toISOString(),
      };
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `unbroken_backup_${new Date().toISOString().slice(0,10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (e) {
      alert('Failed to export backup: ' + e);
    }
  };

  // 2. Import JSON Backup
  const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        
        // Validation check
        if (parsed && Array.isArray(parsed.profiles)) {
          onImportProfiles(parsed.profiles);
          if (parsed.settings) {
            onUpdateSettings(parsed.settings);
          }
          alert('Backup restored successfully!');
          onClose();
        } else {
          alert('Invalid file format. Make sure the JSON file contains valid Unbroken profiles.');
        }
      } catch (err) {
        alert('Failed to parse file: ' + err);
      }
    };
    reader.readAsText(file);
  };

  // 3. Export Active Month Grid to CSV
  const handleExportCSV = () => {
    try {
      // Find active profile (since we pass current habits list)
      const currentProfile = profiles.find(p => p.habits.length > 0) || profiles[0];
      if (!currentProfile) return;

      const habits = currentProfile.habits;

      // Header row
      const headers = ['Habit Name', 'Category', ...Array.from({ length: daysInMonth }, (_, i) => `Day ${i + 1}`), 'Completed', 'Total Days', 'Rate %'];
      
      const csvRows = [headers.join(',')];

      habits.forEach(habit => {
        const history = habit.historyByMonth[activeMonth] || Array(daysInMonth).fill(false);
        const completedCount = history.filter(Boolean).length;
        const completionRate = Math.round((completedCount / daysInMonth) * 100);

        // Escape double quotes in habit names
        const escapedName = `"${habit.name.replace(/"/g, '""')}"`;
        const escapedCategory = `"${(habit.category || '').replace(/"/g, '""')}"`;

        const rowValues = [
          escapedName,
          escapedCategory,
          ...history.map(checked => checked ? 'Yes' : 'No'),
          completedCount,
          daysInMonth,
          `${completionRate}%`
        ];

        csvRows.push(rowValues.join(','));
      });

      const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvRows.join('\n'));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', csvContent);
      downloadAnchor.setAttribute('download', `unbroken_${activeMonth.replace(/\s+/g, '_')}.csv`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (e) {
      alert('Failed to export CSV: ' + e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
              <SettingsIcon size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 leading-none">Settings & Backups</h3>
              <p className="text-xs text-slate-400 mt-1">Configure preferences and sync data</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar text-left">
          
          {/* Section 1: Themes */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
              <Palette size={14} className="text-slate-400" />
              UI Color Theme
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {THEMES.map((theme) => {
                const isSelected = settings.theme === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => onUpdateSettings({ ...settings, theme: theme.id })}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-indigo-600 bg-indigo-50/20 text-indigo-800' 
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full border ${theme.color} flex items-center justify-center shrink-0`}>
                      {isSelected && <Check size={8} className="text-white font-black" />}
                    </span>
                    <span className="truncate">{theme.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Audio Preferences */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
              <Volume2 size={14} className="text-slate-400" />
              Audio Feedbacks
            </h4>
            <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div>
                <p className="text-xs font-bold text-slate-700">Checkmark Sound Chimes</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Play synth cues when clicking checkboxes</p>
              </div>
              <button
                onClick={() => onUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
                className={`p-2 rounded-lg cursor-pointer transition-colors ${
                  settings.soundEnabled 
                    ? 'bg-indigo-150 text-indigo-700 hover:bg-indigo-200' 
                    : 'bg-slate-200 text-slate-400 hover:bg-slate-350'
                }`}
                title={settings.soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
              >
                {settings.soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>
            </div>
          </div>

          {/* Section 3: Backup Export/Import */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
              <Download size={14} className="text-slate-400" />
              Backup & Sync
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleExportBackup}
                className="flex items-center justify-center gap-1.5 p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
              >
                <Download size={14} /> Export Backup
              </button>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-1.5 p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
              >
                <Upload size={14} /> Import Backup
              </button>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImportBackup}
                accept=".json"
                className="hidden"
              />
            </div>
          </div>

          {/* Section 4: Data Export CSV */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
              <FileSpreadsheet size={14} className="text-slate-400" />
              Spreadsheet Export
            </h4>
            <button
              onClick={handleExportCSV}
              className="w-full flex items-center justify-center gap-1.5 p-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
            >
              <FileSpreadsheet size={14} /> Download {activeMonth} Grid (CSV)
            </button>
          </div>

          {/* Section 5: Reset Data */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-extrabold text-rose-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-rose-100 pb-1.5">
              <Trash2 size={14} className="text-rose-400" />
              Danger Zone
            </h4>
            <button
              onClick={onPurgeData}
              className="w-full flex items-center justify-center gap-1.5 p-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
            >
              <Trash2 size={14} /> Wipe All Custom Data
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
