import { motion } from 'framer-motion';

interface DayProgress {
  day: string;
  completed: number;
  total: number;
}

interface WeeklyProgressProps {
  data: DayProgress[];
  className?: string;
}

export function WeeklyProgress({ data, className = '' }: WeeklyProgressProps) {
  const today = new Date().getDay();
  const dayIndex = data.length - 1; // Today is the last item

  const getMessage = () => {
    const completedDays = data.filter(d => d.total > 0 && d.completed === d.total).length;
    const activeDays = data.filter(d => d.completed > 0).length;

    if (completedDays >= 5) return "Amazing week! You're crushing it! 🌟";
    if (completedDays >= 3) return `You were consistent ${completedDays}/7 days this week`;
    if (activeDays > 0) return "Every step counts. Keep going! 💪";
    return "Start today and build momentum!";
  };

  return (
    <motion.div
      className={`p-5 rounded-2xl bg-card border border-border ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3 className="text-sm font-medium text-muted-foreground mb-4">This Week</h3>
      
      <div className="flex justify-between gap-2 mb-4">
        {data.map((day, index) => {
          const percentage = day.total > 0 ? (day.completed / day.total) * 100 : 0;
          const isToday = index === dayIndex;
          
          return (
            <div key={day.day} className="flex flex-col items-center gap-2 flex-1">
              <div className="relative w-full h-24 bg-secondary rounded-lg overflow-hidden">
                <motion.div
                  className={`absolute bottom-0 w-full rounded-lg ${
                    isToday ? 'bg-primary' : 'bg-primary/60'
                  }`}
                  initial={{ height: 0 }}
                  animate={{ height: `${percentage}%` }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                />
              </div>
              <span className={`text-xs font-medium ${
                isToday ? 'text-primary' : 'text-muted-foreground'
              }`}>
                {day.day}
              </span>
            </div>
          );
        })}
      </div>

      <motion.p
        className="text-sm text-center text-foreground font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {getMessage()}
      </motion.p>
    </motion.div>
  );
}
