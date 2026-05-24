import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

// Helper to check if FCM is supported in the current browser
export function isFCMSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

// Request permission and retrieve FCM device token
export async function setupFCMToken(vapidKey: string): Promise<string | null> {
  if (!isFCMSupported()) {
    console.warn('FCM is not supported in this browser context (e.g. secure context HTTPS is required).');
    throw new Error('Push notifications haziafikiwi kwenye mazingira haya (Inahitaji HTTPS na kivinjari kisasa).');
  }

  try {
    const messaging = getMessaging();
    
    // Register the standard Firebase Messaging SW explicitly if not found
    const token = await getToken(messaging, {
      vapidKey: vapidKey,
    });

    if (token) {
      console.log('FCM Device Token acquired successfully:', token);
      
      // Save Token to LocalStorage for offline/fast usage
      localStorage.setItem('ujuzi_fcm_token', token);
      
      // Save Token to user's Firestore Profile document if logged in
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          await updateDoc(userDocRef, {
            fcmTokens: arrayUnion(token),
            lastTokenUpdatedAt: new Date()
          });
          console.log('FCM token registered under user Firestore doc:', currentUser.uid);
        } catch (e) {
          console.warn('Could not auto-save token directly to users collection (making sure collections exist):', e);
        }
      }
      return token;
    } else {
      throw new Error('Hakuna token iliyorejeshwa. Kagua ruhusa ya notification au weka ufunguo sahihi.');
    }
  } catch (error: any) {
    console.error('setupFCMToken failed:', error);
    throw error;
  }
}

// Active listener for FCM when the app is in the FOREGROUND
export function listenToForegroundMessages(onMessageReceived: (payload: any) => void) {
  if (!isFCMSupported()) return () => {};

  try {
    const messaging = getMessaging();
    return onMessage(messaging, (payload) => {
      console.log('Foreground message received in React context:', payload);
      onMessageReceived(payload);
    });
  } catch (e) {
    console.warn('Could not setup foreground FCM listener:', e);
    return () => {};
  }
}
