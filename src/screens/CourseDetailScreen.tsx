import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Check, Lock, Play } from 'lucide-react';
import { ScreenType } from '../App';
import coursesData from '../data/courses.json';
import { Course } from '../types/lesson';
import { useAuth } from '../hooks/useAuth';
import { useProgress } from '../hooks/useProgress';
import { trackEvent } from '../lib/mixpanel';

interface Props {
  onNavigate: (screen: ScreenType, params?: Record<string, any>) => void;
  onBack?: () => void;
  params?: Record<string, any>;
}

export default function CourseDetailScreen({ onNavigate, onBack, params }: Props) {
  const { user, linkAccount } = useAuth();
  const { completedLessons } = useProgress();
  
  // Try to find course from params, otherwise default to first course
  const course = (params?.courseId 
    ? coursesData.find(c => c.course_id === params.courseId) || coursesData[0]
    : coursesData[0]) as unknown as Course;

  useEffect(() => {
    if (course) {
      trackEvent('Course Viewed', { 
        courseId: course.course_id, 
        courseTitle: course.course_title,
        userId: user?.uid
      });
    }
  }, [course?.course_id, user?.uid]);

  const getStatus = (lessonId: string, prevLessonId: string | null) => {
    const isCompleted = completedLessons.includes(lessonId);
    const isNextToBeDone = !isCompleted && 
      (prevLessonId === null || completedLessons.includes(prevLessonId));
    
    if (isCompleted) return 'completed';
    if (isNextToBeDone) return 'active';
    return 'locked';
  };

  if (!course) {
    return <div>Course not found</div>;
  }

  // Flatten lessons to track previous lesson
  const allLessons = course.units.flatMap(u => u.lessons);
  const showAuthPrompt = completedLessons.length >= 3 && (!user || user.isAnonymous);

  return (
    <div className="flex-1 flex flex-col bg-[#ececf0] text-black h-full overflow-hidden relative">
      <div className="flex-1 overflow-y-auto w-full">
        {/* Top Nav */}
        <div className="flex items-center p-6 sticky top-0 z-40 bg-[#ececf0]/90 backdrop-blur-md">
          <button 
            onClick={() => onBack ? onBack() : onNavigate('home')}
            className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center shrink-0 shadow-lg hover:scale-105 transition-transform"
            aria-label="Rudi nyuma (Go back)"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1 text-center font-bold text-xl tracking-tight pr-12 line-clamp-1">
            {course.course_title}
          </div>
        </div>

        <div className="px-6 py-4 relative flex-1 pb-32">
          {/* Timeline Path Line */}
          <div className="absolute left-[54px] top-6 bottom-10 w-0 border-l-[3px] border-[#d5d5d8] border-dotted z-0" />

          <div className="flex flex-col gap-8 relative z-10">
            {course.units.map((unit, unitIdx) => (
              <div key={unit.unit_id} className="mb-8">
                  <div className="flex items-center gap-4 mb-8 bg-[#ececf0] py-2 relative z-10">
                    <div className="w-[60px] h-[60px] rounded-2xl bg-white border-2 border-gray-200 flex flex-shrink-0 items-center justify-center text-3xl shadow-sm z-10 overflow-hidden">
                        {unit.unit_icon}
                    </div>
                    <div className="flex-1">
                      <div className="text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-0.5">Mada {unitIdx + 1}</div>
                      <h2 className="font-bold text-[18px] leading-tight text-gray-900">{unit.unit_title}</h2>
                    </div>
                  </div>

                  <div className="flex flex-col gap-6 pl-4">
                    {unit.lessons.map((lesson, localIdx) => {
                        const allIdx = allLessons.findIndex(l => l.lesson_id === lesson.lesson_id);
                        const prevLessonId = allIdx > 0 ? allLessons[allIdx - 1].lesson_id.toString() : null;
                        const status = getStatus(lesson.lesson_id.toString(), prevLessonId);
                        const isCompleted = status === 'completed';
                        const isActive = status === 'active';
                        const isLocked = status === 'locked';

                        return (
                          <motion.div 
                            key={lesson.lesson_id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: allIdx * 0.1 }}
                            className="flex items-start gap-4 relative"
                          >
                            {/* Node Icon */}
                            <div 
                              className={`w-[60px] h-[60px] rounded-full flex items-center justify-center shrink-0 z-10 transition-transform ${
                                isActive ? 'scale-110 shadow-lg border-2 border-black bg-white text-black' : 
                                isCompleted ? 'bg-black text-white shadow-xl' :
                                'bg-[#e2e2e7] text-[#a1a1a8]'
                              }`}
                            >
                              {isCompleted && <Check className="w-7 h-7" strokeWidth={3} />}
                              {isActive && <Play className="w-6 h-6 ml-1" strokeWidth={2.5} />}
                              {isLocked && <Lock className="w-6 h-6" />}
                            </div>

                            {/* Node Content */}
                            <div 
                              onClick={() => {
                                if (isCompleted || isActive) {
                                  onNavigate('lesson', { lessonId: lesson.lesson_id.toString(), courseId: course.course_id });
                                }
                              }}
                              onKeyDown={(e) => {
                                if ((e.key === 'Enter' || e.key === ' ') && (isCompleted || isActive)) {
                                  e.preventDefault();
                                  onNavigate('lesson', { lessonId: lesson.lesson_id.toString(), courseId: course.course_id });
                                }
                              }}
                              role={isCompleted || isActive ? "button" : "presentation"}
                              tabIndex={isCompleted || isActive ? 0 : -1}
                              aria-label={isCompleted || isActive ? `Somo: ${lesson.title}` : undefined}
                              className={`flex-1 rounded-[1.75rem] p-6 shadow-sm ${
                                isActive 
                                  ? 'bg-black text-white shadow-2xl cursor-pointer hover:scale-[1.02] transition-transform' 
                                  : isCompleted 
                                    ? 'bg-white text-black shadow-md cursor-pointer hover:bg-gray-50 transition-colors' 
                                    : 'bg-[#f4f4f6] text-[#b0b0b8] opacity-80 pointer-events-none'
                              }`}
                            >
                              <div className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-2 ${isActive ? 'text-gray-400' : isCompleted ? 'text-gray-500' : 'text-[#c6c6cc]'}`}>
                                Somo {allIdx + 1}
                              </div>
                              <h3 className={`font-display font-semibold text-[1.15rem] leading-tight ${isActive ? 'text-white' : isCompleted ? 'text-black' : 'text-[#a1a1a8]'}`}>
                                {lesson.title}
                              </h3>
                              <div className={`text-xs mt-2 ${isActive ? 'text-gray-300' : 'text-gray-500'}`}>
                                + {lesson.xp} XP • {lesson.duration_min} min
                              </div>
                              
                              {isActive && (
                                <span 
                                  className="mt-6 bg-white text-black px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest w-fit flex items-center gap-2 hover:bg-gray-200 transition-colors"
                                  aria-hidden="true"
                                >
                                  {localIdx === 0 ? (unitIdx === 0 ? 'ANZA MADA 1' : `ENDELEA: MADA ${unitIdx + 1}`) : 'ENDELEA'} <ArrowLeft className="w-4 h-4 rotate-180" strokeWidth={2.5} />
                                </span>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                  </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Amazing Notification Card for Google Auth */}
      <AnimatePresence>
        {showAuthPrompt && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', bounce: 0.3 }}
            className="absolute bottom-4 left-4 right-4 bg-white rounded-3xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.15)] z-50 border border-gray-100"
          >
            <div className="flex flex-col gap-4 text-center">
              <div className="bg-blue-50 w-16 h-16 rounded-full flex justify-center items-center mx-auto mb-1">
                <span className="text-3xl">🎉</span>
              </div>
              <h3 className="text-xl font-bold font-display text-gray-900 leading-tight">Umefanya vyema sana!</h3>
              <p className="text-gray-600 text-sm leading-relaxed px-2">
                Hifadhi rekodi zako na maendeleo yako bure ili usiweze kuvipoteza. Bofya hapa chini kujiunga na Google.
              </p>
              <button 
                onClick={linkAccount}
                className="mt-2 w-full bg-black text-white font-bold py-3.5 rounded-full shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-3"
              >
                Hifadhi Maendeleo Yako
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

