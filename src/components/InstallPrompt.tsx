import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Download, X, Share, PlusSquare, MoreVertical } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

export default function InstallPrompt() {
  const { isInstallable, isInstalled, installApp } = usePWA();
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);
  const [expandedState, setExpandedState] = useState<null | 'inapp' | 'ios' | 'manual_android'>(null);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    
    // Determine if iOS
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    // Detect In-App Browsers (TikTok, Instagram, Facebook, Snapchat, etc.)
    const inApp = /fban|fbav|instagram|instabridge|tiktok|musical_ly|snapchat|line|wv|webview/.test(userAgent) || 
                  (userAgent.includes('android') && userAgent.includes('version/'));
    setIsInAppBrowser(inApp);

    // Only show if not installed
    if (!isInstalled) {
      // Check if dismissed recently (e.g., last 2 hours)
      const dismissedTime = localStorage.getItem('ujuzi_install_dismissed2');
      let shouldShow = true;
      if (dismissedTime) {
        const diff = Date.now() - parseInt(dismissedTime, 10);
        if (diff < 1000 * 60 * 60 * 2) {
          shouldShow = false;
        }
      }

      if (shouldShow) {
        // Show after a short delay for better UX
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [isInstalled]);

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(false);
    localStorage.setItem('ujuzi_install_dismissed2', Date.now().toString());
  };

  const handleActionButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isInstallable) {
      installApp();
    } else if (isInAppBrowser) {
      setExpandedState(prev => prev === 'inapp' ? null : 'inapp');
    } else if (isIOS) {
      setExpandedState(prev => prev === 'ios' ? null : 'ios');
    } else {
      setExpandedState(prev => prev === 'manual_android' ? null : 'manual_android');
    }
  };

  if (isInstalled || !isVisible) return null;

  const content = (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="fixed bottom-24 left-4 right-4 z-[99999999] md:max-w-md md:mx-auto"
        >
          {/* Main Mini Sleek Card */}
          <div className="bg-neutral-950 border-2 border-white/20 rounded-2xl p-4 shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-xl text-white flex flex-col gap-2 relative overflow-hidden">
            {/* Background Light Spill */}
            <div className="absolute right-0 top-0 w-20 h-20 bg-[#58cc02]/20 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between gap-3 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-[10px] p-0.5 shrink-0 overflow-hidden flex items-center justify-center">
                  <img
                    src="https://i.postimg.cc/J0CyqrKM/IMG-20260510-235338.jpg"
                    alt="Ujuzi"
                    className="w-full h-full object-cover rounded-[8px]"
                  />
                </div>
                <div className="flex flex-col text-left">
                  <h4 className="text-[14px] font-black tracking-wide text-white uppercase leading-none mb-1">Ujuzi App</h4>
                  <p className="text-[11px] text-white/70 font-medium leading-none">Sakinisha Sasa</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleActionButtonClick}
                  className="bg-[#58cc02] hover:bg-[#46a302] text-white font-black text-[13px] px-4 py-2.5 rounded-full flex items-center gap-1.5 transition-all active:scale-95 shadow-lg shadow-[#58cc02]/30 cursor-pointer shrink-0"
                >
                  <Download className="w-4 h-4" strokeWidth={2.5} />
                  Sakinisha
                </button>
                <button
                  onClick={handleClose}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Micro Instruction Drawer inside the prompt */}
            {expandedState && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-2 pt-3 border-t border-white/10 text-[12px] text-white/90 space-y-2 text-left relative z-10"
              >
                {expandedState === 'inapp' && (
                  <div className="space-y-1.5 p-1">
                    <span className="font-bold text-[#ff4b4b] uppercase text-[10px] tracking-wider block mb-1">Kizuizi (Tik Tok / Instagram)</span>
                    <p className="flex items-center flex-wrap leading-relaxed">
                      1. Gusa vitone vitatu <MoreVertical className="w-4 h-4 inline mx-0.5 text-[#ff4b4b]" /> juu kulia.
                    </p>
                    <p className="leading-relaxed">2. Chagua <b>Fungua kwenye Browser (Open in Browser)</b> kisha sakinisha.</p>
                  </div>
                )}
                {expandedState === 'ios' && (
                  <div className="space-y-1.5 p-1">
                    <span className="font-bold text-[#1cb0f6] uppercase text-[10px] tracking-wider block mb-1">Jinsi ya Kuweka (iOS Safari):</span>
                    <p className="flex items-center leading-relaxed">
                      1. Gusa alama ya <Share className="w-4 h-4 inline mx-1 text-[#1cb0f6]" /> chini.
                    </p>
                    <p className="flex items-center leading-relaxed">
                      2. Shuka na chagua <PlusSquare className="w-4 h-4 inline mx-1 text-[#1cb0f6]" /> <b>Add to Home Screen</b>.
                    </p>
                  </div>
                )}
                {expandedState === 'manual_android' && (
                  <div className="space-y-1.5 p-1">
                    <span className="font-bold text-[#ffcd1f] uppercase text-[10px] tracking-wider block mb-1">Kuweka (Manually):</span>
                    <p className="leading-relaxed">1. Gusa alama ya vitone vitatu juu kulia.</p>
                    <p className="leading-relaxed">2. Chagua <b>Install app</b> au <b>Add to Home Screen</b>.</p>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return typeof document !== 'undefined' ? createPortal(content, document.body) : null;
}
