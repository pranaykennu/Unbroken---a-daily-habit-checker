import React from 'react';
import { Habit } from '../types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { LineChart as LineIcon, CheckCircle2, Circle } from 'lucide-react';

interface TopDashboardProps {
  habits: Habit[];
  activeMonth: string;
  daysInMonth: number;
  themeAccent?: string;
}

export const TopDashboard: React.FC<TopDashboardProps> = ({ habits, activeMonth, daysInMonth, themeAccent = '#4f46e5' }) => {
  const totalHabits = habits.length;

  // 1. Calculate Daily Trend Progress (dynamic daysInMonth) for this selected Month
  const lineChartData = Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    const completedCount = habits.reduce((sum, habit) => {
      const hData = habit.historyByMonth[activeMonth] || Array(daysInMonth).fill(false);
      return sum + (hData[index] ? 1 : 0);
    }, 0);
    const percentage = totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 0;
    return {
      day,
      displayDay: `Day ${day}`,
      completed: completedCount,
      total: totalHabits,
      percentage,
    };
  });

  // 2. Calculate Doughnut Ring Data
  const totalSlots = totalHabits * daysInMonth;
  const completedSlots = habits.reduce((sum, habit) => {
    const hData = habit.historyByMonth[activeMonth] || Array(daysInMonth).fill(false);
    // Be careful to only count up to daysInMonth elements
    let count = 0;
    for (let i = 0; i < daysInMonth; i++) {
      if (hData[i]) count++;
    }
    return sum + count;
  }, 0);
  const leftSlots = totalSlots - completedSlots;
  const overallPercentage = totalSlots > 0 ? Math.round((completedSlots / totalSlots) * 100) : 0;

  const ringData = [
    { name: 'Completed', value: completedSlots, color: themeAccent },
    { name: 'Remaining', value: leftSlots, color: '#f1f5f9' }, // Light Slate
  ];

  // Custom tooltips for elegant visualization
  const CustomLineTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-slate-200 shadow-md rounded-lg text-xs leading-relaxed">
          <p className="font-bold text-slate-700">{data.displayDay} ({activeMonth})</p>
          <div className="flex items-center gap-1.5 mt-1 text-indigo-600 font-semibold text-sm">
            <span>{data.percentage}% Completed</span>
          </div>
          <p className="text-slate-400 mt-0.5 font-mono">
            Checked: {data.completed} / {data.total} habits
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 bg-zinc-50/20">
      {/* Line Chart Component (Top Left & Center) */}
      <div id="trend-chart-card" className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col h-[340px]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
              <LineIcon size={18} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800 leading-none">
                Daily Completion Trend for <span className="text-indigo-600">{activeMonth}</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">Completion trajectory of all habits across {daysInMonth} days</p>
            </div>
          </div>
          <div className="flex gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-slate-500 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
              Completion Rate %
            </div>
          </div>
        </div>

        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineChartData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="day"
                tickLine={false}
                stroke="#94a3b8"
                fontSize={11}
                tickMargin={8}
                tickFormatter={(val) => `D${val}`}
              />
              <YAxis
                domain={[0, 100]}
                tickLine={false}
                stroke="#94a3b8"
                fontSize={11}
                tickFormatter={(val) => `${val}%`}
              />
              <Tooltip content={<CustomLineTooltip />} />
              <Line
                name="Completion %"
                type="monotone"
                dataKey="percentage"
                stroke={themeAccent}
                strokeWidth={2.5}
                dot={{ r: 3, stroke: themeAccent, strokeWidth: 1.5, fill: '#fff' }}
                activeDot={{ r: 5, stroke: themeAccent, strokeWidth: 2, fill: themeAccent }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Completion Ring / Doughnut Chart (Top Right) */}
      <div id="completion-ring-card" className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col h-[340px]">
        <div className="mb-2">
          <h2 className="text-base font-semibold text-slate-800 leading-none">Monthly Target Ring</h2>
          <p className="text-xs text-slate-400 mt-1">Ratio to complete target in {activeMonth}</p>
        </div>

        <div className="flex-1 relative flex items-center justify-center min-h-0">
          {/* Centered Percentage Overlay */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-4xl font-extrabold text-slate-800 tracking-tight">{overallPercentage}%</span>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">COMPLETED</span>
          </div>

          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={ringData}
                cx="50%"
                cy="50%"
                innerRadius={78}
                outerRadius={98}
                paddingAngle={3}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
              >
                {ringData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke={index === 0 ? "#4338ca" : "#e2e8f0"} strokeWidth={0.5} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Dynamic Legend at the bottom of Doughnut */}
        <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-xs font-medium text-slate-600">
          <div className="flex items-center gap-2 justify-center">
            <CheckCircle2 size={14} className="text-indigo-500" />
            <div className="flex flex-col">
              <span className="text-slate-400 text-[10px] leading-tight uppercase">Completed</span>
              <span className="text-slate-700 font-bold leading-normal">{completedSlots.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 justify-center border-l border-slate-100">
            <Circle size={14} className="text-slate-300 fill-slate-50" />
            <div className="flex flex-col">
              <span className="text-slate-400 text-[10px] leading-tight uppercase">Remaining</span>
              <span className="text-slate-700 font-bold leading-normal">{leftSlots.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
