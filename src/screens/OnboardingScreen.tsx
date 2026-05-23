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

      {/* Subtle overlay gradients to optimize contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent z-[-1] pointer-events-none" />

      {/* Top Floating App Identity Badge */}
      <div className="absolute top-6 left-6 z-10 flex items-center gap-2">
        <div className="bg-white/95 backdrop-blur-md text-black h-9 px-4 rounded-full flex items-center justify-center text-xs font-bold shadow-md border border-white/20 select-none">
          <Sparkles className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 mr-1.5 animate-pulse" />
          Ujuzi Platform
        </div>
      </div>

      {/* 2. Premium White Polished Animated Card */}
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
        className="bg-white/98 backdrop-blur-lg rounded-[2.5rem] p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)] flex flex-col border border-white/40 max-w-sm mx-auto w-full relative z-10"
      >
        {/* Swahili Visual Header */}
        <div className="space-y-1 mb-6">
          <h2 className="font-sans font-black text-3xl text-neutral-900 tracking-tight leading-[1.1] flex items-center gap-2">
            Karibu Ujuzi!
          </h2>
          <p className="text-sm text-neutral-500 font-medium leading-relaxed">
            Soma masomo ya biashara ya mtandaoni na kukuza mauzo yako kwa haraka na vitendo.
          </p>
        </div>

        {/* Highlight Metrics */}
        <div className="grid grid-cols-2 gap-3 mb-6 bg-neutral-50 p-3.5 rounded-2xl border border-neutral-100">
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Wanafunzi</span>
            <span className="text-sm font-extrabold text-neutral-800">5,000+ Biashara</span>
          </div>
          <div className="border-l border-neutral-200 pl-3">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Muda wa Somo</span>
            <span className="text-sm font-extrabold text-neutral-800">Dakika 5 tu / Siku</span>
          </div>
        </div>

        {/* Dynamic Errors Container */}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 text-xs font-semibold text-rose-500 text-center bg-rose-50 border border-rose-100 p-2.5 rounded-xl"
          >
            {errorMsg}
          </motion.div>
        )}

        {/* 3. Polished Single Action Google Authentication Button */}
        <button
          onClick={handleSignIn}
          disabled={isLoggingIn}
          className="w-full h-14 bg-white hover:bg-neutral-50 text-neutral-800 active:scale-[0.98] transition-all duration-200 border border-neutral-200/90 rounded-2xl flex items-center justify-center gap-3.5 px-4 cursor-pointer shadow-md shadow-neutral-100 disabled:opacity-75 select-none font-bold"
        >
          {isLoggingIn ? (
            <Loader2 className="w-5 h-5 text-neutral-500 animate-spin" />
          ) : (
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" 
              alt="Google G" 
              className="w-5.5 h-5.5 select-none shrink-0"
              referrerPolicy="no-referrer"
            />
          )}
          <span className="text-sm font-bold text-neutral-800 tracking-tight">
            {isLoggingIn ? 'Inafungua...' : 'Endelea na Google'}
          </span>
        </button>

        {/* Secure & Privacy Trust Label */}
        <div className="mt-5 flex items-center justify-center gap-1.5 text-gray-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-[11px] font-semibold tracking-normal uppercase text-gray-400">Ulinzi wa Google ni 100% Salama</span>
        </div>

      </motion.div>
    </div>
  );
}
