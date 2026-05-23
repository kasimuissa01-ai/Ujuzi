import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { useAuth } from './useAuth';
import { trackEvent } from '../lib/mixpanel';

export interface UserProgress {
  userId: string;
  completedLessons: string[];
  streakDates: string[];
  updatedAt?: any;
}

export function useProgress() {
  const { user } = useAuth();
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [streakDates, setStreakDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper to load fallback local state if user is NOT logged in or while loading
  useEffect(() => {
    const savedLessons = localStorage.getItem('ujuzi_completed_lessons');
    if (savedLessons) {
      setCompletedLessons(JSON.parse(savedLessons));
    }
    const savedDates = localStorage.getItem('ujuzi_streak_dates');
    if (savedDates) {
      setStreakDates(JSON.parse(savedDates));
    }
  }, []);

  // Sync with Firestore if logged in
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const docRef = doc(db, 'user_progress', user.uid);
    
    const unsubscribe = onSnapshot(docRef, async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as UserProgress;
        setCompletedLessons(data.completedLessons || []);
        setStreakDates(data.streakDates || []);
        
        // Also update local storage for fallback
        localStorage.setItem('ujuzi_completed_lessons', JSON.stringify(data.completedLessons || []));
        localStorage.setItem('ujuzi_streak_dates', JSON.stringify(data.streakDates || []));
      } else {
        // If doc doesn't exist but we have local progress, let's upload it
        const localLessonsRaw = localStorage.getItem('ujuzi_completed_lessons');
        const localDatesRaw = localStorage.getItem('ujuzi_streak_dates');
        const localLessons = localLessonsRaw ? JSON.parse(localLessonsRaw) : [];
        const localDates = localDatesRaw ? JSON.parse(localDatesRaw) : [];
        
        try {
          await setDoc(docRef, {
            userId: user.uid,
            completedLessons: localLessons,
            streakDates: localDates,
            updatedAt: serverTimestamp()
          });
        } catch (error) {
          console.error("Failed to initialize remote progress", error);
        }
      }
      setLoading(false);
    }, (error) => {
      console.error("Progress sync error:", error);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const markLessonCompleted = async (lessonId: string) => {
    const newLessons = [...completedLessons];
    if (!newLessons.includes(lessonId)) {
      newLessons.push(lessonId);
      setCompletedLessons(newLessons);
      localStorage.setItem('ujuzi_completed_lessons', JSON.stringify(newLessons));
      
      // Update the study timestamp to reset reminder intervals
      try {
        const { updateLastStudiedTimestamp } = await import('../services/notificationService');
        updateLastStudiedTimestamp();
      } catch (err) {
        console.warn('Could not import or call updateLastStudiedTimestamp', err);
      }
      
      trackEvent('Lesson Completed', { 
        lessonId, 
        totalCompleted: newLessons.length,
        userId: user?.uid 
      });
      
      if (user) {
        try {
          await setDoc(doc(db, 'user_progress', user.uid), {
            userId: user.uid,
            completedLessons: newLessons,
            streakDates: streakDates, // keep existing
            updatedAt: serverTimestamp()
          }, { merge: true });
        } catch (error) {
          console.error("Failed to save lesson completion to Firestore", error);
        }
      }
    }
  };

  const markStreakToday = async () => {
    const today = new Date().toISOString().split('T')[0];
    const newDates = [...streakDates];
    
    if (!newDates.includes(today)) {
      newDates.push(today);
      setStreakDates(newDates);
      localStorage.setItem('ujuzi_streak_dates', JSON.stringify(newDates));

      trackEvent('Streak Maintained', { 
        date: today, 
        streakLength: newDates.length,
        userId: user?.uid
      });

      if (user) {
        try {
          await setDoc(doc(db, 'user_progress', user.uid), {
            userId: user.uid,
            completedLessons: completedLessons, // keep existing
            streakDates: newDates,
            updatedAt: serverTimestamp()
          }, { merge: true });
        } catch (error) {
          console.error("Failed to save streak to Firestore", error);
        }
      }
    }
  };

  return {
    completedLessons,
    streakDates,
    loadingProgress: loading,
    markLessonCompleted,
    markStreakToday
  };
}
