import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface GrowthPlantProps {
  streak: number;
  className?: string;
}

export function GrowthPlant({ streak, className = '' }: GrowthPlantProps) {
  const stage = useMemo(() => {
    if (streak === 0) return 0;
    if (streak < 3) return 1;
    if (streak < 7) return 2;
    if (streak < 14) return 3;
    if (streak < 30) return 4;
    return 5;
  }, [streak]);

  const stageLabels = ['Seed', 'Sprout', 'Seedling', 'Growing', 'Blooming', 'Flourishing'];
  const stageColors = [
    'hsl(45, 30%, 60%)',
    'hsl(120, 40%, 65%)',
    'hsl(130, 45%, 55%)',
    'hsl(140, 50%, 45%)',
    'hsl(150, 55%, 40%)',
    'hsl(150, 60%, 35%)',
  ];

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative w-32 h-40 flex items-end justify-center">
        {/* Pot */}
        <motion.div 
          className="absolute bottom-0 w-16 h-10 rounded-b-2xl"
          style={{ backgroundColor: 'hsl(25, 40%, 35%)' }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        />
        <motion.div 
          className="absolute bottom-8 w-20 h-3 rounded-full"
          style={{ backgroundColor: 'hsl(25, 35%, 30%)' }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 }}
        />
        
        {/* Soil */}
        <motion.div 
          className="absolute bottom-9 w-14 h-2 rounded-full"
          style={{ backgroundColor: 'hsl(30, 30%, 25%)' }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4 }}
        />

        {/* Plant stages */}
        {stage >= 1 && (
          <motion.div
            className="absolute bottom-10 w-1 rounded-full"
            style={{ 
              backgroundColor: stageColors[stage],
              height: stage >= 2 ? '40px' : '15px',
            }}
            initial={{ height: 0 }}
            animate={{ height: stage >= 2 ? 40 : 15 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          />
        )}

        {stage >= 2 && (
          <>
            <motion.div
              className="absolute bottom-14 -left-1 w-4 h-3 rounded-full origin-right"
              style={{ 
                backgroundColor: stageColors[stage],
                transform: 'rotate(-30deg)',
                left: '55%',
              }}
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: -30 }}
              transition={{ duration: 0.3, delay: 0.7 }}
            />
            <motion.div
              className="absolute bottom-16 w-4 h-3 rounded-full origin-left"
              style={{ 
                backgroundColor: stageColors[stage],
                transform: 'rotate(30deg)',
                right: '55%',
              }}
              initial={{ scale: 0, rotate: 30 }}
              animate={{ scale: 1, rotate: 30 }}
              transition={{ duration: 0.3, delay: 0.8 }}
            />
          </>
        )}

        {stage >= 3 && (
          <>
            <motion.div
              className="absolute bottom-20 w-5 h-4 rounded-full"
              style={{ 
                backgroundColor: stageColors[stage],
                left: '58%',
                transform: 'rotate(-20deg)',
              }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.9 }}
            />
            <motion.div
              className="absolute bottom-22 w-5 h-4 rounded-full"
              style={{ 
                backgroundColor: stageColors[stage],
                right: '58%',
                transform: 'rotate(20deg)',
              }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 1 }}
            />
          </>
        )}

        {stage >= 4 && (
          <motion.div
            className="absolute bottom-28 w-6 h-6 rounded-full"
            style={{ 
              background: 'radial-gradient(circle, hsl(350, 70%, 65%) 0%, hsl(340, 60%, 55%) 100%)',
            }}
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: 0.5, delay: 1.1 }}
          />
        )}

        {stage >= 5 && (
          <>
            <motion.div
              className="absolute bottom-26 w-4 h-4 rounded-full"
              style={{ 
                background: 'radial-gradient(circle, hsl(45, 90%, 65%) 0%, hsl(35, 80%, 55%) 100%)',
                left: '25%',
              }}
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.5, delay: 1.2 }}
            />
            <motion.div
              className="absolute bottom-24 w-4 h-4 rounded-full"
              style={{ 
                background: 'radial-gradient(circle, hsl(280, 60%, 70%) 0%, hsl(270, 50%, 60%) 100%)',
                right: '25%',
              }}
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.5, delay: 1.3 }}
            />
          </>
        )}
      </div>

      <motion.div 
        className="mt-4 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <p className="text-sm font-medium text-foreground">{stageLabels[stage]}</p>
        <p className="text-xs text-muted-foreground">
          {streak === 0 ? 'Start a habit to plant your seed!' : `${streak} day streak`}
        </p>
      </motion.div>
    </div>
  );
}
