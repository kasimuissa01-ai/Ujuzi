import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, signInAnonymously, onAuthStateChanged, signInWithPopup, signInWithRedirect, getRedirectResult, linkWithPopup, linkWithRedirect, signOut } from 'firebase/auth';
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

    // Dynamic recovery: process redirection result when PWA returns from Google login flow
    getRedirectResult(auth)
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
        console.error("Google auth redirect recovery failed:", error);
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
    const isPWA = isStandaloneApp();
    if (isPWA) {
      try {
        await signInWithRedirect(auth, googleProvider);
      } catch (redirectError) {
        sessionStorage.removeItem('ujuzi_auth_in_progress');
        console.error("Google Standalone redirect failed, fall-backing to popup:", redirectError);
        try {
          const result = await signInWithPopup(auth, googleProvider);
          sessionStorage.removeItem('ujuzi_auth_in_progress');
          trackEvent('Login', { method: 'GooglePopupFallback', userId: result.user.uid });
        } catch (error) {
          sessionStorage.removeItem('ujuzi_auth_in_progress');
          console.error("Popup fallback failed:", error);
          throw error;
        }
      }
    } else {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        sessionStorage.removeItem('ujuzi_auth_in_progress');
        trackEvent('Login', { method: 'Google', userId: result.user.uid });
      } catch (popupError: any) {
        console.warn("Popup blocked or failed in this web context. Bubbling error to UI.", popupError);
        sessionStorage.removeItem('ujuzi_auth_in_progress');
        throw popupError;
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
    const isPWA = isStandaloneApp();
    try {
      if (auth.currentUser && auth.currentUser.isAnonymous) {
        try {
          if (isPWA) {
            await linkWithRedirect(auth.currentUser, googleProvider);
          } else {
            const result = await linkWithPopup(auth.currentUser, googleProvider);
            trackEvent('Link Account', { method: 'Google', userId: result.user.uid });
          }
        } catch (linkError: any) {
          if (linkError.code === 'auth/credential-already-in-use' || linkError.code === 'auth/email-already-in-use') {
             // Let them login instead
             await loginWithGoogle();
          } else {
            throw linkError;
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
