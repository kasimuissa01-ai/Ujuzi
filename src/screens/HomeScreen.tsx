import { motion } from 'motion/react';
import { Bell, Search, LayoutGrid, Monitor, Briefcase, GraduationCap, ArrowRight, Sparkles } from 'lucide-react';
import { ScreenType } from '../App';

interface Props {
  onNavigate: (screen: ScreenType) => void;
}

export default function HomeScreen({ onNavigate }: Props) {
  return (
    <div className="flex-1 flex flex-col bg-[#ececf0] h-full overflow-y-auto pb-20">
      <div className="px-6 pt-12">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-300 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0">
              <img 
                src="https://api.dicebear.com/7.x/notionists/svg?seed=Jacob&backgroundColor=e5e7eb" 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-black">Jambo, Baraka</p>
              <p className="text-xs text-gray-500 font-medium tracking-wide">Progress: 78%</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white">
              <Search className="w-4 h-4" />
            </button>
            <button className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white relative">
              <Bell className="w-4 h-4" />
              <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full" />
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="mb-6">
          <h1 className="font-display text-5xl font-bold tracking-tight text-[#121212] leading-[1.05]">
            Invest in your
            <span className="block relative">
              Education
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-black fill-current" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0,5 Q50,10 100,5 L100,10 L0,10 Z" opacity="0.1"/>
                <path d="M0,0 Q50,5 100,0 L100,5 L0,5 Z"/>
              </svg>
            </span>
          </h1>
        </div>

        {/* Categories (Chips) */}
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-6 px-6 no-scrollbar mb-6">
          <button className="bg-black text-white p-3 rounded-full shrink-0">
            <LayoutGrid className="w-5 h-5" />
          </button>
          <button className="bg-black text-white px-5 py-3 rounded-full text-sm font-semibold shrink-0 flex items-center gap-2">
            <Monitor className="w-4 h-4" /> Biashara (Biz)
          </button>
          <button className="bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors px-5 py-3 rounded-full text-sm font-semibold shrink-0 flex items-center gap-2">
            <Briefcase className="w-4 h-4" /> Masoko (Marketing)
          </button>
          <button className="bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors px-5 py-3 rounded-full text-sm font-semibold shrink-0 flex items-center gap-2">
            <GraduationCap className="w-4 h-4" /> AI Tools
          </button>
        </div>

        {/* Primary Class Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          onClick={() => onNavigate('course')}
          className="bg-black text-white rounded-[2rem] p-6 shadow-xl mb-4 relative overflow-hidden cursor-pointer group"
        >
          {/* Card Bg Elements */}
          <div className="absolute right-[-2rem] bottom-[-2rem] opacity-20 group-hover:scale-105 transition-transform duration-500">
             <div className="w-40 h-40 border border-white/20 rounded-full flex items-center justify-center">
                <div className="w-24 h-24 border border-white/30 rounded-full" />
             </div>
          </div>

          <div className="flex justify-between items-center mb-10 relative z-10">
            <div className="bg-white/10 px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-semibold backdrop-blur-md">
              <Monitor className="w-3 h-3" /> Biashara
            </div>
            <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-xs font-semibold">
              3/5
            </div>
          </div>

          <div className="relative z-10">
            <h2 className="font-display text-2xl font-bold mb-3 w-3/4 leading-tight">
              TikTok Growth & Uza Online
            </h2>
            <div className="flex justify-between items-end mt-8">
              <div>
                <button className="bg-white text-black px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
                  Soma Sasa
                </button>
                <div className="text-[10px] text-gray-400 font-medium">
                  9,530 wanafunzi &bull; Sura 2 zimebaki
                </div>
              </div>
              
              {/* Graphic icon group */}
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-orange-400 border-2 border-black z-30" />
                <div className="w-8 h-8 rounded-full bg-blue-400 border-2 border-black z-20" />
                <div className="w-8 h-8 rounded-full bg-purple-400 border-2 border-black z-10" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Secondary Class Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          onClick={() => onNavigate('path')}
          className="bg-white text-black rounded-[2rem] p-6 shadow-sm border border-gray-100 mb-6 cursor-pointer"
        >
          <div className="flex justify-between items-center mb-6">
            <div className="bg-gray-100 px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-semibold text-gray-700">
              <Briefcase className="w-3 h-3" /> Masoko
            </div>
            <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-xs font-semibold text-gray-500">
              2/6
            </div>
          </div>

          <h2 className="font-display text-xl font-bold mb-6 leading-tight">
            Sales Psychology for Freelancers
          </h2>

          <div className="flex justify-between items-end">
            <button className="bg-black text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider">
              Anza
            </button>
          </div>
        </motion.div>

      </div>

      {/* Floating Bottom Nav / Action (AI Tutor) */}
      <div className="fixed sm:absolute bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-sm z-50">
         <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate('ai-tutor')}
            className="w-full bg-[#121212] text-white py-4 px-6 rounded-full shadow-2xl flex items-center justify-between border border-gray-800"
         >
           <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-white" />
             </div>
             <span className="font-semibold text-sm">Uliza AI Mwalimu</span>
           </div>
           <ArrowRight className="w-5 h-5 text-gray-400" />
         </motion.button>
      </div>

    </div>
  );
}
