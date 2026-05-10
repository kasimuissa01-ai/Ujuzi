import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, CheckCircle2, Sparkles, PenTool, Lightbulb, ArrowRight, Bot, Send, Loader2, X, BookOpen, Database } from 'lucide-react';
import { ScreenType } from '../App';
import courseData from '../data/saikolojia-ya-wateja.json';
import { generateLessonContent, chatWithTutor } from '../lib/ai';
import { getLessonContent, saveLessonContent } from '../lib/supabase';
import TypewriterMarkdown from '../components/TypewriterMarkdown';
import Markdown from 'react-markdown';

interface Props {
  onNavigate: (screen: ScreenType, params?: Record<string, any>) => void;
  onBack?: () => void;
  params?: Record<string, any>;
}

export default function LessonDetailScreen({ onNavigate, onBack, params }: Props) {
  const lessonId = params?.lessonId;
  const lessonIndex = parseInt(lessonId, 10);
  const lesson = courseData.modules[lessonIndex];
  
  const [completed, setCompleted] = useState(false);
  const [lessonContent, setLessonContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // AI Tutor State
  const [showTutor, setShowTutor] = useState(false);
  const [chatMessages, setChatMessages] = useState<{role: string, content: string}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const [typingIndex, setTypingIndex] = useState<number | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check completion status
    const saved = localStorage.getItem('ujuzi_completed_lessons');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.includes(lessonId)) {
        setCompleted(true);
      }
    }
    
    // Load or generate content
    const generate = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use cached content if available to save tokens
        const cacheKey = `ujuzi_lesson_${lessonId}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          setLessonContent(cached);
          setLoading(false);
          return;
        }

        // Check Supabase first
        const globalId = `saikolojia-ya-wateja-${lessonId}`;
        const remoteContent = await getLessonContent(globalId);
        if (remoteContent) {
          setLessonContent(remoteContent);
          localStorage.setItem(cacheKey, remoteContent); // update local cache
          setLoading(false);
          return;
        }

        const content = await generateLessonContent(lesson);
        setLessonContent(content);
        localStorage.setItem(cacheKey, content);
        
        // Save to Supabase in background
        saveLessonContent(globalId, content).catch(e => console.error("Could not save to Supabase", e));
      } catch (err: any) {
        console.error("AI Generation Error", err);
        setError(err.message || 'Kuna tatizo limejitokeza wakati wa kuandaa somo.');
      } finally {
        setLoading(false);
      }
    };
    
    // reset state when lesson changes
    setLessonContent(null);
    setShowTutor(false);
    setChatMessages([
      { role: 'assistant', content: `Habari! Mimi ni Mama Maarifa. Je, una swali gani kuhusu mada ya leo: "${lesson?.title}"?` }
    ]);
    
    if (lesson) generate();
  }, [lessonId, lesson]);

  useEffect(() => {
    if (showTutor && chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, showTutor]);

  const handleComplete = () => {
    const saved = localStorage.getItem('ujuzi_completed_lessons');
    let parsed: string[] = saved ? JSON.parse(saved) : [];
    
    if (!parsed.includes(lessonId)) {
      parsed.push(lessonId);
      localStorage.setItem('ujuzi_completed_lessons', JSON.stringify(parsed));
      setCompleted(true);
    }

    // Go to next lesson or back to course
    if (lessonIndex < courseData.modules.length - 1) {
      setTimeout(() => {
        onNavigate('lesson', { lessonId: (lessonIndex + 1).toString() });
      }, 600);
    } else {
      setTimeout(() => {
        onBack ? onBack() : onNavigate('course');
      }, 600);
    }
  };

  const handleSendChat = async () => {
    if (!chatInput.trim() || isChatting) return;
    
    const userMsg = chatInput.trim();
    setChatInput('');
    const updatedHistory = [...chatMessages, { role: 'user', content: userMsg }];
    setChatMessages(updatedHistory);
    setIsChatting(true);

    try {
      const resp = await chatWithTutor(updatedHistory, userMsg, lesson.title, lessonContent || "");
      setChatMessages(prev => {
        setTypingIndex(prev.length);
        return [...prev, { role: 'assistant', content: resp }];
      });
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Samahani, network ina shida kidogo. Jaribu tena.' }]);
    } finally {
      setIsChatting(false);
    }
  };

  // Thinking Animation Component
  const ThinkingIndicator = () => {
    const [step, setStep] = useState(0);
    const [time, setTime] = useState(0.0);
    
    const steps = [
      "Inasoma swali...", 
      "Inatafuta kwenye muongozo wa kozi...", 
      "Inachambua data halisi za soko...", 
      "Inaandaa majibu kamili..."
    ];
    
    useEffect(() => {
      const timer = setInterval(() => setTime(t => t + 0.1), 100);
      return () => clearInterval(timer);
    }, []);

    useEffect(() => {
      const stepTimer = setInterval(() => setStep(s => Math.min(s + 1, steps.length - 1)), 1500);
      return () => clearInterval(stepTimer);
    }, []);

    return (
      <motion.div 
        initial={{ opacity: 0, y: 5 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="w-full max-w-2xl py-2"
      >
        <div className="flex items-center justify-between mb-3 text-gray-500">
           <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs font-bold font-display">Mama Maarifa inafikiria...</span>
           </div>
           <div className="text-[10px] font-mono font-bold">
              {time.toFixed(1)}s
           </div>
        </div>
        
        <div className="space-y-1.5 mb-2 pl-6 border-l-2 border-gray-200 ml-2">
          {steps.map((text, idx) => (
             <div key={idx} className={`flex items-center gap-2.5 text-xs transition-all duration-300 ${idx === step ? 'text-gray-800 font-medium' : idx < step ? 'text-gray-400' : 'hidden'}`}>
                {idx < step ? (
                  <CheckCircle2 className="w-3 h-3" />
                ) : (
                  <div className="w-3 h-3 rounded-full border-2 border-gray-200 border-t-black animate-spin shrink-0" />
                )}
                {text}
             </div>
          ))}
        </div>
      </motion.div>
    );
  };

  if (!lesson) {
    return <div className="flex-1 bg-[#ececf0] flex items-center justify-center">Somo halipatikani</div>;
  }

  return (
    <div className="flex-1 flex flex-col bg-[#ececf0] text-black h-full overflow-hidden relative">
      {/* Top Header */}
      <div className="flex justify-between items-center p-6 bg-[#ececf0]/90 backdrop-blur-md sticky top-0 z-40 shrink-0">
        {/* Progress Bar (Global Course Progress) */}
        <div className="absolute top-0 left-0 h-1 bg-black transition-all duration-500 ease-out z-50" style={{ width: `${((lessonIndex + (completed ? 1 : 0)) / courseData.modules.length) * 100}%` }} />
        
        <button 
          onClick={() => onBack ? onBack() : onNavigate('course')}
          className="w-10 h-10 bg-white shadow-sm rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-xs font-bold uppercase tracking-widest text-gray-400">
          Somo la {lessonIndex + 1} la {courseData.modules.length}
        </div>
        <button 
          onClick={() => setShowTutor(true)}
          className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform overflow-hidden relative"
        >
          <Sparkles className="w-4 h-4" />
          <div className="absolute inset-0 bg-white/20 animate-pulse" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col relative z-10 custom-scrollbar">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-display text-4xl font-bold leading-tight mb-8">
            {lesson.title}
          </h1>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500 gap-6">
              <div className="relative">
                 <motion.div 
                   animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }} 
                   transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                   className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full"
                 />
                 <Sparkles className="w-6 h-6 text-black absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div className="flex flex-col items-center gap-2">
                <p className="text-lg font-bold text-black font-display tracking-tight">Tunaandaa Somo Lako</p>
                <p className="text-xs font-medium uppercase tracking-widest text-gray-400">Inachukua sekunde chache...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-6 rounded-2xl flex flex-col items-center gap-4 text-center">
              <p className="font-medium text-sm">{error}</p>
              <button onClick={() => window.location.reload()} className="bg-red-600 text-white px-4 py-2 rounded-full text-xs font-bold uppercase">Jaribu Tena</button>
            </div>
          ) : (
            <div className="prose prose-lg mb-10 text-gray-800 prose-p:leading-relaxed prose-headings:font-display">
               <div className="markdown-body">
                  <Markdown>{lessonContent}</Markdown>
               </div>
            </div>
          )}
        </motion.div>

        {/* Bottom Action */}
        {!loading && !error && (
          <div className="mt-auto pt-8 pb-6">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleComplete}
              className={`w-full py-4 rounded-full flex items-center justify-center gap-3 font-semibold text-lg transition-colors shadow-lg ${
                completed 
                  ? 'bg-[#121212] text-white' 
                  : 'bg-black text-white'
              }`}
            >
              {completed ? (
                <>
                   Somo Limemalizika <CheckCircle2 className="w-5 h-5" />
                </>
              ) : (
                <>
                   Nimemaliza Somo hili <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </div>
        )}
      </div>

      {/* AI Tutor Overlay Modal */}
      <AnimatePresence>
        {showTutor && (
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute inset-0 bg-white z-50 flex flex-col rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)]"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-none mb-1">Mama Maarifa</h3>
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Inasaidia mada ya sasa</p>
                </div>
              </div>
              <button 
                onClick={() => setShowTutor(false)}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto w-full p-4 sm:p-6 flex flex-col gap-6 bg-[#fafafa] custom-scrollbar">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' ? (
                      <div className="flex gap-3 w-full max-w-[90%] sm:max-w-[85%]">
                        <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center shrink-0 mt-1 shadow-sm">
                          <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 text-black">
                          <div className="prose prose-sm max-w-none font-medium leading-relaxed prose-p:mb-2 prose-ul:mb-2 prose-ol:mb-2">
                             <TypewriterMarkdown 
                               text={msg.content} 
                               animate={i === typingIndex} 
                               onComplete={() => setTypingIndex(null)}
                             />
                          </div>
                        </div>
                      </div>
                  ) : (
                      <div className="max-w-[85%] bg-blue-100 text-[#121212] rounded-3xl rounded-tr-sm px-5 py-3 shadow-sm border border-blue-200">
                        <div className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                      </div>
                  )}
                </div>
              ))}
              {isChatting && (
                <div className="flex justify-start w-full">
                  <div className="flex gap-4 w-full">
                    <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center shrink-0 mt-1 shadow-sm">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <ThinkingIndicator />
                  </div>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            <div className="p-4 bg-white border-t border-gray-100 shrink-0 mb-4 sm:mb-0">
              <div className="relative flex items-center w-full">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                  placeholder="Muulize Mama Maarifa swali..."
                  className="w-full bg-[#f4f4f6] text-black border-none rounded-full py-4 pl-6 pr-14 text-sm focus:ring-2 focus:ring-black outline-none"
                  disabled={isChatting}
                />
                <button 
                  onClick={handleSendChat}
                  disabled={isChatting || !chatInput.trim()}
                  className={`absolute right-2 w-10 h-10 rounded-full flex items-center justify-center text-white transition-all ${
                    isChatting || !chatInput.trim() ? 'bg-gray-300' : 'bg-black hover:scale-105'
                  }`}
                >
                  <Send className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

