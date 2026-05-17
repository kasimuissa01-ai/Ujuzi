import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import Markdown from 'react-markdown';
import { LessonBlock } from '../types/lesson';
import { Check, X, Lightbulb, Volume2, VolumeX } from 'lucide-react';
import DragDropExercise from './DragDropExercise';

import InstaBioExercise from './InstaBioExercise';

interface Props {
  step: LessonBlock;
  onContinue: () => void;
  setCompanionFeedback: (message: string, mood: any) => void;
  canContinue: boolean;
  setCanContinue: (value: boolean) => void;
  playSound: (name: 'correct' | 'wrong' | 'complete' | 'correct_voice') => void;
  isPlayingAudio?: boolean;
  onToggleAudio?: () => void;
}

export default function StepRenderer({ step, onContinue, setCompanionFeedback, canContinue, setCanContinue, playSound, isPlayingAudio, onToggleAudio }: Props) {
  
  const AudioButton = () => {
    if (!(step as any).audio) return null;
    return (
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={(e) => {
          e.stopPropagation();
          onToggleAudio && onToggleAudio();
        }}
        className={`w-14 h-14 shrink-0 flex items-center justify-center rounded-2xl transition-all border-b-[4px] active:border-b-0 active:translate-y-1 ${
          isPlayingAudio 
            ? 'bg-[#1cb0f6] border-[#1899d6] text-white shadow-[0_0_15px_rgba(28,176,246,0.5)]' 
            : 'bg-[#1cb0f6] border-[#1899d6] text-white hover:bg-[#20b8fe]'
        }`}
      >
        {isPlayingAudio ? (
           <motion.div
             animate={{ scale: [1, 1.2, 1] }}
             transition={{ repeat: Infinity, duration: 1 }}
           >
             <Volume2 className="w-8 h-8 drop-shadow-md" />
           </motion.div>
        ) : (
           <Volume2 className="w-8 h-8 drop-shadow-sm" />
        )}
      </motion.button>
    );
  };

  if (step.type === 'story' || step.type === 'text') {
    return (
      <div className="flex flex-col h-full bg-[#131f24] min-h-[50vh] relative pt-2 px-6 pb-4 overflow-visible">
        {/* Animated Background blob */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#1cb0f6]/5 rounded-full blur-3xl pointer-events-none" />
        
        {/* Character Image */}
        <div className="relative z-10 flex flex-col items-center justify-center shrink-0 mb-4 h-[35vh] min-h-[200px]">
          <motion.div
             initial={{ y: 20, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             transition={{ type: 'spring', bounce: 0.6 }}
             className="relative h-full"
          >
            <div className="h-full aspect-square">
               <img 
                 src="https://fhtnqhkxpvrfzxrwwtso.supabase.co/storage/v1/object/public/Ujuzi_pkus/1778583556967-removebg-preview.png"
                 alt="Character"
                 className="w-full h-full object-contain drop-shadow-2xl"
               />
            </div>
            
            {step.type === 'story' && step.character && (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#37464f] border-[2px] border-[#131f24] text-white text-[11px] px-4 py-1 font-bold rounded-full shadow-lg whitespace-nowrap">
                {step.character}
              </div>
            )}
          </motion.div>
        </div>

        {/* Minimalist Info Text */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="relative z-10 w-full flex flex-col gap-4"
        >
          <div className="flex justify-start">
            <AudioButton />
          </div>
          
          <div className="text-[18px] md:text-[20px] leading-relaxed font-medium text-[#d1d5db] whitespace-pre-wrap">
              <Markdown
                components={{
                  p: ({node, ...props}) => <p className="mb-4 last:mb-0 opacity-90" {...props} />,
                  strong: ({node, ...props}) => <strong className="text-white font-extrabold" {...props} />,
                }}
              >
                {step.content}
              </Markdown>
          </div>
        </motion.div>
      </div>
    );
  }

  if (step.type === 'tip') {
    return (
      <div className="flex flex-col space-y-6">
        <div className="bg-[#ffc800]/10 border-[3px] border-[#ffc800]/50 rounded-2xl p-6 flex flex-col gap-4 shadow-sm relative mt-6">
          <div className="absolute -top-7 flex items-center gap-3">
            <div className="bg-[#ffc800] border-[3px] border-[#131f24] w-14 h-14 rounded-full flex items-center justify-center shadow-lg">
              <Lightbulb className="text-yellow-900 w-7 h-7" />
            </div>
            <AudioButton />
          </div>
          <p className="text-[19px] leading-relaxed font-medium text-white mt-4">
            {step.content}
          </p>
        </div>
      </div>
    );
  }
  
  if (step.type === 'image') {
     return (
        <div className="flex flex-col space-y-4">
           <div className="bg-[#1cb0f6]/10 rounded-2xl overflow-hidden shadow-sm border-[3px] border-[#37464f]">
              <img src={step.src} alt={step.caption || ""} className="w-full h-auto object-cover" />
           </div>
           {step.caption && (
              <p className="text-center text-sm font-bold text-gray-400">{step.caption}</p>
           )}
        </div>
     );
  }

  if (step.type === 'image_ab') {
    const [selectedId, setSelectedId] = useState<'A' | 'B' | null>(null);
    const [wrongOptions, setWrongOptions] = useState<string[]>([]);

    const handleSelect = (option: 'A' | 'B') => {
      if (canContinue) return; // Prevent change after success
      setSelectedId(option);
      
      if (option === step.correct) {
        playSound('correct_voice');
        if (typeof window !== 'undefined' && window.navigator.vibrate) {
          window.navigator.vibrate(100);
        }
        setCanContinue(true);
        setCompanionFeedback(step.feedback_correct, "celebrating");
      } else {
        playSound('wrong');
        if (typeof window !== 'undefined' && window.navigator.vibrate) {
          window.navigator.vibrate([100, 50, 100]);
        }
        setWrongOptions(prev => [...prev, option]);
        setCompanionFeedback(step.feedback_wrong, "thinking");
      }
    };

    return (
      <div className="flex flex-col space-y-6 h-full pb-8">
        <div className="flex items-start gap-4">
          <AudioButton />
          <h2 className="text-[20px] font-bold tracking-tight text-white leading-snug mt-1">
            {step.label}
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {(['A', 'B'] as const).map((opt) => {
            const data = opt === 'A' ? step.option_a : step.option_b;
            const isCorrectOption = opt === step.correct;
            const isSelected = selectedId === opt;
            const isWrong = wrongOptions.includes(opt);
            
            let baseBorder = 'border-[#37464f] hover:bg-white/5 border-b-4 bg-[#131f24]';
            let textClass = 'text-white';
            let hasCheck = false;
            let hasWrong = false;

            if (isSelected && isCorrectOption) {
                 baseBorder = 'border-[#58cc02] border-b-[3px] bg-[#58cc02]/10';
                 textClass = 'text-[#58cc02]';
                 hasCheck = true;
            } else if (isWrong) {
                 baseBorder = 'border-[#ea2b2b] border-b-[3px] bg-[#ea2b2b]/10';
                 textClass = 'text-[#ea2b2b]';
                 hasWrong = true;
            } else if (canContinue) {
                 baseBorder = 'border-[#37464f] border-b-[3px] bg-[#131f24] opacity-50';
            }

            return (
              <motion.button
                key={opt}
                whileTap={!canContinue ? { scale: 0.98 } : undefined}
                onClick={() => handleSelect(opt)}
                disabled={canContinue}
                className={`relative flex flex-col overflow-hidden rounded-2xl border-[3px] transition-all p-3 active:translate-y-[1px] active:border-b-[3px] ${baseBorder}`}
                style={
                  (!canContinue && !isSelected && !isWrong) ? { borderBottomWidth: '4px' } : { borderBottomWidth: '3px' }
                }
              >
                <div className="w-full aspect-[4/5] sm:aspect-[3/4] shrink-0 rounded-xl overflow-hidden bg-white relative mb-3">
                  <img src={data.src} alt={data.label} className="w-full h-full object-contain absolute inset-0" />
                </div>
                <div className="w-full text-center flex items-center justify-center">
                  <span className={`text-[17px] font-bold ${textClass}`}>
                    {hasCheck ? '✓ ' : hasWrong ? '✗ ' : ''}
                    {data.label}
                  </span>
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>
    );
  }

  if (step.type === 'fill_blank') {
    const [selectedWords, setSelectedWords] = useState<(string | null)[]>(Array(step.blanks).fill(null));

    const handleSelect = (word: string) => {
      if (canContinue) return;
      const nextEmptyIndex = selectedWords.findIndex(w => w === null);
      if (nextEmptyIndex !== -1) {
        const newSelected = [...selectedWords];
        newSelected[nextEmptyIndex] = word;
        setSelectedWords(newSelected);
        
        // If all blanks filled, assess
        if (!newSelected.includes(null)) {
          const isCorrect = newSelected.every((w, i) => w === step.correct[i]);
          if (isCorrect) {
            playSound('correct_voice');
            if (typeof window !== 'undefined' && window.navigator.vibrate) window.navigator.vibrate(100);
            setCanContinue(true);
            setCompanionFeedback(step.feedback, "celebrating");
          } else {
            playSound('wrong');
            if (typeof window !== 'undefined' && window.navigator.vibrate) window.navigator.vibrate([100, 50, 100]);
            setCompanionFeedback("Kumekuwa na kosa mahali. Fikiria vizuri kisha ujaribu tena.", "curious");
            // Automatically clear after a short delay so they can try again
            setTimeout(() => {
              if (!canContinue) setSelectedWords(Array(step.blanks).fill(null));
            }, 1000);
          }
        }
      }
    };

    const parts = step.sentence.split('___');

    return (
      <div className="flex flex-col h-full space-y-12 pb-8">
         <div className="flex items-start gap-4 mb-2">
           <AudioButton />
           <h2 className="text-[20px] font-bold text-white mt-1">{step.prompt}</h2>
         </div>
        <div className="text-[20px] font-medium tracking-tight text-white leading-relaxed flex flex-wrap gap-x-2 items-center p-2 rounded-2xl">
          {parts.map((part, index) => (
            <span key={index} className="flex flex-wrap gap-x-2 items-center leading-loose">
              <span>{part}</span>
              {index < parts.length - 1 && (
                <span className={`inline-flex items-center justify-center min-w-[100px] h-10 px-4 border-b-2 font-bold mb-1 ${
                   selectedWords[index] 
                   ? (selectedWords[index] === step.correct[index] ? 'border-[#58cc02] text-[#58cc02]' : 'border-[#ea2b2b] text-[#ea2b2b]') 
                   : 'border-[#37464f]'
                }`}>
                  {selectedWords[index] || ""}
                </span>
              )}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 mt-auto justify-center">
          {step.options.map((word) => {
             const isUsed = selectedWords.includes(word);
             return (
               <motion.button
                 key={word}
                 whileTap={!isUsed ? { scale: 0.95 } : undefined}
                 onClick={() => handleSelect(word)}
                 disabled={canContinue || isUsed}
                 className={`px-5 py-3 rounded-xl border-[3px] font-bold text-[17px] transition-all bg-[#131f24] active:translate-y-[1px] ${
                   isUsed
                     ? 'border-[#202f36] text-[#37464f] cursor-not-allowed border-b-[3px]'
                     : 'border-[#37464f] border-b-[4px] hover:bg-white/5 text-white active:border-b-[3px]'
                  }`}
                 style={
                   !isUsed ? { borderBottomWidth: '4px' } : { borderBottomWidth: '3px' }
                 }
               >
                 {word}
               </motion.button>
             )
          })}
        </div>
      </div>
    );
  }

  if (step.type === 'quiz' || step.type === 'scenario') {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [wrongIndices, setWrongIndices] = useState<number[]>([]);

    const handleSelect = (index: number) => {
      if (canContinue) return;
      setSelectedIndex(index);
      if (index === step.correct_index) {
        playSound('correct_voice');
        if (typeof window !== 'undefined' && window.navigator.vibrate) window.navigator.vibrate(100);
        setCanContinue(true);
        setCompanionFeedback(step.feedback, "celebrating");
      } else {
        playSound('wrong');
        if (typeof window !== 'undefined' && window.navigator.vibrate) window.navigator.vibrate([100, 50, 100]);
        setWrongIndices(prev => [...prev, index]);
        setCompanionFeedback("Sio sahihi! Umechagua jibu ambalo si sahihi. Fikiria kwa makini kisha ujaribu tena.", "thinking");
      }
    };

    return (
      <div className="flex flex-col space-y-8 h-full pb-8">
        <div className="flex items-start gap-4">
          <AudioButton />
          <h2 className="text-[20px] font-bold tracking-tight text-white leading-snug mt-1">
            {step.type === 'scenario' ? step.label : step.question}
          </h2>
        </div>
        
        {step.type === 'scenario' && step.chat && step.chat.length > 0 && (
           <div className="bg-[#202f36] rounded-2xl p-4 flex flex-col gap-3">
              <span className="text-xs font-bold uppercase text-gray-400">{step.setup}</span>
              {step.chat.map((msg, i) => (
                 <div key={i} className={`flex ${msg.side === 'left' ? 'justify-start' : 'justify-end'}`}>
                    <div className={`px-4 py-3 max-w-[85%] rounded-2xl text-[17px] ${
                       msg.side === 'left' ? 'bg-[#37464f] text-white rounded-tl-sm' : 'bg-[#58cc02] text-white rounded-tr-sm'
                    }`}>
                       <span className="text-[11px] font-bold block mb-1 opacity-60 uppercase">{msg.speaker}</span>
                       {msg.text}
                    </div>
                 </div>
              ))}
           </div>
        )}

        <div className="flex flex-col gap-3">
          {step.options.map((opt, idx) => {
            const isSelected = selectedIndex === idx;
            const isWrong = wrongIndices.includes(idx);
            const isCorrectOption = idx === step.correct_index;
            
            let baseStyles = 'border-[#37464f] border-b-[4px] hover:bg-white/5 text-white bg-[#131f24]';
            if (isSelected && isCorrectOption) {
                 baseStyles = 'border-[#58cc02] border-b-[3px] bg-[#58cc02]/10 text-[#58cc02]';
            } else if (isWrong) {
                 baseStyles = 'border-[#ea2b2b] border-b-[3px] bg-[#ea2b2b]/10 text-[#ea2b2b]';
            } else if (canContinue) {
                 baseStyles = 'border-[#37464f] border-b-[3px] text-white bg-[#131f24] opacity-50';
            }

            return (
              <motion.button
                key={idx}
                whileTap={!canContinue ? { scale: 0.98 } : undefined}
                onClick={() => handleSelect(idx)}
                disabled={canContinue}
                className={`p-5 rounded-2xl border-[3px] text-left transition-all relative active:translate-y-[1px] ${baseStyles}`}
                style={
                  (!canContinue && !isSelected && !isWrong) ? { borderBottomWidth: '4px' } : { borderBottomWidth: '3px' }
                }
              >
                <div className="flex items-center justify-between pr-8">
                  <span className="text-[17px] font-bold leading-relaxed">{opt}</span>
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>
    );
  }

  if (step.type === 'bio_builder') {
    const [bizName, setBizName] = useState('');
    const [location, setLocation] = useState('');
    const [action, setAction] = useState('');

    const isComplete = bizName.trim() !== '' && location.trim() !== '' && action.trim() !== '';

    useEffect(() => {
      setCanContinue(isComplete);
    }, [isComplete, setCanContinue]);

    return (
      <div className="flex flex-col space-y-6 h-full pb-8">
        <div className="flex items-start gap-4">
          <AudioButton />
          <h2 className="text-[20px] font-bold tracking-tight text-white leading-snug mt-1">
            {step.prompt}
          </h2>
        </div>

        <div className="bg-[#131f24] border-[3px] border-[#37464f] rounded-2xl p-6 mt-4 relative">
           <div className="absolute -top-3 left-4 bg-[#1cb0f6] text-white text-[11px] px-3 py-1 font-bold rounded-full uppercase tracking-wider shadow-sm">
             Andika hapa
           </div>
           
           <div className="text-white text-[20px] md:text-[24px] leading-[3rem] md:leading-[3.5rem] font-medium flex flex-wrap items-center gap-x-3 gap-y-4 pt-2">
             <span>Nauza</span>
             <input 
               type="text"
               value={bizName}
               onChange={(e) => setBizName(e.target.value)}
               className="bg-transparent border-b-[3px] border-[#37464f] px-2 py-1 text-[#1cb0f6] text-[20px] md:text-[24px] font-bold focus:border-[#1cb0f6] focus:outline-none transition-colors w-[140px] md:w-[180px] text-center"
               placeholder="nini?"
             />
             <span>napatikana</span>
             <input 
               type="text"
               value={location}
               onChange={(e) => setLocation(e.target.value)}
               className="bg-transparent border-b-[3px] border-[#37464f] px-2 py-1 text-[#1cb0f6] text-[20px] md:text-[24px] font-bold focus:border-[#1cb0f6] focus:outline-none transition-colors w-[160px] md:w-[200px] text-center"
               placeholder="wapi?"
             />
             <span>ili kuagiza fanya hivi:</span>
             <input 
               type="text"
               value={action}
               onChange={(e) => setAction(e.target.value)}
               className="bg-transparent border-b-[3px] border-[#37464f] px-2 py-1 text-[#1cb0f6] text-[20px] md:text-[24px] font-bold focus:border-[#1cb0f6] focus:outline-none transition-colors w-[200px] md:w-[250px] text-center"
               placeholder="mf. piga 07..."
             />
           </div>
        </div>
      </div>
    );
  }

  if (step.type === 'exercise') {
    const [answer, setAnswer] = useState('');
    const [showExample, setShowExample] = useState(false);

    useEffect(() => {
      setCanContinue(answer.trim().length > 5);
    }, [answer, setCanContinue]);

    return (
      <div className="flex flex-col space-y-6 h-full pb-8">
        <div className="flex items-start gap-4">
          <AudioButton />
          <h2 className="text-[20px] font-bold tracking-tight text-white leading-snug mt-1">
            {step.prompt}
          </h2>
        </div>

        <div className="bg-[#131f24] border-[3px] border-[#37464f] rounded-2xl p-4 flex flex-col gap-4">
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder={step.placeholder}
            className="w-full bg-[#202f36] border-2 border-[#37464f] rounded-xl p-4 text-white text-[17px] focus:border-[#1cb0f6] focus:outline-none min-h-[120px] resize-none"
          />
          
          {showExample ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#58cc02]/10 border-2 border-[#58cc02]/50 p-4 rounded-xl"
            >
              <div className="text-[#58cc02] text-[12px] font-bold uppercase tracking-wider mb-2">Mfano kutoka kwa Ujuzi:</div>
              <p className="text-white text-[16px] leading-relaxed italic">"{step.example}"</p>
            </motion.div>
          ) : (
            <button 
              onClick={() => setShowExample(true)}
              className="text-[#1cb0f6] text-[15px] font-bold uppercase tracking-wider self-start hover:text-white transition-colors"
            >
              Onyesha Mfano
            </button>
          )}
        </div>
      </div>
    );
  }

  if (step.type === 'challenge') {
    useEffect(() => {
      setCanContinue(true);
    }, [setCanContinue]);

    return (
      <div className="flex flex-col space-y-6 h-full pb-8">
        <div className="flex items-start gap-4">
          <AudioButton />
          <h2 className="text-[24px] font-bold tracking-tight text-[#ffc800] leading-snug mt-1">
            {step.title}
          </h2>
        </div>
        
        <div className="bg-[#ffc800]/10 border-[3px] border-[#ffc800] rounded-3xl p-6 flex flex-col gap-6 items-center text-center mt-8">
          <div className="w-20 h-20 bg-[#ffc800] rounded-full flex items-center justify-center -mt-16 border-4 border-[#131f24]">
            <span className="text-4xl text-yellow-900">🏆</span>
          </div>
          
          <p className="text-white text-[19px] leading-relaxed font-medium">
            {step.task}
          </p>
          
          <div className="bg-[#131f24] rounded-2xl py-3 px-6 border-2 border-[#37464f]">
            <span className="text-[#ffc800] font-bold text-[18px]">+{step.reward_xp} XP</span>
          </div>
        </div>
      </div>
    );
  }

  if (step.type === 'cloze') {
    const [selectedWord, setSelectedWord] = useState<string | null>(null);

    const handleSelect = (word: string) => {
      if (canContinue) return;
      setSelectedWord(word);
      if (word === step.correct) {
          playSound('correct_voice');
          setCanContinue(true);
          setCompanionFeedback(step.feedback, "celebrating");
      } else {
          playSound('wrong');
          setCompanionFeedback("Si sahihi, jaribu tena!", "thinking");
          setTimeout(() => setSelectedWord(null), 1000);
      }
    };

    return (
        <div className="flex flex-col gap-6 pt-6">
            <div className="flex items-start gap-4">
              <AudioButton />
              <h2 className="text-white text-[20px] font-bold">{step.prompt}</h2>
            </div>
            <div className="bg-[#131f24] p-6 rounded-2xl text-white text-[20px] font-medium border-2 border-[#37464f]">
                {step.sentence_with_blank.replace('{blank}', selectedWord ? `"${selectedWord}"` : "________")}
            </div>
            <div className="grid grid-cols-2 gap-3">
                {step.options.map(opt => (
                    <button key={opt} onClick={() => handleSelect(opt)} className="bg-[#202f36] p-4 rounded-xl text-white font-bold border-b-4 border-[#37464f] active:border-b-0 active:translate-y-1 hover:bg-[#37464f]">
                        {opt}
                    </button>
                ))}
            </div>
        </div>
    );
  }

  if (step.type === 'match') {
      const [matches, setMatches] = useState<{[key: string]: string}>({});
      
      const handlePair = (left: string, right: string) => {
          if (canContinue) return;
          const newMatches = {...matches, [left]: right};
          setMatches(newMatches);
          
          if (Object.keys(newMatches).length === step.pairs.length) {
              // Simple check
              const allCorrect = step.pairs.every(p => newMatches[p.left] === p.right);
              if (allCorrect) {
                  playSound('correct_voice');
                  setCanContinue(true);
                  setCompanionFeedback(step.feedback, "celebrating");
              }
          }
      };

      return (
          <div className="flex flex-col gap-6 pt-6">
            <div className="flex items-start gap-4">
              <AudioButton />
              <h2 className="text-white text-[20px] font-bold">{step.prompt}</h2>
            </div>
              {step.pairs.map(pair => (
                  <div key={pair.left} className="flex gap-2">
                      <div className="bg-[#202f36] p-3 rounded-lg text-white font-bold flex-1">{pair.left}</div>
                      <div className="text-white">→</div>
                      <button className="bg-[#1cb0f6] p-3 rounded-lg text-white font-bold flex-1" onClick={() => handlePair(pair.left, pair.right)}>
                          {matches[pair.left] || "Select"}
                      </button>
                  </div>
              ))}
          </div>
      );
  }

  if (step.type === 'drag_drop') {
      return (
          <div className="flex flex-col gap-4 pt-4">
            <div className="flex items-start gap-4">
              <AudioButton />
              <h2 className="text-white text-[20px] font-bold">{step.prompt}</h2>
            </div>
            <DragDropExercise 
               step={step} 
               canContinue={canContinue}
               onSuccess={(feedback) => {
                  playSound('correct_voice');
                  setCanContinue(true);
                  setCompanionFeedback(feedback, "celebrating");
               }} 
            />
          </div>
      );
  }

  if (step.type === 'insta_bio') {
      return (
          <div className="flex flex-col gap-4 pt-4 h-full pb-6">
            <div className="flex items-start gap-4">
              <AudioButton />
              <h2 className="text-white text-[20px] font-bold mt-1 pr-4 leading-snug">{step.prompt}</h2>
            </div>
            <InstaBioExercise 
               step={step} 
               canContinue={canContinue}
               onSuccess={(feedback) => {
                  playSound('correct_voice');
                  setCanContinue(true);
                  setCompanionFeedback(feedback, "celebrating");
               }} 
            />
          </div>
      );
  }

  return null;
}
