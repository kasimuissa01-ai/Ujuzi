import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { InstaBioBlock } from '../types/lesson';
import { Check } from 'lucide-react';

interface Props {
  step: InstaBioBlock;
  onSuccess: (feedback: string) => void;
  canContinue: boolean;
}

export default function InstaBioExercise({ step, onSuccess, canContinue }: Props) {
  const [activeBlankIndex, setActiveBlankIndex] = useState<number>(0);
  const [filledBlanks, setFilledBlanks] = useState<(string | null)[]>(Array(step.blanks).fill(null));

  useEffect(() => {
    const nextEmpty = filledBlanks.findIndex(b => b === null);
    if (nextEmpty !== -1 && !canContinue) {
      setActiveBlankIndex(nextEmpty);
    }
  }, [filledBlanks, canContinue]);

  const availableOptions = step.options.filter(opt => !filledBlanks.includes(opt));

  const handleSelectOption = (word: string) => {
    if (canContinue) return;
    
    // snap into active blank
    const newFilled = [...filledBlanks];
    newFilled[activeBlankIndex] = word;
    setFilledBlanks(newFilled);

    // check if all filled
    if (!newFilled.includes(null)) {
      // Check correctness
      let isCorrect = false;
      
      // Viatu legacy logic
      if (step.correct.includes('Kariakoo')) {
         isCorrect = 
          (newFilled[0] === 'Kiume' || newFilled[0] === 'Kike') &&
          (newFilled[1] === 'Kiume' || newFilled[1] === 'Kike') &&
          newFilled[0] !== newFilled[1] &&
          newFilled[2] === 'Kariakoo';
      } else {
         // Generic strict match with step.correct array
         isCorrect = step.correct.every((val, idx) => newFilled[idx] === val);
         
         // If exact order doesn't matter for their course, maybe we just check inclusion.
         // Let's do exact order since bio usually has an order. If it fails, users can rearrange. 
      }

      if (isCorrect) {
        onSuccess(step.feedback);
      }
    }
  };

  const handleClearBlank = (index: number) => {
    if (canContinue) return;
    const newFilled = [...filledBlanks];
    newFilled[index] = null;
    setFilledBlanks(newFilled);
    setActiveBlankIndex(index);
  };

  const Blank = ({ index }: { index: number }) => {
    const isFilled = filledBlanks[index] !== null;
    const isActive = activeBlankIndex === index && !isFilled;

    return (
      <span 
        onClick={() => {
           if (isFilled) handleClearBlank(index);
           else if (!canContinue) setActiveBlankIndex(index);
        }}
        className={`inline-flex items-center justify-center min-w-[80px] min-h-[32px] px-3 my-1 rounded-md text-sm font-bold align-middle transition-colors cursor-pointer break-words text-center ${
          isFilled 
            ? 'bg-[#1cb0f6] text-white shadow-sm py-1.5'
            : isActive
              ? 'bg-[#37464f] border-2 border-[#1cb0f6] text-gray-400 border-dashed py-1.5'
              : 'bg-[#202f36] border border-gray-600 text-gray-500 py-1.5'
        }`}
      >
        {isFilled ? filledBlanks[index] : `Nafasi ${index + 1}`}
      </span>
    );
  };

  const isViatu = step.correct.includes('Kariakoo');

  return (
    <div className="flex flex-col gap-6 pt-2 h-full">
      {/* Instagram Mockup Card */}
      <div className="bg-slate-900 rounded-3xl border border-slate-700 overflow-hidden shadow-2xl flex flex-col mt-2">
        {/* Header */}
        <div className="p-5 flex items-center gap-5 border-b border-slate-800 bg-slate-900">
          <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-pink-500 p-[3px] shrink-0">
            <div className="w-full h-full bg-slate-900 border-[3px] border-slate-900 rounded-full overflow-hidden flex items-center justify-center">
               <img 
                 src={isViatu 
                   ? "https://fhtnqhkxpvrfzxrwwtso.supabase.co/storage/v1/object/public/Ujuzi_pkus/1778583556967-removebg-preview.png"
                   : "https://i.postimg.cc/J0CyqrKM/IMG-20260510-235338.jpg"
                 } 
                 alt="Profile" 
                 className="w-full h-full object-cover bg-[#131f24]" 
               />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="text-white font-bold text-[19px] flex items-center gap-1.5">
              {isViatu ? "Amina wa Viatu" : "Biashara Yako"} <Check className="w-[14px] h-[14px] text-white bg-blue-500 rounded-full p-[2px]" />
            </div>
            <div className="text-slate-400 text-[15px]">
              {isViatu ? "@amina_viatu" : "@biashara_yako"}
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <div className="p-5 bg-slate-900 text-slate-100 text-[17px] leading-[1.8] flex flex-col gap-2">
           {isViatu ? (
             <>
               <div className="mb-2">Karibu katika duka letu 🛍️</div>
               <div className="mb-2 flex flex-wrap items-center leading-loose">
                 Tunauza Viatu vya <Blank index={0} /> na <Blank index={1} /> 👟👠
               </div>
               <div className="mb-2 flex flex-wrap items-center leading-loose">
                 Tupo <Blank index={2} />, Mtaa wa Congo 📍
               </div>
             </>
           ) : (
             <div className="flex flex-col gap-2">
               {Array.from({ length: step.blanks }).map((_, idx) => (
                 <Blank key={idx} index={idx} />
               ))}
             </div>
           )}
        </div>
      </div>

      {/* Word Bank */}
      <div className="mt-auto pb-4">
         <div className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider px-2">
            Zana za Kujaza Bio:
         </div>
         <div className="bg-[#131f24] rounded-2xl p-4 border-2 border-[#37464f] min-h-[140px] flex items-start">
           <div className="flex flex-wrap gap-2.5">
             <AnimatePresence>
               {availableOptions.map((opt) => (
                 <motion.button
                   key={opt}
                   layout
                   initial={{ opacity: 0, scale: 0.8 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.8 }}
                   whileTap={{ scale: 0.95 }}
                   onClick={() => handleSelectOption(opt)}
                   className="px-5 py-3 bg-white text-slate-900 rounded-2xl font-bold text-[16px] shadow-sm border-b-[4px] border-slate-300 hover:bg-slate-50 transition-colors active:border-b-0 active:translate-y-[4px] flex-grow text-center"
                 >
                   {opt}
                 </motion.button>
               ))}
               {availableOptions.length === 0 && !canContinue && (
                 <motion.div 
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   className="w-full text-center text-slate-400 font-medium py-4"
                 >
                   Si sahihi! Gusa maneno kwenye Bio kuyarudisha hapa chini kisha ujaribu tena.
                 </motion.div>
               )}
             </AnimatePresence>
           </div>
         </div>
      </div>
    </div>
  );
}

