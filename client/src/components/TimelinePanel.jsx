import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, Globe, Search, Database } from 'lucide-react';

const STATIC_STEPS = [
  { id: 'think', icon: BrainCircuit, label: 'Thinking...', delay: 0 },
  { id: 'search', icon: Search, label: 'Searching the web...', delay: 1000 },
  { id: 'extract', icon: Database, label: 'Extracting information...', delay: 2500 },
];

const TimelinePanel = ({ isActive, needsSearch = true }) => {
  const [activeStepIndex, setActiveStepIndex] = useState(-1);

  useEffect(() => {
    if (!isActive) {
      setActiveStepIndex(-1);
      return;
    }

    // Determine steps based on search requirement
    const stepsToRun = needsSearch ? STATIC_STEPS : [STATIC_STEPS[0]];
    
    // Animate through steps purely cosmetically
    const timers = stepsToRun.map((step, index) => {
      return setTimeout(() => {
        setActiveStepIndex(index);
      }, step.delay);
    });

    return () => timers.forEach(clearTimeout);
  }, [isActive, needsSearch]);

  if (!isActive) return null;

  const stepsToDisplay = needsSearch ? STATIC_STEPS : [STATIC_STEPS[0]];

  return (
    <div className="w-full flex flex-col gap-2 md:gap-4 p-4 md:p-6 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-md shadow-2xl">
      <h3 className="text-white/60 text-[10px] md:text-sm font-medium mb-1 md:mb-2 uppercase tracking-tight md:tracking-wider">Activity Log</h3>
      
      <div className="relative">
        <div className="absolute left-3.5 top-2 bottom-2 w-[1px] bg-white/10" />
        
        <div className="flex flex-col gap-6 relative">
          {stepsToDisplay.map((step, index) => {
            const isCompleted = index < activeStepIndex;
            const isCurrent = index === activeStepIndex;
            const isPending = index > activeStepIndex;
            
            const Icon = step.icon;
            
            return (
              <motion.div 
                key={step.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: isPending ? 0 : 1, x: isPending ? -10 : 0 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-4 items-center ${isPending ? 'hidden' : 'flex'}`}
              >
                {/* Icon Circle */}
                <div className={`
                  w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center relative z-10 transition-all duration-500
                  ${isCurrent ? 'bg-black border border-white/80 text-white glow-neon' : ''}
                  ${isCompleted ? 'bg-black border border-white/20 text-white/50' : ''}
                `}>
                  <Icon size={isCurrent ? 12 : 10} className={`${isCurrent ? 'animate-pulse' : ''} md:scale-125`} />
                </div>
                
                {/* Label */}
                <div className={`transition-all duration-500 text-xs md:text-base ${isCurrent ? 'text-white text-shadow-neon' : 'text-white/50'}`}>
                  {step.label}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TimelinePanel;
