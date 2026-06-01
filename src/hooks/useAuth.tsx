import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, signInAnonymously, onAuthStateChanged, signInWithPopup, signInWithRedirect, getRedirectResult, linkWithPopup, linkWithRedirect, signOut, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { identifyUser, trackEvent } from '../lib/mixpanel';
import { loginToOneSignal, logoutFromOneSignal } from '../services/onesignalService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginAnonymously: () => Promise<void>;
  linkAccount: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  loginWithGoogle: async () => {},
  loginAnonymously: async () => {},
  linkAccount: async () => {},
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Safety timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 5000);

    // Enforce robust persistent state storage explicitly to survive PWA closes or reloads
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        // Recover redirect outcome if they did login via redirect
        return getRedirectResult(auth);
      })
      .then((result) => {
        if (result) {
          sessionStorage.removeItem('ujuzi_auth_in_progress');
          setUser(result.user);
          identifyUser(result.user.uid, {
            $email: result.user.email,
            $name: result.user.displayName,
            isAnonymous: result.user.isAnonymous,
          });
          loginToOneSignal(result.user.uid);
          trackEvent('Login Redirect Resolved', { userId: result.user.uid });
        }
      })
      .catch((error) => {
        sessionStorage.removeItem('ujuzi_auth_in_progress');
        console.error("Google Auth local persistence or redirect setup failed:", error);
      });

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      clearTimeout(timeout);
      if (currentUser) {
        sessionStorage.removeItem('ujuzi_auth_in_progress');
        setUser(currentUser);
        identifyUser(currentUser.uid, {
          $email: currentUser.email,
          $name: currentUser.displayName,
          isAnonymous: currentUser.isAnonymous,
        });
        loginToOneSignal(currentUser.uid);
        trackEvent('Session Start', { isAnonymous: currentUser.isAnonymous });
      } else {
        setUser(null);
        logoutFromOneSignal();
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Standalone/PWA detection
  const isStandaloneApp = () => {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes('android-app://')
    );
  };

  const loginWithGoogle = async () => {
    sessionStorage.setItem('ujuzi_auth_in_progress', 'true');
    
    // Popup authentication is extremely robust for PWAs and standalone app displays,
    // as it stays fully native within the container sheet without page-displacement reloads.
    try {
      const result = await signInWithPopup(auth, googleProvider);
      sessionStorage.removeItem('ujuzi_auth_in_progress');
      setUser(result.user);
      trackEvent('Login Popup Succeeded', { userId: result.user.uid });
    } catch (popupError: any) {
      console.warn("Popup blocked or failed. Running slide-back redirect strategy...", popupError);
      
      // If popup is closed by user, don't fallback to redirect automatically, just let them retry.
      if (popupError?.code === 'auth/popup-closed-by-user') {
        sessionStorage.removeItem('ujuzi_auth_in_progress');
        throw popupError;
      }
      
      // Try fallback to redirect ONLY if popup fails due to unsupported features/blocked popup
      try {
        await signInWithRedirect(auth, googleProvider);
      } catch (redirectError: any) {
        sessionStorage.removeItem('ujuzi_auth_in_progress');
        console.error("Popup fallback redirect failed:", redirectError);
        throw redirectError;
      }
    }
  };

  const loginAnonymously = async () => {
    throw new Error("Kuingia kwa mgeni kumesitishwa. Tafadhali tumia Google Login kuingia mtandaoni.");
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      trackEvent('Logout');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const linkAccount = async () => {
    try {
      if (auth.currentUser && auth.currentUser.isAnonymous) {
        try {
          const result = await linkWithPopup(auth.currentUser, googleProvider);
          trackEvent('Link Account Succeeded', { userId: result.user.uid });
        } catch (linkError: any) {
          if (linkError.code === 'auth/credential-already-in-use' || linkError.code === 'auth/email-already-in-use') {
             // Already in use, let them login via standard Google flow instead
             await loginWithGoogle();
          } else {
             // Popup failed or not supported, try fallback to redirect
             try {
               await linkWithRedirect(auth.currentUser!, googleProvider);
             } catch (redirectError) {
               console.error("Link account with redirect fallthrough failed:", redirectError);
               throw redirectError;
             }
          }
        }
      } else {
        await loginWithGoogle();
      }
    } catch (error) {
      console.error("Linking failed:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, loginAnonymously, linkAccount, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
