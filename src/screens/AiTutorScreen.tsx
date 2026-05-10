import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Sparkles, Send, Bot } from 'lucide-react';
import { ScreenType } from '../App';

interface Props {
  onNavigate: (screen: ScreenType) => void;
  onBack?: () => void;
}

export default function AiTutorScreen({ onNavigate, onBack }: Props) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Habari Baraka! Mimi ni Mwalimu AI wako. Ungependa kujifunza nini leo kuhusu Biashara au Teknolojia?' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput('');
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Swali zuri sana! "Sales Psychology" ni uwezo wa kuelewa jinsi wateja wanavyofikiri ili uweze kuwauzia kirahisi zaidi. Unataka nikupe mfano halisi sokoni?' 
      }]);
    }, 1500);
  };

  const prompts = [
    "Ni nini 'Sales Psychology'?",
    "Jinsi ya kukuza TikTok?",
    "Kupata wateja wa kwanza"
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
          <span className="font-bold text-lg">Ai Mwalimu</span>
        </div>
        <div className="w-10 h-10" /> {/* Spacer */}
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
        {messages.map((msg, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
               <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center shrink-0 mr-2 mt-1">
                 <Sparkles className="w-3 h-3 text-white" />
               </div>
            )}
            <div className={`max-w-[80%] rounded-[1.5rem] px-5 py-3 ${
              msg.role === 'user' 
                ? 'bg-black text-white rounded-tr-sm' 
                : 'bg-white text-black border border-gray-100 shadow-sm rounded-tl-sm'
            }`}>
              <p className="text-sm leading-relaxed">{msg.content}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200 shrink-0">
        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
          {prompts.map((prompt, i) => (
            <button 
              key={i}
              onClick={() => setInput(prompt)}
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
            placeholder="Uliza swali lolote..."
            className="w-full bg-gray-100 border-none rounded-full py-4 pl-6 pr-14 text-sm focus:ring-2 focus:ring-black outline-none"
          />
          <button 
            onClick={handleSend}
            className="absolute right-2 w-10 h-10 bg-black rounded-full flex items-center justify-center text-white hover:scale-105 transition-transform"
          >
            <Send className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
