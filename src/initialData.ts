import { Habit, LIST_OF_MONTHS } from './types';

// Let's create a helper function to generate deterministic but realistic-looking checkmarks
// so the tracker looks full and alive on first render for all 6 months.
const createHistoryPatternForMonth = (
  month: string,
  baseProbability: number,
  alternateWeekends = false
): boolean[] => {
  const history: boolean[] = [];
  
  // Decide multiplier based on historical month phase
  let monthMultiplier = 1.0;
  if (month.startsWith('January')) {
    monthMultiplier = 1.15; // New Year resolutions peak!
  } else if (month.startsWith('February')) {
    monthMultiplier = 0.82; // Post-resolution dip
  } else if (month.startsWith('March')) {
    monthMultiplier = 0.90; // Stabilization
  } else if (month.startsWith('April')) {
    monthMultiplier = 0.96; // Intentional focus
  } else if (month.startsWith('May')) {
    monthMultiplier = 1.04; // Rising wave of discipline
  } else if (month.startsWith('June')) {
    monthMultiplier = 1.10; // Peak summer consistency
  }

  const pFinal = Math.max(0.15, Math.min(0.98, baseProbability * monthMultiplier));

  for (let day = 1; day <= 31; day++) {
    const isWeekend = day % 7 === 6 || day % 7 === 0;
    let p = pFinal;
    if (alternateWeekends && isWeekend) {
      p = pFinal > 0.5 ? 0.35 : 0.85; // alternate weekend orientation
    } else if (isWeekend) {
      p = Math.min(0.99, pFinal + 0.12); // active on weekends
    } else {
      p = Math.max(0.05, pFinal - 0.05); // slightly lower on weekdays
    }

    // High-quality deterministic random seed incorporating day & month string
    const stringHash = month.split('').reduce((acc, char, index) => acc + char.charCodeAt(0) * (index + 1), 0);
    const pseudoRandom = Math.sin(day * 1337 + p * 42 + stringHash) * 0.5 + 0.5;
    history.push(pseudoRandom < p);
  }
  return history;
};

// Generates the historyByMonth dictionary for all 6 months
const generateHistoryByMonth = (baseProbability: number, alternateWeekends = false): Record<string, boolean[]> => {
  const record: Record<string, boolean[]> = {};
  LIST_OF_MONTHS.forEach((m) => {
    record[m] = createHistoryPatternForMonth(m, baseProbability, alternateWeekends);
  });
  return record;
};

export const INITIAL_HABITS: Habit[] = [
  {
    id: 'habit-1',
    name: 'Deep Learning & Neural Networks Course',
    goal: 31,
    category: 'Learning',
    historyByMonth: generateHistoryByMonth(0.72, true)
  },
  {
    id: 'habit-2',
    name: 'Algorithm Practice & System Design',
    goal: 31,
    category: 'Engineering',
    historyByMonth: generateHistoryByMonth(0.65, true)
  },
  {
    id: 'habit-3',
    name: 'Gym Workout & Core Strength Training',
    goal: 31,
    category: 'Fitness',
    historyByMonth: {
      'January 2026': [
        true, true, false, true, true, false, false, // W1
        true, true, false, true, true, false, false, // W2
        true, true, false, true, true, false, false, // W3
        true, true, false, true, true, false, false, // W4
        true, true, false
      ],
      'February 2026': [
        false, true, false, true, false, false, false,
        true, false, false, true, false, false, false,
        true, false, true, false, false, true, false,
        true, false, false, true, false, false, true,
        false, false, false
      ],
      'March 2026': [
        true, false, true, false, true, false, false,
        true, false, true, false, true, false, false,
        true, false, true, false, true, false, true,
        false, true, false, true, false, true, false,
        true, false, true
      ],
      'April 2026': generateHistoryByMonth(0.60, false)['April 2026'],
      'May 2026': generateHistoryByMonth(0.64, false)['May 2026'],
      'June 2026': generateHistoryByMonth(0.70, false)['June 2026']
    }
  },
  {
    id: 'habit-4',
    name: 'Drink 3 Liters of Water',
    goal: 31,
    category: 'Health',
    historyByMonth: generateHistoryByMonth(0.85)
  },
  {
    id: 'habit-5',
    name: '8 Hours Quality Sleep (No Screen after 10 PM)',
    goal: 31,
    category: 'Wellbeing',
    historyByMonth: generateHistoryByMonth(0.60)
  },
  {
    id: 'habit-6',
    name: 'Read 20 Pages of Tech Book',
    goal: 31,
    category: 'Learning',
    historyByMonth: generateHistoryByMonth(0.54)
  },
  {
    id: 'habit-7',
    name: 'Mindfulness & Deep Breathing Session (15m)',
    goal: 31,
    category: 'Mind',
    historyByMonth: generateHistoryByMonth(0.48, true)
  },
  {
    id: 'habit-8',
    name: 'Code Commits & Side Project Builds',
    goal: 31,
    category: 'Engineering',
    historyByMonth: generateHistoryByMonth(0.62)
  },
  {
    id: 'habit-9',
    name: 'Prepare Healthy Meals (Low Carb)',
    goal: 31,
    category: 'Health',
    historyByMonth: generateHistoryByMonth(0.68)
  },
  {
    id: 'habit-10',
    name: 'Daily Journaling & Self-Reflections',
    goal: 31,
    category: 'Wellbeing',
    historyByMonth: generateHistoryByMonth(0.46)
  },
  {
    id: 'habit-11',
    name: 'Walk 10,000 Steps',
    goal: 31,
    category: 'Fitness',
    historyByMonth: generateHistoryByMonth(0.66)
  },
  {
    id: 'habit-12',
    name: 'Joint Mobility & Full-Body Stretch Routine',
    goal: 31,
    category: 'Fitness',
    historyByMonth: generateHistoryByMonth(0.56)
  }
];

export const CATEGORY_COLORS: Record<string, string> = {
  Learning: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  Engineering: 'bg-purple-100 text-purple-700 border-purple-200',
  Fitness: 'bg-rose-100 text-rose-700 border-rose-200',
  Health: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Wellbeing: 'bg-blue-100 text-blue-700 border-blue-200',
  Mind: 'bg-amber-100 text-amber-700 border-amber-200',
};
