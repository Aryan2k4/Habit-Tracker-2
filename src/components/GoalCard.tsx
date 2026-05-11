import { motion } from 'framer-motion';
import {
  ChevronRight,
  ChevronDown,
  Target,
  Plus,
  Pencil,
  Trash2
} from 'lucide-react';

import { Goal } from '@/types/habit';
import { ProgressRing } from './ProgressRing';
import { useState } from 'react';
import { useHabits } from '@/context/HabitContext';

interface GoalCardProps {
  goal: Goal;
  onClick: () => void;
}

export function GoalCard({ goal }: GoalCardProps) {
  const [expanded, setExpanded] = useState(false);

  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editedGoalName, setEditedGoalName] = useState('');

  const { deleteGoal, updateGoal } = useHabits();

  const totalHabits = goal.subGoals.reduce(
    (acc, sg) => acc + sg.habits.length,
    0
  );

  const today = new Date().toISOString().split('T')[0];

  const completedToday = goal.subGoals.reduce(
    (acc, sg) =>
      acc +
      sg.habits.filter((h) =>
        h.completedDates.includes(today)
      ).length,
    0
  );

  const progress =
    totalHabits > 0
      ? (completedToday / totalHabits) * 100
      : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      className="p-5 rounded-2xl bg-card border border-border shadow-card hover:shadow-card-hover transition-shadow"
      onClick={() => setExpanded(!expanded)}
    >
      {/* Top */}
      <div className="flex items-start justify-between mb-4">
        <div
          className="p-3 rounded-xl"
          style={{
            backgroundColor: `${goal.color}20`
          }}
        >
          <Target
            className="w-5 h-5"
            style={{ color: goal.color }}
          />
        </div>

        <ProgressRing
          progress={progress}
          size={48}
          strokeWidth={4}
        />
      </div>

      {editingGoalId === goal.id ? (
        <input
          value={editedGoalName}
          onChange={(e) => setEditedGoalName(e.target.value)}
          onBlur={() => {
            if (!editedGoalName.trim()) return;

            updateGoal(goal.id, {
              name: editedGoalName.trim(),
            });

            setEditingGoalId(null);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              if (!editedGoalName.trim()) return;

              updateGoal(goal.id, {
                name: editedGoalName.trim(),
              });

              setEditingGoalId(null);
            }
          }}
          autoFocus
          className="font-semibold text-lg bg-transparent border border-primary rounded px-2 py-1 outline-none"
        />
      ) : (
        <h3 className="font-semibold text-lg text-foreground mb-1">
          {goal.name}
        </h3>
      )}

      {/* Description */}
      {goal.description && (
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {goal.description}
        </p>
      )}

      {/* Bottom */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>{goal.subGoals.length} sub-goals</span>
          <span>{totalHabits} habits</span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
        >
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* Expanded Section */}
      {expanded && (
        <div className="mt-5 pt-4 border-t border-border space-y-4">

          {/* Subgoals */}
          <div className="space-y-3">
            {goal.subGoals.map((sg) => (
              <div
                key={sg.id}
                className="p-3 rounded-xl bg-secondary/40"
              >
                <h4 className="font-medium text-sm mb-2">
                  {sg.name}
                </h4>

                <div className="space-y-2">
                  {sg.habits.map((habit) => (
                    <div
                      key={habit.id}
                      className="text-xs text-muted-foreground bg-background rounded-lg px-3 py-2"
                    >
                      • {habit.name}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">

            {/* Edit */}
            <button
              onClick={(e) => {
                e.stopPropagation();

                setEditingGoalId(goal.id);
                setEditedGoalName(goal.name);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm hover:bg-primary/20 transition-colors"
            >
              <Pencil className="w-4 h-4" />
              Edit
            </button>

            {/* Delete */}
            <button
              onClick={(e) => {
                e.stopPropagation();

                const confirmed = confirm(
                  'Delete this goal?'
                );

                if (!confirmed) return;

                deleteGoal(goal.id);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-destructive/10 text-destructive text-sm hover:bg-destructive/20 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>

          </div>
        </div>
      )
      }
    </motion.div >
  );
}

interface AddGoalCardProps {
  onClick: () => void;
}

export function AddGoalCard({
  onClick,
}: AddGoalCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      className="p-5 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors flex flex-col items-center justify-center min-h-[180px] gap-3"
      onClick={onClick}
    >
      <div className="p-3 rounded-full bg-secondary">
        <Plus className="w-6 h-6 text-muted-foreground" />
      </div>

      <span className="text-sm font-medium text-muted-foreground">
        Add New Goal
      </span>
    </motion.div>
  );
}