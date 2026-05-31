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

registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
);
