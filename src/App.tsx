/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import OnboardingScreen from './screens/OnboardingScreen';
import HomeScreen from './screens/HomeScreen';
import CourseDetailScreen from './screens/CourseDetailScreen';
import InteractiveLesson from './screens/InteractiveLesson';
import { trackEvent } from './lib/mixpanel';
import { useAuth } from './hooks/useAuth';
import { Loader2 } from 'lucide-react';
import InstallPrompt from './components/InstallPrompt';

export type ScreenType = 'onboarding' | 'home' | 'course' | 'lesson';

export type HistoryState = {
  screen: ScreenType;
  params?: Record<string, any>;
};

export default function App() {
  const { loading: authLoading } = useAuth();
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

  if (authLoading) {
    return (
      <div className="h-[100dvh] w-full bg-[#ececf0] flex justify-center items-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-auto flex items-center justify-center overflow-hidden border-[3px] border-white shadow-md bg-white rounded-full px-4 mb-4">
            <img src="https://i.postimg.cc/J0CyqrKM/IMG-20260510-235338.jpg" alt="Logo" className="h-[22px] w-auto object-contain" />
          </div>
          <Loader2 className="w-8 h-8 animate-spin text-black" />
          <p className="text-sm font-medium text-gray-500">Inatayarisha maarifa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-full bg-[#ececf0] sm:bg-neutral-900 flex justify-center items-center overflow-hidden">
      {/* Mobile Device Constraint for Desktop, full screen on mobile */}
      <div className="w-full h-full sm:max-w-[400px] sm:max-h-[850px] bg-[#ececf0] sm:rounded-[3rem] sm:shadow-2xl sm:border-[8px] sm:border-black overflow-hidden relative flex flex-col">
        {currentScreen === 'onboarding' && <OnboardingScreen onNavigate={navigate} />}
        {currentScreen === 'home' && <HomeScreen onNavigate={navigate} />}
        {currentScreen === 'course' && <CourseDetailScreen onNavigate={navigate} onBack={goBack} params={currentParams} />}
        {currentScreen === 'lesson' && <InteractiveLesson onNavigate={navigate} onBack={goBack} params={currentParams} />}
        
        <InstallPrompt />
      </div>
    </div>
  );
}
