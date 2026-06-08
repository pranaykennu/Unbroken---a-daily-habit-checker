import React from 'react';
import { X, Sparkles, Dumbbell, Brain, Code } from 'lucide-react';
import { CATEGORY_COLORS } from '../initialData';

interface PresetHabit {
  name: string;
  category: string;
  description: string;
}

const PRESET_CATEGORIES = [
  { name: 'Fitness & Health', icon: <Dumbbell size={14} className="text-rose-500" /> },
  { name: 'Mind & Wellbeing', icon: <Brain size={14} className="text-amber-500" /> },
  { name: 'Learning & Tech', icon: <Code size={14} className="text-indigo-500" /> },
];

const PRESETS: Record<string, PresetHabit[]> = {
  'Fitness & Health': [
    { name: 'Walk 10,000 Steps', category: 'Fitness', description: 'Maintain daily aerobic movement.' },
    { name: 'Gym Workout & Strength', category: 'Fitness', description: 'Core and muscular weight training.' },
    { name: 'Drink 3 Liters of Water', category: 'Health', description: 'Keep hydrated throughout the day.' },
    { name: 'Prepare Healthy Meals (Low Carb)', category: 'Health', description: 'Avoid fast foods; prep nutritious inputs.' },
    { name: 'Full-Body Stretches (15m)', category: 'Fitness', description: 'Increase joint mobility and flexibility.' },
  ],
  'Mind & Wellbeing': [
    { name: 'Mindfulness & Meditation (15m)', category: 'Mind', description: 'Calm the mind, focus on deep breathing.' },
    { name: '8 Hours Quality Sleep', category: 'Wellbeing', description: 'Shut down screens by 10 PM.' },
    { name: 'Daily Journaling & Reflections', category: 'Wellbeing', description: 'Write thoughts, goals, and wins.' },
    { name: 'No Caffeine after 2 PM', category: 'Health', description: 'Protect sleep hygiene and cycle.' },
    { name: 'Deep Breathing Breaks (3x)', category: 'Mind', description: 'De-stress during working hours.' },
  ],
  'Learning & Tech': [
    { name: 'Read 20 Pages of Tech Book', category: 'Learning', description: 'Expand your knowledge base systematically.' },
    { name: 'Algorithm & System Design Prep', category: 'Engineering', description: 'Maintain technical problem-solving skills.' },
    { name: 'Code Commits & Side Project builds', category: 'Engineering', description: 'Maintain active building momentum.' },
    { name: 'Deep Work Session (90 mins)', category: 'Learning', description: 'Undistracted, high-concentration work.' },
    { name: 'Learn a New Language Lesson', category: 'Learning', description: 'Practice vocabulary and grammar.' },
  ],
};

interface PresetCatalogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddHabit: (name: string, category: string) => void;
}

export const PresetCatalog: React.FC<PresetCatalogProps> = ({ isOpen, onClose, onAddHabit }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 leading-none">Habit Catalog</h3>
              <p className="text-xs text-slate-400 mt-1">Select from pre-defined atomic habits to add instantly</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
          {PRESET_CATEGORIES.map((catGroup) => (
            <div key={catGroup.name} className="space-y-3">
              <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                {catGroup.icon}
                {catGroup.name}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PRESETS[catGroup.name]?.map((preset) => (
                  <div 
                    key={preset.name}
                    className="p-3 bg-slate-50 hover:bg-indigo-50/35 border border-slate-200/80 hover:border-indigo-200 rounded-xl transition-all flex flex-col justify-between group cursor-pointer"
                    onClick={() => {
                      onAddHabit(preset.name, preset.category);
                      onClose();
                    }}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-700 transition-colors leading-tight">
                          {preset.name}
                        </span>
                        <span className={`px-1.5 py-0.2 text-[8px] font-semibold border rounded-full shrink-0 ${
                          CATEGORY_COLORS[preset.category] || 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {preset.category}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                        {preset.description}
                      </p>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-slate-100 text-[10px] font-bold text-indigo-650 group-hover:text-indigo-700 transition-colors flex items-center justify-end">
                      + Add to Checklist
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
