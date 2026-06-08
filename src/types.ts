export interface Habit {
  id: string;
  name: string;
  goal: number; // 31 days per month
  historyByMonth: Record<string, boolean[]>; // e.g., { "January 2026": boolean[], "February 2026": boolean[] }
  category?: string; // e.g., Learning, Engineering, Fitness, Health, Wellbeing, Mind
}

export interface Profile {
  id: string;
  name: string;
  habits: Habit[];
}

export interface Settings {
  theme: string;
  soundEnabled: boolean;
}

export interface DayProgress {
  day: number;
  completed: number;
  total: number;
  percentage: number;
}

export interface WeekStats {
  week: string; // e.g. "Week 1"
  percentage: number;
  completed: number;
  left: number;
  total: number;
  color: string; // Pastel HEX
  days: string; // e.g. "1 - 7"
}

export interface GlobalSummary {
  completionRate: number;
  completedCount: number;
  goalCount: number;
  leftCount: number;
}

export interface MonthlyOverviewData {
  month: string;
  completed: number;
  total: number;
  percentage: number;
}

export interface ProjectedData {
  month: string;
  percentage: number;
  isProjected: boolean;
}

export const LIST_OF_MONTHS = [
  'January 2026',
  'February 2026',
  'March 2026',
  'April 2026',
  'May 2026',
  'June 2026'
];
