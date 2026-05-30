import { initializeApp } from 'firebase/app';
import { getFirestore, initializeFirestore, doc, getDoc, setDoc, enableMultiTabIndexedDbPersistence, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, signInAnonymously, signInWithPopup, linkWithPopup, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json'; // relative to src/lib/

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId);

// Enable offline IndexedDB persistence for Firestore
if (typeof window !== 'undefined') {
  enableMultiTabIndexedDbPersistence(db)
    .catch((err) => {
      if (err.code === 'failed-precondition') {
        // Multiple tabs open, persistence can only be enabled in one tab at a time.
        console.warn('Firestore persistence failed-precondition: multiple tabs open.');
      } else if (err.code === 'unimplemented') {
        // The current browser does not support all of the features required to enable persistence
        enableIndexedDbPersistence(db).catch((e) => {
          console.warn('Firestore single-tab persistence failed:', e);
        });
      } else {
        console.error('Firestore persistence error:', err);
      }
    });
}

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function getLessonFromFirestore(lessonId: string): Promise<string | null> {
  const pathForGet = `lessons/${lessonId}`;
  try {
    const docRef = doc(db, 'lessons', lessonId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().content as string;
    }
    return null;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. Network is offline.");
      return null;
    }
    handleFirestoreError(error, OperationType.GET, pathForGet);
    return null;
  }
}

export async function saveLessonToFirestore(lessonId: string, content: string): Promise<void> {
  const pathForWrite = `lessons/${lessonId}`;
  try {
    const docRef = doc(db, 'lessons', lessonId);
    await setDoc(docRef, { content, updatedAt: new Date() }, { merge: true });
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Save failed, client is offline.");
      return;
    }
    handleFirestoreError(error, OperationType.WRITE, pathForWrite);
  }
}
