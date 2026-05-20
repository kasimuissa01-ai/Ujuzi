import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Search, LayoutGrid, Monitor, Briefcase, GraduationCap, ArrowRight, Sparkles, X, Plus, Download, Share, PlusSquare, MoreVertical, Smartphone } from 'lucide-react';
import { ScreenType } from '../App';
import coursesData from '../data/courses.json';
import { useProgress } from '../hooks/useProgress';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { usePWA } from '../hooks/usePWA';

interface Props {
  onNavigate: (screen: ScreenType, params?: Record<string, any>) => void;
}

export default function HomeScreen({ onNavigate }: Props) {
  const { user } = useAuth();
  const { notifications, unreadCount } = useNotifications();
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  const { completedLessons } = useProgress();
  
  const { isInstallable, isInstalled, installApp } = usePWA();
  const [isIOS, setIsIOS] = useState(false);
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);
  const [actionExpandedState, setActionExpandedState] = useState<null | 'inapp' | 'ios' | 'manual_android'>(null);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    
    // Determine if iOS
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    // Detect In-App Browsers (TikTok, Instagram, Facebook, Snapchat, etc.)
    const inApp = /fban|fbav|instagram|instabridge|tiktok|musical_ly|snapchat|line|wv|webview/.test(userAgent) || 
                  (userAgent.includes('android') && userAgent.includes('version/'));
    setIsInAppBrowser(inApp);
  }, []);

  const handleInstallClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isInstallable) {
      installApp();
    } else if (isInAppBrowser) {
      setActionExpandedState(prev => prev === 'inapp' ? null : 'inapp');
    } else if (isIOS) {
      setActionExpandedState(prev => prev === 'ios' ? null : 'ios');
    } else {
      setActionExpandedState(prev => prev === 'manual_android' ? null : 'manual_android');
    }
  };
  
  // Hardcoded for old course data just so notifications don't break if no courses
  const totalLessons = 0; 
  const progressPercent = 0;

  return (
    <div className="flex-1 flex flex-col bg-[#ececf0] h-full overflow-y-auto pb-20 relative">
      <div className="px-6 pt-12">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8 relative z-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-300 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0">
              <img 
                src="https://api.dicebear.com/7.x/notionists/svg?seed=Jacob&backgroundColor=e5e7eb" 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-black">Jambo, {user?.displayName?.split(' ')[0] || 'Rafiki'}</p>
              <p className="text-xs text-gray-500 font-medium tracking-wide">Progress: {progressPercent}%</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsSearching(!isSearching)}
              className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white"
              aria-label={isSearching ? "Funga Utafutaji" : "Tafuta (Search)"}
            >
              {isSearching ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
            </button>
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white relative"
                aria-label="Notifikesheni (Notifications)"
                aria-expanded={showNotifications}
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && <div className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full border border-black" />}
              </button>
              
              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-12 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-50 ring-1 ring-black/5"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-sm font-bold">Taarifa (Notifications)</h4>
                      {unreadCount > 0 && <span className="bg-orange-100 text-orange-600 text-[10px] px-2 py-0.5 rounded-full font-bold">{unreadCount} mpya</span>}
                    </div>

                    <div className="space-y-3 max-h-64 overflow-y-auto no-scrollbar">
                      {notifications.length > 0 ? (
                        notifications.map((notif) => (
                          <div key={notif.id} className={`p-3 rounded-xl border ${notif.read ? 'bg-white border-gray-100' : 'bg-gray-50 border-gray-200'}`}>
                            <p className="text-xs font-bold text-black mb-1">{notif.title}</p>
                            <p className="text-[11px] text-gray-500 leading-tight">{notif.message}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-xs text-gray-400 py-4">Huna taarifa mpya kwa sasa.</p>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <div className="bg-gray-50 rounded-xl p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-semibold text-gray-700">Maendeleo Yako</span>
                          <span className="text-xs font-bold text-black">{progressPercent}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                           <div className="h-full bg-black rounded-full" style={{ width: `${progressPercent}%` }} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Title / Search */}
        <div className="mb-6 min-h-[7rem]">
          <AnimatePresence mode="wait">
            {isSearching ? (
              <motion.div
                key="search"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full pt-2"
              >
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tafuta kozi..."
                    className="w-full bg-white text-black border-none rounded-2xl py-4 pl-12 pr-4 text-base focus:ring-2 focus:ring-black outline-none shadow-sm"
                    aria-label="Tafuta kozi (Search courses)"
                  />
                  <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                </div>
              </motion.div>
            ) : (
              <motion.h1
                key="title"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-[#121212] leading-[1.1] pb-2"
              >
                Wekeza kwenye
                <span className="block relative mt-1">
                  Maarifa Yako
                  <svg className="absolute w-full h-3 -bottom-1 left-0 text-black fill-current" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0,5 Q50,10 100,5 L100,10 L0,10 Z" opacity="0.1"/>
                    <path d="M0,0 Q50,5 100,0 L100,5 L0,5 Z"/>
                  </svg>
                </span>
              </motion.h1>
            )}
          </AnimatePresence>
        </div>

        {/* Categories (Chips) */}
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-6 px-6 no-scrollbar mb-6" role="group" aria-label="Vikundi (Categories)">
          <button className="bg-black text-white p-3 rounded-full shrink-0" aria-label="Kategoria zote (All categories)">
            <LayoutGrid className="w-5 h-5" />
          </button>
          <button className="bg-black text-white px-5 py-3 rounded-full text-sm font-semibold shrink-0 flex items-center gap-2" aria-label="Masoko (Marketing)">
            <Briefcase className="w-4 h-4" /> Masoko (Marketing)
          </button>
          <button className="bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors px-5 py-3 rounded-full text-sm font-semibold shrink-0 flex items-center gap-2" aria-label="Biashara (Biz)">
            <Monitor className="w-4 h-4" /> Biashara (Biz)
          </button>
          <button className="bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors px-5 py-3 rounded-full text-sm font-semibold shrink-0 flex items-center gap-2" aria-label="Zana za AI (AI Tools)">
            <GraduationCap className="w-4 h-4" /> AI Tools
          </button>
        </div>

        {/* Courses List */}
        {coursesData.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2rem] p-8 mt-4 text-center border-2 border-dashed border-gray-300 flex flex-col items-center justify-center min-h-[250px]"
          >
             <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Briefcase className="w-8 h-8 text-gray-400" />
             </div>
             <h3 className="font-display text-xl font-bold text-gray-800 mb-2">Hakuna Kozi Yoyote</h3>
             <p className="text-sm text-gray-500 mb-6 max-w-[200px] leading-relaxed">
               Umeanzisha ukurasa mpya. Anza kwa kuongeza kozi yako ya kwanza.
             </p>
             <button className="bg-[#121212] hover:bg-black transition-colors text-white px-6 py-3 rounded-full font-bold text-sm tracking-wide gap-2 flex items-center">
                <Plus className="w-4 h-4" /> Anzisha Kozi
             </button>
          </motion.div>
        ) : (
          <motion.div 
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.15 }
              }
            }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
             {coursesData.map((course, index) => {
               const totalLessons = course.units.reduce((acc, unit) => acc + unit.lessons.length, 0);
               const isFirst = index === 0;
               const bgColors = ["bg-[#121212]", "bg-[#1cb0f6]", "bg-[#ff4b4b]", "bg-[#ffc800]"];
               const textColors = ["text-white", "text-white", "text-white", "text-[#121212]"];
               const bgColor = bgColors[index % bgColors.length];
               const textColor = textColors[index % textColors.length];
               const borderClass = textColor === "text-white" ? "border-white/20" : "border-black/20";
               const bgMutedClass = textColor === "text-white" ? "bg-white/10" : "bg-black/10";
               
               return (
                  <motion.div 
                    key={course.course_id}
                    variants={{
                      hidden: { opacity: 0, y: 30, scale: 0.95 },
                      show: { 
                        opacity: 1, 
                        y: 0, 
                        scale: 1,
                        transition: { type: "spring", stiffness: 300, damping: 24 } 
                      }
                    }}
                    onClick={() => onNavigate('course', { courseId: course.course_id })}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`${bgColor} ${textColor} rounded-[2rem] p-6 lg:p-8 shadow-xl relative overflow-hidden cursor-pointer group ${isFirst ? 'md:col-span-2 min-h-[240px]' : 'min-h-[260px]'}`}
                    role="button"
                  >
                    <div className="absolute right-[-2rem] bottom-[-2rem] opacity-20 group-hover:scale-110 transition-transform duration-700 ease-out">
                       <div className={`w-40 h-40 border ${borderClass} rounded-full flex items-center justify-center`}>
                          <div className={`w-24 h-24 border ${borderClass} rounded-full`} />
                       </div>
                    </div>

                    <div className="flex justify-between items-center mb-8 relative z-10">
                      <div className={`${bgMutedClass} px-4 py-2 rounded-full flex items-center gap-2 text-xs font-bold uppercase tracking-wider backdrop-blur-md`}>
                        <Briefcase className="w-3.5 h-3.5" /> {course.category}
                      </div>
                      <div className={`w-10 h-10 rounded-full border ${borderClass} flex items-center justify-center text-xs font-bold`}>
                        ?/{totalLessons}
                      </div>
                    </div>

                    <div className="relative z-10 flex flex-col justify-end h-[calc(100%-4rem)]">
                      <div>
                        <h2 className={`font-display ${isFirst ? 'text-3xl md:text-4xl' : 'text-2xl'} font-extrabold mb-3 w-4/5 leading-tight`}>
                          {course.course_title}
                        </h2>
                        <p className={`text-sm mb-6 w-4/5 font-medium ${textColor === "text-white" ? "text-gray-300" : "text-gray-700"}`}>
                          {course.level} • {course.language}
                        </p>
                      </div>
                      
                      <div className="flex justify-between items-center mt-auto pt-2">
                        <button className={`${textColor === "text-white" ? "bg-white text-black" : "bg-black text-white"} px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-shadow`}>
                          Anza Kozi
                        </button>
                        
                        <div className="flex -space-x-3">
                          <div className={`w-8 h-8 rounded-full bg-orange-400 border-2 ${bgColor === "bg-[#121212]" ? "border-[#121212]" : "border-transparent"} shadow-sm z-30`} />
                          <div className={`w-8 h-8 rounded-full bg-blue-400 border-2 ${bgColor === "bg-[#1cb0f6]" ? "border-[#1cb0f6]" : "border-transparent"} shadow-sm z-20`} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
               );
             })}
          </motion.div>
        )}

      </div>

      {/* Floating Bottom Nav / Action (Install App) */}
      <div className="fixed sm:absolute bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-sm z-50">
         <motion.div 
            className="w-full bg-[#121212] flex flex-col rounded-[1.5rem] shadow-2xl border border-gray-800 overflow-hidden"
            animate={actionExpandedState ? { y: 0 } : { y: 0 }}
         >
           <button 
              onClick={handleInstallClick}
              className="w-full text-white py-4 px-6 flex items-center justify-between"
              aria-label="Install App"
           >
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Download className="w-4 h-4 text-white" />
               </div>
               <span className="font-semibold text-sm">Install App</span>
             </div>
             <ArrowRight className={`w-5 h-5 text-gray-400 transition-transform ${actionExpandedState ? 'rotate-90' : ''}`} />
           </button>

           {/* Expanded instructions */}
           <AnimatePresence>
              {actionExpandedState && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-6 pb-4 border-t border-white/10 text-white"
                >
                  <div className="mt-4 text-[12px] text-gray-300 space-y-2 text-left">
                    {actionExpandedState === 'inapp' && (
                      <div className="space-y-1.5">
                        <span className="font-bold text-[#ff4b4b] uppercase text-[10px] tracking-wider block mb-1">Tik Tok & Instagram blockage!</span>
                        <p className="flex items-center flex-wrap leading-tight">
                          1. Gusa vitone vitatu <MoreVertical className="w-3.5 h-3.5 inline mx-0.5 text-[#ff4b4b]" /> juu kulia.
                        </p>
                        <p className="leading-tight">2. Chagua <b>Fungua kwenye Browser (Open in Browser)</b> kisha sakinisha.</p>
                      </div>
                    )}
                    {actionExpandedState === 'ios' && (
                      <div className="space-y-1.5">
                        <span className="font-bold text-[#1cb0f6] uppercase text-[10px] tracking-wider block mb-1">iOS Safari Instructions:</span>
                        <p className="flex items-center leading-tight">
                          1. Gusa alama ya <Share className="w-3.5 h-3.5 inline mx-1 text-[#1cb0f6]" /> chini ya Safari.
                        </p>
                        <p className="flex items-center leading-tight">
                          2. Shuka na chagua <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-[#1cb0f6]" /> <b>Add to Home Screen</b>.
                        </p>
                      </div>
                    )}
                    {actionExpandedState === 'manual_android' && (
                      <div className="space-y-1.5">
                        <span className="font-bold text-[#ffcd1f] uppercase text-[10px] tracking-wider block mb-1">Manually Install / Add:</span>
                        <p className="leading-tight">1. Gusa alama ya vitone vitatu juu kulia mwa browser.</p>
                        <p className="leading-tight">2. Chagua <b>Install app</b> au <b>Add to Home Screen</b>.</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
           </AnimatePresence>
         </motion.div>
      </div>

      {/* Overlay to catch clicks and close notifications */}
      {showNotifications && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setShowNotifications(false)}
        />
      )}

    </div>
  );
}
