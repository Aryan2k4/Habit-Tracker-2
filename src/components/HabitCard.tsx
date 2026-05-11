import { motion } from 'framer-motion';
import { Check, Bell, BellOff, Trash2, Pencil } from 'lucide-react';
import { Habit, SubGoal, Goal } from '@/types/habit';
import { useHabits } from '@/context/HabitContext';
import { useState } from 'react';

interface HabitCardProps {
  habit: Habit;
  subGoal: SubGoal;
  goal: Goal;
  showContext?: boolean;
}

export function HabitCard({ habit, subGoal, goal, showContext = true }: HabitCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(habit.name);
  const { toggleHabitCompletion, updateHabit, deleteHabit } = useHabits();
  const today = new Date().toISOString().split('T')[0];
  const isCompleted = habit.completedDates.includes(today);

  const handleToggle = () => {
    toggleHabitCompletion(goal.id, subGoal.id, habit.id, today);
  };

  const toggleReminder = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateHabit(goal.id, subGoal.id, habit.id, {
      reminderEnabled: !habit.reminderEnabled
    });
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const saveEdit = () => {
    if (!editedName.trim()) return;

    updateHabit(goal.id, subGoal.id, habit.id, {
      name: editedName.trim(),
    });

    setIsEditing(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();

    deleteHabit(goal.id, subGoal.id, habit.id);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={`
        relative p-4 rounded-xl cursor-pointer transition-all duration-300
        ${isCompleted
          ? 'bg-primary/10 border-2 border-primary/30'
          : 'bg-card border border-border hover:shadow-card-hover'
        }
      `}
      onClick={handleToggle}
    >
      <div className="flex items-center gap-4">
        <motion.div
          className={`
            w-8 h-8 rounded-full flex items-center justify-center
            transition-colors duration-300
            ${isCompleted
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-muted-foreground'
            }
          `}
          whileTap={{ scale: 0.8 }}
        >
          {isCompleted && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              <Check className="w-5 h-5" />
            </motion.div>
          )}
        </motion.div>

        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onBlur={saveEdit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  saveEdit();
                }
              }}
              autoFocus
              className="bg-transparent border border-primary rounded px-2 py-1 text-sm w-full"
            />
          ) : (
            <h4 className={`font-medium truncate ${isCompleted ? 'text-primary' : 'text-foreground'}`}>
              {habit.name}
            </h4>
          )}
          {showContext && (
            <p className="text-xs text-muted-foreground truncate">
              {goal.name} → {subGoal.name}
            </p>
          )}
        </div>

        <button
          onClick={toggleReminder}
          className={`
    p-2 rounded-lg transition-colors
    ${habit.reminderEnabled
              ? 'text-primary hover:bg-primary/10'
              : 'text-muted-foreground hover:bg-secondary'
            }
  `}
        >
          {habit.reminderEnabled ? (
            <Bell className="w-4 h-4" />
          ) : (
            <BellOff className="w-4 h-4" />
          )}
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleEdit();
          }}
          className="
    p-2 rounded-lg text-muted-foreground
    hover:bg-primary/10 hover:text-primary
    transition-colors
  "
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(e);
          }}
          className="
    p-2 rounded-lg text-muted-foreground
    hover:bg-destructive/10 hover:text-destructive
    transition-colors
  "
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      {isCompleted && (
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            background: 'radial-gradient(circle at center, hsl(var(--primary) / 0.1) 0%, transparent 70%)',
          }}
        />
      )}
    </motion.div>
  );
}
