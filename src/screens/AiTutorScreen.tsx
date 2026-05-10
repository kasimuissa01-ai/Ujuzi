import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Sparkles, Send, Bot, Loader2, CheckCircle2, BookOpen, Database } from 'lucide-react';
import { ScreenType } from '../App';
import { chatWithTutor } from '../lib/ai';
import TypewriterMarkdown from '../components/TypewriterMarkdown';
import courseData from '../data/saikolojia-ya-wateja.json';

interface Props {
  onNavigate: (screen: ScreenType) => void;
  onBack?: () => void;
}

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

export default function AiTutorScreen({ onNavigate, onBack }: Props) {
  const [messages, setMessages] = useState<{role: string, content: string}[]>([
    { role: 'assistant', content: 'Habari Baraka! Mimi ni Mama Maarifa. Ungependa kujifunza nini leo kuhusu Biashara au Teknolojia?' }
  ]);
  const [input, setInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const [typingIndex, setTypingIndex] = useState<number | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isChatting]);

  const handleSend = async () => {
    if (!input.trim() || isChatting) return;
    
    const userMsg = input.trim();
    setInput('');
    
    const updatedHistory = [...messages, { role: 'user', content: userMsg }];
    setMessages(updatedHistory);
    setIsChatting(true);
    
    const globalCourseContext = `
      Course Title: ${courseData.course_title}
      Description: ${courseData.course_description}
      Modules Summary: ${courseData.modules.map(m => m.title).join(', ')}
    `;

    try {
      const resp = await chatWithTutor(updatedHistory, userMsg, "Msaada Mkuu na Maswali Mengi (Mama Maarifa AI)", globalCourseContext);
      setMessages(prev => {
        setTypingIndex(prev.length);
        return [...prev, { role: 'assistant', content: resp }];
      });
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Samahani, network ina shida kidogo. Jaribu tena.' }]);
    } finally {
      setIsChatting(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
  };

  const prompts = [
    "Ni nini 'Sales Psychology'?",
    "Kupata wateja wa kwanza mtandaoni",
    "Mbinu za kuweka bei"
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#ececf0] h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white/80 backdrop-blur-md border-b border-gray-200 z-10 shrink-0">
        <button 
          onClick={() => onBack ? onBack() : onNavigate('home')}
          className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center shrink-0">
             <Bot className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg">Mama Maarifa</span>
        </div>
        <div className="w-10 h-10" /> {/* Spacer */}
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto w-full p-4 sm:p-6 flex flex-col gap-6 custom-scrollbar">
        {messages.map((msg, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
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
          </motion.div>
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
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200 shrink-0 mb-4 sm:mb-0">
        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
          {prompts.map((prompt, i) => (
            <button 
              key={i}
              onClick={() => handleQuickPrompt(prompt)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold shrink-0 hover:bg-gray-200 transition-colors border border-gray-200"
            >
              {prompt}
            </button>
          ))}
        </div>
        <div className="relative flex items-center">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isChatting}
            placeholder="Uliza swali lolote..."
            className="w-full bg-[#f4f4f6] text-black border-none rounded-full py-4 pl-6 pr-14 text-sm focus:ring-2 focus:ring-black outline-none"
          />
          <button 
            onClick={handleSend}
            disabled={isChatting || !input.trim()}
            className={`absolute right-2 w-10 h-10 rounded-full flex items-center justify-center text-white transition-all ${
              isChatting || !input.trim() ? 'bg-gray-300' : 'bg-black hover:scale-105'
            }`}
          >
            <Send className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
