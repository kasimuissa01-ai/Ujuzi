import { motion } from 'motion/react';
import { ArrowDownRight, BookOpen } from 'lucide-react';
import { ScreenType } from '../App';

interface Props {
  onNavigate: (screen: ScreenType) => void;
}

export default function OnboardingScreen({ onNavigate }: Props) {
  return (
    <div className="flex-1 flex flex-col pt-8 pb-6 px-4 bg-[#ececf0] h-full overflow-hidden relative z-0">
      {/* Background Illustration */}
      <div className="absolute inset-x-0 top-0 bottom-[35%] z-[-1] flex items-start justify-center pt-16">
        <motion.img
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          src="https://i.postimg.cc/TP1mFbCR/IMG-20260510-193209.jpg"
          alt="Learning Illustration"
          className="w-full h-full object-contain mix-blend-multiply object-top scale-110"
        />
      </div>

      {/* Top Bar Wrapper*/}
      <div className="flex items-center justify-between mb-2 shrink-0 z-10 w-full relative">
        <div className="flex items-center gap-2">
          <div className="bg-black text-white px-5 h-10 rounded-full flex items-center justify-center text-sm font-semibold shadow-sm">
            Ai Assistant
          </div>
        </div>
        <div className="h-10 px-4 rounded-full flex items-center justify-center overflow-hidden border-[3px] border-white shadow-md bg-white">
          <img src="https://i.postimg.cc/J0CyqrKM/IMG-20260510-235338.jpg" alt="Logo" className="h-[22px] w-auto object-contain" />
        </div>
      </div>

      {/* Spacer to push bottom content down */}
      <div className="flex-1 min-h-20 pointer-events-none" />

      {/* Bottom Section */}
      <div className="flex flex-col shrink-0 gap-3">
        {/* Black Card */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-[#121212] text-white rounded-[2rem] p-6 flex flex-col shadow-xl overflow-hidden relative"
        >
          <h1 className="font-display text-4xl sm:text-[2.5rem] font-bold leading-[1.05] tracking-tight mb-4">
            Level up<br />
            <span className="text-gray-400">Maarifa Yako.</span>
          </h1>
          
          <div className="flex justify-between items-end mt-auto">
             <p className="text-gray-500 text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider max-w-[180px]">
               Jifunze kidogo. Matokeo makubwa. Bila pleasure.
             </p>
             <ArrowDownRight className="w-6 h-6 text-white shrink-0" strokeWidth={1.5} />
          </div>
        </motion.div>

        {/* Action Pill */}
        <motion.button 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          onClick={() => onNavigate('home')}
          className="w-full h-16 bg-[#d9d9de] text-black rounded-full flex items-center justify-between p-2 group hover:bg-[#d0d0d6] transition-colors"
        >
          <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" fill="currentColor" strokeWidth={1.5} />
          </div>
          <span className="font-semibold text-lg tracking-tight pr-4">Get Started</span>
          <div className="flex text-gray-400 font-bold tracking-widest px-4 opacity-50 group-hover:opacity-100 transition-opacity">
            {">>>"}
          </div>
        </motion.button>
      </div>
    </div>
  );
}