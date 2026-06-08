import React, { useState } from 'react';
import { Habit } from '../types';
import { CATEGORY_COLORS } from '../initialData';
import { Plus, Check, Trash2, RotateCcw, ShieldCheck, HelpCircle } from 'lucide-react';

interface DailyGridProps {
  habits: Habit[];
  activeMonth: string;
  daysInMonth: number;
  onToggleCheckbox: (habitId: string, dayIdx: number) => void;
  onAddHabit: (name: string, category: string) => void;
  onDeleteHabit: (habitId: string) => void;
  onResetHabit: (habitId: string) => void;
}

export const DailyGrid: React.FC<DailyGridProps> = ({
  habits,
  activeMonth,
  daysInMonth,
  onToggleCheckbox,
  onAddHabit,
  onDeleteHabit,
  onResetHabit
}) => {
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState('Learning');
  const [isAdding, setIsAdding] = useState(false);

  // Helper to retrieve the current month's history cleanly padded/sliced
  const getHabitHistoryForMonth = (habit: Habit, monthKey: string, daysCount: number): boolean[] => {
    const existing = habit.historyByMonth[monthKey] || [];
    if (existing.length === daysCount) {
      return existing;
    }
    const result = [...existing];
    while (result.length < daysCount) {
      result.push(false);
    }
    return result.slice(0, daysCount);
  };

  // Helper to resolve the pastel styling based on the day index (0-30 corresponding to Day 1-31)
  const getWeekGroupConfig = (dayIdx: number) => {
    const day = dayIdx + 1;
    if (day >= 1 && day <= 7) {
      return {
        bg: 'bg-rose-50/20 hover:bg-rose-100/30',
        headerBg: 'bg-rose-100/70 border-rose-200 text-rose-800',
        badgeBg: 'bg-rose-200/60 text-rose-800',
        border: 'border-rose-100/50',
        accent: 'text-rose-600',
        weekName: 'Week 1'
      };
    } else if (day >= 8 && day <= 14) {
      return {
        bg: 'bg-blue-50/20 hover:bg-blue-100/30',
        headerBg: 'bg-blue-100/70 border-blue-200 text-blue-800',
        badgeBg: 'bg-blue-200/60 text-blue-800',
        border: 'border-blue-100/50',
        accent: 'text-blue-600',
        weekName: 'Week 2'
      };
    } else if (day >= 15 && day <= 21) {
      return {
        bg: 'bg-amber-50/20 hover:bg-amber-100/30',
        headerBg: 'bg-amber-100/70 border-amber-200 text-amber-800',
        badgeBg: 'bg-amber-200/60 text-amber-850',
        border: 'border-amber-100/50',
        accent: 'text-amber-600',
        weekName: 'Week 3'
      };
    } else if (day >= 22 && day <= 28) {
      return {
        bg: 'bg-emerald-50/20 hover:bg-emerald-100/30',
        headerBg: 'bg-emerald-100/70 border-emerald-200 text-emerald-800',
        badgeBg: 'bg-emerald-200/60 text-emerald-800',
        border: 'border-emerald-100/50',
        accent: 'text-emerald-600',
        weekName: 'Week 4'
      };
    } else {
      return {
        bg: 'bg-purple-50/20 hover:bg-purple-100/30',
        headerBg: 'bg-purple-100/70 border-purple-200 text-purple-800',
        badgeBg: 'bg-purple-200/30 text-purple-800',
        border: 'border-purple-100/50',
        accent: 'text-purple-600',
        weekName: 'Week 5'
      };
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    onAddHabit(newHabitName.trim(), newHabitCategory);
    setNewHabitName('');
    setIsAdding(false);
  };

  // Define dynamic week spans
  const dynamicWeeks = [
    { name: 'WEEK 1', span: 'Days 1 - 7', colSpan: 7, bg: 'bg-rose-50 text-rose-705' },
    { name: 'WEEK 2', span: 'Days 8 - 14', colSpan: 7, bg: 'bg-blue-50 text-blue-705' },
    { name: 'WEEK 3', span: 'Days 15 - 21', colSpan: 7, bg: 'bg-amber-50 text-amber-705' },
    { name: 'WEEK 4', span: 'Days 22 - 28', colSpan: 7, bg: 'bg-emerald-50 text-emerald-705' },
  ];

  if (daysInMonth > 28) {
    dynamicWeeks.push({
      name: 'WEEK 5',
      span: `Days 29 - ${daysInMonth}`,
      colSpan: daysInMonth - 28,
      bg: 'bg-purple-50/50 text-purple-705'
    });
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-8">
      {/* Grid Controls Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-semibold text-slate-800">
            Interactive Grid for <span className="text-indigo-600 font-bold">{activeMonth}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">Spreadsheet logging panel grouped visually into pastel weeks</p>
        </div>
        
        <div className="flex gap-2">
          {!isAdding ? (
            <button
              onClick={() => setIsAdding(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4.5 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Plus size={15} /> Add Habit
            </button>
          ) : (
            <button
              onClick={() => setIsAdding(false)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold px-4.5 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Slide-out Habit Add Form */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg animate-fade-in relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-slate-500 font-semibold text-[11px] uppercase tracking-wide mb-1.5">
                Habit Description
              </label>
              <input
                type="text"
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                placeholder="e.g. Strength stretches, Water intake..."
                className="w-full text-xs py-2 px-3 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-slate-500 font-semibold text-[11px] uppercase tracking-wide mb-1.5">
                Category Group
              </label>
              <select
                value={newHabitCategory}
                onChange={(e) => setNewHabitCategory(e.target.value)}
                className="w-full text-xs py-2 px-3 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
              >
                {Object.keys(CATEGORY_COLORS).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 px-4 rounded-md shadow-sm transition-all cursor-pointer"
              >
                Save Habit
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Spreadsheet grid scroll wrapper */}
      <div className="overflow-x-auto custom-scrollbar border border-slate-200/80 rounded-xl shadow-inner bg-slate-50/20">
        <table className="w-full border-collapse text-left min-w-[1240px]">
          <thead>
            {/* Super Row representing Week Spans */}
            <tr className="bg-slate-100 border-b border-slate-200 text-[10px] font-bold text-slate-405 select-none">
              <th className="p-3 w-[260px] min-w-[260px] border-r border-slate-200 bg-slate-100 sticky left-0 z-10" />
              {dynamicWeeks.map((w, idx) => (
                <th key={idx} className={`p-1 px-2 border-r border-slate-200 text-center ${w.bg}`} colSpan={w.colSpan}>
                  {w.name} ({w.span})
                </th>
              ))}
              <th className="p-3 w-[230px] bg-slate-100 text-center border-l border-slate-200" colSpan={3}>
                CALCULATED METRICS
              </th>
            </tr>

            {/* Sub headers indicating Days and stat columns */}
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {/* Habit list header */}
              <th className="p-3 w-[260px] min-w-[260px] border-r border-slate-200 bg-slate-100 sticky left-0 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                Habit Descriptions & Goal
              </th>
              
              {/* Days columns 1 - dynamic list */}
              {Array.from({ length: daysInMonth }).map((_, index) => {
                const day = index + 1;
                const weekStyle = getWeekGroupConfig(index);
                return (
                  <th
                    key={index}
                    className={`p-1.5 text-center font-semibold text-[10px] select-none border-r border-slate-200/80 min-w-[28px] ${weekStyle.headerBg}`}
                  >
                    D{day}
                  </th>
                );
              })}

              {/* Habit Metrics Column Headers */}
              <th className="p-3 text-center text-slate-650 bg-slate-50 border-l border-r border-slate-200 font-bold min-w-[55px] w-[65px]">
                Done
              </th>
              <th className="p-3 text-center text-slate-650 bg-slate-50 border-r border-slate-200 font-bold min-w-[55px] w-[65px]">
                Left
              </th>
              <th className="p-3 text-left text-slate-650 bg-slate-50 font-bold min-w-[100px] w-[100px]">
                Rate % Bar
              </th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-slate-150 bg-white">
            {habits.map((habit) => {
              const history = getHabitHistoryForMonth(habit, activeMonth, daysInMonth);
              const completedCount = history.filter(Boolean).length;
              const leftCount = Math.max(0, daysInMonth - completedCount);
              const completionPercent = Math.round((completedCount / daysInMonth) * 100);

              return (
                <tr key={habit.id} className="hover:bg-slate-50/50 group transition-colors">
                  {/* Left row header: Name, Goal, Category */}
                  <td className="p-3 border-r border-slate-200 bg-white sticky left-0 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.02)] group-hover:bg-slate-50 transition-colors">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs font-bold text-slate-700 leading-tight">
                        {habit.name}
                      </span>
                      <div className="flex items-center gap-2">
                        {/* Static Goal mirroring number of days */}
                        <span className="text-[10px] font-mono text-slate-400">
                          Goal: <strong className="text-slate-650 font-bold">{daysInMonth}</strong>
                        </span>
                        {/* Category Badge */}
                        {habit.category && (
                          <span className={`px-1.5 py-0.2 text-[9px] font-semibold border rounded-full ${
                            CATEGORY_COLORS[habit.category] || 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}>
                            {habit.category}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quick Habit Control Overlay on hover */}
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 mt-2 pt-1 border-t border-dashed border-slate-100 transition-opacity">
                      <button
                        onClick={() => onResetHabit(habit.id)}
                        className="text-[9px] text-slate-450 hover:text-indigo-600 flex items-center gap-0.5 cursor-pointer"
                        title="Clear all checkmarks"
                      >
                        <RotateCcw size={10} /> Reset Row
                      </button>
                      <span className="text-slate-200">|</span>
                      <button
                        onClick={() => onDeleteHabit(habit.id)}
                        className="text-[9px] text-slate-455 hover:text-red-500 flex items-center gap-0.5 ml-auto cursor-pointer"
                        title="Delete habit"
                      >
                        <Trash2 size={10} /> Delete
                      </button>
                    </div>
                  </td>

                  {/* Dynamic days check columns */}
                  {history.map((checked, dayIdx) => {
                    const groupConfig = getWeekGroupConfig(dayIdx);
                    return (
                      <td
                        key={dayIdx}
                        onClick={() => onToggleCheckbox(habit.id, dayIdx)}
                        className={`p-1 text-center transition-all cursor-pointer border-r border-slate-200 ${groupConfig.bg} ${
                          checked ? 'bg-indigo-50/10' : ''
                        }`}
                      >
                        <div className="flex justify-center items-center">
                          {/* Checked box representation */}
                          {checked ? (
                            <div className="w-[18px] h-[18px] rounded flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-transform scale-105">
                              <Check size={11} strokeWidth={3} />
                            </div>
                          ) : (
                            // Unchecked representation
                            <div className="w-[18px] h-[18px] rounded border border-slate-300 bg-white hover:border-slate-500 transition-colors" />
                          )}
                        </div>
                      </td>
                    );
                  })}

                  {/* Stat columns right-most */}
                  {/* Dynamic Completed Count */}
                  <td className="p-3 text-center text-xs font-bold font-mono text-slate-700 bg-slate-50/50 border-l border-r border-slate-200">
                    {completedCount}
                  </td>
                  {/* Dynamic Left Count */}
                  <td className={`p-3 text-center text-xs font-bold font-mono bg-slate-50/50 border-r border-slate-200 ${
                    leftCount === 0 ? 'text-emerald-500' : 'text-slate-400'
                  }`}>
                    {leftCount === 0 ? (
                      <span className="flex items-center justify-center text-emerald-500 gap-0.5 text-[10px]" title="Goal reached!">
                        <ShieldCheck size={11} /> Ok
                      </span>
                    ) : (
                      leftCount
                    )}
                  </td>
                  {/* Dynamic Visual Progress Bar */}
                  <td className="p-3 bg-slate-50/50 space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 font-mono">
                      <span>{completionPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          completionPercent >= 75
                            ? 'bg-emerald-500'
                            : completionPercent >= 50
                            ? 'bg-indigo-500'
                            : completionPercent >= 30
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${completionPercent}%` }}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Grid instruction banner */}
      <div className="flex items-start gap-2 bg-slate-50 rounded-lg p-3 border border-slate-100 mt-4 text-slate-500 select-none">
        <HelpCircle size={15} className="mt-0.5 text-slate-400 shrink-0" />
        <span className="text-[11px] leading-relaxed">
          <strong>Interactive Spreadsheet Mode</strong>: Tap any of the Day cells above to instantly log/toggle your progress for <span className="font-bold text-indigo-600">{activeMonth}</span>. You can easily delete habits or reset entire rows on hover. Charts and statistics update automatically.
        </span>
      </div>
    </div>
  );
};
