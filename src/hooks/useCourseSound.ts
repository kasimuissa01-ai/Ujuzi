import { useRef, useCallback } from 'react';

const SOUNDS = {
  correct: 'https://fhtnqhkxpvrfzxrwwtso.supabase.co/storage/v1/object/public/Ujuzi_pkus/mixkit-page-forward-single-chime-1107.wav',
  wrong: 'https://fhtnqhkxpvrfzxrwwtso.supabase.co/storage/v1/object/public/Ujuzi_pkus/mixkit-wrong-answer-bass-buzzer-948.wav',
  complete: 'https://fhtnqhkxpvrfzxrwwtso.supabase.co/storage/v1/object/public/Ujuzi_pkus/mixkit-fantasy-game-success-notification-270.wav',
  ndio_kabisa: 'https://fhtnqhkxpvrfzxrwwtso.supabase.co/storage/v1/object/public/Ujuzi_pkus/ndio_kabisa.wav',
  safi_sana: 'https://fhtnqhkxpvrfzxrwwtso.supabase.co/storage/v1/object/public/Ujuzi_pkus/safi_sana.wav',
  vizuri_sana: 'https://fhtnqhkxpvrfzxrwwtso.supabase.co/storage/v1/object/public/Ujuzi_pkus/vizuri_sana.wav',
  bingo: 'https://fhtnqhkxpvrfzxrwwtso.supabase.co/storage/v1/object/public/Ujuzi_pkus/Bingo.wav'
};

const CORRECT_VOICES = ['ndio_kabisa', 'safi_sana', 'vizuri_sana', 'bingo'];
type SoundType = keyof typeof SOUNDS | 'correct_voice';

export function useCourseSound() {
  const audioRef = useRef<Record<string, HTMLAudioElement>>({});

  // Preload all sounds when hook is first used
  const preload = useCallback(() => {
    Object.entries(SOUNDS).forEach(([key, url]) => {
      const audio = new Audio(url);
      audio.preload = 'auto';
      audioRef.current[key] = audio;
    });
  }, []);

  // Play a sound by name
  const play = useCallback((name: SoundType) => {
    try {
      if (name === 'correct_voice') {
        const chime = audioRef.current['correct'];
        if (chime) {
          chime.currentTime = 0;
          chime.play().catch(() => {});
        }
        
        const randomKey = CORRECT_VOICES[Math.floor(Math.random() * CORRECT_VOICES.length)];
        const voice = audioRef.current[randomKey];
        if (voice) {
          // Play the voice slightly after the chime
          setTimeout(() => {
            voice.currentTime = 0;
            voice.play().catch(() => {});
          }, 300);
        }
        return;
      }

      const audio = audioRef.current[name];
      if (audio) {
        audio.currentTime = 0; // rewind to start so it plays fresh every time
        audio.play().catch(() => {
          // Browser blocked autoplay — user hasn't interacted yet, safe to ignore
        });
      }
    } catch (e) {
      // Silently fail — sound should never break the app
    }
  }, []);

  return { preload, play };
}
