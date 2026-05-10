import { motion } from 'motion/react';
import { ArrowLeft, MoreHorizontal, BookOpen, Clock, FileText, Smartphone } from 'lucide-react';
import { ScreenType } from '../App';

interface Props {
  onNavigate: (screen: ScreenType) => void;
  onBack?: () => void;
}

export default function CourseDetailScreen({ onNavigate, onBack }: Props) {
  return (
    <div className="flex-1 flex flex-col bg-[#050505] text-white h-full overflow-y-auto pb-8">
      {/* Top Nav */}
      <div className="flex justify-between items-center p-6 sticky top-0 z-50 bg-[#050505]/80 backdrop-blur-md">
        <button 
          onClick={() => onBack ? onBack() : onNavigate('home')}
          className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center hover:opacity-90 transition-opacity"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <button className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center hover:opacity-90 transition-opacity">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      <div className="px-6 relative">
        {/* Course Illustration / Hero */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full aspect-[4/3] flex items-center justify-center mb-8 relative"
        >
           {/* Faux Chart Illustration */}
           <div className="relative w-48 h-40">
             {/* Chart board */}
             <div className="absolute inset-0 border-2 border-gray-600 rounded-lg overflow-hidden">
                <div className="absolute bottom-4 left-4 w-6 h-12 bg-gray-500 rounded-sm" />
                <div className="absolute bottom-4 left-14 w-6 h-20 bg-gray-400 rounded-sm" />
                <div className="absolute bottom-4 left-24 w-6 h-16 bg-white rounded-sm" />
                <div className="absolute bottom-4 left-34 w-6 h-24 bg-gray-300 rounded-sm" />
             </div>
             {/* Person Outline */}
             <div className="absolute -left-8 -bottom-6 w-24 h-32 flex flex-col items-center">
                 <div className="w-10 h-10 border-2 border-white rounded-full mb-1" />
                 <div className="w-16 h-20 border-2 border-white rounded-t-2xl relative">
                    <div className="absolute -right-4 top-4 w-8 h-2 border-2 border-white rotate-45 transform origin-left" />
                 </div>
             </div>
           </div>
           
           {/* Ambient glow */}
           <div className="absolute inset-0 bg-white/5 blur-3xl rounded-full z-[-1]" />
        </motion.div>

        {/* Content */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
          <h1 className="font-display text-4xl font-bold mb-4 tracking-tight">Sales Skills</h1>
          <p className="text-gray-400 text-sm leading-relaxed mb-8">
            Sales Skills kwa Wajasiriamali ni mwongozo rahisi kukusaidia kuuza bidhaa zako kwa ujasiri. Jifunze mbinu za ukweli zinazofanya kazi mtandaoni na mtaani...
          </p>

          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg tracking-wide">Walimu Wako</h3>
            <span className="text-xs text-gray-500 font-medium">Ona Wote</span>
          </div>

          {/* Avatars */}
          <div className="flex gap-4 mb-10 overflow-x-auto pb-2 no-scrollbar">
            {[1,2,3,4].map((i) => (
              <div key={i} className="w-14 h-14 rounded-full overflow-hidden border border-gray-800 shrink-0">
                <img 
                  src={`https://api.dicebear.com/7.x/notionists/svg?seed=Teacher${i}&backgroundColor=222`} 
                  alt="Teacher" 
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>

          {/* Stats Grid */}
          <div className="bg-[#ececf0] rounded-3xl p-4">
             <div className="grid grid-cols-2 gap-3">
                {/* Stat block 1 */}
                <div className="bg-[#121212] rounded-2xl p-4 flex flex-col justify-between h-24">
                   <div className="text-gray-400 font-medium text-xs">Muda</div>
                   <div className="flex items-end gap-1">
                      <span className="font-display text-3xl font-bold text-white leading-none">2.5</span>
                      <span className="text-[10px] text-gray-500 mb-1">Masaa</span>
                   </div>
                   <Clock className="w-8 h-8 text-white/5 absolute top-4 right-4" />
                </div>
                
                {/* Stat block 2 */}
                <div className="bg-[#121212] rounded-2xl p-4 flex flex-col justify-between h-24 relative overflow-hidden">
                   <div className="text-gray-400 font-medium text-xs">Masomo</div>
                   <div className="flex items-end gap-1">
                      <span className="font-display text-3xl font-bold text-white leading-none">12</span>
                      <span className="text-[10px] text-gray-500 mb-1">Sehemu</span>
                   </div>
                   <BookOpen className="w-16 h-16 text-white/5 absolute -right-2 -bottom-2" />
                </div>

                {/* Stat block 3 */}
                <div className="bg-[#121212] rounded-2xl p-4 flex flex-col justify-between h-24">
                   <div className="text-gray-400 font-medium text-xs">Rasilimali</div>
                   <div className="flex items-end gap-1">
                      <span className="font-display text-3xl font-bold text-white leading-none">3</span>
                      <span className="text-[10px] text-gray-500 mb-1">Faili</span>
                   </div>
                   <FileText className="w-8 h-8 text-white/5 absolute top-4 right-4" />
                </div>

                {/* Stat block 4 */}
                <div className="bg-[#121212] rounded-2xl p-4 flex flex-col justify-between h-24">
                   <div className="text-gray-400 font-medium text-xs">Upatikanaji</div>
                   <div className="flex items-end gap-1">
                      <span className="font-display text-2xl font-bold text-white leading-none">Simu/PC</span>
                   </div>
                   <Smartphone className="w-8 h-8 text-white/5 absolute top-4 right-4" />
                </div>
             </div>
             
             <button className="w-full mt-3 bg-black text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-gray-900 transition-colors">
                Anza Sasa hivi
             </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
