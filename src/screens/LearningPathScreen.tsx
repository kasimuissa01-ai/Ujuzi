import { motion } from 'motion/react';
import { ArrowLeft, Check, Lock, Play } from 'lucide-react';
import { ScreenType } from '../App';

interface Props {
  onNavigate: (screen: ScreenType) => void;
  onBack?: () => void;
}

export default function LearningPathScreen({ onNavigate, onBack }: Props) {
  const pathData = [
    { id: 1, title: 'Introduction to TikTok Sales', status: 'completed' },
    { id: 2, title: 'Creating Viral Hooks', status: 'active' },
    { id: 3, title: 'Closing the Sale in DMs', status: 'locked' },
    { id: 4, title: 'Building a Brand Story', status: 'locked' },
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#ececf0] text-black h-full overflow-y-auto">
      {/* Top Nav */}
      <div className="flex justify-between items-center p-6 sticky top-0 z-50 bg-[#ececf0]/80 backdrop-blur-md">
        <button 
          onClick={() => onBack ? onBack() : onNavigate('home')}
          className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center hover:opacity-90 transition-opacity"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="font-bold">Njia ya Kujifunza</div>
        <div className="w-10 h-10" />
      </div>

      <div className="px-6 py-4 relative">
        {/* Timeline Path */}
        <div className="absolute left-[38px] top-6 bottom-10 w-1 bg-gray-200 z-0 border-l border-r border-gray-300 border-dashed" />

        <div className="flex flex-col gap-8 relative z-10">
          {pathData.map((node, i) => {
            const isCompleted = node.status === 'completed';
            const isActive = node.status === 'active';
            const isLocked = node.status === 'locked';

            return (
              <motion.div 
                key={node.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-6 relative"
              >
                {/* Node Icon */}
                <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 border-4 border-[#ececf0] z-10 transition-transform ${isActive ? 'scale-110' : ''} ${
                  isCompleted ? 'bg-black text-white shadow-md' :
                  isActive ? 'bg-white text-black shadow-lg border-black' :
                  'bg-gray-200 text-gray-400'
                }`}>
                  {isCompleted && <Check className="w-6 h-6" />}
                  {isActive && <Play className="w-5 h-5 ml-1" />}
                  {isLocked && <Lock className="w-5 h-5" />}
                </div>

                {/* Node Content */}
                <div className={`flex-1 rounded-[1.5rem] p-5 shadow-sm border ${
                  isActive ? 'bg-black text-white border-black' : 
                  isCompleted ? 'bg-white text-black border-gray-100' : 
                  'bg-white/50 text-gray-400 border-gray-100'
                }`}>
                  <div className="text-xs font-bold uppercase tracking-wider mb-2 opacity-80">
                    Somo {node.id}
                  </div>
                  <h3 className="font-display font-semibold text-lg leading-tight w-4/5">
                    {node.title}
                  </h3>
                  
                  {isActive && (
                    <button className="mt-4 bg-white text-black px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider w-fit flex items-center gap-2">
                       Endelea <ArrowLeft className="w-3 h-3 rotate-180" />
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
