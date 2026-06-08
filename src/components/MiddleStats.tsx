import React from 'react';
import { Habit, WeekStats } from '../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Award, Zap, Calendar, CheckSquare, Sparkles } from 'lucide-react';

interface MiddleStatsProps {
  habits: Habit[];
  activeMonth: string;
  daysInMonth: number;
}

export const MiddleStats: React.FC<MiddleStatsProps> = ({ habits, activeMonth, daysInMonth }) => {
  const totalHabits = habits.length;
  const totalPossible = totalHabits * daysInMonth;

  // 1. Calculate overall completed and left for this activeMonth
  const totalCompleted = habits.reduce((sum, h) => {
    const history = h.historyByMonth[activeMonth] || Array(daysInMonth).fill(false);
    let count = 0;
    for (let i = 0; i < daysInMonth; i++) {
      if (history[i]) count++;
    }
    return sum + count;
  }, 0);
  const totalLeft = Math.max(0, totalPossible - totalCompleted);
  const globalPercentage = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

  // 2. Define and calculate Weekly statistics for this activeMonth dynamically
  const weeksConfig = [
    { name: 'Week 1', daysRange: 'Days 1-7', start: 0, end: 6, color: '#fba7b4' }, // Pastel Pink/Rose
    { name: 'Week 2', daysRange: 'Days 8-14', start: 7, end: 13, color: '#93c5fd' }, // Pastel Blue
    { name: 'Week 3', daysRange: 'Days 15-21', start: 14, end: 20, color: '#fcd34d' }, // Pastel Yellow
    { name: 'Week 4', daysRange: 'Days 22-28', start: 21, end: 27, color: '#6ee7b7' }, // Pastel Green
  ];

  if (daysInMonth > 28) {
    weeksConfig.push({
      name: 'Week 5',
      daysRange: `Days 29-${daysInMonth}`,
      start: 28,
      end: daysInMonth - 1,
      color: '#c084fc' // Pastel Purple/Pink
    });
  }

  const weeksData: WeekStats[] = weeksConfig.map((config) => {
    const daysInWeek = (config.end - config.start) + 1;
    const weekPossible = totalHabits * daysInWeek;
    
    let weekCompleted = 0;
    habits.forEach((habit) => {
      const history = habit.historyByMonth[activeMonth] || Array(daysInMonth).fill(false);
      for (let dayIdx = config.start; dayIdx <= config.end; dayIdx++) {
        if (history[dayIdx]) {
          weekCompleted++;
        }
      }
    });

    const percentage = weekPossible > 0 ? Math.round((weekCompleted / weekPossible) * 100) : 0;

    return {
      week: config.name,
      percentage,
      completed: weekCompleted,
      left: Math.max(0, weekPossible - weekCompleted),
      total: weekPossible,
      color: config.color,
      days: config.daysRange
    };
  });

  // 3. Ranked Top 10 Habits for this activeMonth
  const rankedHabits = habits
    .map((habit) => {
      const history = habit.historyByMonth[activeMonth] || Array(daysInMonth).fill(false);
      let completedCount = 0;
      for (let i = 0; i < daysInMonth; i++) {
        if (history[i]) completedCount++;
      }
      const percentage = Math.round((completedCount / daysInMonth) * 100);
      return {
        ...habit,
        completedCount,
        percentage
      };
    })
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 10);

  // Custom Weekly Bar Tooltip
  const WeeklyBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as WeekStats;
      return (
        <div className="bg-white p-3 border border-slate-200 shadow-md rounded-lg text-xs leading-relaxed">
          <p className="font-bold text-slate-800">{data.week} ({data.days})</p>
          <div className="flex items-center gap-1.5 mt-1 font-semibold text-indigo-600 text-sm">
            <span>{data.percentage}% Completion</span>
          </div>
          <p className="text-slate-500 mt-1 font-mono">
            Completions: {data.completed} / {data.total} tasks
          </p>
          <p className="text-slate-400 font-mono">
            Unchecked: {data.left} remaining
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
      {/* LEFT: Global Stats Panel */}
      <div id="global-stats-card" className="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
              <Zap size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Metrics Panel</h2>
              <p className="text-xs text-slate-400">{activeMonth} Audit</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Global Progress */}
            <div className="border-b border-slate-100 pb-3">
              <span className="text-slate-400 text-xs font-medium">Global Progress</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-indigo-600 tracking-tight">{globalPercentage}%</span>
                <span className="text-xs text-slate-400 font-medium">of monthly targets</span>
              </div>
            </div>

            {/* Quick stats items */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-slate-400 text-[10px] font-bold uppercase block">Completed</span>
                <span className="text-lg font-extrabold text-slate-700 block mt-0.5">{totalCompleted}</span>
                <span className="text-[10px] text-slate-400">checkmarks</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-slate-400 text-[10px] font-bold uppercase block">Left</span>
                <span className="text-lg font-extrabold text-[#fba7b4] block mt-0.5">{totalLeft}</span>
                <span className="text-[10px] text-slate-400">remaining</span>
              </div>
            </div>

            {/* Goal summary */}
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600 bg-slate-50 border border-dashed border-slate-200 px-3 py-2 rounded-lg">
              <span className="flex items-center gap-1.5 font-medium text-slate-400">
                <CheckSquare size={13} className="text-slate-400" /> Goal Targets:
              </span>
              <span className="font-bold text-slate-700">{totalPossible} checklist items</span>
            </div>
          </div>
        </div>

        {/* Small weekly checklist summary list in Left Panel */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Weekly Milestones</h3>
          <ul className="space-y-1.5 text-xs text-slate-600">
            {weeksData.map((w) => (
              <li key={w.week} className="flex justify-between items-center bg-slate-50/50 hover:bg-slate-50 px-2 py-1 rounded border border-slate-100/50">
                <span className="flex items-center gap-1 font-medium text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: w.color }} />
                  {w.week} 
                </span>
                <span className="font-semibold text-slate-700">{w.percentage}%</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* CENTER: Weekly Progress Bar Chart */}
      <div id="weekly-overview-card" className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col h-[340px] lg:h-auto">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-emerald-50 p-2 rounded-lg text-emerald-600">
            <Calendar size={18} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-800 leading-none">Weekly Progress</h2>
            <p className="text-xs text-slate-400 mt-1">Completion rates for each week in {activeMonth}</p>
          </div>
        </div>

        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeksData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="week" tickLine={false} stroke="#94a3b8" fontSize={11} tickMargin={8} />
              <YAxis
                domain={[0, 100]}
                tickLine={false}
                stroke="#94a3b8"
                fontSize={11}
                tickFormatter={(val) => `${val}%`}
              />
              <Tooltip content={<WeeklyBarTooltip />} cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="percentage" barSize={36} radius={[4, 4, 0, 0]}>
                {weeksData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend for Weeks with Day limits */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 items-center justify-center border-t border-slate-100 pt-3 mt-2 text-[10px] text-slate-500 font-semibold uppercase tracking-wide">
          {weeksData.map((w, i) => (
            <div key={i} className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: w.color }} />
              <span>{w.week} <span className="text-[9px] text-slate-400 lowercase">({w.days})</span></span>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT: Top 10 Habits ranked list */}
      <div id="top-habits-card" className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between max-h-[400px] lg:max-h-none overflow-hidden">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="bg-amber-50 p-2 rounded-lg text-amber-600">
                <Award size={18} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-800 leading-none font-sans">Top 10 Habits</h2>
                <p className="text-xs text-slate-400 mt-1">Best performers in {activeMonth}</p>
              </div>
            </div>
            <Sparkles size={16} className="text-amber-500 animate-pulse" />
          </div>

          <div className="overflow-y-auto max-h-[240px] pr-1 scrollbar-thin scrollbar-thumb-slate-200 custom-scrollbar space-y-2">
            {rankedHabits.map((habit, index) => (
              <div
                key={habit.id}
                className="flex items-center gap-3 p-2 bg-slate-50/50 hover:bg-slate-50 rounded-lg border border-slate-100/80 transition-colors"
              >
                {/* Seed Ranking Badge */}
                <span className={`w-5 h-5 flex items-center justify-center font-bold text-[10px] rounded-full shrink-0 ${
                  index === 0
                    ? 'bg-amber-100 text-amber-700 ring-2 ring-amber-300'
                    : index === 1
                    ? 'bg-slate-200 text-slate-700'
                    : index === 2
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-slate-100 text-slate-500'
                }`}>
                  #{index + 1}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold text-slate-700 truncate block">
                      {habit.name}
                    </span>
                    <span className="text-xs font-bold text-slate-800 shrink-0 font-mono ml-2">
                      {habit.percentage}%
                    </span>
                  </div>
                  {/* Subtle completion indicator bar */}
                  <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        habit.percentage >= 75
                          ? 'bg-emerald-500'
                          : habit.percentage >= 50
                          ? 'bg-blue-500'
                          : habit.percentage >= 30
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${habit.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-100 pt-3 mt-3 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> Strong (75%+)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-1.5 rounded-full bg-blue-500 inline-block" /> Solid (50-74%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-1.5 rounded-full bg-amber-500 inline-block" /> Dev (30-49%)
          </span>
        </div>
      </div>
    </div>
  );
};
