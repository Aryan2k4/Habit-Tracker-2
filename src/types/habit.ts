export interface Habit {
  id: string;
  name: string;
  description?: string;
  completedDates: string[];
  createdAt: string;
  reminderEnabled: boolean;
}

export interface SubGoal {
  id: string;
  name: string;
  description?: string;
  habits: Habit[];
  progress: number;
}

export interface Goal {
  id: string;
  name: string;
  description?: string;
  whyItMatters?: string;
  subGoals: SubGoal[];
  createdAt: string;
  color: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface StreakInfo {
  current: number;
  best: number;
  totalCompletions: number;
}
