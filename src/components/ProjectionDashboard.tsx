import React from 'react';
import { Habit, LIST_OF_MONTHS } from '../types';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  ReferenceLine
} from 'recharts';
import {
  TrendingUp,
  Sparkles,
  Zap,
  Info,
  Flame,
  Compass,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface ProjectionDashboardProps {
  habits: Habit[];
  themeAccent?: string;
}

const MONTH_NAMES_MAP = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const getDaysForMonthString = (monthStr: string): number => {
  const parts = monthStr.split(' ');
  const mName = parts[0];
  const yVal = parseInt(parts[1]) || 2026;
  const mIdx = MONTH_NAMES_MAP.indexOf(mName);
  if (mIdx === -1) return 31;
  return new Date(yVal, mIdx + 1, 0).getDate();
};

export const ProjectionDashboard: React.FC<ProjectionDashboardProps> = ({ habits, themeAccent = '#4f46e5' }) => {
  const totalHabits = habits.length;

  if (totalHabits === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-8 text-center text-slate-400">
        <Info className="mx-auto mb-2 text-slate-300" size={32} />
        <p>Add some habits above to generate predictive performance forecasts.</p>
      </div>
    );
  }

  // 1. Compute Historical completion rate for each month using exact calendar days
  const historicalData = LIST_OF_MONTHS.map((month, idx) => {
    let completedCount = 0;
    const monthDaysCount = getDaysForMonthString(month);
    const totalPossible = totalHabits * monthDaysCount;

    habits.forEach((habit) => {
      const history = habit.historyByMonth[month] || [];
      // Count completed up to monthDaysCount to avoid overflows
      let count = 0;
      for (let i = 0; i < monthDaysCount; i++) {
        if (history[i]) count++;
      }
      completedCount += count;
    });

    const percentage = totalPossible > 0 ? parseFloat(((completedCount / totalPossible) * 100).toFixed(1)) : 0;

    return {
      index: idx + 1, // 1 to 6
      month,
      shortName: month.split(' ')[0], // "January"
      percentage,
      isProjected: false,
    };
  });

  // 2. Perform Simple Linear Regression on the 6 months data points
  const n = historicalData.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  historicalData.forEach((d) => {
    sumX += d.index;
    sumY += d.percentage;
    sumXY += d.index * d.percentage;
    sumXX += d.index * d.index;
  });

  const meanX = sumX / n;
  const meanY = sumY / n;

  // Slope (m)
  const numm = sumXY - n * meanX * meanY;
  const denm = sumXX - n * meanX * meanX;
  const slope = denm !== 0 ? numm / denm : 0;

  // Intercept (c)
  const intercept = meanY - slope * meanX;

  // Calculate Projected Data for July 2026, August 2026, and September 2026 (Indices 7, 8, 9)
  const futureMonths = [
    { index: 7, month: 'July 2026', shortName: 'July' },
    { index: 8, month: 'August 2026', shortName: 'Aug' },
    { index: 9, month: 'September 2026', shortName: 'Sept' },
  ];

  const projectedData = futureMonths.map((m) => {
    let rawPercent = slope * m.index + intercept;
    // Keep between realistic bounds of 20% to 98%
    const percentage = parseFloat(Math.max(20, Math.min(98, rawPercent)).toFixed(1));
    return {
      index: m.index,
      month: m.month,
      shortName: m.shortName,
      percentage,
      isProjected: true,
    };
  });

  // Combine both for unified chart plotting
  const combinedChartData = [...historicalData, ...projectedData];

  // 3. Category Stats Analysis (Lifestyle understanding helper)
  const categoriesList = ['Learning', 'Engineering', 'Fitness', 'Health', 'Wellbeing', 'Mind'];
  const categoryTrends = categoriesList.map((cat) => {
    let q1Sum = 0;
    let q1Slots = 0;
    let q2Sum = 0;
    let q2Slots = 0;

    const catHabits = habits.filter((h) => h.category === cat);
    if (catHabits.length === 0) return null;

    catHabits.forEach((habit) => {
      // Q1: January 2026 (31 days) & February 2026 (28 days)
      const janDays = getDaysForMonthString('January 2026');
      const febDays = getDaysForMonthString('February 2026');
      
      const janHistory = habit.historyByMonth['January 2026'] || [];
      const febHistory = habit.historyByMonth['February 2026'] || [];

      for (let i = 0; i < janDays; i++) {
        if (janHistory[i]) q1Sum++;
      }
      for (let i = 0; i < febDays; i++) {
        if (febHistory[i]) q1Sum++;
      }
      q1Slots += (janDays + febDays);

      // Q2: May 2026 (31 days) & June 2026 (30 days)
      const mayDays = getDaysForMonthString('May 2026');
      const junDays = getDaysForMonthString('June 2026');

      const mayHistory = habit.historyByMonth['May 2026'] || [];
      const junHistory = habit.historyByMonth['June 2026'] || [];

      for (let i = 0; i < mayDays; i++) {
        if (mayHistory[i]) q2Sum++;
      }
      for (let i = 0; i < junDays; i++) {
        if (junHistory[i]) q2Sum++;
      }
      q2Slots += (mayDays + junDays);
    });

    const q1Rate = q1Slots > 0 ? (q1Sum / q1Slots) * 105 : 0; // scaled matching Q2 ratios
    const q2Rate = q2Slots > 0 ? (q2Sum / q2Slots) * 105 : 0;
    const rateDiff = parseFloat((q2Rate - q1Rate).toFixed(1));

    return {
      category: cat,
      q1Rate: parseFloat(Math.min(98, q1Rate).toFixed(0)),
      q2Rate: parseFloat(Math.min(98, q2Rate).toFixed(0)),
      diff: rateDiff,
    };
  }).filter((x): x is { category: string; q1Rate: number; q2Rate: number; diff: number } => x !== null);

  // Overall trajectory streak assessment
  const junePerformance = historicalData[5]?.percentage || 0;
  const standardProjectedJuly = projectedData[0]?.percentage || 0;
  const slopeMagnitude = Math.abs(parseFloat((slope * 10).toFixed(1)));

  // Custom tooltips
  const UnifiedTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3.5 border border-slate-200 shadow-lg rounded-xl text-xs leading-relaxed max-w-[200px]">
          <p className="font-extrabold text-slate-800">{data.month}</p>
          <div className="flex items-center gap-1.5 mt-1 font-mono text-sm font-bold">
            {data.isProjected ? (
              <span className="text-violet-650">★ Predicted: {data.percentage}%</span>
            ) : (
              <span className="text-indigo-600">✓ Logged: {data.percentage}%</span>
            )}
          </div>
          <p className="text-[10px] text-slate-400 mt-1 font-sans leading-normal">
            {data.isProjected
              ? 'Computed using continuous regression trend lines.'
              : 'Actual verified completion data.'}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div id="projections-analysis-section" className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm mb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-indigo-50">
        <div>
          <div className="flex items-center gap-2">
            <div className="bg-violet-50 p-2 rounded-lg text-violet-600">
              <TrendingUp size={18} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800 leading-none">
                Predictive Projections & 6-Month Track Record
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Linear regression and trend metrics based on past 6 months of historical habit performance
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Trajectory Badge */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-2.5 shrink-0 select-none">
          {slope >= 0 ? (
            <span className="flex items-center text-indigo-700 text-xs font-semibold gap-1">
              <ArrowUpRight size={16} className="text-indigo-600 shrink-0" />
              Upward Trend (+{slopeMagnitude}%/mo)
            </span>
          ) : (
            <span className="flex items-center text-amber-700 text-xs font-semibold gap-1">
              <ArrowDownRight size={16} className="text-amber-500 shrink-0" />
              Slight Dip ({slopeMagnitude}%/mo)
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Layout Card spanning 2 cols */}
        <div className="lg:col-span-2 bg-slate-50/50 rounded-xl border border-slate-200/60 p-4 flex flex-col h-[300px]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
              Logged performance & Future Outlook (July-Sept)
            </span>
            <div className="flex items-center gap-3 text-[10px] font-bold uppercase text-slate-500 tracking-wider">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-indigo-600 rounded-sm inline-block" /> Historical Logs
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-violet-400 rounded-sm inline-block opacity-60" /> Forecast Projections
              </span>
            </div>
          </div>

          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={combinedChartData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="shortName"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  tickMargin={8}
                />
                <YAxis
                  domain={[0, 100]}
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip content={<UnifiedTooltip />} cursor={{ fill: 'rgba(79, 70, 229, 0.03)' }} />
                
                {/* Visual guideline splitting historical and project phase */}
                <ReferenceLine x="July" stroke="#8b5cf6" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: "Projection Horizon", position: "top", fill: "#8b5cf6", fontSize: 9, fontWeight: "bold" }} />

                <Bar dataKey="percentage" barSize={34} radius={[4, 4, 0, 0]}>
                  {combinedChartData.map((entry, index) => {
                    const isFut = entry.isProjected;
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={isFut ? '#c084fc' : themeAccent}
                        fillOpacity={isFut ? 0.65 : 1}
                        stroke={isFut ? '#8b5cf6' : themeAccent}
                        strokeWidth={isFut ? 1.5 : 0}
                        strokeDasharray={isFut ? '4 2' : '0'}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lifestyle Diagnostics Panel (Right side) */}
        <div className="flex flex-col gap-4">
          <div className="bg-gradient-to-br from-violet-50/60 to-indigo-50/20 border border-violet-100 rounded-xl p-4 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-violet-600 animate-pulse shrink-0" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest leading-none">
                  Predictive Analysis Summary
                </h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                By evaluating continuous logs, we forecast your overall wellness consistency index will land around{' '}
                <strong className="text-violet-700 text-sm font-extrabold">{standardProjectedJuly}%</strong> in{' '}
                <span className="font-semibold text-slate-600">July 2026</span>.
              </p>

              <div className="mt-3.5 space-y-2 text-xs">
                <div className="flex items-start gap-2 bg-white/70 border border-violet-100/50 p-2 rounded-lg">
                  <Flame size={14} className="text-orange-500 shrink-0 mt-0.5" />
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    <strong>Consistency Peak</strong>: Your January New Year Resolution average was{' '}
                    <span className="font-bold text-slate-800">
                      {historicalData[0]?.percentage}%
                    </span>
                    . You recovered nicely in June to {junePerformance}%.
                  </p>
                </div>

                <div className="flex items-start gap-2 bg-white/70 border border-violet-100/50 p-2 rounded-lg">
                  <Compass size={14} className="text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    <strong>Lifestyle Tip</strong>: {slope >= 0 ? (
                      'Your performance is consistently scaling up! Make sure to keep structural routines in place to prevent burnouts.'
                    ) : (
                      'You experienced a dip in mid-spring. Adding morning triggers or calendar blocking will help counteract this trajectory.'
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 border-t border-violet-100 pt-3 mt-3 text-[10px] text-slate-400 leading-normal">
              <Zap size={11} className="text-violet-500 shrink-0" />
              <span>Calculated over dynamic log weights using Least Squares Linear Regression.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Lifestyle category comparison metrics */}
      {categoryTrends.length > 0 && (
        <div className="mt-5 pt-5 border-t border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">
            Active Lifestyle Category Transitions (Q1 Jan-Feb vs Q2 May-Jun Consistency Comparison)
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {categoryTrends.map((catTrend) => {
              if (!catTrend) return null;
              const isGrowth = catTrend.diff >= 0;
              return (
                <div key={catTrend.category} className="bg-slate-50 border border-slate-205 p-2.5 rounded-lg text-center flex flex-col justify-between">
                  <span className="text-xs font-extrabold text-slate-700 block truncate">{catTrend.category}</span>
                  <div className="flex justify-center items-baseline gap-1 mt-1">
                    <span className="text-slate-400 text-[10px]">Q1</span>
                    <span className="text-xs font-semibold text-slate-500">{catTrend.q1Rate}%</span>
                    <span className="text-slate-400 text-[10px] ml-1">→ Q2</span>
                    <span className="text-xs font-extrabold text-slate-800">{catTrend.q2Rate}%</span>
                  </div>

                  <span className={`text-[10px] font-bold mt-1.5 inline-block mx-auto px-1.5 py-0.5 rounded ${
                    isGrowth ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {isGrowth ? '▲ Up ' : '▼ Down '} {Math.abs(catTrend.diff)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
