import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, X, Share, PlusSquare, MoreVertical } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

export default function InstallPrompt() {
  const { isInstallable, isInstalled, installApp } = usePWA();
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);

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
      // Show after a short delay for better UX
      const timer = setTimeout(() => {
        // Show if iOS (manual instructions), if installable (Android Chrome), or if trapped in an in-app browser
        if (isIOSDevice || isInstallable || inApp) {
          setIsVisible(true);
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isInstalled, isInstallable]);

  const handleClose = () => {
    setIsVisible(false);
    // Optional: store in localStorage to not show again for a while
    localStorage.setItem('ujuzi_install_dismissed', Date.now().toString());
  };

  if (isInstalled || !isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.9 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed bottom-6 left-6 right-6 z-[100] flex justify-center"
        >
          <div className="bg-black text-white rounded-[2rem] p-6 shadow-2xl border border-white/10 w-full max-w-[340px] relative overflow-hidden">
            {/* Logo background pattern (subtle) */}
            <div className="absolute -right-8 -bottom-8 opacity-5">
               <img src="https://i.postimg.cc/J0CyqrKM/IMG-20260510-235338.jpg" alt="" className="w-40 h-40 rotate-12" />
            </div>

            <button 
              onClick={handleClose}
              className="absolute top-4 right-4 p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white rounded-2xl p-0.5 mb-4 shadow-lg overflow-hidden flex items-center justify-center">
                <img 
                  src="https://i.postimg.cc/J0CyqrKM/IMG-20260510-235338.jpg" 
                  alt="Ujuzi Logo" 
                  className="w-full h-full object-cover rounded-[14px]"
                />
              </div>

              <h3 className="text-xl font-bold mb-1">Install Ujuzi App</h3>
              <p className="text-white/60 text-sm mb-6 px-4">
                Pata ufikiaji wa haraka na ujifunze popote ulipo, hata bila internet.
              </p>

              {isInAppBrowser ? (
                <div className="space-y-4 w-full">
                  <div className="bg-white/5 rounded-2xl p-4 text-left border border-white/5">
                    <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">FUNGUA KWENYE BROWSER</p>
                    <p className="text-sm mb-3">TikTok/Instagram inazuia ku-install App. Tafadhali fungua kwenye browser:</p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center text-[10px] font-bold">1</div>
                        <p className="text-sm flex items-center flex-wrap">
                          Bonyeza vidoti vitatu <MoreVertical className="w-4 h-4 mx-1" /> juu kulia.
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center text-[10px] font-bold">2</div>
                        <p className="text-sm">Chagua <b>Open in Browser</b> au Safari/Chrome.</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : isIOS ? (
                <div className="space-y-4 w-full">
                  <div className="bg-white/5 rounded-2xl p-4 text-left border border-white/5">
                    <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">JINSI YA KUINSTALL</p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center text-[10px] font-bold">1</div>
                        <p className="text-sm">Bonyeza <Share className="w-4 h-4 inline-block mx-1 mb-1" /> chini ya browser yako.</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center text-[10px] font-bold">2</div>
                        <p className="text-sm">Chagua <PlusSquare className="w-4 h-4 inline-block mx-1 mb-1" /> <b>Add to Home Screen</b>.</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={installApp}
                  className="w-full bg-white text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-neutral-200 transition-all active:scale-95"
                >
                  <Download className="w-5 h-5" />
                  Install App Now
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
