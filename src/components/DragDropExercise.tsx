import React, { useState, useEffect } from 'react';
import { DragDropBlock } from '../types/lesson';
import { motion, AnimatePresence } from 'framer-motion';

interface DragDropExerciseProps {
  step: DragDropBlock;
  onSuccess: (feedback: string) => void;
  canContinue: boolean;
}

export default function DragDropExercise({ step, onSuccess, canContinue }: DragDropExerciseProps) {
  const [availableItems, setAvailableItems] = useState(step.items);
  const [selectedItems, setSelectedItems] = useState<typeof step.items>([]);
  const [hasError, setHasError] = useState(false);

  const handleSelect = (item: typeof step.items[0]) => {
     if (canContinue) return;
     setAvailableItems(prev => prev.filter(i => i.id !== item.id));
     setSelectedItems(prev => [...prev, item]);
     setHasError(false);
  };

  const handleDeselect = (item: typeof step.items[0]) => {
     if (canContinue) return;
     setSelectedItems(prev => prev.filter(i => i.id !== item.id));
     setAvailableItems(prev => [...prev, item]);
     setHasError(false);
  };

  useEffect(() => {
     if (selectedItems.length === step.items.length) {
         const currentOrder = selectedItems.map(i => i.id);
         const isCorrect = step.correct_order.every((id, index) => id === currentOrder[index]);
         if (isCorrect) {
             onSuccess(step.feedback);
         } else {
             setHasError(true);
             if (typeof window !== 'undefined' && window.navigator.vibrate) {
                window.navigator.vibrate([100, 50, 100]);
             }
         }
     }
  }, [selectedItems, step.items.length, step.correct_order, step.feedback, onSuccess]);

  return (
    <div className="flex flex-col gap-6 pt-2">
      {step.design_context === 'instagram_bio' && (
        <div className="bg-[#131f24] rounded-2xl border-2 border-[#37464f] overflow-hidden mb-2">
          <div className="p-4 border-b border-[#37464f] flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-pink-500 p-[3px]">
              <div className="w-full h-full bg-[#131f24] border-[2px] border-[#131f24] rounded-full overflow-hidden flex items-center justify-center text-gray-500 font-bold text-xs">
                 Mimi
              </div>
            </div>
            <div>
              <div className="text-white font-bold text-lg">Amina wa Viatu</div>
              <div className="text-gray-400 text-sm">@amina_viatu</div>
            </div>
          </div>
        </div>
      )}

      <div>
          <div className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">Mpangilio Wako:</div>
          <div className={`flex flex-col gap-3 p-4 rounded-2xl border-[3px] transition-colors ${hasError ? 'border-red-500 bg-red-500/5' : canContinue ? 'border-[#58cc02] bg-[#58cc02]/10' : 'border-[#37464f] bg-[#202f36]'}`}>
            {[...Array(step.items.length)].map((_, index) => {
               const item = selectedItems[index];
               return (
                  <div key={index} className={`min-h-[64px] border-2 border-dashed ${hasError ? 'border-red-500/50' : canContinue ? 'border-[#58cc02]/50' : 'border-[#37464f]'} rounded-xl flex items-center justify-center p-1 relative`}>
                     {item ? (
                        <motion.div 
                          layoutId={`item-${item.id}`} 
                          onClick={() => handleDeselect(item)}
                          className={`absolute inset-0 ${hasError ? 'bg-red-500' : canContinue ? 'bg-[#58cc02]' : 'bg-[#1cb0f6]'} text-white font-bold rounded-xl flex items-center p-4 cursor-pointer z-10`}
                        >
                           <span className="opacity-50 mr-3">{index + 1}.</span> {item.text}
                        </motion.div>
                     ) : (
                        <span className="text-gray-500 font-bold opacity-50 px-4 text-center">Nafasi ya {index + 1}</span>
                     )}
                  </div>
               )
            })}
          </div>
          <AnimatePresence>
            {hasError && (
              <motion.div initial={{opacity:0, y:-10}} animate={{opacity:1, y:0}} className="text-red-400 font-bold text-sm text-center mt-3">
                Mpangilio sio sahihi. Gusa kuondoa na uanze tena.
              </motion.div>
            )}
          </AnimatePresence>
      </div>

      {availableItems.length > 0 && (
         <div className="border-t-2 border-[#202f36] pt-6">
            <div className="text-sm font-bold text-gray-400 mb-4 uppercase">Chagua Hatua Hapa Chini (Gusa Kupanga):</div>
            <div className="flex flex-col gap-3">
              {availableItems.map(item => (
                  <motion.div 
                    layoutId={`item-${item.id}`} 
                    key={item.id} 
                    onClick={() => handleSelect(item)} 
                    className="bg-[#202f36] border-2 border-[#37464f] text-white p-4 rounded-xl cursor-pointer hover:bg-[#37464f] font-medium active:scale-95 transition-transform"
                  >
                      {item.text}
                  </motion.div>
              ))}
            </div>
         </div>
      )}
    </div>
  );
}
