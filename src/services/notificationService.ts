import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

export type ReminderPersona = 'strict' | 'gentle' | 'hustler';
export type NotificationFrequency = '10s-test' | 'daily' | 'hourly';

export interface ReminderConfig {
  enabled: boolean;
  persona: ReminderPersona;
  frequency: NotificationFrequency;
  lastStudiedTimestamp: number;
}

// Creative multi-persona Swahili messages
const PERSONA_MESSAGES: Record<ReminderPersona, Array<{ title: string; body: string }>> = {
  strict: [
    {
      title: "Mwalimu Mkali 🍎",
      body: "Mkuu, umeridhika na hali yako ya sasa? 🤨 Rudi darasani sasa hivi uendelee na masomo ya biashara!"
    },
    {
      title: "Mwalimu Mkali 🍎",
      body: "Eti unataka mafanikio lakini masomo huelewi au hutaki kusoma? Hatua ya leo ya Ujuzi inakusubiri! 🔑"
    },
    {
      title: "Mwalimu Mkali 🍎",
      body: "Elimu ni ufunguo wa maisha... lakini umeacha ufunguo nyumbani tangu jana! Fungua programu sasa hivi usome."
    }
  ],
  gentle: [
    {
      title: "Ndugu Mpole 🤝",
      body: "Habari mpendwa rafiki! 👋 Neema na Juma wanakusubiri uendeleze safari yako ya kipekee leo."
    },
    {
      title: "Ndugu Mpole 🤝",
      body: "Kusoma dakika 5 tu kwa siku kunaweza kuokoa biashara yako ya mtandaoni haraka sana. Tuonane darasani!"
    },
    {
      title: "Ndugu Mpole 🤝",
      body: "Rafiki, usijali kama jana hukuweza. Leo ni siku mpya kabisa yenye fursa mpya, tuisome pamoja sasa. ✨"
    }
  ],
  hustler: [
    {
      title: "Tajiri wa Kisasa 💸",
      body: "Eti mkuu, TZS 450,000 za faida ya mwezi huu zipotee hivi hivi? Bofya hapa uokoe soko lako sasa! 🚀"
    },
    {
      title: "Tajiri wa Kisasa 💸",
      body: "Wenzako wanabadilisha 'Akaunti za Instagram' kuwa mashine ya kupigia hela. Wewe unasubiri nini? Fungua darasa sasa!"
    },
    {
      title: "Tajiri wa Kisasa 💸",
      body: "Dili la leo limeiva! Usikubali wateja wakukimbie kwa kukosa maarifa ya kisaikolojia. Bofya hapa uokoe mteja."
    }
  ]
};

// Default Configuration
const DEFAULT_CONFIG: ReminderConfig = {
  enabled: true,
  persona: 'gentle',
  frequency: 'daily',
  lastStudiedTimestamp: Date.now()
};

// Retrieve configuration from local storage
export function getNotificationConfig(): ReminderConfig {
  if (typeof window === 'undefined') return DEFAULT_CONFIG;

  try {
    const enabledRaw = localStorage.getItem('ujuzi_notif_enabled');
    const personaRaw = localStorage.getItem('ujuzi_notif_persona') as ReminderPersona;
    const freqRaw = localStorage.getItem('ujuzi_notif_frequency') as NotificationFrequency;
    const lastStudiedRaw = localStorage.getItem('ujuzi_last_studied_time');

    return {
      enabled: enabledRaw !== null ? enabledRaw === 'true' : true,
      persona: personaRaw || 'gentle',
      frequency: freqRaw || 'daily',
      lastStudiedTimestamp: lastStudiedRaw ? parseInt(lastStudiedRaw, 10) : Date.now()
    };
  } catch (e) {
    return DEFAULT_CONFIG;
  }
}

// Update study timestamp manually on lesson/unit completions
export function updateLastStudiedTimestamp() {
  if (typeof window === 'undefined') return;
  const now = Date.now();
  localStorage.setItem('ujuzi_last_studied_time', now.toString());
  localStorage.setItem('ujuzi_missed_notified', 'false'); // reset notify state so they can receive future reminders
}

// Save complete configuration
export function saveNotificationConfig(config: Partial<ReminderConfig>) {
  if (typeof window === 'undefined') return;

  if (config.enabled !== undefined) {
    localStorage.setItem('ujuzi_notif_enabled', config.enabled ? 'true' : 'false');
  }
  if (config.persona !== undefined) {
    localStorage.setItem('ujuzi_notif_persona', config.persona);
  }
  if (config.frequency !== undefined) {
    localStorage.setItem('ujuzi_notif_frequency', config.frequency);
    // Reset notification trigger tracker when frequency is changed
    localStorage.setItem('ujuzi_missed_notified', 'false');
  }
  if (config.lastStudiedTimestamp !== undefined) {
    localStorage.setItem('ujuzi_last_studied_time', config.lastStudiedTimestamp.toString());
    localStorage.setItem('ujuzi_missed_notified', 'false');
  }
}

// Check notification permission state
export async function checkNotificationPermission(): Promise<'granted' | 'denied' | 'default'> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

// Request permission for push notifications
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.warn('Browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (e) {
      console.warn('Error requesting permission', e);
      return false;
    }
  }

  return false;
}

// Trigger standard web push or background push notification on demand
export async function triggerNativePushNotification(title: string, body: string, link: string = '/') {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.warn('System notifications not supported');
    return false;
  }

  // Request if not granted
  if (Notification.permission !== 'granted') {
    const granted = await requestNotificationPermission();
    if (!granted) {
      console.warn('Push permission was denied.');
      return false;
    }
  }

  // Play custom subtle sound if needed, or default vibrate
  if (window.navigator?.vibrate) {
    window.navigator.vibrate([150, 80, 150]);
  }

  // Try to push through registered service worker for a clean PWA OS look!
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      if (reg) {
        reg.showNotification(title, {
          body,
          icon: '/icon.svg',
          badge: '/icon.svg',
          tag: 'ujuzi-reminder-sync',
          renotify: true,
          vibrate: [150, 80, 150],
          data: { url: link }
        } as any);
        return true;
      }
    } catch (e) {
      console.warn('Failed SW showNotification, using fallback window.Notification', e);
    }
  }

  // Fallback to Window Notification
  try {
    const notif = new Notification(title, {
      body,
      icon: '/icon.svg'
    });
    notif.onclick = () => {
      window.focus();
      if (link && link !== '/') {
        window.location.href = link;
      }
    };
    return true;
  } catch (err) {
    console.warn('Direct notification error:', err);
    return false;
  }
}

// Remote persistence: Save notification to Firebase so it is visible in the dropdown list
export async function addInAppNotification(userId: string | undefined, title: string, message: string, type: 'reminder' | 'system' = 'reminder') {
  if (!userId) return;
  try {
    await addDoc(collection(db, 'notifications'), {
      userId,
      title,
      message,
      type,
      createdAt: Timestamp.now(),
      read: false
    });
  } catch (e) {
    console.error('Failed to add in-app Firestore notification:', e);
  }
}

// Helper to personalize notifications with user's first name
export function personalizeMessage(text: string, name?: string | null): string {
  const finalName = name || 'Mkuu';
  return text
    .replace(/Mkuu/g, finalName)
    .replace(/mkuu/g, finalName.toLowerCase())
    .replace(/Rafiki/g, finalName)
    .replace(/rafiki/g, finalName.toLowerCase());
}

// Fetch random persona-based creative message
export function getRandomPersonaMessage(persona: ReminderPersona): { title: string; body: string } {
  const collectionList = PERSONA_MESSAGES[persona] || PERSONA_MESSAGES.gentle;
  const randomIndex = Math.floor(Math.random() * collectionList.length);
  return collectionList[randomIndex];
}

// Runs a check on app load or background interval to automatically trigger if lesson was missed
export async function checkAndTriggerReminder(userId?: string) {
  const config = getNotificationConfig();
  if (!config.enabled) return;

  const lastStudied = config.lastStudiedTimestamp;
  const now = Date.now();
  const timeDifferenceMs = now - lastStudied;

  let thresholdsMs = 24 * 60 * 60 * 1000; // default 24 hours
  if (config.frequency === '10s-test') {
    thresholdsMs = 10 * 1000; // 10 seconds for easy test sandbox mode!
  } else if (config.frequency === 'hourly') {
    thresholdsMs = 60 * 60 * 1000; // 1 hour
  }

  // Verify we haven't already fired this specific missed-lesson notification
  const alreadyNotified = localStorage.getItem('ujuzi_missed_notified') === 'true';

  if (timeDifferenceMs >= thresholdsMs && !alreadyNotified) {
    const rawMessage = getRandomPersonaMessage(config.persona);
    const currentUser = auth.currentUser;
    const firstName = currentUser?.displayName ? currentUser.displayName.split(' ')[0] : null;

    const title = personalizeMessage(rawMessage.title, firstName);
    const body = personalizeMessage(rawMessage.body, firstName);
    
    // Fire native local push alert
    const success = await triggerNativePushNotification(title, body, '/');
    if (success) {
      localStorage.setItem('ujuzi_missed_notified', 'true');
      
      // Also register inside Firestore in-app notifications
      if (userId) {
        await addInAppNotification(userId, title, body, 'reminder');
      }
    }
  }
}
