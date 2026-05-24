import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, signInAnonymously, onAuthStateChanged, signInWithPopup, signInWithRedirect, getRedirectResult, linkWithPopup, linkWithRedirect, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { identifyUser, trackEvent } from '../lib/mixpanel';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  linkAccount: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  loginWithGoogle: async () => {},
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
          setUser(result.user);
          identifyUser(result.user.uid, {
            $email: result.user.email,
            $name: result.user.displayName,
            isAnonymous: result.user.isAnonymous,
          });
          trackEvent('Login Redirect Resolved', { userId: result.user.uid });
        }
      })
      .catch((error) => {
        console.error("Google auth redirect recovery failed:", error);
      });

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      clearTimeout(timeout);
      if (currentUser) {
        setUser(currentUser);
        identifyUser(currentUser.uid, {
          $email: currentUser.email,
          $name: currentUser.displayName,
          isAnonymous: currentUser.isAnonymous,
        });
        trackEvent('Session Start', { isAnonymous: currentUser.isAnonymous });
      } else {
        // Sign in anonymously on first load
        try {
          await signInAnonymously(auth);
        } catch (error: any) {
          console.error("Anonymous auth failed:", error);
          if (error?.code === 'auth/admin-restricted-operation') {
            console.warn("Ujuzi dev note: Please enable Anonymous Authentication in the Firebase Console: Build > Authentication > Sign-in method");
          }
        }
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
    const isPWA = isStandaloneApp();
    if (isPWA) {
      try {
        await signInWithRedirect(auth, googleProvider);
      } catch (redirectError) {
        console.error("Google Standalone redirect failed, fall-backing to popup:", redirectError);
        try {
          const result = await signInWithPopup(auth, googleProvider);
          trackEvent('Login', { method: 'GooglePopupFallback', userId: result.user.uid });
        } catch (error) {
          console.error("Popup fallback failed:", error);
          throw error;
        }
      }
    } else {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        trackEvent('Login', { method: 'Google', userId: result.user.uid });
      } catch (popupError: any) {
        console.warn("Popup blocked or failed in this web context, activating redirect redirect mechanism...", popupError);
        try {
          await signInWithRedirect(auth, googleProvider);
        } catch (redirectError2) {
          console.error("Redirect fallback completely blocked:", redirectError2);
          throw redirectError2;
        }
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
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
            if (isPWA) {
              await signInWithRedirect(auth, googleProvider);
            } else {
              try {
                await signInWithPopup(auth, googleProvider);
              } catch {
                await signInWithRedirect(auth, googleProvider);
              }
            }
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
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, linkAccount, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
