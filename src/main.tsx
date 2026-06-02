import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './hooks/useAuth.tsx';

// @ts-ignore
import { registerSW } from 'virtual:pwa-register';

// Intercept expected offline network logs from third-party SDKs to prevent sandboxed false positive errors
if (typeof window !== 'undefined') {
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
    if (
      message.includes('Could not reach Cloud Firestore backend') ||
      (message.includes('@firebase/firestore') && message.includes('unavailable')) ||
      (message.includes('Connection failed') && message.includes('Firestore'))
    ) {
      console.warn('[Firestore Offline Notification Checked]:', ...args);
      return;
    }
    originalConsoleError(...args);
  };
}

// Unregister any stale, broken, or dev-mode service workers in sanbox/dev environments to break infinite refresh loops
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  const isProductionDomain = () => {
    const hostname = window.location.hostname;
    return hostname.includes('ujuzii.vercel.app') || hostname.includes('ujuzi.vercel.app');
  };

  if (!import.meta.env.PROD || !isProductionDomain()) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister().then(() => {
          console.log('[Sandbox Cleanup] Stale Service Worker unregistered successfully.');
        });
      }
    });
  }
}

// Only register the PWA service worker on production domains to avoid refresh loops in sandboxes and development
if (typeof window !== 'undefined' && import.meta.env.PROD) {
  const isProd = window.location.hostname.includes('ujuzii.vercel.app') || window.location.hostname.includes('ujuzi.vercel.app');
  if (isProd) {
    registerSW({ immediate: true });
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
);
