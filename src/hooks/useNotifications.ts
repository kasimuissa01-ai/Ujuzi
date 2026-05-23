import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './useAuth';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'course' | 'lesson' | 'reminder' | 'system';
  createdAt: Timestamp;
  read: boolean;
  link?: string;
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Request permission silently on mount
    import('../services/notificationService').then(({ requestNotificationPermission }) => {
      requestNotificationPermission().catch(e => console.warn('Notification permission request bypassed or denied:', e));
    });

    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    // Listen for notifications for the specific user
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: Notification[] = [];
      let unread = 0;
      
      snapshot.forEach((doc) => {
        const data = doc.data() as Omit<Notification, 'id'>;
        msgs.push({ id: doc.id, ...data });
        if (!data.read) unread++;
      });

      // Seamless Native Push Trigger: Any NEW unread document inserted into Firestore triggers a native push
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const docData = change.doc.data() as any;
          if (docData && !docData.read) {
            // Verify it was created recently (last 5 minutes) to avoid repeating on startup
            const createdTime = docData.createdAt?.toMillis ? docData.createdAt.toMillis() : Date.now();
            const ageMs = Date.now() - createdTime;
            if (ageMs < 300000) {
              const link = docData.link || '/';
              import('../services/notificationService').then(({ triggerNativePushNotification, getNotificationConfig }) => {
                const config = getNotificationConfig();
                if (config.enabled) {
                  triggerNativePushNotification(docData.title, docData.message, link);
                }
              }).catch(err => console.warn('Could not fire native push warning:', err));
            }
          }
        }
      });
      
      setNotifications(msgs);
      setUnreadCount(unread);
    }, (error) => {
      console.warn("Notification listener error:", error);
      // Fallback/Mock notifications for empty collection if needed
      if (notifications.length === 0) {
        setNotifications([
          {
            id: 'welcome',
            title: 'Karibu Ujuzi!',
            message: 'Anza leo na kozi ya Saikolojia ya Wateja.',
            type: 'system',
            createdAt: Timestamp.now(),
            read: false
          }
        ]);
        setUnreadCount(1);
      }
    });

    return unsubscribe;
  }, [user]);

  return { notifications, unreadCount };
}
