/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import OnboardingScreen from './screens/OnboardingScreen';
import HomeScreen from './screens/HomeScreen';
import CourseDetailScreen from './screens/CourseDetailScreen';
import AiTutorScreen from './screens/AiTutorScreen';
import LessonDetailScreen from './screens/LessonDetailScreen';

export type ScreenType = 'onboarding' | 'home' | 'course' | 'ai-tutor' | 'lesson';

export type HistoryState = {
  screen: ScreenType;
  params?: Record<string, any>;
};

export default function App() {
  const [history, setHistory] = useState<HistoryState[]>([{ screen: 'onboarding' }]);

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

  return (
    <div className="h-[100dvh] w-full bg-[#ececf0] sm:bg-neutral-900 flex justify-center items-center overflow-hidden">
      {/* Mobile Device Constraint for Desktop, full screen on mobile */}
      <div className="w-full h-full sm:max-w-[400px] sm:max-h-[850px] bg-[#ececf0] sm:rounded-[3rem] sm:shadow-2xl sm:border-[8px] sm:border-black overflow-hidden relative flex flex-col">
        {currentScreen === 'onboarding' && <OnboardingScreen onNavigate={navigate} />}
        {currentScreen === 'home' && <HomeScreen onNavigate={navigate} />}
        {currentScreen === 'course' && <CourseDetailScreen onNavigate={navigate} onBack={goBack} />}
        {currentScreen === 'ai-tutor' && <AiTutorScreen onNavigate={navigate} onBack={goBack} />}
        {currentScreen === 'lesson' && <LessonDetailScreen onNavigate={navigate} onBack={goBack} params={currentParams} />}
      </div>
    </div>
  );
}
