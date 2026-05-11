import { motion } from 'framer-motion';
import { Flame, Trophy } from 'lucide-react';
import { StreakInfo } from '@/types/habit';

interface StreakDisplayProps {
  streakInfo: StreakInfo;
  className?: string;
}

export function StreakDisplay({ streakInfo, className = '' }: StreakDisplayProps) {
  return (
    <div className={`flex gap-4 ${className}`}>
      <motion.div
        className="flex-1 p-4 rounded-xl bg-gradient-to-br from-streak-gold/20 to-streak-glow/10 border border-streak-gold/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-streak-gold/20">
            <Flame className="w-5 h-5 text-streak-gold" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{streakInfo.current}</p>
            <p className="text-xs text-muted-foreground">Current streak</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="flex-1 p-4 rounded-xl bg-card border border-border"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Trophy className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{streakInfo.best}</p>
            <p className="text-xs text-muted-foreground">Best streak</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
