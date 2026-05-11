import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Leaf, LogOut, Plus, Calendar, BarChart3, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useHabits } from '@/context/HabitContext';
import { GrowthPlant } from '@/components/GrowthPlant';
import { StreakDisplay } from '@/components/StreakDisplay';
import { WeeklyProgress } from '@/components/WeeklyProgress';
import { HabitCard } from '@/components/HabitCard';
import { GoalCard, AddGoalCard } from '@/components/GoalCard';
import { CreateGoalModal } from '@/components/CreateGoalModal';

type View = 'today' | 'goals' | 'progress';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { goals, todayHabits, streakInfo, weeklyProgress } = useHabits();
  const [currentView, setCurrentView] = useState<View>('today');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const today = new Date().toISOString().split('T')[0];
  const completedToday = todayHabits.filter(h =>
    h.habit.completedDates.includes(today)
  ).length;
  const totalToday = todayHabits.length;
  const progress = totalToday > 0 ? (completedToday / totalToday) * 100 : 0;

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const motivationalMessage = useMemo(() => {
    if (totalToday === 0) return "Add your first goal to get started!";
    if (completedToday === totalToday) return "All done today! You're amazing! 🌟";
    if (completedToday > 0) return `${totalToday - completedToday} habits left for today`;
    return "Ready to tackle your habits?";
  }, [completedToday, totalToday]);

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10">
              <Leaf className="w-5 h-5 text-primary" />
            </div>
            <span className="text-lg font-semibold text-foreground">Bloom</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user?.email?.split("@")[0]}
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 pb-24">
        {/* Welcome section */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold text-foreground mb-1">
            {greeting}!
          </h1>
          <p className="text-muted-foreground">{motivationalMessage}</p>
        </motion.div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            className="p-4 rounded-2xl bg-card border border-border"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <GrowthPlant streak={streakInfo.current} />
          </motion.div>

          <motion.div
            className="col-span-1 lg:col-span-2 space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <StreakDisplay streakInfo={streakInfo} />

            {/* Today's progress */}
            <div className="p-4 rounded-xl bg-card border border-border">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-muted-foreground">Today's Progress</span>
                <span className="text-sm font-semibold text-foreground">
                  {completedToday}/{totalToday}
                </span>
              </div>
              <div className="h-3 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="hidden lg:block"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <WeeklyProgress data={weeklyProgress} className="h-full" />
          </motion.div>
        </div>

        {/* View tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'today' as View, label: 'Today', icon: Calendar },
            { id: 'goals' as View, label: 'Goals', icon: Target },
            { id: 'progress' as View, label: 'Progress', icon: BarChart3 },
          ].map(tab => (
            <Button
              key={tab.id}
              variant={currentView === tab.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentView(tab.id)}
              className="gap-2"
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Content based on view */}
        <AnimatePresence mode="wait">
          {currentView === 'today' && (
            <motion.div
              key="today"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-3"
            >
              {todayHabits.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">No habits yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create a goal and add habits to get started
                  </p>
                  <Button onClick={() => setIsCreateModalOpen(true)}>
                    Create your first goal
                  </Button>
                </div>
              ) : (
                todayHabits.map(({ goal, subGoal, habit }) => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    subGoal={subGoal}
                    goal={goal}
                  />
                ))
              )}
            </motion.div>
          )}

          {currentView === 'goals' && (
            <motion.div
              key="goals"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {goals.map(goal => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onClick={() => {/* TODO: Open goal detail */ }}
                />
              ))}
              <AddGoalCard onClick={() => setIsCreateModalOpen(true)} />
            </motion.div>
          )}

          {currentView === 'progress' && (
            <motion.div
              key="progress"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <WeeklyProgress data={weeklyProgress} />

              <div className="p-6 rounded-2xl bg-card border border-border">
                <h3 className="font-semibold text-foreground mb-4">Your Journey</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-3xl font-bold text-foreground">{goals.length}</p>
                    <p className="text-xs text-muted-foreground">Goals</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-foreground">{todayHabits.length}</p>
                    <p className="text-xs text-muted-foreground">Habits</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-foreground">{streakInfo.totalCompletions}</p>
                    <p className="text-xs text-muted-foreground">Completions</p>
                  </div>
                </div>
              </div>

              {goals.length > 0 && goals[0].whyItMatters && (
                <motion.div
                  className="p-6 rounded-2xl bg-primary/5 border border-primary/20"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="text-sm text-muted-foreground mb-2">Remember why you started:</p>
                  <p className="text-foreground font-medium italic">"{goals[0].whyItMatters}"</p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating action button */}
      <motion.button
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsCreateModalOpen(true)}
      >
        <Plus className="w-6 h-6" />
      </motion.button>

      <CreateGoalModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
