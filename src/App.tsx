/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home as HomeIcon, User as UserIcon } from 'lucide-react';
import OnboardingScreen from './screens/OnboardingScreen';
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import CourseDetailScreen from './screens/CourseDetailScreen';
import InteractiveLesson from './screens/InteractiveLesson';
import { trackEvent } from './lib/mixpanel';
import { useAuth } from './hooks/useAuth';
import { Loader2 } from 'lucide-react';
import InstallPrompt from './components/InstallPrompt';

export type ScreenType = 'onboarding' | 'home' | 'course' | 'lesson' | 'profile';

export type HistoryState = {
  screen: ScreenType;
  params?: Record<string, any>;
};

export default function App() {
  const { loading: authLoading, user } = useAuth();
  const [history, setHistory] = useState<HistoryState[]>([{ screen: 'onboarding' }]);

  useEffect(() => {
    trackEvent('App Mount');
  }, []);

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

  // Auto route to home screen if user is authenticated with a non-anonymous Google Account
  useEffect(() => {
    if (user && !user.isAnonymous && currentScreen === 'onboarding') {
      navigate('home');
    }
  }, [user, currentScreen]);

  return (
    <div className="h-[100dvh] w-full bg-[#ececf0] sm:bg-neutral-900 flex justify-center items-center overflow-hidden">
      {/* Mobile Device Constraint for Desktop, full screen on mobile */}
      <div className="w-full h-full sm:max-w-[400px] sm:max-h-[850px] bg-[#ececf0] sm:rounded-[3rem] sm:shadow-2xl sm:border-[8px] sm:border-black overflow-hidden relative flex flex-col">
        {authLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-[#ececf0]">
            <Loader2 className="w-8 h-8 text-black animate-spin mb-4 shrink-0" />
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500 animate-pulse select-none">
              Ujuzi Platform
            </span>
          </div>
        ) : (
          <>
            {currentScreen === 'onboarding' && <OnboardingScreen onNavigate={navigate} />}
            {currentScreen === 'home' && <HomeScreen onNavigate={navigate} />}
            {currentScreen === 'profile' && <ProfileScreen onNavigate={navigate} />}
            {currentScreen === 'course' && <CourseDetailScreen onNavigate={navigate} onBack={goBack} params={currentParams} />}
            {currentScreen === 'lesson' && <InteractiveLesson onNavigate={navigate} onBack={goBack} params={currentParams} />}
          </>
        )}
        
        {/* Inspired Polished Floating Bottom Pill Navigation Bar (Google / Senior Designer Design) */}
        <AnimatePresence>
          {(currentScreen === 'home' || currentScreen === 'profile') && (
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 25 }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-[270px]"
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

        <InstallPrompt />
      </div>
    </div>
  );
}
