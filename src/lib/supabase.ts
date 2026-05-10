/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

// Fallback to the provided keys if the environment variables aren't injected yet.
// Supabase Anon Keys are safe to expose in the browser client.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fhtnqhkxpvrfzxrwwtso.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZodG5xaGt4cHZyZnp4cnd3dHNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0MzE1OTgsImV4cCI6MjA5NDAwNzU5OH0.3zlPVvDZDXIh8jKI_gY0geyNCBz9oIBpSFXFHTJG3TQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getLessonContent(lessonId: string): Promise<string | null> {
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
  try {
    await supabase
      .from('generated_lessons')
      .insert([{ lesson_id: lessonId, content }]);
  } catch (err) {
    console.error("Error saving lesson to Supabase:", err);
  }
}
