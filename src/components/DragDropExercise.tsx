import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DragDropBlock } from '../types/lesson';
import { GripVertical } from 'lucide-react';

interface SortableItemProps {
  id: string;
  text: string;
}

export function SortableItem(props: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: props.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-grab active:cursor-grabbing ${
        isDragging 
          ? 'bg-[#37464f] border-[#1cb0f6] shadow-xl opacity-90' 
          : 'bg-[#202f36] border-[#37464f] text-white hover:bg-[#37464f]'
      }`}
    >
      <GripVertical className="text-gray-400 w-5 h-5 shrink-0" />
      <span className="font-medium">{props.text}</span>
    </div>
  );
}

interface DragDropExerciseProps {
  step: DragDropBlock;
  onSuccess: (feedback: string) => void;
  canContinue: boolean;
}

export default function DragDropExercise({ step, onSuccess, canContinue }: DragDropExerciseProps) {
  const [items, setItems] = useState(step.items);

  // Initialize sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
        activationConstraint: {
            distance: 5 // require 5px movement to start drag (helps scrolling on mobile)
        }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    if (canContinue) return; // Disable drag if already succeeded

    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Check if correct order
        const currentOrder = newItems.map(i => i.id);
        const isCorrect = step.correct_order.every((id, index) => id === currentOrder[index]);
        
        if (isCorrect) {
            onSuccess(step.feedback);
        }
        
        return newItems;
      });
    }
  };

  return (
    <div className="flex flex-col gap-6 pt-2">
      {step.design_context === 'instagram_bio' && (
        <div className="bg-[#131f24] rounded-2xl border-2 border-[#37464f] overflow-hidden">
          <div className="p-4 border-b border-[#37464f] flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-pink-500 p-[3px]">
              <div className="w-full h-full bg-[#131f24] border-[2px] border-[#131f24] rounded-full overflow-hidden">
                 <img src="https://fhtnqhkxpvrfzxrwwtso.supabase.co/storage/v1/object/public/Ujuzi_pkus/1778583556967-removebg-preview.png" alt="Profile" className="w-full h-full object-cover" />
              </div>
            </div>
            <div>
              <div className="text-white font-bold text-lg">Amina wa Viatu</div>
              <div className="text-gray-400 text-sm">@amina_viatu</div>
            </div>
          </div>
          <div className="p-4">
            <div className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">Panga Bio Yako Hapa Chini:</div>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={items}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-col gap-2">
                  {items.map((item) => (
                    <SortableItem key={item.id} id={item.id} text={item.text} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </div>
      )}

      {step.design_context !== 'instagram_bio' && (
         <DndContext
             sensors={sensors}
             collisionDetection={closestCenter}
             onDragEnd={handleDragEnd}
           >
             <SortableContext
               items={items}
               strategy={verticalListSortingStrategy}
             >
               <div className="flex flex-col gap-3">
                 {items.map((item) => (
                   <SortableItem key={item.id} id={item.id} text={item.text} />
                 ))}
               </div>
             </SortableContext>
           </DndContext>
      )}
    </div>
  );
}
