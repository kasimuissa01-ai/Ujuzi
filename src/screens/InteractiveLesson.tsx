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

  const [steps, setSteps] = useState<any[]>([]);

  useEffect(() => {
    if (lesson?.blocks) {
      setSteps([...lesson.blocks]);
    } else {
      setSteps([]);
    }
  }, [lesson]);

  const [interactiveStepsTotal, setInteractiveStepsTotal] = useState<Set<string>>(new Set());
  const [interactiveStepsFailed, setInteractiveStepsFailed] = useState<Set<string>>(new Set());

  useEffect(() => {
    setInteractiveStepsTotal(new Set());
    setInteractiveStepsFailed(new Set());
  }, [lesson?.lesson_id]);

  const { preload, play } = useCourseSound();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [canContinue, setCanContinue] = useState(false);
  const [companionMessage, setCompanionMessage] = useState<string | null>(null);
  const [companionMood, setCompanionMood] = useState<'neutral'|'curious'|'encouraging'|'teaching'|'happy'|'celebrating'|'thinking'|'idle'>('idle');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showStreak, setShowStreak] = useState(false);

  const startTimeRef = useRef(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (showSuccess && elapsedSeconds === 0) {
      setElapsedSeconds(Math.round((Date.now() - startTimeRef.current) / 1000));
    }
  }, [showSuccess, elapsedSeconds]);

  const formatDuration = (sec: number) => {
    const totalSec = sec || 179; // Fallback to 2:59 if needed
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Duolingo-style feedback overlay states
  const [lastCheckResult, setLastCheckResult] = useState<'correct' | 'wrong' | null>(null);
  const [feedbackHeading, setFeedbackHeading] = useState<string>('');
  const [feedbackText, setFeedbackText] = useState<string>('');

  const PRAISES = [
    "Safi sana! 🎉",
    "Kazi nzuri! ✨",
    "Safi! 🌟",
    "Vizuri mno! 💯",
    "Kanzi nzuri! ✨",
    "Hongera! 🙌"
  ];

  const TRY_AGAIN = [
    "Haikuwa sahihi... 🙁",
    "Sio yenyewe, jaribu tena! 💪",
    "Jaribu tena, unaweza! 💭",
    "Fikiria upya kidogo! 🔍"
  ];

  const currentStep = steps[currentStepIndex];
  const progressPercent = steps.length > 0 ? Math.round((currentStepIndex / steps.length) * 100) : 0;

  // School grading for Tanzanian context
  const totalInt = interactiveStepsTotal.size;
  const failedInt = interactiveStepsFailed.size;
  const firstTryCorrect = Math.max(0, totalInt - failedInt);
  const accuracyPercent = totalInt > 0 ? Math.round((firstTryCorrect / totalInt) * 100) : 100;

  let gradeLetter = 'A';
  let gradeWord = 'Excellent (Kazi Nzuri Mno!)';
  let gradeColor = 'text-[#1cb0f6]'; 
  let gradeBg = 'bg-[#1cb0f6]/10';
  let gradeBorder = 'border-[#1cb0f6]';

  if (accuracyPercent === 100) {
    gradeLetter = 'A+';
    gradeWord = 'Kazi Kuu Kupita Kiasi!';
    gradeColor = 'text-[#1cb0f6]';
    gradeBg = 'bg-[#1cb0f6]/20';
    gradeBorder = 'border-[#1cb0f6]';
  } else if (accuracyPercent >= 80) {
    gradeLetter = 'A';
    gradeWord = 'Kazi Nzuri Mno!';
    gradeColor = 'text-[#1cb0f6] animate-pulse';
    gradeBg = 'bg-[#1cb0f6]/10';
    gradeBorder = 'border-[#1cb0f6]/50';
  } else if (accuracyPercent >= 65) {
    gradeLetter = 'B+';
    gradeWord = 'Safi Sana!';
    gradeColor = 'text-white';
    gradeBg = 'bg-white/10';
    gradeBorder = 'border-white/30';
  } else if (accuracyPercent >= 50) {
    gradeLetter = 'B';
    gradeWord = 'Vizuri!';
    gradeColor = 'text-white/90';
    gradeBg = 'bg-white/5';
    gradeBorder = 'border-white/20';
  } else if (accuracyPercent >= 40) {
    gradeLetter = 'C';
    gradeWord = 'Wastani';
    gradeColor = 'text-gray-300';
    gradeBg = 'bg-[#1c282f]';
    gradeBorder = 'border-white/10';
  } else {
    gradeLetter = 'F';
    gradeWord = 'Fanya Marekebisho';
    gradeColor = 'text-red-500';
    gradeBg = 'bg-red-500/10';
    gradeBorder = 'border-red-500/30';
  }

  useEffect(() => {
    preload();
  }, [preload]);

  useEffect(() => {
    // Reset state on step change
    setCanContinue(false);
    setIsPlayingAudio(false);
    setLastCheckResult(null);
    setFeedbackHeading('');
    setFeedbackText('');
    
    // Automatically allow continuing for non-interactive steps
    if (['story', 'text', 'tip', 'image', 'certificate_unlock'].includes(currentStep?.type)) {
      setCompanionMood('teaching');
      setCompanionMessage(currentStep?.type === 'tip' ? "Chukua dokezo hili!" : (currentStep?.type === 'certificate_unlock' ? "Hongera sana kwa kufika hapa! 🎉" : null));
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
    setFeedbackText(message);
  };

  const handlePlaySound = (name: 'correct' | 'wrong' | 'complete' | 'correct_voice', skipUI?: boolean) => {
    // Play the physical non-voice sound effect
    play(name);

    // Haptic Duolingo vibration triggers
    if (typeof window !== 'undefined' && window.navigator.vibrate) {
      if (name === 'correct' || name === 'correct_voice') {
        window.navigator.vibrate(60);
      } else if (name === 'wrong') {
        window.navigator.vibrate([100, 50, 100]);
      } else if (name === 'complete') {
        window.navigator.vibrate([80, 40, 80, 40, 120]);
      }
    }

    // Step outcome tracking for Tanzania school grading & Duolingo retry flow
    if (currentStep) {
      const stepKey = currentStep.prompt || String(currentStepIndex);
      
      if (name === 'wrong') {
        // Track as failed
        setInteractiveStepsFailed(prev => {
          const next = new Set(prev);
          next.add(stepKey);
          return next;
        });

        // Duolingo mistake recycle mode active! Add a copy of current step to the end of lesson sequence
        setSteps(prev => [...prev, { ...currentStep }]);
      } else if (name === 'correct' || name === 'correct_voice') {
        // Track as answered
        setInteractiveStepsTotal(prev => {
          const next = new Set(prev);
          next.add(stepKey);
          return next;
        });
      }
    }

    // Map sound action to Duolingo result pane states (only if we are NOT skipping UI popups)
    if (!skipUI) {
      if (name === 'correct_voice' || name === 'correct') {
        const idx = Math.floor(Math.random() * PRAISES.length);
        setLastCheckResult('correct');
        setFeedbackHeading(PRAISES[idx]);
      } else if (name === 'wrong') {
        const idx = Math.floor(Math.random() * TRY_AGAIN.length);
        setLastCheckResult('wrong');
        setFeedbackHeading(TRY_AGAIN[idx]);
      }
    }
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
      <div className="bg-[#0b131a] min-h-[100dvh] text-white flex flex-col font-sans select-none overflow-hidden relative">
        <div className="flex-1 flex flex-col items-center justify-center w-full px-6 pt-4 pb-32 md:max-w-2xl md:mx-auto">
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            className="bg-[#16222f] rounded-2xl p-4 text-[17px] leading-snug text-white font-medium relative mb-12 shadow-lg max-w-[250px] text-center"
          >
            {/* Speech Bubble Tail */}
            <div className="absolute right-[40px] -bottom-[8px] w-4 h-4 bg-[#16222f] transform rotate-45 rounded-sm" />
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
                  <span className={`text-[13px] font-bold ${isFilled || isToday ? 'text-[#ff9600]' : 'text-gray-500'}`}>{day}</span>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6 + (idx * 0.1), type: 'spring' }}
                    className={`w-9 h-9 rounded-full flex items-center justify-center ${
                      isFilled ? 'bg-[#ff9600]' : isToday ? 'bg-transparent border-[2px] border-[#ff9600]' : 'bg-transparent border-[2px] border-white/25'
                    }`}
                  >
                    {isFilled && <Check size={20} className="text-[#0b131a]" strokeWidth={3} />}
                  </motion.div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Fixed Bottom Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 p-5 border-t-2 border-white/5 bg-[#0b131a]/90 backdrop-blur-md z-40 flex justify-center shadow-[0_-8px_24px_rgba(0,0,0,0.5)]">
          <div className="w-full max-w-2xl px-2">
            <button
               onClick={handleComplete}
               className="w-full py-4 rounded-xl font-extrabold uppercase tracking-wider text-[16px] transition-all flex items-center justify-center gap-2 bg-[#1cb0f6] border-[#1899d6] border-b-[4px] active:border-b-0 active:translate-y-1 text-white hover:bg-[#20b8fe]"
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
      <div className="bg-[#0b131a] min-h-[100dvh] text-white flex flex-col font-sans select-none overflow-hidden relative">
        <div className="flex-1 flex flex-col items-center justify-center w-full px-6 pt-4 pb-32 md:max-w-2xl md:mx-auto">
          
          <div className="relative w-48 h-48 mb-6 flex items-center justify-center">
            <div className="absolute w-56 h-56 bg-blue-500/10 rounded-full blur-3xl opacity-75 animate-pulse pointer-events-none" />
            
            {/* Sparkling stars in white and blue */}
            <div className="absolute top-2 left-6 text-[#1cb0f6] text-xl font-black animate-pulse">✦</div>
            <div className="absolute top-10 right-4 text-white text-3xl animate-bounce">✦</div>
            <div className="absolute bottom-6 left-2 text-[#1cb0f6] text-2xl animate-spin">✦</div>
            <div className="absolute bottom-2 right-8 text-white text-lg">✦</div>
            
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1, y: [0, -12, 0] }}
              transition={{ type: 'spring', delay: 0.1, bounce: 0.6, y: { repeat: Infinity, duration: 4, ease: "easeInOut" } }}
              className="w-40 h-40"
            >
              <img 
                src="https://fhtnqhkxpvrfzxrwwtso.supabase.co/storage/v1/object/public/Ujuzi_pkus/1778583556967-removebg-preview.png"
                alt="Companion Flying" 
                className="w-full h-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.5)] animate-pulse" 
              />
            </motion.div>
          </div>

          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="text-[32px] md:text-[36px] font-black text-[#1cb0f6] tracking-tight mb-2 text-center leading-tight"
          >
            {accuracyPercent === 100 ? "Upo Vizuri Kupitiliza! 👽" : "Somo Limekamilika! 🎉"}
          </motion.h2>

          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="text-gray-300 text-[16px] md:text-[18px] text-center max-w-sm mb-10 leading-relaxed font-semibold"
          >
            {accuracyPercent === 100 
              ? "Hakuna makosa hata kidogo! Kiwango cha juu sana cha uwezo." 
              : accuracyPercent >= 80 
                ? `Umekosa swali ${failedInt} tu. Umefanya kazi nzuri ya kipekee! ✨`
                : `Usahihi wa ${accuracyPercent}%. Mazoezi yanakufanya uwe bingwa siku hadi siku! 💪`}
          </motion.p>

          {/* Grid representing grades, accuracy and completion parameters */}
          <div className="grid grid-cols-3 gap-3 md:gap-4 w-full max-w-sm md:max-w-md mt-2">
            {/* Block 1: DARAJA / GRADE */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
              className={`flex flex-col bg-[#16222f] border-2 ${gradeBorder} rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(28,176,246,0.15)] select-none`}
            >
              <div className="bg-[#1cb0f6] text-white text-[10px] md:text-[11px] font-black uppercase tracking-wider py-1.5 text-center shrink-0">
                DARAJA
              </div>
              <div className="flex-1 flex flex-col items-center justify-center py-5">
                <div className={`flex items-center gap-1.5 font-black text-3xl md:text-4xl ${gradeColor}`}>
                  <span>{gradeLetter}</span>
                </div>
                <span className="text-gray-400 text-[9px] md:text-[10px] font-extrabold task-subtext mt-1 text-center truncate px-1">
                  {accuracyPercent >= 80 ? "BORA SANA" : accuracyPercent >= 50 ? "VIZURI" : "MAREKEBISHO"}
                </span>
              </div>
            </motion.div>

            {/* Block 2: USAHIHI */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, type: 'spring' }}
              className="flex flex-col bg-[#16222f] border-2 border-white/20 rounded-2xl overflow-hidden select-none"
            >
              <div className="bg-white/10 text-white text-[10px] md:text-[11px] font-black uppercase tracking-wider py-1.5 text-center shrink-0">
                USAHIHI
              </div>
              <div className="flex-1 flex flex-col items-center justify-center py-5">
                <div className="flex items-center gap-1.5 font-black text-2xl md:text-3xl text-white">
                  <span className="text-xl md:text-2xl">🎯</span>
                  <span>{accuracyPercent}%</span>
                </div>
              </div>
            </motion.div>

            {/* Block 3: MUDA */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, type: 'spring' }}
              className="flex flex-col bg-[#16222f] border-2 border-white/20 rounded-2xl overflow-hidden select-none"
            >
              <div className="bg-white/10 text-white text-[10px] md:text-[11px] font-black uppercase tracking-wider py-1.5 text-center shrink-0">
                MUDA
              </div>
              <div className="flex-1 flex flex-col items-center justify-center py-5">
                <div className="flex items-center gap-1.5 font-black text-2xl md:text-3xl text-white">
                  <span className="text-xl md:text-2xl">⏱️</span>
                  <span>{formatDuration(elapsedSeconds)}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Fixed Bottom Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 p-5 bg-[#0b131a]/90 backdrop-blur-md border-t-2 border-white/5 z-40 flex justify-center shadow-[0_-8px_24px_rgba(0,0,0,0.5)]">
          <div className="w-full max-w-2xl px-2 flex gap-3.5 items-center">
            {/* Share custom button styled like visual mockup */}
            <button 
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: 'Ujuzi App Success',
                    text: `Nimekamilisha somo kwa kiwango cha Daraja ${gradeLetter} (${accuracyPercent}% usahihi) kwenye programu ya Ujuzi!`,
                    url: window.location.href,
                  }).catch(console.error);
                } else {
                  alert("Imekopishwa kwenye clipboard! Fungua WhatsApp uwaonyeshe mafanikio yako!");
                }
              }}
              className="p-4 rounded-xl border-2 border-white/10 text-gray-300 bg-[#16222f] hover:bg-[#1e2f3e] active:translate-y-0.5 hover:text-white transition-all shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            </button>
            <button
              onClick={handleComplete}
              className="flex-1 py-4 rounded-xl font-extrabold uppercase tracking-wider text-[16px] transition-all flex items-center justify-center gap-2 bg-[#1cb0f6] border-[#1899d6] border-b-[4px] active:border-b-0 active:translate-y-1 text-white hover:bg-[#20b8fe] shadow-[0_4px_15px_rgba(28,176,246,0.3)]"
            >
              ENDELEA
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0b131a] min-h-[100dvh] text-white flex flex-col font-sans select-none overflow-hidden relative">
      
      {/* App Bar / Progress */}
      <div className="pt-6 pb-4 px-6 flex items-center gap-6 bg-[#0b131a] sticky top-0 z-50 md:max-w-2xl md:mx-auto md:w-full">
        <button 
          onClick={() => onBack ? onBack() : onNavigate('course', { courseId: course?.course_id })}
          className="w-10 h-10 flex flex-col items-center justify-center text-gray-400 hover:text-white rounded-full transition-colors shrink-0"
        >
          <X className="w-6 h-6" strokeWidth={2.5} />
        </button>
        <div className="flex-1 h-3.5 bg-[#16222f] rounded-full overflow-hidden relative">
          <motion.div 
            className="absolute top-0 left-0 bottom-0 bg-[#1cb0f6] rounded-full"
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
                className="bg-transparent border-[2.5px] border-[#16222f] rounded-3xl p-4 text-[17px] leading-snug text-white font-medium relative max-w-[65%]"
              >
                {/* Speech Bubble Tail */}
                <div className="absolute -left-[10px] top-[45%] -translate-y-1/2 w-4 h-4 bg-[#0b131a] border-l-[2.5px] border-b-[2.5px] border-[#16222f] transform rotate-45 rounded-sm" />
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
                  playSound={handlePlaySound}
                  isPlayingAudio={isPlayingAudio}
                  onToggleAudio={handleToggleAudio}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Duolingo style dynamic drawer bottom layout */}
      <AnimatePresence>
        {lastCheckResult === 'correct' && (
          <motion.div
            initial={{ y: 200, opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 200, opacity: 0.5 }}
            transition={{ type: "spring", stiffness: 150, damping: 20 }}
            className="fixed bottom-0 left-0 right-0 border-t-[3px] border-[#1899d6]/30 bg-[#0c1520] p-6 md:p-8 z-50 flex justify-center shadow-[0_-10px_30px_rgba(0,0,0,0.6)]"
          >
            <div className="w-full max-w-2xl px-2 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-14 h-14 rounded-full bg-[#1cb0f6] flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(28,176,246,0.3)] border-[3px] border-white/20">
                  <Check className="w-8 h-8 text-white" strokeWidth={4} />
                </div>
                <div>
                  <h3 className="text-[#1cb0f6] text-2xl font-black tracking-tight">
                    {feedbackHeading || "Safi sana!"}
                  </h3>
                </div>
              </div>
              
              <button
                onClick={handleNext}
                className="md:w-auto w-full py-4 px-12 rounded-xl font-extrabold uppercase tracking-wider text-[16px] transition-all flex items-center justify-center gap-2 bg-[#1cb0f6] border-b-[4px] border-[#1899d6] active:border-b-0 active:translate-y-1 text-white hover:bg-[#20b8fe] shrink-0 shadow-[0_4px_15px_rgba(28,176,246,0.2)]"
              >
                {currentStepIndex === steps.length - 1 ? "Kamilisha" : "Endelea"}
              </button>
            </div>
          </motion.div>
        )}

        {lastCheckResult === 'wrong' && (
          <motion.div
            initial={{ y: 200, opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 200, opacity: 0.5 }}
            transition={{ type: "spring", stiffness: 150, damping: 20 }}
            className="fixed bottom-0 left-0 right-0 border-t-[3px] border-[#4d1f1f] bg-[#221313] p-6 md:p-8 z-50 flex justify-center shadow-[0_-10px_30px_rgba(0,0,0,0.6)]"
          >
            <div className="w-full max-w-2xl px-2 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-14 h-14 rounded-full bg-[#ea2b2b] flex items-center justify-center shrink-0 shadow-[0_4px_10px_rgba(234,43,43,0.3)] border-[3px] border-white/20">
                  <X className="w-8 h-8 text-white" strokeWidth={4} />
                </div>
                <div>
                  <h3 className="text-[#ff4b4b] text-2xl font-black tracking-tight">
                    {feedbackHeading || "Kazi nzuri!"}
                  </h3>
                </div>
              </div>
              
              <button
                onClick={() => setLastCheckResult(null)}
                className="md:w-auto w-full py-4 px-12 rounded-xl font-extrabold uppercase tracking-wider text-[16px] transition-all flex items-center justify-center gap-2 bg-[#ea2b2b] border-b-[4px] border-[#bf2222] active:border-b-0 active:translate-y-1 text-white hover:bg-[#ff3b3b] shrink-0 shadow-[0_4px_15px_rgba(234,43,43,0.2)]"
              >
                Jaribu Tena
              </button>
            </div>
          </motion.div>
        )}

        {lastCheckResult === null && (
          <div className="fixed bottom-0 left-0 right-0 p-5 bg-[#0b131a]/90 backdrop-blur-md border-t-2 border-white/5 z-40 flex justify-center shadow-[0_-8px_24px_rgba(0,0,0,0.5)]">
            <div className="w-full max-w-2xl px-2">
              <button
                onClick={handleNext}
                disabled={!canContinue}
                className={`w-full py-4 rounded-xl font-extrabold uppercase tracking-wider text-[16px] transition-all flex items-center justify-center gap-2 border-b-[4px] active:border-b-0 active:translate-y-1 ${
                  canContinue 
                    ? 'bg-[#1cb0f6] border-[#1899d6] text-white hover:bg-[#20b8fe] shadow-[0_4px_15px_rgba(28,176,246,0.3)]' 
                    : 'bg-[#16222f] border-white/10 text-gray-500 border-b-[4px] cursor-not-allowed clickable-disabled'
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
        )}
      </AnimatePresence>
    </div>
  );
}
