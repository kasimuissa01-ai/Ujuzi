import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Check, Lock, Play } from 'lucide-react';
import { ScreenType } from '../App';
import courseData from '../data/saikolojia-ya-wateja.json';

interface Props {
  onNavigate: (screen: ScreenType, params?: Record<string, any>) => void;
  onBack?: () => void;
}

export default function CourseDetailScreen({ onNavigate, onBack }: Props) {
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('ujuzi_completed_lessons');
    if (saved) {
      setCompletedLessons(JSON.parse(saved));
    }
  }, []);

  const getStatus = (index: number) => {
    const isCompleted = completedLessons.includes(index.toString());
    const isNextToBeDone = !isCompleted && 
      (index === 0 || completedLessons.includes((index - 1).toString()));
    
    if (isCompleted) return 'completed';
    if (isNextToBeDone) return 'active';
    return 'locked';
  };

  return (
    <div className="flex-1 flex flex-col bg-[#ececf0] text-black h-full overflow-y-auto">
      {/* Top Nav */}
      <div className="flex items-center p-6 sticky top-0 z-50 bg-[#ececf0]/90 backdrop-blur-md">
        <button 
          onClick={() => onBack ? onBack() : onNavigate('home')}
          className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center shrink-0 shadow-lg hover:scale-105 transition-transform"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-1 text-center font-bold text-xl tracking-tight pr-12">
          Njia ya Kujifunza
        </div>
      </div>

      <div className="px-6 py-4 relative flex-1">
        {/* Timeline Path Line */}
        <div className="absolute left-[54px] top-6 bottom-10 w-0 border-l-[3px] border-[#d5d5d8] border-dotted z-0" />

        <div className="flex flex-col gap-8 relative z-10">
          {courseData.modules.map((module, idx) => {
            const status = getStatus(idx);
            const isCompleted = status === 'completed';
            const isActive = status === 'active';
            const isLocked = status === 'locked';

            return (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-4 relative"
              >
                {/* Node Icon */}
                <div 
                  className={`w-[60px] h-[60px] rounded-full flex items-center justify-center shrink-0 z-10 transition-transform ${
                    isActive ? 'scale-110 shadow-lg border-2 border-black bg-white text-black' : 
                    isCompleted ? 'bg-black text-white shadow-xl' :
                    'bg-[#e2e2e7] text-[#a1a1a8]'
                  }`}
                >
                  {isCompleted && <Check className="w-7 h-7" strokeWidth={3} />}
                  {isActive && <Play className="w-6 h-6 ml-1" strokeWidth={2.5} />}
                  {isLocked && <Lock className="w-6 h-6" />}
                </div>

                {/* Node Content */}
                <div 
                  onClick={() => {
                    if (isCompleted || isActive) {
                      onNavigate('lesson', { lessonId: idx.toString() });
                    }
                  }}
                  className={`flex-1 rounded-[1.75rem] p-6 shadow-sm ${
                    isActive 
                      ? 'bg-black text-white shadow-2xl cursor-pointer hover:scale-[1.02] transition-transform' 
                      : isCompleted 
                        ? 'bg-white text-black shadow-md cursor-pointer hover:bg-gray-50 transition-colors' 
                        : 'bg-[#f4f4f6] text-[#b0b0b8] opacity-80 pointer-events-none'
                  }`}
                >
                  <div className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-2 ${isActive ? 'text-gray-400' : isCompleted ? 'text-gray-500' : 'text-[#c6c6cc]'}`}>
                    Somo {idx + 1}
                  </div>
                  <h3 className={`font-display font-semibold text-[1.35rem] leading-tight ${isActive ? 'text-white' : isCompleted ? 'text-black' : 'text-[#a1a1a8]'}`}>
                    {module.title}
                  </h3>
                  
                  {isActive && (
                    <button className="mt-6 bg-white text-black px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest w-fit flex items-center gap-2 hover:bg-gray-200 transition-colors">
                       ENDELEA <ArrowLeft className="w-4 h-4 rotate-180" strokeWidth={2.5} />
                    </button>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  );
}

