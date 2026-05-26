import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

/**
 * Check if OneSignal is allowed and configured to run on the current domain.
 */
export function isOneSignalAllowedOnCurrentDomain(): boolean {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  return (
    hostname.includes('ujuzii.vercel.app') || 
    hostname.includes('ujuzi.vercel.app') || 
    hostname === 'localhost' || 
    hostname === '127.0.0.1'
  );
}

/**
 * Access the global OneSignal instance safely.
 */
export function getOneSignalInstance(): any {
  if (typeof window === 'undefined') return null;
  if (!isOneSignalAllowedOnCurrentDomain()) return null;
  return (window as any).OneSignal;
}

/**
 * Check if Web Push/OneSignal notifications are supported.
 */
export function isOneSignalSupported(): boolean {
  if (typeof window === 'undefined') return false;
  if (!isOneSignalAllowedOnCurrentDomain()) return false;
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

/**
 * Retrieve the current OneSignal Push Subscription ID (Player ID).
 */
export function getOneSignalSubscriptionId(): string | null {
  const OneSignal = getOneSignalInstance();
  if (!OneSignal) return null;
  try {
    return OneSignal.User?.PushSubscription?.id || null;
  } catch (e) {
    console.warn('Error reading OneSignal PushSubscription id:', e);
    return null;
  }
}

/**
 * Checks if the user is currently opted into OneSignal Push Notifications.
 */
export function isOneSignalOptedIn(): boolean {
  const OneSignal = getOneSignalInstance();
  if (!OneSignal) return false;
  try {
    return !!OneSignal.User?.PushSubscription?.optedIn;
  } catch (e) {
    return false;
  }
}

/**
 * Opt-in to Push Notifications. Will request permission if not already granted.
 */
export async function optInPushNotifications(): Promise<boolean> {
  const OneSignal = getOneSignalInstance();
  if (!OneSignal) {
    throw new Error('OneSignal SDK haijapakiwa bado.');
  }

  try {
    // Request permission using the standard browser prompt via OneSignal
    if (typeof Notification !== 'undefined' && Notification.permission !== 'granted') {
      await OneSignal.Notifications.requestPermission();
    }
    
    // Opt-in the subscription
    await OneSignal.User?.PushSubscription?.optIn();
    
    // Auto sync with Firestore if possible
    const subId = OneSignal.User?.PushSubscription?.id;
    if (subId) {
      localStorage.setItem('ujuzi_onesignal_id', subId);
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          await updateDoc(userDocRef, {
            onesignalUserIds: arrayUnion(subId),
            lastNotificationType: 'onesignal',
            lastTokenUpdatedAt: new Date()
          });
        } catch (dbErr) {
          console.warn('Could not save OneSignal ID to users document:', dbErr);
        }
      }
    }
    return true;
  } catch (error: any) {
    console.error('optInPushNotifications failed:', error);
    throw error;
  }
}

/**
 * Opt-out of Push Notifications.
 */
export async function optOutPushNotifications(): Promise<boolean> {
  const OneSignal = getOneSignalInstance();
  if (!OneSignal) return false;

  try {
    await OneSignal.User?.PushSubscription?.optOut();
    return true;
  } catch (error) {
    console.error('optOutPushNotifications failed:', error);
    return false;
  }
}

/**
 * Identify / Log user into OneSignal to associate Firebase User ID safe and securely.
 */
export async function loginToOneSignal(userId: string): Promise<void> {
  if (typeof window === 'undefined') return;
  if (!isOneSignalAllowedOnCurrentDomain()) {
    console.log('OneSignal login skipped: domain is not allowed.');
    return;
  }

  // We push onto the deferred queue to ensure OneSignal is initialized
  const windowObj = window as any;
  windowObj.OneSignalDeferred = windowObj.OneSignalDeferred || [];
  windowObj.OneSignalDeferred.push(async function(OneSignal: any) {
    try {
      console.log('Identifying user in OneSignal with Firebase UID:', userId);
      await OneSignal.login(userId);

      // Sync user profile first name tag with OneSignal
      const currentUser = auth.currentUser;
      if (currentUser?.displayName) {
        const firstName = currentUser.displayName.split(' ')[0];
        try {
          await OneSignal.User.addTag("first_name", firstName);
          console.log('OneSignal first_name tag synced:', firstName);
        } catch (tagErr) {
          console.warn('Failed to sync tag with OneSignal:', tagErr);
        }
      }
      
      // Look up and track the subscription ID as well
      const subId = OneSignal.User?.PushSubscription?.id;
      if (subId) {
        localStorage.setItem('ujuzi_onesignal_id', subId);
      }
    } catch (e) {
      console.error('OneSignal login failed:', e);
    }
  });
}

/**
 * Log out of OneSignal (disassociate user session).
 */
export async function logoutFromOneSignal(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (!isOneSignalAllowedOnCurrentDomain()) {
    console.log('OneSignal logout skipped: domain is not allowed.');
    return;
  }

  const windowObj = window as any;
  windowObj.OneSignalDeferred = windowObj.OneSignalDeferred || [];
  windowObj.OneSignalDeferred.push(async function(OneSignal: any) {
    try {
      await OneSignal.logout();
      localStorage.removeItem('ujuzi_onesignal_id');
    } catch (e) {
      console.error('OneSignal logout failed:', e);
    }
  });
}
