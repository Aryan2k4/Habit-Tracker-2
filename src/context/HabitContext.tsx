import React, { createContext, useContext, useMemo } from 'react';
import { Goal, Habit, SubGoal, StreakInfo } from '@/types/habit';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useAuth } from './AuthContext';

interface HabitContextType {
  goals: Goal[];
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'subGoals'>) => Goal;
  updateGoal: (goalId: string, updates: Partial<Goal>) => void;
  deleteGoal: (goalId: string) => void;
  addSubGoal: (goalId: string, subGoal: Omit<SubGoal, 'id' | 'habits' | 'progress'>) => void;
  updateSubGoal: (goalId: string, subGoalId: string, updates: Partial<SubGoal>) => void;
  deleteSubGoal: (goalId: string, subGoalId: string) => void;
  addHabit: (goalId: string, subGoalId: string, habit: Omit<Habit, 'id' | 'completedDates' | 'createdAt'>) => void;
  updateHabit: (goalId: string, subGoalId: string, habitId: string, updates: Partial<Habit>) => void;
  deleteHabit: (goalId: string, subGoalId: string, habitId: string) => void;
  toggleHabitCompletion: (goalId: string, subGoalId: string, habitId: string, date: string) => void;
  streakInfo: StreakInfo;
  todayHabits: { goal: Goal; subGoal: SubGoal; habit: Habit }[];
  weeklyProgress: { day: string; completed: number; total: number }[];
}

const HabitContext = createContext<HabitContextType | undefined>(undefined);

const GOAL_COLORS = [
  'hsl(150, 30%, 45%)', // Sage green
  'hsl(200, 60%, 50%)', // Ocean blue
  'hsl(280, 50%, 55%)', // Lavender
  'hsl(15, 70%, 55%)',  // Coral
  'hsl(45, 80%, 50%)',  // Golden
];

export function HabitProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const storageKey = user ? `bloom-goals-${user.id}` : 'bloom-goals-guest';
  const [goals, setGoals] = useLocalStorage<Goal[]>(storageKey, []);

  const addGoal = (goalData: Omit<Goal, 'id' | 'createdAt' | 'subGoals'>) => {
  const newGoal: Goal = {
    ...goalData,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    subGoals: [],
    color: goalData.color || GOAL_COLORS[goals.length % GOAL_COLORS.length],
  };

  setGoals(prevGoals => [...prevGoals, newGoal]);

  return newGoal;
};
  const updateGoal = (goalId: string, updates: Partial<Goal>) => {
    setGoals(goals.map(g => g.id === goalId ? { ...g, ...updates } : g));
  };

  const deleteGoal = (goalId: string) => {
    setGoals(goals.filter(g => g.id !== goalId));
  };

  const addSubGoal = (goalId: string, subGoalData: Partial<SubGoal>) => {
  const newSubGoal: SubGoal = {
  ...(subGoalData as SubGoal),
  id: subGoalData.id || crypto.randomUUID(),
  habits: subGoalData.habits || [],
  progress: 0,
};

  setGoals(prevGoals =>
    prevGoals.map(g =>
      g.id === goalId
        ? {
            ...g,
            subGoals: [...g.subGoals, newSubGoal],
          }
        : g
    )
  );
};
  const updateSubGoal = (goalId: string, subGoalId: string, updates: Partial<SubGoal>) => {
    setGoals(goals.map(g => 
      g.id === goalId 
        ? { 
            ...g, 
            subGoals: g.subGoals.map(sg => 
              sg.id === subGoalId ? { ...sg, ...updates } : sg
            ) 
          }
        : g
    ));
  };

  const deleteSubGoal = (goalId: string, subGoalId: string) => {
    setGoals(goals.map(g => 
      g.id === goalId 
        ? { ...g, subGoals: g.subGoals.filter(sg => sg.id !== subGoalId) }
        : g
    ));
  };

  const addHabit = (
  goalId: string,
  subGoalId: string,
  habitData: Omit<Habit, 'id' | 'completedDates' | 'createdAt'>
) => {
  const newHabit: Habit = {
    ...habitData,
    id: crypto.randomUUID(),
    completedDates: [],
    createdAt: new Date().toISOString(),
  };

  setGoals(prevGoals =>
    prevGoals.map(goal =>
      goal.id === goalId
        ? {
            ...goal,
            subGoals: goal.subGoals.map(subGoal =>
              subGoal.id === subGoalId
                ? {
                    ...subGoal,
                    habits: [...subGoal.habits, newHabit],
                  }
                : subGoal
            ),
          }
        : goal
    )
  );
};

  const updateHabit = (
  goalId: string,
  subGoalId: string,
  habitId: string,
  updates: Partial<Habit>
) => {
  setGoals(prevGoals =>
    prevGoals.map(g =>
      g.id === goalId
        ? {
            ...g,
            subGoals: g.subGoals.map(sg =>
              sg.id === subGoalId
                ? {
                    ...sg,
                    habits: sg.habits.map(h =>
                      h.id === habitId
                        ? { ...h, ...updates }
                        : h
                    ),
                  }
                : sg
            ),
          }
        : g
    )
  );
};

  const deleteHabit = (goalId: string, subGoalId: string, habitId: string) => {
    setGoals(goals.map(g => 
      g.id === goalId 
        ? { 
            ...g, 
            subGoals: g.subGoals.map(sg => 
              sg.id === subGoalId 
                ? { ...sg, habits: sg.habits.filter(h => h.id !== habitId) }
                : sg
            ) 
          }
        : g
    ));
  };

  const toggleHabitCompletion = (goalId: string, subGoalId: string, habitId: string, date: string) => {
    setGoals(goals.map(g => 
      g.id === goalId 
        ? { 
            ...g, 
            subGoals: g.subGoals.map(sg => 
              sg.id === subGoalId 
                ? { 
                    ...sg, 
                    habits: sg.habits.map(h => {
                      if (h.id !== habitId) return h;
                      const hasDate = h.completedDates.includes(date);
                      return {
                        ...h,
                        completedDates: hasDate 
                          ? h.completedDates.filter(d => d !== date)
                          : [...h.completedDates, date]
                      };
                    }) 
                  }
                : sg
            ) 
          }
        : g
    ));
  };

  const todayHabits = useMemo(() => {
    const result: { goal: Goal; subGoal: SubGoal; habit: Habit }[] = [];
    goals.forEach(goal => {
      goal.subGoals.forEach(subGoal => {
        subGoal.habits.forEach(habit => {
          result.push({ goal, subGoal, habit });
        });
      });
    });
    return result;
  }, [goals]);

  const streakInfo = useMemo((): StreakInfo => {
    const allDates: string[] = [];
    goals.forEach(g => 
      g.subGoals.forEach(sg => 
        sg.habits.forEach(h => 
          allDates.push(...h.completedDates)
        )
      )
    );

    const uniqueDates = [...new Set(allDates)].sort().reverse();
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    let current = 0;
    let checking = uniqueDates.includes(today) ? today : yesterday;
    
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
      if (uniqueDates.includes(checkDate)) {
        current++;
      } else if (i > 0) {
        break;
      }
    }

    return {
      current,
      best: current, // Placeholder for best streak calculation
      totalCompletions: allDates.length,
    };
  }, [goals]);

  const weeklyProgress = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 86400000);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = days[date.getDay()];
      
      let completed = 0;
      let total = 0;
      
      goals.forEach(g => 
        g.subGoals.forEach(sg => 
          sg.habits.forEach(h => {
            total++;
            if (h.completedDates.includes(dateStr)) completed++;
          })
        )
      );
      
      result.push({ day: dayName, completed, total });
    }
    
    return result;
  }, [goals]);

  return (
    <HabitContext.Provider value={{
      goals,
      addGoal,
      updateGoal,
      deleteGoal,
      addSubGoal,
      updateSubGoal,
      deleteSubGoal,
      addHabit,
      updateHabit,
      deleteHabit,
      toggleHabitCompletion,
      streakInfo,
      todayHabits,
      weeklyProgress,
    }}>
      {children}
    </HabitContext.Provider>
  );
}

export function useHabits() {
  const context = useContext(HabitContext);
  if (context === undefined) {
    throw new Error('useHabits must be used within a HabitProvider');
  }
  return context;
}
