import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ScreenType } from '../App';
import coursesData from '../data/courses.json';
import StepRenderer from '../components/StepRenderer';
import { Course, BaseBlock } from '../types/lesson';
import { X, Check, Target, Zap, Flame } from 'lucide-react';
import { useCourseSound } from '../hooks/useCourseSound';
import { useProgress } from '../hooks/useProgress';
import { trackEvent } from '../lib/mixpanel';
import { useAuth } from '../hooks/useAuth';

interface Props {
  onNavigate: (screen: ScreenType, params?: Record<string, any>) => void;
  onBack?: () => void;
  params?: Record<string, any>;
}

export default function InteractiveLesson({ onNavigate, onBack, params }: Props) {
  const { user } = useAuth();
  const { markLessonCompleted, markStreakToday, streakDates } = useProgress();
  const courseId = params?.courseId;
  const course = (coursesData.find(c => c.course_id === courseId) || coursesData[0]) as unknown as Course;
  
  const lessonId = params?.lessonId;
  const allLessons = course?.units.flatMap(u => u.lessons) || [];
  const activeAllIndex = allLessons.findIndex(l => l.lesson_id.toString() === lessonId);
  const lesson = activeAllIndex !== -1 ? allLessons[activeAllIndex] : allLessons[0];
  const actualTargetLessonId = lesson?.lesson_id.toString() || "";

  useEffect(() => {
    if (lesson) {
      trackEvent('Lesson Started', { 
        lessonId: lesson.lesson_id, 
        lessonTitle: lesson.title,
        courseId: course?.course_id,
        userId: user?.uid
      });
    }
  }, [lesson?.lesson_id, user?.uid]);

  const steps = lesson?.blocks || [];
  const { preload, play } = useCourseSound();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [canContinue, setCanContinue] = useState(false);
  const [companionMessage, setCompanionMessage] = useState<string | null>(null);
  const [companionMood, setCompanionMood] = useState<'neutral'|'curious'|'encouraging'|'teaching'|'happy'|'celebrating'|'thinking'|'idle'>('idle');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showStreak, setShowStreak] = useState(false);

  const currentStep = steps[currentStepIndex];
  const progressPercent = steps.length > 0 ? ((currentStepIndex) / steps.length) * 100 : 0;

  useEffect(() => {
    preload();
  }, [preload]);

  useEffect(() => {
    // Reset state on step change
    setCanContinue(false);
    setIsPlayingAudio(false);
    
    // Automatically allow continuing for non-interactive steps
    if (['story', 'text', 'tip', 'image'].includes(currentStep?.type)) {
      setCompanionMood('teaching');
      setCompanionMessage(currentStep?.type === 'tip' ? "Chukua dokezo hili!" : null);
      setCanContinue(true);
    } else {
      setCompanionMood('idle');
      setCompanionMessage("Soma kwa makini, kisha fanya uamuzi.");
    }

    // Play step specific audio if available
    const baseStep = currentStep as BaseBlock | undefined;
    if (baseStep?.audio) {
       const audio = new Audio(baseStep.audio);
       audioRef.current = audio;

       audio.addEventListener('play', () => setIsPlayingAudio(true));
       audio.addEventListener('pause', () => setIsPlayingAudio(false));
       audio.addEventListener('ended', () => setIsPlayingAudio(false));

       const playPromise = audio.play();
       if (playPromise !== undefined) {
         playPromise.catch(e => {
           if (e.name !== 'AbortError' && e.name !== 'NotSupportedError') {
             console.error("Audio play failed:", e);
           }
         });
       }
    }

    // Cleanup audio when moving to the next step or unmounting
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
    };
  }, [currentStepIndex, currentStep]);

  const handleSetFeedback = (message: string, mood: any) => {
    setCompanionMessage(message);
    setCompanionMood(mood);
  };

  const handleToggleAudio = () => {
    if (audioRef.current) {
      if (isPlayingAudio) {
        audioRef.current.pause();
      } else {
        if (audioRef.current.currentTime >= audioRef.current.duration) {
          audioRef.current.currentTime = 0;
        }
        audioRef.current.play().catch(console.error);
      }
    }
  };

  const handleNext = () => {
    if (!canContinue) return;
    
    if (typeof window !== 'undefined' && window.navigator.vibrate) {
      window.navigator.vibrate(50); // Small haptic feedback for button press
    }
    
    // Immediately stop audio when user clicks Continue
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }

    setCanContinue(false);
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      play('complete');
      setShowSuccess(true);
      setCanContinue(true); // Allow continuing past the success screen
    }
  };

  const handleComplete = () => {
    if (!showStreak) {
      // Record today as completed for streak tracking
      markStreakToday();

      setShowStreak(true);
      return;
    }

    markLessonCompleted(actualTargetLessonId);

    // Always navigate back to the course map to show topic progression
    onBack ? onBack() : onNavigate('course', { courseId: course?.course_id });
  };

  if (!lesson || steps.length === 0) {
    return (
      <div className="bg-white min-h-[100dvh] flex flex-col items-center justify-center p-6 text-center font-sans">
        <h2 className="text-xl font-bold font-display tracking-tight text-black mb-4">Module not ready</h2>
        <p className="text-gray-500 mb-8 max-w-sm">This module hasn't been upgraded to the new interactive format yet.</p>
        <button 
          onClick={() => onBack ? onBack() : onNavigate('course', { courseId: course?.course_id })} 
          className="bg-black text-white px-8 py-3 rounded-full font-bold uppercase tracking-wider text-sm hover:scale-105 transition-transform"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (showStreak) {
    const swahiliDays = ['J3', 'J4', 'J5', 'Alh', 'Ij', 'Jm', 'Jp'];
    
    // Calculate dates for the current week (Monday to Sunday)
    const todayDate = new Date();
    const dayOfWeek = todayDate.getDay();
    const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    
    const weekDates = swahiliDays.map((_, i) => {
      const d = new Date(todayDate);
      d.setDate(todayDate.getDate() - daysSinceMonday + i);
      return d.toISOString().split('T')[0];
    });

    // Also get the today index for highlighting
    const todayDateString = todayDate.toISOString().split('T')[0];

    return (
      <div className="bg-[#131f24] min-h-[100dvh] text-white flex flex-col font-sans select-none overflow-hidden relative">
        <div className="flex-1 flex flex-col items-center justify-center w-full px-6 pt-4 pb-32 md:max-w-2xl md:mx-auto">
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            className="bg-[#2a3942] rounded-2xl p-4 text-[17px] leading-snug text-white font-medium relative mb-12 shadow-lg max-w-[250px] text-center"
          >
            {/* Speech Bubble Tail */}
            <div className="absolute right-[40px] -bottom-[8px] w-4 h-4 bg-[#2a3942] transform rotate-45 rounded-sm" />
            Moto wako unaweza kuzima ukiruka siku.
          </motion.div>

          {/* Flame + Companion illustration */}
          <div className="relative mb-16 flex items-end justify-center h-48 w-48">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="absolute left-4 top-0"
            >
              <Flame size={120} className="text-[#ff9600] fill-[#ff9600] drop-shadow-2xl" />
            </motion.div>
            
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4, type: 'spring' }}
              className="z-10 bg-transparent w-36 h-36 relative right-[-20px] bottom-[-10px]"
            >
              <img 
                src="https://i.postimg.cc/wM0FjxYS/1778583983007-removebg-preview.png" 
                alt="Companion" 
                className="w-full h-full object-contain filter drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]" 
              />
            </motion.div>
          </div>

          <div className="flex items-center justify-center gap-3 w-full">
            {swahiliDays.map((day, idx) => {
              const dateString = weekDates[idx];
              const isToday = dateString === todayDateString;
              const isFilled = streakDates.includes(dateString); 
              
              return (
                <div key={day} className="flex flex-col items-center gap-2">
                  <span className={`text-[13px] font-bold ${isFilled || isToday ? 'text-[#ff9600]' : 'text-[#4b5563]'}`}>{day}</span>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6 + (idx * 0.1), type: 'spring' }}
                    className={`w-9 h-9 rounded-full flex items-center justify-center ${
                      isFilled ? 'bg-[#ff9600]' : isToday ? 'bg-transparent border-[2px] border-[#ff9600]' : 'bg-transparent border-[2px] border-[#37464f]'
                    }`}
                  >
                    {isFilled && <Check size={20} className="text-[#131f24]" strokeWidth={3} />}
                  </motion.div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Fixed Bottom Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 p-4 border-t-2 border-[#37464f] bg-[#131f24] z-40 flex justify-center">
          <div className="w-full max-w-2xl px-2">
            <button
              onClick={handleComplete}
              className={`w-full py-4 rounded-xl font-bold uppercase tracking-wider text-[16px] transition-all flex items-center justify-center gap-2 border-[3px] active:border-b-0 active:translate-y-1 bg-[#2b90fb] border-[#1875d6] text-white hover:bg-[#2083eb] border-b-4`}
            >
              Maliza Somo
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showSuccess && !showStreak) {
    return (
      <div className="bg-[#131f24] min-h-[100dvh] text-white flex flex-col font-sans select-none overflow-hidden relative">
        <div className="flex-1 flex flex-col items-center justify-center w-full px-6 pt-4 pb-32 md:max-w-2xl md:mx-auto">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', delay: 0.2, bounce: 0.5 }}
            className="w-40 h-40 mb-8"
          >
            <img src="https://i.postimg.cc/wM0FjxYS/1778583983007-removebg-preview.png" alt="Ujuzi Companion" className="w-full h-full object-contain drop-shadow-xl" />
          </motion.div>

          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-[32px] font-bold text-[#ffc800] tracking-tight mb-2 text-center"
          >
            Somo limekamilika!
          </motion.h2>

          <div className="flex gap-4 mt-8 w-full max-w-sm">
            <motion.div 
               initial={{ y: 20, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               transition={{ delay: 0.6 }}
               className="bg-[#ffc800]/10 border-2 border-[#ffc800] rounded-2xl p-4 flex-1 flex flex-col items-center justify-center gap-1"
            >
               <div className="flex items-center gap-2 text-[#ffc800] font-bold text-xl">
                 <Zap className="w-5 h-5 fill-current" /> 10
               </div>
               <span className="text-[#ffc800]/80 text-[11px] font-bold uppercase tracking-wider">XP Imepatikana</span>
            </motion.div>

            <motion.div 
               initial={{ y: 20, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               transition={{ delay: 0.8 }}
               className="bg-[#58cc02]/10 border-2 border-[#58cc02] rounded-2xl p-4 flex-1 flex flex-col items-center justify-center gap-1"
            >
               <div className="flex items-center gap-2 text-[#58cc02] font-bold text-xl">
                 <Target className="w-5 h-5" /> 100%
               </div>
               <span className="text-[#58cc02]/80 text-[11px] font-bold uppercase tracking-wider">Usahihi</span>
            </motion.div>
          </div>
        </div>

        {/* Fixed Bottom Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 p-4 border-t-2 border-[#37464f] bg-[#131f24] z-40 flex justify-center">
          <div className="w-full max-w-2xl px-2">
            <button
              onClick={handleComplete}
              className={`w-full py-4 rounded-xl font-bold uppercase tracking-wider text-[16px] transition-all flex items-center justify-center gap-2 border-[3px] active:border-b-0 active:translate-y-1 bg-[#58cc02] border-[#58a700] text-white hover:bg-[#46a302] border-b-4`}
            >
              Endelea
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#131f24] min-h-[100dvh] text-white flex flex-col font-sans select-none overflow-hidden relative">
      
      {/* App Bar / Progress */}
      <div className="pt-6 pb-4 px-6 flex items-center gap-6 bg-[#131f24] sticky top-0 z-50 md:max-w-2xl md:mx-auto md:w-full">
        <button 
          onClick={() => onBack ? onBack() : onNavigate('course', { courseId: course?.course_id })}
          className="w-10 h-10 flex flex-col items-center justify-center text-gray-400 hover:text-white rounded-full transition-colors shrink-0"
        >
          <X className="w-6 h-6" strokeWidth={2.5} />
        </button>
        <div className="flex-1 h-3.5 bg-[#37464f] rounded-full overflow-hidden relative">
          <motion.div 
            className="absolute top-0 left-0 bottom-0 bg-[#ffc800] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          />
        </div>
        <div className="w-10 shrink-0" />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center overflow-y-auto w-full px-4 pt-4 pb-32 md:max-w-2xl md:mx-auto">
        
        {/* Companion Area */}
        {companionMessage && (
          <div className="w-full flex items-center justify-start gap-4 mb-6">
            <motion.div
              animate={{ y: [0, -2, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="shrink-0 relative"
            >
              <img 
                src="https://i.postimg.cc/wM0FjxYS/1778583983007-removebg-preview.png" 
                alt="Ujuzi Companion" 
                className="w-28 h-28 md:w-32 md:h-32 object-contain drop-shadow-md z-10 relative" 
              />
            </motion.div>
            <AnimatePresence mode="wait">
              <motion.div
                key={companionMessage}
                initial={{ opacity: 0, scale: 0.9, x: -10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: -10 }}
                className="bg-transparent border-[2.5px] border-[#37464f] rounded-3xl p-4 text-[17px] leading-snug text-white font-medium relative max-w-[65%]"
              >
                {/* Speech Bubble Tail */}
                <div className="absolute -left-[10px] top-[45%] -translate-y-1/2 w-4 h-4 bg-[#131f24] border-l-[2.5px] border-b-[2.5px] border-[#37464f] transform rotate-45 rounded-sm" />
                {companionMessage}
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        <div className="w-full flex-1 relative px-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStepIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="h-full w-full"
            >
              {currentStep && (
                <StepRenderer 
                  key={currentStepIndex}
                  step={currentStep} 
                  canContinue={canContinue}
                  setCanContinue={setCanContinue}
                  onContinue={handleNext}
                  setCompanionFeedback={handleSetFeedback}
                  playSound={play}
                  isPlayingAudio={isPlayingAudio}
                  onToggleAudio={handleToggleAudio}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 border-t-2 border-[#37464f] bg-[#131f24] z-40 flex justify-center">
        <div className="w-full max-w-2xl px-2">
          <button
            onClick={handleNext}
            disabled={!canContinue}
            className={`w-full py-4 rounded-xl font-bold uppercase tracking-wider text-[16px] transition-all flex items-center justify-center gap-2 border-[3px] active:border-b-0 active:translate-y-1 ${
              canContinue 
                ? 'bg-[#e5e5ea] border-[#c7c7cc] text-gray-900 border-b-4 hover:bg-white' 
                : 'bg-[#37464f] border-[#253239] text-[#718591] border-b-4 cursor-not-allowed'
            }`}
          >
            {currentStepIndex === steps.length - 1 ? (
               <>Kamilisha Somo <Check className="w-5 h-5 ml-1" strokeWidth={3} /></>
            ) : (
               'Endelea'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
