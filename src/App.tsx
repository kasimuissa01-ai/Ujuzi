/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home as HomeIcon, User as UserIcon, Briefcase as BriefcaseIcon } from 'lucide-react';
import OnboardingScreen from './screens/OnboardingScreen';
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import JobsScreen from './screens/JobsScreen';
import CourseDetailScreen from './screens/CourseDetailScreen';
import InteractiveLesson from './screens/InteractiveLesson';
import { trackEvent } from './lib/mixpanel';
import { useAuth } from './hooks/useAuth';
import InstallPrompt from './components/InstallPrompt';

export type ScreenType = 'onboarding' | 'home' | 'course' | 'lesson' | 'profile' | 'jobs';

export type HistoryState = {
  screen: ScreenType;
  params?: Record<string, any>;
};

export default function App() {
  const { loading: authLoading, user } = useAuth();
  const [history, setHistory] = useState<HistoryState[]>([{ screen: 'onboarding' }]);
  
  // Splash and loader states for a premium, high-quality native brand launch
  const [isSplashActive, setIsSplashActive] = useState(true);
  const [splashProgress, setSplashProgress] = useState(0);
  const [formattedTime, setFormattedTime] = useState('12:00');

  useEffect(() => {
    trackEvent('App Mount');
  }, []);

  // Update mock phone status bar time dynamically
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      let minutes = now.getMinutes();
      const strHours = hours < 10 ? `0${hours}` : `${hours}`;
      const strMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
      setFormattedTime(`${strHours}:${strMinutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Smooth splash progress simulation (takes ~1.4 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setSplashProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1.5;
      });
    }, 20);
    return () => clearInterval(interval);
  }, []);

  // Defer dismissing the splash screen until both Firebase Auth is loaded and brand animation finishes
  useEffect(() => {
    if (!authLoading && splashProgress >= 100) {
      const timeout = setTimeout(() => {
        setIsSplashActive(false);
      }, 350);
      return () => clearTimeout(timeout);
    }
  }, [authLoading, splashProgress]);

  // Handle browser back button (PopState)
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault();
      setHistory(prev => prev.length > 1 ? prev.slice(0, -1) : prev);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Set initial state in history
  useEffect(() => {
    window.history.replaceState({ screen: 'onboarding' }, '');
  }, []);

  const currentRoute = history[history.length - 1];
  const currentScreen = currentRoute.screen;
  const currentParams = currentRoute.params;

  const navigate = (screen: ScreenType, params?: Record<string, any>) => {
    window.history.pushState({ screen, params }, '');
    setHistory(prev => [...prev, { screen, params }]);
  };

  const goBack = () => {
    if (history.length > 1) {
      window.history.back();
    }
  };

  // Auto route to home screen if user is authenticated
  useEffect(() => {
    if (user && currentScreen === 'onboarding') {
      navigate('home');
    }
  }, [user, currentScreen]);

  return (
    <div className="h-[100dvh] w-full bg-[#ececf0] sm:bg-neutral-900 flex justify-center items-center overflow-hidden">
      {/* Mobile Device Mockup Canvas for Desktop, fullscreen on real browsers/phones */}
      <div className="w-full h-full sm:max-w-[400px] sm:max-h-[850px] bg-[#ececf0] sm:rounded-[3rem] sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)] sm:border-[12px] sm:border-neutral-950 overflow-hidden relative flex flex-col select-none">
        
        {/* Dynamic Island / Camera Lens Punch-hole inside desktop mock shell */}
        <div className="hidden sm:block absolute top-2.5 left-1/2 -translate-x-1/2 h-4 w-20 bg-neutral-950 rounded-full z-100 shadow-inner" />

        {/* Real Status Bar only shown in desktop simulated frame screen (hidden on real phones to save space) */}
        <div className="hidden sm:flex justify-between items-center px-6 pt-4.5 pb-2 text-[11px] font-black text-neutral-600 select-none bg-transparent shrink-0 z-50">
          <div>{formattedTime}</div>
          <div className="flex items-center gap-1.5">
            {/* Cell signal lines */}
            <div className="flex items-end gap-[1.5px] h-2.5">
              <div className="w-[2px] h-1.5 bg-neutral-600 rounded-[0.5px]" />
              <div className="w-[2px] h-2 bg-neutral-600 rounded-[0.5px]" />
              <div className="w-[2px] h-2.5 bg-neutral-600 rounded-[0.5px]" />
            </div>
            {/* WiFi icon */}
            <svg className="w-3 h-3 text-neutral-600 fill-current" viewBox="0 0 24 24">
              <path d="M12 21l-12-12c5-5 14-5 19 0l-12 12zm0-10.8l7.8 7.8 1.4-1.4-9.2-9.2-9.2 9.2 1.4 1.4 7.8-7.8z" />
            </svg>
            {/* Battery icon */}
            <div className="w-5 h-2.5 border border-neutral-600 rounded-[3px] p-[1px] flex items-center">
              <div className="h-full w-4/5 bg-neutral-600 rounded-[1px]" />
              <div className="w-[1.5px] h-1 bg-neutral-600 rounded-r-[0.5px] ml-[0.5px]" />
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {isSplashActive ? (
            <motion.div 
              key="splash"
              className="absolute inset-0 bg-[#0b131a] flex flex-col items-center justify-between py-16 z-50 overflow-hidden"
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
            >
              {/* Soft ambient brand glow */}
              <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 bg-[#1cb0f6]/10 rounded-full blur-[80px]" />

              <div /> {/* Spacer */}

              {/* Brand Logo & Slogan Frame */}
              <div className="flex flex-col items-center relative z-10 select-none">
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 180, damping: 20, delay: 0.15 }}
                  className="relative"
                >
                  <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-2xl shadow-[#1cb0f6]/20 border border-white/10 flex items-center justify-center p-0.5 bg-[#1cb0f6]">
                    <img src="/icon.svg" alt="Ujuzi Logo" className="w-full h-full object-cover" />
                  </div>
                  {/* Pulsing visual halo key */}
                  <div className="absolute -inset-1 rounded-3xl border border-[#1cb0f6]/30 animate-pulse" />
                </motion.div>

                <motion.h1
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  className="text-3xl font-black text-white mt-6 tracking-[0.1em] font-sans"
                >
                  UJUZI
                </motion.h1>

                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                  className="text-[10px] text-gray-400 font-bold tracking-[0.25em] uppercase mt-2 font-mono"
                >
                  Soma Kidogo Ujue Zaidi
                </motion.p>
              </div>

              {/* Bottom Loader & Progress */}
              <div className="flex flex-col items-center w-full max-w-[180px] relative z-10 px-4">
                <div className="w-full h-[3px] bg-white/10 rounded-full overflow-hidden relative">
                  <motion.div 
                    className="absolute top-0 bottom-0 left-0 bg-[#1cb0f6]"
                    animate={{ width: `${splashProgress}%` }}
                    transition={{ ease: "linear" }}
                  />
                </div>
                <span className="text-[9px] font-mono font-bold text-[#1cb0f6] tracking-widest mt-2 px-1 py-0.5 rounded bg-[#1cb0f6]/10 animate-pulse">
                  TAYARI {Math.min(100, Math.round(splashProgress))}%
                </span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="app-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="flex-1 flex flex-col overflow-hidden relative w-full h-full"
            >
              {/* Content Router bounds to strict remaining device height */}
              <div className="flex-1 min-h-0 w-full relative overflow-hidden flex flex-col">
                {currentScreen === 'onboarding' && <OnboardingScreen onNavigate={navigate} />}
                {currentScreen === 'home' && <HomeScreen onNavigate={navigate} />}
                {currentScreen === 'profile' && <ProfileScreen onNavigate={navigate} />}
                {currentScreen === 'jobs' && <JobsScreen onNavigate={navigate} />}
                {currentScreen === 'course' && <CourseDetailScreen onNavigate={navigate} onBack={goBack} params={currentParams} />}
                {currentScreen === 'lesson' && <InteractiveLesson onNavigate={navigate} onBack={goBack} params={currentParams} />}
              </div>

              {/* Polished Native-feeling Floating Bottom navigation bar - perfectly fixed, never scrolls */}
              <AnimatePresence>
                {(currentScreen === 'home' || currentScreen === 'profile' || currentScreen === 'jobs') && (
                  <motion.div
                    initial={{ y: 80, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 80, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 26 }}
                    className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-[325px]"
                  >
                    <div className="bg-white/85 backdrop-blur-xl border border-white/70 shadow-[0_15px_40px_-5px_rgba(0,0,0,0.12)] rounded-full p-2.5 flex items-center justify-between gap-1">
                      {/* Home Tab Button */}
                      <button
                        onClick={() => navigate('home')}
                        className="relative flex-1 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 select-none group"
                      >
                        {currentScreen === 'home' && (
                          <motion.div
                            layoutId="activeTabPill"
                            className="absolute inset-0 bg-white rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-neutral-100"
                            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                          />
                        )}
                        <div className="relative z-10 flex items-center gap-2">
                          <HomeIcon 
                            className={`w-5 h-5 transition-colors duration-200 ${currentScreen === 'home' ? 'text-black fill-black' : 'text-neutral-400 group-hover:text-black'}`} 
                          />
                          {currentScreen === 'home' && (
                            <span className="text-xs font-black text-black tracking-tight font-sans">Home</span>
                          )}
                        </div>
                      </button>

                      {/* Jobs Tab Button */}
                      <button
                        onClick={() => navigate('jobs')}
                        className="relative flex-1 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 select-none group"
                      >
                        {currentScreen === 'jobs' && (
                          <motion.div
                            layoutId="activeTabPill"
                            className="absolute inset-0 bg-white rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-neutral-100"
                            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                          />
                        )}
                        <div className="relative z-10 flex items-center gap-2">
                          <BriefcaseIcon 
                             className={`w-5 h-5 transition-colors duration-200 ${currentScreen === 'jobs' ? 'text-black fill-black' : 'text-neutral-400 group-hover:text-black'}`} 
                          />
                          {currentScreen === 'jobs' && (
                            <span className="text-xs font-black text-black tracking-tight font-sans">Kazi</span>
                          )}
                        </div>
                      </button>

                      {/* Profile Tab Button */}
                      <button
                        onClick={() => navigate('profile')}
                        className="relative flex-1 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 select-none group"
                      >
                        {currentScreen === 'profile' && (
                          <motion.div
                            layoutId="activeTabPill"
                            className="absolute inset-0 bg-white rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-neutral-100"
                            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                          />
                        )}
                        <div className="relative z-10 flex items-center gap-2">
                          <UserIcon 
                            className={`w-5 h-5 transition-colors duration-200 ${currentScreen === 'profile' ? 'text-black fill-black' : 'text-neutral-400 group-hover:text-black'}`} 
                          />
                          {currentScreen === 'profile' && (
                            <span className="text-xs font-black text-black tracking-tight font-sans">Profile</span>
                          )}
                        </div>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        <InstallPrompt />

        {/* Home gesture swipe indicator bar strictly for mockup styling on desktop view */}
        <div className="hidden sm:block w-full py-1.5 bg-transparent mt-auto shrink-0 select-none">
          <div className="w-28 h-[4px] bg-neutral-400/40 rounded-full mx-auto" />
        </div>
      </div>
    </div>
  );
}
