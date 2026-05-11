import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useHabits } from '@/context/HabitContext';

interface CreateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateGoalModal({ isOpen, onClose }: CreateGoalModalProps) {
  const { addGoal, addSubGoal, addHabit } = useHabits();
  const [step, setStep] = useState(1);
  const [goalData, setGoalData] = useState({
    name: '',
    description: '',
    whyItMatters: '',
  });
  const [subGoals, setSubGoals] = useState<{ name: string; habits: string[] }[]>([
    { name: '', habits: [''] }
  ]);
 

  const handleNext = () => {
    if (step === 1 && goalData.name) {
      setStep(2);
    } else if (step === 2) {
      handleCreateGoal();
    }
  };

 const handleCreateGoal = () => {
  const createdGoal = addGoal({
    name: goalData.name,
    description: goalData.description,
    whyItMatters: goalData.whyItMatters,
    color: '',
  });

  const goalId = createdGoal.id;

  subGoals.forEach((sg) => {
    if (!sg.name.trim()) return;

    const subGoalId = crypto.randomUUID();

    addSubGoal(goalId, {
      id: subGoalId,
      name: sg.name,
      habits: [],
      progress: 0,
    } as any);

    sg.habits.forEach((habitName) => {
      if (!habitName.trim()) return;

      addHabit(goalId, subGoalId, {
        name: habitName,
        reminderEnabled: false,
      });
    });
  });

  setStep(3);

  setTimeout(() => {
    resetAndClose();
  }, 2000);
};


  const resetAndClose = () => {
    setStep(1);
    setGoalData({ name: '', description: '', whyItMatters: '' });
    setSubGoals([{ name: '', habits: [''] }]);
    onClose();
  };

  const addNewSubGoal = () => {
    setSubGoals([...subGoals, { name: '', habits: [''] }]);
  };

  const updateSubGoal = (index: number, name: string) => {
    const updated = [...subGoals];
    updated[index].name = name;
    setSubGoals(updated);
  };

  const addHabitToSubGoal = (subGoalIndex: number) => {
  setSubGoals(prev =>
    prev.map((sg, index) =>
      index === subGoalIndex
        ? {
            ...sg,
            habits: [...sg.habits, ''],
          }
        : sg
    )
  );
};

 const updateHabit = (
  subGoalIndex: number,
  habitIndex: number,
  name: string
) => {
  setSubGoals(prev =>
    prev.map((sg, sgIdx) =>
      sgIdx === subGoalIndex
        ? {
            ...sg,
            habits: sg.habits.map((habit, hIdx) =>
              hIdx === habitIndex ? name : habit
            ),
          }
        : sg
    )
  );
};
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/20 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={resetAndClose}
        >
          <motion.div
            className="w-full max-w-lg bg-card rounded-2xl shadow-lg overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Progress indicator */}
            <div className="flex gap-2 p-4 border-b border-border">
              {[1, 2, 3].map(s => (
                <div
                  key={s}
                  className={`flex-1 h-1 rounded-full transition-colors ${
                    s <= step ? 'bg-primary' : 'bg-secondary'
                  }`}
                />
              ))}
            </div>

            <div className="p-6">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h2 className="text-xl font-semibold text-foreground mb-2">
                      What's your big goal?
                    </h2>
                    <p className="text-sm text-muted-foreground mb-6">
                      Think about something meaningful you want to achieve
                    </p>

                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Goal name
                        </label>
                        <Input
                          placeholder="e.g., Get Fit, Learn Spanish, Read More"
                          value={goalData.name}
                          onChange={e => setGoalData({ ...goalData, name: e.target.value })}
                          className="h-12"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Description (optional)
                        </label>
                        <Textarea
                          placeholder="What does success look like?"
                          value={goalData.description}
                          onChange={e => setGoalData({ ...goalData, description: e.target.value })}
                          rows={2}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Why does this matter to you?
                        </label>
                        <Textarea
                          placeholder="This will motivate you when things get tough"
                          value={goalData.whyItMatters}
                          onChange={e => setGoalData({ ...goalData, whyItMatters: e.target.value })}
                          rows={2}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="max-h-[60vh] overflow-y-auto"
                  >
                    <h2 className="text-xl font-semibold text-foreground mb-2">
                      Break it down
                    </h2>
                    <p className="text-sm text-muted-foreground mb-6">
                      Add sub-goals and daily habits to achieve "{goalData.name}"
                    </p>

                    <div className="space-y-6">
                      {subGoals.map((sg, sgIndex) => (
                        <div key={sgIndex} className="p-4 rounded-xl bg-secondary/50 space-y-3">
                          <Input
                            placeholder="Sub-goal name (e.g., Lose 5kg)"
                            value={sg.name}
                            onChange={e => updateSubGoal(sgIndex, e.target.value)}
                          />
                          
                          <div className="pl-4 space-y-2">
                            <p className="text-xs text-muted-foreground">Daily habits:</p>
                            {sg.habits.map((habit, hIndex) => (
                              <Input
                                key={hIndex}
                                placeholder="e.g., Exercise 30 mins"
                                value={habit}
                                onChange={e => updateHabit(sgIndex, hIndex, e.target.value)}
                                className="h-10"
                              />
                            ))}
                            <button
                              onClick={() => addHabitToSubGoal(sgIndex)}
                              className="text-xs text-primary hover:underline flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" /> Add habit
                            </button>
                          </div>
                        </div>
                      ))}

                      <button
                        onClick={addNewSubGoal}
                        className="w-full p-3 rounded-xl border-2 border-dashed border-border hover:border-primary/50 text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" /> Add another sub-goal
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-8 text-center"
                  >
                    <motion.div
                      className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.5 }}
                    >
                      <Sparkles className="w-8 h-8 text-primary" />
                    </motion.div>
                    <h2 className="text-xl font-semibold text-foreground mb-2">
                      Goal Created!
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Your journey to "{goalData.name}" begins now
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {step < 3 && (
              <div className="flex gap-3 p-4 border-t border-border">
                <Button
                  variant="outline"
                  onClick={resetAndClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={step === 1 && !goalData.name}
                  className="flex-1"
                >
                  {step === 2 ? 'Create Goal' : 'Next'}
                </Button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
