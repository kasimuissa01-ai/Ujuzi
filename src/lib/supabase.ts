/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

// Fallback to the provided keys if the environment variables aren't injected yet.
// Supabase Anon Keys are safe to expose in the browser client.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

export async function getLessonContent(lessonId: string): Promise<string | null> {
  if (!supabase) {
    console.warn("Supabase client is not initialized.");
    return null;
  }
  try {
    const { data, error } = await supabase
      .from('generated_lessons')
      .select('content')
      .eq('lesson_id', lessonId)
      .single();
      
    if (error || !data) return null;
    return data.content;
  } catch (err) {
    console.error("Error fetching lesson from Supabase:", err);
    return null;
  }
}

export async function saveLessonContent(lessonId: string, content: string): Promise<void> {
  if (!supabase) {
    console.warn("Supabase client is not initialized.");
    return;
  }
  try {
    await supabase
      .from('generated_lessons')
      .insert([{ lesson_id: lessonId, content }]);
  } catch (err) {
    console.error("Error saving lesson to Supabase:", err);
  }
}
