import { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Sparkles, Loader2 } from 'lucide-react';
import { ScreenType } from '../App';
import { useAuth } from '../hooks/useAuth';

interface Props {
  onNavigate: (screen: ScreenType) => void;
}

export default function OnboardingScreen({ onNavigate }: Props) {
  const { loginWithGoogle } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSignIn = async () => {
    setIsLoggingIn(true);
    setErrorMsg(null);
    try {
      await loginWithGoogle();
      // On successful auth, App.tsx's useEffect automatically triggers navigation to 'home'
    } catch (error: any) {
      console.error("Google Auth failed:", error);
      setErrorMsg("Kuna tatizo la kuunganisha. Tafadhali jaribu tena.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div id="auth-screen" className="flex-1 flex flex-col justify-end p-6 h-full w-full overflow-hidden relative z-0">
      
      {/* 1. Request-Specific Cover Background Image */}
      <img
        src="https://i.postimg.cc/W1XGXBHv/a-vibrant-digital-illustration-for-a-mobile-app-a.png"
        alt="Vibrant App Illustration"
        referrerPolicy="no-referrer"
        className="absolute inset-0 w-full h-full object-cover z-[-2] pointer-events-none select-none"
      />

      {/* Subtle overlay gradients to optimize contrast for text and make images truly stand out */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/20 to-black/85 z-[-1] pointer-events-none" />

      {/* Top Floating App Identity Badge */}
      <div className="absolute top-6 left-6 z-10 flex items-center gap-2">
        <div className="bg-white/95 backdrop-blur-md text-black h-8 px-3 rounded-full flex items-center justify-center text-[10px] font-black tracking-wider uppercase shadow-md border border-white/20 select-none">
          <Sparkles className="w-3 h-3 text-orange-500 fill-orange-500 mr-1 animate-pulse shrink-0" />
          Ujuzi Platform
        </div>
      </div>

      {/* Top Left Main Branding Content Header (Senior Designer Request) */}
      <div className="absolute top-20 left-6 right-6 z-10 flex flex-col items-start text-left select-none">
        <h1 className="font-sans font-black text-4xl text-white tracking-tight leading-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
          KARIBU UJUZI
        </h1>
        <p className="mt-2 text-white/95 text-[14px] font-bold leading-relaxed max-w-[280px] drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
          Soma masomo ya biashara na ujuzi haraka na kwa vitendo.
        </p>
        
        {/* Dynamic Mobile Pills aligned perfectly for gorgeous style */}
        <div className="mt-4 flex flex-col gap-2">
          <div className="inline-flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl py-1.5 px-3 shadow-md">
            <span className="text-xs">👥</span>
            <span className="text-[11px] font-black text-white/90 uppercase tracking-wider">
              Wanafunzi 50,000+ Biashara
            </span>
          </div>
          <div className="inline-flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl py-1.5 px-3 shadow-md">
            <span className="text-xs">⏱️</span>
            <span className="text-[11px] font-black text-white/90 uppercase tracking-wider">
              Muda wa somo dakika 5 TU
            </span>
          </div>
        </div>
      </div>

      {/* 2. Premium Compact White Animated Client Login Trigger Card */}
      <motion.div
        initial={{ y: 220, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ 
          type: "spring", 
          stiffness: 110, 
          damping: 20,
          delay: 0.1 
        }}
        id="auth-white-card" 
        className="bg-white/95 backdrop-blur-xl rounded-[2rem] p-5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] flex flex-col border border-white/60 max-w-sm mx-auto w-full relative z-10 mb-2"
      >
        {/* Dynamic Errors Container if Authentication fails */}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 text-[11px] font-extrabold text-rose-500 text-center bg-rose-50 border border-rose-100 p-2 rounded-xl"
          >
            {errorMsg}
          </motion.div>
        )}

        {/* 3. Polished Single Action Google Authentication Button - Highly compact */}
        <button
          onClick={handleSignIn}
          disabled={isLoggingIn}
          className="w-full h-13 bg-neutral-900 hover:bg-black text-white active:scale-[0.98] transition-all duration-200 rounded-2xl flex items-center justify-center gap-3 px-4 cursor-pointer shadow-md disabled:opacity-75 select-none"
        >
          {isLoggingIn ? (
            <Loader2 className="w-5 h-5 text-neutral-400 animate-spin" />
          ) : (
            <div className="bg-white p-1 rounded-lg flex items-center justify-center shadow-sm shrink-0">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" 
                alt="Google G" 
                className="w-4.5 h-4.5 select-none"
                referrerPolicy="no-referrer"
              />
            </div>
          )}
          <span className="text-xs font-black uppercase tracking-wider text-white">
            {isLoggingIn ? 'Inafungua...' : 'Endelea na Google'}
          </span>
        </button>

        {/* Secure & Privacy Trust Label */}
        <div className="mt-3.5 flex items-center justify-center gap-1.5 text-neutral-500">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span className="text-[10px] font-black uppercase tracking-wide text-neutral-500">
            Ulinzi wa Google ni 100% Salama
          </span>
        </div>

      </motion.div>
    </div>
  );
}
