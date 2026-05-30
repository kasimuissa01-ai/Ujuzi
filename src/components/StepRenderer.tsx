import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import Markdown from 'react-markdown';
import { LessonBlock } from '../types/lesson';
import { Check, X, Lightbulb, Volume2 } from 'lucide-react';
import DragDropExercise from './DragDropExercise';
import InstaBioExercise from './InstaBioExercise';

interface Props {
  step: LessonBlock;
  onContinue: () => void;
  setCompanionFeedback: (message: string, mood: any) => void;
  canContinue: boolean;
  setCanContinue: (value: boolean) => void;
  playSound: (name: 'correct' | 'wrong' | 'complete' | 'correct_voice', skipUI?: boolean) => void;
  isPlayingAudio?: boolean;
  onToggleAudio?: () => void;
}

export default function StepRenderer({ 
  step, 
  onContinue, 
  setCompanionFeedback, 
  canContinue, 
  setCanContinue, 
  playSound, 
  isPlayingAudio, 
  onToggleAudio 
}: Props) {
  
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

  switch (step.type) {
    case 'story':
    case 'text':
      return <StoryTextStep step={step} AudioButton={AudioButton} />;
    
    case 'tip':
      return <TipStep step={step} AudioButton={AudioButton} />;
    
    case 'image':
      return <ImageStep step={step} />;
    
    case 'image_ab':
      return (
        <ImageABStep 
          step={step} 
          canContinue={canContinue} 
          setCanContinue={setCanContinue} 
          playSound={playSound} 
          setCompanionFeedback={setCompanionFeedback} 
          AudioButton={AudioButton} 
        />
      );
    
    case 'fill_blank':
      return (
        <FillBlankStep 
          step={step} 
          canContinue={canContinue} 
          setCanContinue={setCanContinue} 
          playSound={playSound} 
          setCompanionFeedback={setCompanionFeedback} 
          AudioButton={AudioButton} 
        />
      );
    
    case 'quiz':
    case 'scenario':
    case 'payment_verification_scenario':
    case 'unit_reflection':
    case 'reflection_moment':
      return (
        <QuizLikeStep 
          step={step} 
          canContinue={canContinue} 
          setCanContinue={setCanContinue} 
          playSound={playSound} 
          setCompanionFeedback={setCompanionFeedback} 
          AudioButton={AudioButton} 
        />
      );
    
    case 'bio_builder':
      return (
        <BioBuilderStep 
          step={step} 
          setCanContinue={setCanContinue} 
          AudioButton={AudioButton} 
        />
      );
    
    case 'exercise':
      return (
        <ExerciseStep 
          step={step} 
          setCanContinue={setCanContinue} 
          AudioButton={AudioButton} 
        />
      );
    
    case 'challenge':
      return (
        <ChallengeStep 
          step={step} 
          setCanContinue={setCanContinue} 
          AudioButton={AudioButton} 
        />
      );
    
    case 'cloze':
      return (
        <ClozeStep 
          step={step} 
          canContinue={canContinue} 
          setCanContinue={setCanContinue} 
          playSound={playSound} 
          setCompanionFeedback={setCompanionFeedback} 
          AudioButton={AudioButton} 
        />
      );
    
    case 'match':
      return (
        <MatchStep 
          step={step} 
          canContinue={canContinue} 
          setCanContinue={setCanContinue} 
          playSound={playSound} 
          setCompanionFeedback={setCompanionFeedback} 
          AudioButton={AudioButton} 
        />
      );
    
    case 'drag_drop':
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
    
    case 'insta_bio':
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
    
    case 'pain_calculator':
      return (
        <PainCalculatorStep 
          step={step} 
          setCanContinue={setCanContinue} 
          playSound={playSound} 
          setCompanionFeedback={setCompanionFeedback} 
          AudioButton={AudioButton} 
        />
      );
    
    case 'mistake_example':
      return (
        <MistakeExampleStep 
          step={step} 
          canContinue={canContinue} 
          setCanContinue={setCanContinue} 
          playSound={playSound} 
          setCompanionFeedback={setCompanionFeedback} 
          AudioButton={AudioButton} 
        />
      );
    
    case 'commitment_contract':
      return (
        <CommitmentContractStep 
          step={step} 
          setCanContinue={setCanContinue} 
          playSound={playSound} 
          setCompanionFeedback={setCompanionFeedback} 
          AudioButton={AudioButton} 
        />
      );
    
    case 'safe_share_prep':
      return (
        <SafeSharePrepStep 
          step={step} 
          setCanContinue={setCanContinue} 
          playSound={playSound} 
          setCompanionFeedback={setCompanionFeedback} 
          AudioButton={AudioButton} 
        />
      );
    
    case 'certificate_unlock':
      return (
        <CertificateUnlockStep 
          step={step} 
          setCanContinue={setCanContinue} 
          AudioButton={AudioButton} 
        />
      );
    
    default:
      return null;
  }
}

// ==========================================
// SUB-COMPONENTS (INDEPENDENT FUNCTIONAL COMPONENTS)
// ==========================================

function StoryTextStep({ step, AudioButton }: { step: any; AudioButton: React.ComponentType }) {
  return (
    <div className="flex flex-col h-full bg-[#131f24] min-h-[50vh] relative pt-2 px-6 pb-4 overflow-visible">
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#1cb0f6]/5 rounded-full blur-3xl pointer-events-none" />
      
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

function TipStep({ step, AudioButton }: { step: any; AudioButton: React.ComponentType }) {
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

function ImageStep({ step }: { step: any }) {
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

interface InteractiveStepProps {
  step: any;
  canContinue: boolean;
  setCanContinue: (val: boolean) => void;
  playSound: (name: any, skipUI?: boolean) => void;
  setCompanionFeedback: (msg: string, mood: any) => void;
  AudioButton: React.ComponentType;
}

function ImageABStep({ step, canContinue, setCanContinue, playSound, setCompanionFeedback, AudioButton }: InteractiveStepProps) {
  const [selectedId, setSelectedId] = useState<'A' | 'B' | null>(null);
  const [wrongOptions, setWrongOptions] = useState<string[]>([]);

  const handleSelect = (option: 'A' | 'B') => {
    if (canContinue) return;
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

          const isPlaceholder = !data.src || data.src.includes('example.com');

          return (
            <motion.button
              key={opt}
              whileTap={!canContinue ? { scale: 0.98 } : undefined}
              onClick={() => handleSelect(opt)}
              disabled={canContinue}
              className={`relative flex flex-col overflow-hidden rounded-2xl border-[3px] transition-all active:translate-y-[1px] ${baseBorder} ${isPlaceholder ? 'p-6 justify-center items-center text-center min-h-[160px]' : 'p-3'}`}
              style={
                (!canContinue && !isSelected && !isWrong) ? { borderBottomWidth: '4px' } : { borderBottomWidth: '3px' }
              }
            >
              {isPlaceholder ? (
                <div className="flex flex-col items-center justify-center w-full h-full">
                  <div className={`w-12 h-12 rounded-xl mb-4 border-2 flex items-center justify-center font-bold text-lg transition-colors ${
                    hasCheck 
                      ? 'bg-[#58cc02] border-[#58cc02] text-white' 
                      : hasWrong 
                        ? 'bg-[#ea2b2b] border-[#ea2b2b] text-white' 
                        : isSelected 
                          ? 'bg-[#1cb0f6] border-[#1cb0f6] text-white'
                          : 'bg-transparent border-[#37464f] text-[#8a9296]'
                  }`}>
                    {hasCheck ? <Check className="w-6 h-6" strokeWidth={3} /> : hasWrong ? <X className="w-6 h-6" strokeWidth={3} /> : opt}
                  </div>
                  <span className={`text-[17px] font-bold leading-relaxed ${textClass}`}>
                    {data.label}
                  </span>
                </div>
              ) : (
                <>
                  <div className="w-full aspect-[4/5] sm:aspect-[3/4] shrink-0 rounded-xl overflow-hidden bg-white relative mb-3">
                    <img src={data.src} alt={data.label} className="w-full h-full object-contain absolute inset-0" referrerPolicy="no-referrer" />
                  </div>
                  <div className="w-full text-center flex items-center justify-center">
                    <span className={`text-[17px] font-bold ${textClass}`}>
                      {hasCheck ? '✓ ' : hasWrong ? '✗ ' : ''}
                      {data.label}
                    </span>
                  </div>
                </>
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  );
}

function FillBlankStep({ step, canContinue, setCanContinue, playSound, setCompanionFeedback, AudioButton }: InteractiveStepProps) {
  const [selectedWords, setSelectedWords] = useState<(string | null)[]>(Array(step.blanks).fill(null));

  const handleSelect = (word: string) => {
    if (canContinue) return;
    const nextEmptyIndex = selectedWords.findIndex(w => w === null);
    if (nextEmptyIndex !== -1) {
      const newSelected = [...selectedWords];
      newSelected[nextEmptyIndex] = word;
      setSelectedWords(newSelected);
      
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
        {parts.map((part: string, index: number) => (
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
        {step.options.map((word: string) => {
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

function QuizLikeStep({ step, canContinue, setCanContinue, playSound, setCompanionFeedback, AudioButton }: InteractiveStepProps) {
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
      setCompanionFeedback("Sio sahihi! Umechagua jibu ambalo si sahihi.", "thinking");
    }
  };

  const questionText = (step.type === 'scenario' || step.type === 'payment_verification_scenario') ? step.label : 
                       (step.type === 'unit_reflection' || step.type === 'reflection_moment') ? step.prompt : 
                       step.question;

  return (
    <div className="flex flex-col space-y-8 h-full pb-8">
      <div className="flex items-start gap-4">
        <AudioButton />
        <h2 className="text-[20px] font-bold tracking-tight text-white leading-snug mt-1">
          {questionText}
        </h2>
      </div>
      
      {(step.type === 'scenario' || step.type === 'payment_verification_scenario') && step.setup && (
         <div className="bg-[#202f36] rounded-2xl p-4 flex flex-col gap-3">
            <span className="text-xs font-bold uppercase text-gray-400">Hali Halisi</span>
            <p className="text-[17px] text-white italic">"{step.setup}"</p>
            
            {step.chat && step.chat.length > 0 && step.chat.map((msg: any, i: number) => (
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
        {step.options.map((opt: string, idx: number) => {
          const isSelected = selectedIndex === idx;
          const isWrong = wrongIndices.includes(idx);
          const isCorrectOption = idx === step.correct_index;
          
          let baseStyles = 'border-[#37464f] border-b-[4px] hover:bg-white/5 text-[#d1d5db] hover:text-white bg-[#131f24]';
          let iconClass = 'border-2 border-[#37464f] text-[#d1d5db] group-hover:bg-[#37464f] group-hover:border-[#37464f] group-hover:text-white';
          
          if (isSelected && isCorrectOption) {
               baseStyles = 'border-[#58cc02] border-b-[3px] bg-[#58cc02]/10 text-[#58cc02]';
               iconClass = '!bg-[#58cc02] !border-[#58cc02] text-white';
          } else if (isWrong) {
               baseStyles = 'border-[#ea2b2b] border-b-[3px] bg-[#ea2b2b]/10 text-[#ea2b2b]';
               iconClass = '!bg-[#ea2b2b] !border-[#ea2b2b] text-white';
          } else if (canContinue) {
               baseStyles = 'border-[#37464f] border-b-[3px] text-[#8a9296] bg-[#131f24] opacity-50';
               iconClass = 'border-2 border-[#37464f] text-[#8a9296]';
          }

          return (
            <motion.button
              key={idx}
              whileHover={!canContinue && !isWrong ? { scale: 1.01 } : undefined}
              whileTap={!canContinue ? { scale: 0.98 } : undefined}
              onClick={() => handleSelect(idx)}
              disabled={canContinue}
              className={`p-4 rounded-xl border-[3px] text-left transition-colors relative active:translate-y-[1px] group ${baseStyles}`}
              style={
                (!canContinue && !isSelected && !isWrong) ? { borderBottomWidth: '4px' } : { borderBottomWidth: '3px' }
              }
            >
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center font-bold text-sm transition-colors ${iconClass}`}>
                  {isSelected && isCorrectOption ? <Check className="w-5 h-5" strokeWidth={3} /> : isWrong ? <X className="w-5 h-5" strokeWidth={3} /> : String.fromCharCode(65 + idx)}
                </div>
                <span className="text-[17px] font-bold leading-relaxed">{opt}</span>
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  );
}

function BioBuilderStep({ step, setCanContinue, AudioButton }: { step: any; setCanContinue: (val: boolean) => void; AudioButton: React.ComponentType }) {
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

function ExerciseStep({ step, setCanContinue, AudioButton }: { step: any; setCanContinue: (val: boolean) => void; AudioButton: React.ComponentType }) {
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

function ChallengeStep({ step, setCanContinue, AudioButton }: { step: any; setCanContinue: (val: boolean) => void; AudioButton: React.ComponentType }) {
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

      <div className="bg-[#ffc800]/10 border-[3px] border-[#ffc800]/50 rounded-2xl p-6 flex flex-col items-center gap-6 text-center">
        <div className="w-16 h-16 bg-[#ffc800] rounded-2xl flex items-center justify-center text-3xl shadow-lg border-2 border-white/20">
          🏆
        </div>
        
        <p className="text-white text-[18px] leading-relaxed font-semibold">
          {step.task}
        </p>
        
        <div className="bg-[#131f24] rounded-2xl py-3 px-6 border-2 border-[#37464f]">
          <span className="text-[#ffc800] font-bold text-[18px]">+{step.reward_xp} XP</span>
        </div>
      </div>
    </div>
  );
}

function ClozeStep({ step, canContinue, setCanContinue, playSound, setCompanionFeedback, AudioButton }: InteractiveStepProps) {
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
              {step.options.map((opt: string) => (
                  <button key={opt} onClick={() => handleSelect(opt)} className="bg-[#202f36] p-4 rounded-xl text-white font-bold border-b-4 border-[#37464f] active:border-b-0 active:translate-y-1 hover:bg-[#37464f]">
                      {opt}
                  </button>
              ))}
          </div>
      </div>
  );
}

function MatchStep({ step, canContinue, setCanContinue, playSound, setCompanionFeedback, AudioButton }: InteractiveStepProps) {
  const [matches, setMatches] = useState<{[key: string]: string}>({});
  const [shuffledRights, setShuffledRights] = useState<string[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);

  useEffect(() => {
      setShuffledRights([...step.pairs.map((p: any) => p.right)].sort(() => Math.random() - 0.5));
  }, [step]);
  
  const handleSelectLeft = (left: string) => {
      if (canContinue) return;
      setSelectedLeft(left === selectedLeft ? null : left);
  };

  const handleSelectRight = (right: string) => {
      if (canContinue || !selectedLeft) return;
      
      const correctPair = step.pairs.find((p: any) => p.left === selectedLeft);
      if (correctPair && correctPair.right === right) {
          playSound('correct', true);
          if (typeof window !== 'undefined' && window.navigator.vibrate) window.navigator.vibrate(50);
          const newMatches = {...matches, [selectedLeft]: right};
          setMatches(newMatches);
          setSelectedLeft(null);
          
          if (Object.keys(newMatches).length === step.pairs.length) {
              playSound('correct_voice');
              setCanContinue(true);
              setCompanionFeedback(step.feedback || "Safi sana!", "celebrating");
          }
      } else {
          playSound('wrong', true);
          if (typeof window !== 'undefined' && window.navigator.vibrate) window.navigator.vibrate([50, 50, 50]);
          setCompanionFeedback("Sio yenyewe, jaribu tena!", "thinking");
          setSelectedLeft(null);
      }
  };

  return (
      <div className="flex flex-col gap-6 pt-4 pb-8 h-full">
        <div className="flex items-start gap-4">
          <AudioButton />
          <h2 className="text-white text-[20px] font-bold mt-1 tracking-tight">{step.prompt}</h2>
        </div>
        
        <div className="flex flex-col gap-4 mt-2">
          <div className="grid grid-cols-2 gap-3 sm:gap-6">
            <div className="flex flex-col gap-3">
              {step.pairs.map((pair: any) => {
                const isMatched = !!matches[pair.left];
                const isSelected = selectedLeft === pair.left;
                
                let bgClass = 'bg-[#131f24] hover:bg-white/5 border-[#37464f] text-[#d1d5db]';
                let borderW = 'border-b-[4px] border-[3px]';
                
                if (isMatched) {
                    bgClass = 'bg-[#58cc02]/10 border-[#58cc02] text-[#58cc02] opacity-50';
                    borderW = 'border-[3px]';
                } else if (isSelected) {
                    bgClass = 'bg-[#1cb0f6]/10 border-[#1cb0f6] text-[#1cb0f6]';
                    borderW = 'border-b-[3px] border-[3px] translate-y-[1px]';
                }

                return (
                    <motion.button 
                       key={pair.left} 
                       whileTap={(!isMatched && !isSelected) ? { scale: 0.98 } : undefined}
                       className={`p-4 rounded-xl font-bold leading-snug transition-all text-left flex items-center justify-center text-center ${borderW} ${bgClass}`}
                       onClick={() => handleSelectLeft(pair.left)}
                       disabled={isMatched || canContinue}
                       style={isMatched ? { pointerEvents: 'none'} : {}}
                    >
                       {pair.left}
                    </motion.button>
                 )
              })}
            </div>

            <div className="flex flex-col gap-3">
              {shuffledRights.map((right: string) => {
                 const isMatched = Object.values(matches).includes(right);
                 
                 let bgClass = 'bg-[#131f24] hover:bg-white/5 border-[#37464f] text-[#d1d5db]';
                 let borderW = 'border-b-[4px] border-[3px]';
                 
                 if (isMatched) {
                     bgClass = 'bg-[#58cc02]/10 border-[#58cc02] text-[#58cc02] opacity-50';
                     borderW = 'border-[3px]';
                 } else if (selectedLeft) {
                     bgClass = 'bg-[#131f24] hover:bg-[#1cb0f6]/5 text-white border-[#1cb0f6] border-dashed';
                 }
                 
                 return (
                     <motion.button 
                        key={right}
                        whileTap={!isMatched ? { scale: 0.98 } : undefined}
                        className={`p-4 rounded-xl font-bold leading-snug transition-all text-left flex items-center justify-center text-center ${borderW} ${bgClass}`}
                        onClick={() => handleSelectRight(right)}
                        disabled={isMatched || canContinue || !selectedLeft}
                        style={isMatched ? { pointerEvents: 'none'} : {}}
                     >
                        {right}
                     </motion.button>
                 )
              })}
            </div>
          </div>
        </div>
      </div>
  );
}

function PainCalculatorStep({ step, setCanContinue, playSound, setCompanionFeedback, AudioButton }: Omit<InteractiveStepProps, 'canContinue'>) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState<string | null>(null);

  const handleCalculate = () => {
    const price = parseFloat(values['average_item_price'] || '0');
    const count = parseFloat(values['missed_daily_customers'] || '0');
    if (price > 0 && count > 0) {
      const formulaResult = price * count * 30;
      const formattedResult = new Intl.NumberFormat('en-US').format(formulaResult);
      setResult(formattedResult);
      playSound('correct_voice');
      setCanContinue(true);
      setCompanionFeedback("Huu ndio upotevu halisi wa kifedha uliopo. Sasa ni wakati wa kuanza kujifunza jinsi ya kuuzuia!", "thinking");
    }
  };

  return (
    <div className="flex flex-col gap-6 pt-4 pb-8 h-full text-white">
      <div className="flex items-start gap-4">
        <AudioButton />
        <h2 className="text-[20px] font-bold mt-1 tracking-tight">{step.prompt}</h2>
      </div>
      <div className="flex flex-col gap-4 bg-[#202f36] p-6 rounded-2xl border-2 border-[#37464f]">
        {step.inputs.map((input: any) => (
          <div key={input.key} className="flex flex-col gap-2">
            <label className="text-[14px] font-bold text-gray-300">{input.label}</label>
            <input
              type="number"
              value={values[input.key] || ''}
              onChange={(e) => {
                setValues({ ...values, [input.key]: e.target.value });
                setCanContinue(false);
                setResult(null);
              }}
              placeholder={input.placeholder}
              className="bg-[#131f24] border-2 border-[#37464f] p-4 rounded-xl text-white text-[16px] focus:border-[#1cb0f6] focus:outline-none w-full"
            />
          </div>
        ))}
        {!result ? (
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleCalculate}
            disabled={!values['average_item_price'] || !values['missed_daily_customers']}
            className="mt-2 w-full bg-[#1cb0f6] border-b-4 border-[#1899d6] hover:bg-[#20b8fe] text-white font-bold py-4 px-6 rounded-xl text-[17px] active:border-b-0 active:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Kokotoa Upotevu Wako 🧮
          </motion.button>
        ) : (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mt-2 p-5 bg-[#ea2b2b]/10 border-2 border-[#ea2b2b]/40 rounded-xl text-center"
          >
            <p className="text-[22px] font-extrabold text-[#ea2b2b] mb-2">
              TSH {result} /=
            </p>
            <p className="text-[15px] text-gray-200 leading-relaxed font-semibold">
              {step.result_template.replace('{result}', result)}
            </p>
            <p className="text-[13px] text-[#ffcd1f] font-bold mt-4 animate-pulse">
              {step.call_to_action}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function MistakeExampleStep({ step, canContinue, setCanContinue, playSound, setCompanionFeedback, AudioButton }: InteractiveStepProps) {
  const [selected, setSelected] = useState<'bad_example' | 'good_example' | null>(null);

  const handleSelect = (choice: 'bad_example' | 'good_example') => {
    setSelected(choice);
    if (choice === step.correct) {
      playSound('correct_voice');
      setCanContinue(true);
      setCompanionFeedback(step.feedback, "celebrating");
    } else {
      playSound('wrong');
      setCompanionFeedback("Hapo kuna makosa. Fikiria vizuri kuhusu tofauti yao kisha chagua jibu sahihi.", "thinking");
    }
  };

  return (
    <div className="flex flex-col gap-6 pt-4 pb-8 h-full text-white">
      <div className="flex items-start gap-4">
        <AudioButton />
        <h2 className="text-[20px] font-bold mt-1 tracking-tight">{step.question}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border-2 border-[#ea2b2b]/30 bg-[#ea2b2b]/5 rounded-2xl p-5 flex flex-col gap-3">
          <span className="bg-[#ea2b2b] text-white text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider self-start">
            Mfano Mbaya / Kosa ❌
          </span>
          <p className="text-[17px] font-medium leading-relaxed italic text-gray-300">
            "{step.bad_example}"
          </p>
        </div>

        <div className="border-2 border-[#58cc02]/30 bg-[#58cc02]/5 rounded-2xl p-5 flex flex-col gap-3">
          <span className="bg-[#58cc02] text-white text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider self-start">
            Mfano Mzuri / Sahihi ✔
          </span>
          <p className="text-[17px] font-medium leading-relaxed italic text-gray-100 font-semibold font-sans">
            "{step.good_example}"
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 mt-4">
        <p className="text-gray-400 font-bold text-sm uppercase tracking-wider">Gusa jibu sahihi hapa chini:</p>
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelect('bad_example')}
            disabled={canContinue}
            className={`p-4 rounded-xl border-2 text-[16px] font-bold text-center transition-all ${
              selected === 'bad_example'
                ? 'bg-[#ea2b2b]/20 border-[#ea2b2b] text-[#ea2b2b]'
                : 'bg-[#202f36] border-[#37464f] text-gray-300 hover:bg-[#37464f]'
            }`}
          >
            Kosa
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelect('good_example')}
            disabled={canContinue}
            className={`p-4 rounded-xl border-2 text-[16px] font-bold text-center transition-all ${
              selected === 'good_example'
                ? 'bg-[#58cc02]/20 border-[#58cc02] text-[#58cc02]'
                : 'bg-[#202f36] border-[#37464f] text-gray-300 hover:bg-[#37464f]'
            }`}
          >
            Sahihi
          </motion.button>
        </div>
      </div>
    </div>
  );
}

function CommitmentContractStep({ step, setCanContinue, playSound, setCompanionFeedback, AudioButton }: Omit<InteractiveStepProps, 'canContinue'>) {
  const [fields, setFields] = useState<Record<string, string>>({});
  const [signed, setSigned] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);

  const isAllFieldsFilled = step.prompt_fields.every((f: any) => {
    if (f.type === 'date_auto_fill') return true;
    return fields[f.key]?.trim().length > 0;
  });

  useEffect(() => {
    const autoFills: Record<string, string> = {};
    step.prompt_fields.forEach((f: any) => {
      if (f.type === 'date_auto_fill') {
        autoFills[f.key] = new Date().toLocaleDateString('sw-TZ', { day: 'numeric', month: 'long', year: 'numeric' });
      }
    });
    if (Object.keys(autoFills).length > 0) {
      setFields((prev) => ({ ...prev, ...autoFills }));
    }
  }, [step]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1cb0f6';
  }, [canvasRef.current]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
    setSigned(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSigned(false);
    setCanContinue(false);
  };

  const handleSubmitContract = () => {
    if (isAllFieldsFilled && (!step.signature_required || signed)) {
      playSound('correct_voice');
      setShowCongrats(true);
      setCanContinue(true);
      setCompanionFeedback(step.completion_message, "celebrating");
    }
  };

  return (
    <div className="flex flex-col gap-6 pt-4 pb-8 h-full text-white">
      <div className="flex items-start gap-4">
        <AudioButton />
        <h2 className="text-[22px] font-extrabold text-[#ffcd1f] tracking-tight">{step.title}</h2>
      </div>

      <p className="text-[15px] text-gray-300 leading-relaxed font-medium">
        {step.instruction}
      </p>

      {!showCongrats ? (
        <div className="flex flex-col gap-4 bg-[#1a282f] border-4 border-dashed border-[#37464f] p-6 rounded-2xl">
          {step.prompt_fields.map((field: any) => (
            <div key={field.key} className="flex flex-col gap-2">
              <label className="text-[14px] font-bold text-gray-300">{field.label}</label>
              {field.type === 'date_auto_fill' ? (
                <div className="p-4 bg-[#131f24] border-2 border-[#37464f] text-[#58cc02] font-bold rounded-xl text-[16px]">
                  {fields[field.key]}
                </div>
              ) : (
                <input
                  type="text"
                  value={fields[field.key] || ''}
                  onChange={(e) => setFields({ ...fields, [field.key]: e.target.value })}
                  placeholder={field.placeholder}
                  className="bg-[#131f24] border-2 border-[#37464f] p-4 rounded-xl text-white text-[16px] focus:border-[#ffcd1f] focus:outline-none w-full font-medium"
                />
              )}
            </div>
          ))}

          {step.signature_required && (
            <div className="flex flex-col gap-2 mt-2">
              <div className="flex justify-between items-center">
                <label className="text-[14px] font-bold text-gray-300">{step.signature_label}</label>
                <button onClick={clearCanvas} className="text-[13px] text-[#ff4b4b] font-bold uppercase tracking-wider">
                  Futa Saini
                </button>
              </div>
              <div className="bg-[#131f24] border-2 border-[#37464f] rounded-xl overflow-hidden relative" style={{ height: '120px' }}>
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={120}
                  className="w-full h-full cursor-crosshair"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
                {!signed && (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500 pointer-events-none text-xs font-semibold uppercase tracking-widest">
                    Chora saini yako hapa kwa kidole au mouse
                  </div>
                )}
              </div>
            </div>
          )}

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmitContract}
            disabled={!isAllFieldsFilled || (step.signature_required && !signed)}
            className="mt-4 w-full bg-[#58cc02] border-b-4 border-[#46a302] hover:bg-[#61e002] text-white font-extrabold py-4 px-6 rounded-xl text-[17px] active:border-b-0 active:translate-y-1 transition-all disabled:opacity-40"
          >
            Weka Sahihi na Kamilisha Mkataba 📝✍
          </motion.button>
        </div>
      ) : (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-6 bg-[#58cc02]/15 border-4 border-dashed border-[#58cc02]/50 rounded-2xl text-center flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 bg-[#58cc02] rounded-full flex items-center justify-center text-3xl shadow-lg">
            📜
          </div>
          <h3 className="text-[20px] font-extrabold text-[#58cc02]">Mkataba Umewahiwa Rasmi!</h3>
          <p className="text-[16px] text-gray-200 leading-relaxed font-semibold">
            {step.completion_message}
          </p>
          {step.xp_reward && (
            <span className="text-yellow-400 font-bold block bg-[#131f24] px-4 py-2 border border-[#37464f] rounded-full text-xs uppercase tracking-wider">
              +{step.xp_reward} XP Reward
            </span>
          )}
        </motion.div>
      )}
    </div>
  );
}

function SafeSharePrepStep({ step, setCanContinue, playSound, setCompanionFeedback, AudioButton }: Omit<InteractiveStepProps, 'canContinue'>) {
  const [fields, setFields] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const isAllFieldsFilled = step.prompt_fields.every((f: any) => fields[f.key]?.trim().length > 0);

  const handleSave = () => {
    if (isAllFieldsFilled) {
      playSound('correct_voice');
      setSaved(true);
      setCanContinue(true);
      setCompanionFeedback("Excellent! Umepanga mpango kamili, sasa uko tayari kuhusiana na watu.", "celebrating");
    }
  };

  return (
    <div className="flex flex-col gap-6 pt-4 pb-8 h-full text-white font-sans">
      <div className="flex items-start gap-4">
        <AudioButton />
        <h2 className="text-[22px] font-extrabold text-[#1cb0f6] tracking-tight">{step.title}</h2>
      </div>

      <p className="text-[15px] text-gray-300 leading-relaxed font-medium">
        {step.instruction}
      </p>

      {!saved ? (
        <div className="flex flex-col gap-4 bg-[#1a282f] border-2 border-[#37464f] p-6 rounded-2xl">
          {step.prompt_fields.map((field: any) => (
            <div key={field.key} className="flex flex-col gap-2">
              <label className="text-[14px] font-bold text-gray-300">{field.label}</label>
              <input
                type="text"
                value={fields[field.key] || ''}
                onChange={(e) => setFields({ ...fields, [field.key]: e.target.value })}
                placeholder={field.placeholder}
                className="bg-[#131f24] border-2 border-[#37464f] p-4 rounded-xl text-white text-[16px] focus:border-[#1cb0f6] focus:outline-none w-full font-medium"
              />
            </div>
          ))}

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={!isAllFieldsFilled}
            className="mt-4 w-full bg-[#1cb0f6] border-b-4 border-[#1899d6] hover:bg-[#20b8fe] text-white font-extrabold py-4 px-6 rounded-xl text-[17px] active:border-b-0 active:translate-y-1 transition-all disabled:opacity-40"
          >
            Hifadhi Maandalizi yangu 🤝
          </motion.button>
        </div>
      ) : (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-6 bg-[#1cb0f6]/15 border-2 border-[#1cb0f6]/50 rounded-2xl flex flex-col items-center gap-4 text-center pb-8"
        >
          <div className="w-16 h-16 bg-[#1cb0f6] rounded-full flex items-center justify-center text-3xl shadow-lg">
            ✨
          </div>
          <h3 className="text-[20px] font-extrabold text-[#1cb0f6]">{step.reassurance_message}</h3>
          {step.xp_reward && (
            <span className="text-yellow-400 font-bold block bg-[#131f24] px-4 py-2 border border-[#37464f] rounded-full text-xs uppercase tracking-wider">
              +{step.xp_reward} XP Reward
            </span>
          )}
        </motion.div>
      )}
    </div>
  );
}

function CertificateUnlockStep({ step, setCanContinue, AudioButton }: { step: any; setCanContinue: (val: boolean) => void; AudioButton: React.ComponentType }) {
  useEffect(() => {
    setCanContinue(true);
  }, [setCanContinue]);

  return (
    <div className="flex flex-col gap-6 pt-4 pb-8 h-full text-white items-center text-center">
      <AudioButton />
      
      <motion.div 
        initial={{ scale: 0.8, rotate: -5, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.5, delay: 0.1 }}
        className="bg-gradient-to-br from-[#ffd700] via-[#cfa310] to-[#8b6508] border-4 border-[#131f24] rounded-3xl p-8 shadow-[0_0_40px_rgba(255,215,0,0.3)] max-w-sm mt-4 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 left-0 bottom-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 animate-pulse pointer-events-none" />
        
        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-4xl mb-4 mx-auto animate-bounce border-2 border-white/30 shadow-inner">
          🎓
        </div>
        
        <h3 className="text-[22px] font-black uppercase text-yellow-950 tracking-tight leading-none mb-2 font-sans">
          {step.title}
        </h3>
        
        {step.badge_earned && (
          <div className="bg-yellow-950/20 backdrop-blur-sm px-4 py-1.5 rounded-full inline-block border border-white/15 mb-4">
            <span className="text-yellow-950 font-black text-xs uppercase tracking-widest">
              Badge: {step.badge_earned} 🏆
            </span>
          </div>
        )}

        <p className="text-[14px] text-yellow-950 font-semibold leading-relaxed">
          {step.message}
        </p>
      </motion.div>

      <p className="text-gray-400 font-bold text-sm mt-6 uppercase tracking-wider animate-pulse">
        Bofya "Endelea" kukamilisha course! 🎉
      </p>
    </div>
  );
}
