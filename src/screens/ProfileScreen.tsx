import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LogOut, 
  Award, 
  CheckCircle2, 
  Flame, 
  User as UserIcon, 
  Mail, 
  Bell, 
  ShieldCheck, 
  ChevronRight, 
  X, 
  FileText, 
  Check, 
  Info,
  ExternalLink,
  Globe,
  Scale
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useProgress } from '../hooks/useProgress';
import { ScreenType } from '../App';
import { 
  getNotificationConfig, 
  saveNotificationConfig, 
  ReminderConfig, 
  ReminderPersona, 
  NotificationFrequency 
} from '../services/notificationService';

interface Props {
  onNavigate: (screen: ScreenType) => void;
}

export default function ProfileScreen({ onNavigate }: Props) {
  const { user, logout } = useAuth();
  const { completedLessons, streakDates } = useProgress();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Notification Config State
  const [notifConfig, setNotifConfig] = useState<ReminderConfig>({
    enabled: true,
    persona: 'gentle',
    frequency: 'daily',
    lastStudiedTimestamp: Date.now()
  });

  // UI state for sliding Legal Document Screen
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'terms' | 'privacy' | 'acceptable'>('all');

  // Load configuration on mount
  useEffect(() => {
    setNotifConfig(getNotificationConfig());
  }, []);

  const handleToggleNotifications = () => {
    const nextEnabled = !notifConfig.enabled;
    const updated = { ...notifConfig, enabled: nextEnabled };
    setNotifConfig(updated);
    saveNotificationConfig({ enabled: nextEnabled });
  };

  const handleChangePersona = (persona: ReminderPersona) => {
    const updated = { ...notifConfig, persona };
    setNotifConfig(updated);
    saveNotificationConfig({ persona });
  };

  const handleChangeFrequency = (frequency: NotificationFrequency) => {
    const updated = { ...notifConfig, frequency };
    setNotifConfig(updated);
    saveNotificationConfig({ frequency });
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      onNavigate('onboarding');
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Determine Swahili Badge Name based on completions
  const completionCount = completedLessons.length;
  let badgeName = "Mwanafunzi Mpya";
  let badgeBadge = "🥉 Shaba";

  if (completionCount >= 5) {
    badgeName = "Mtaalamu Level 1";
    badgeBadge = "🥇 Dhahabu";
  } else if (completionCount >= 2) {
    badgeName = "Mwanafunzi Machachari";
    badgeBadge = "🥈 Fedha";
  }

  return (
    <div className="flex-1 flex flex-col bg-[#ececf0] h-full relative overflow-hidden">
      {/* Scrollable Main Content Wrapper */}
      <div className="flex-1 overflow-y-auto pb-32">
        {/* Visual Top Highlight Segment */}
        <div className="bg-gradient-to-b from-[#ececf0] to-[#f4f4f6] px-6 pt-12 pb-6 border-b border-neutral-200">
          <h1 className="font-sans font-black text-3xl text-neutral-900 tracking-tight mb-6">Wasifu Wako</h1>
        
        {/* Profile Card Summary showing Google Profile Information */}
        <div className="flex items-center gap-4 bg-white p-5 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
          <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-slate-100 shadow-inner bg-neutral-900 flex items-center justify-center shrink-0">
            {user?.photoURL ? (
              <img 
                src={user.photoURL} 
                alt="Google Profile" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <UserIcon className="w-8 h-8 text-neutral-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-black text-neutral-900 leading-tight truncate">
              {user?.displayName || 'Rafiki wa Ujuzi'}
            </h2>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 font-medium select-all truncate">
              <Mail className="w-3.5 h-3.5 inline text-slate-400 shrink-0" />
              {user?.email || 'Hujajiunga na Google'}
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-5">
        
        {/* Rank & Stats badges */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-neutral-200/60 shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex flex-col justify-between">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-2">Hali ya Cheo</span>
            <div>
              <span className="text-xs font-bold text-neutral-800 line-clamp-1 block leading-tight">{badgeBadge}</span>
              <span className="text-[11px] text-slate-400 font-medium block mt-0.5">{badgeName}</span>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-neutral-200/60 shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex flex-col justify-between">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-2">Siku za Kasi</span>
            <div className="flex items-center gap-1.5">
              <Flame className="w-5 h-5 text-orange-500 fill-orange-500 shrink-0 animate-bounce" />
              <span className="text-xl font-black text-neutral-900 leading-none">{streakDates.length}</span>
              <span className="text-xs text-slate-500 font-bold">Streak</span>
            </div>
          </div>
        </div>

        {/* Dynamic Achievements & Stats Overview */}
        <div className="bg-white rounded-3xl p-5 border border-neutral-200/60 shadow-[0_4px_25px_rgba(0,0,0,0.01)] space-y-4">
          <h3 className="font-sans font-black text-sm text-neutral-900 uppercase tracking-wider">Hatua za Masomo</h3>
          
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-neutral-800 block animate-fade-in">Masomo Yaliyokamilika</span>
                <span className="text-[11px] text-slate-400 font-semibold uppercase">Umejifunza kwa Vitendo</span>
              </div>
            </div>
            <span className="text-lg font-black text-emerald-600">{completionCount}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-neutral-800 block">Cheti cha Mafunzo</span>
                <span className="text-[11px] text-slate-400 font-semibold uppercase">Masomo 5 Muhimu</span>
              </div>
            </div>
            <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
              {completionCount >= 5 ? "Kamilika" : `${completionCount}/5`}
            </span>
          </div>
        </div>

        {/* Polished Native-Looking Toggle Notification Feature Settings */}
        <div className="bg-white rounded-3xl p-5 border border-neutral-200/60 shadow-[0_4px_25px_rgba(0,0,0,0.01)] space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-neutral-800 uppercase tracking-wider">Arifa za Kusukuma</h4>
                <p className="text-[11px] text-slate-400 font-medium">Kupokea vikumbusho vya masomo</p>
              </div>
            </div>
            
            {/* Custom Interactive Toggle Switch */}
            <button
              onClick={handleToggleNotifications}
              className={`w-14 h-8 rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer ${
                notifConfig.enabled ? 'bg-black' : 'bg-neutral-200'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
                  notifConfig.enabled ? 'translate-x-[1.5rem]' : 'translate-x-[0]'
                }`}
              />
            </button>
          </div>

          {notifConfig.enabled && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-4 pt-3 border-t border-neutral-100"
            >
              {/* Persona Selection */}
              <div>
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-2.5">
                  Mtindo wa Kikumbusho (Assistant Persona)
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {(['strict', 'gentle', 'hustler'] as ReminderPersona[]).map((p) => {
                    const label = p === 'strict' ? 'Mkali 🍎' : p === 'gentle' ? 'Mpole 🤝' : 'Tajiri 💸';
                    const active = notifConfig.persona === p;
                    return (
                      <button
                        key={p}
                        onClick={() => handleChangePersona(p)}
                        className={`py-2 px-1 text-center shrink-0 rounded-xl text-xs font-bold border transition-all duration-150 cursor-pointer ${
                          active 
                            ? 'bg-black text-white border-black' 
                            : 'bg-neutral-50 text-slate-600 border-neutral-250 hover:bg-neutral-100'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Intervals selection */}
              <div>
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-2.5">
                  Mzunguko wa Vikumbusho
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {(['10s-test', 'hourly', 'daily'] as NotificationFrequency[]).map((f) => {
                    const label = f === '10s-test' ? 'Sekunde 10' : f === 'hourly' ? 'Kila Saa' : 'Kila Siku';
                    const active = notifConfig.frequency === f;
                    return (
                      <button
                        key={f}
                        onClick={() => handleChangeFrequency(f)}
                        className={`py-2 px-1 text-center shrink-0 rounded-xl text-xs font-bold border transition-all duration-150 cursor-pointer ${
                          active 
                            ? 'bg-black text-white border-black' 
                            : 'bg-neutral-50 text-slate-600 border-neutral-250 hover:bg-neutral-100'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Privacy, Legal Terms, and Conditions Settings Link */}
        <div className="bg-white rounded-3xl p-2 border border-neutral-200/60 shadow-[0_4px_25px_rgba(0,0,0,0.01)]">
          <button
            onClick={() => setShowPrivacy(true)}
            className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-neutral-50 transition-colors duration-150 text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-neutral-100 flex items-center justify-center text-slate-600">
                <FileText className="w-5 h-5 text-neutral-700" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-neutral-800 uppercase tracking-wider">Masharti & Faragha</h4>
                <p className="text-[11px] text-slate-400 font-medium">Platform Legal Documents (Ujuzi)</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Polished White Profile Logout Trigger */}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full h-14 bg-white hover:bg-neutral-50 active:scale-[0.98] transition-all duration-200 text-rose-600 border border-neutral-200/90 rounded-2xl flex items-center justify-center gap-3 px-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)] font-bold select-none cursor-pointer mt-4"
        >
          <LogOut className="w-4 h-4 shrink-0 text-rose-500" />
          <span className="text-sm font-black tracking-tight">Toka Kwenye Wasifu</span>
        </button>

      </div>
      </div>

      {/* AMAZING OVERLAY DESIGN FOR PDF ANALYSED LEGAL DOCUMENTS (Terms, Privacy Policy, Acceptable Use Policy is strictly fully functional and gorgeous) */}
      <AnimatePresence>
        {showPrivacy && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'tween', ease: [0.19, 1, 0.22, 1], duration: 0.35 }}
            className="absolute inset-0 z-[100] bg-[#f8f9fa] flex flex-col h-full overflow-hidden shadow-[0_-15px_40px_rgba(0,0,0,0.12)]"
          >
            {/* Smooth Floating Header */}
            <div className="bg-white px-6 pt-10 pb-4 border-b border-neutral-200 flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] text-indigo-600 font-extrabold tracking-widest uppercase block mb-0.5">Hati za Kisheria</span>
                <h2 className="font-sans font-black text-xl text-neutral-900 tracking-tight leading-none animate-fade-in">Ujuzi Legal Documents</h2>
              </div>
              <button
                onClick={() => setShowPrivacy(false)}
                className="w-10 h-10 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-slate-800 shrink-0 cursor-pointer active:scale-90 transition-all duration-150"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Filter Tabs Menu built exactly for rapid visual check */}
            <div className="bg-slate-50 border-b border-neutral-200 py-3 px-6 flex gap-1.5 overflow-x-auto scrollbar-none shrink-0">
              {(['all', 'terms', 'privacy', 'acceptable'] as const).map((tab) => {
                const label = tab === 'all' ? 'Zote' : tab === 'terms' ? 'Terms' : tab === 'privacy' ? 'Privacy' : 'Acceptable Use';
                const active = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-2 px-4 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 transition-all duration-150 cursor-pointer ${
                      active ? 'bg-black text-white shadow-sm' : 'bg-white text-slate-600 border border-neutral-200/60 hover:bg-slate-100'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Scrollable Document Core Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 pb-20 space-y-8">
              
              {/* Document Metadata Table Cards */}
              <div className="bg-white p-5 rounded-[2rem] border border-neutral-200/60 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-3.5 select-text">
                <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100">
                  <span className="text-slate-400 font-bold uppercase tracking-wider">Tarehe ya Kuanza</span>
                  <span className="font-extrabold text-neutral-800">1 June 2025</span>
                </div>
                <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100">
                  <span className="text-slate-400 font-bold uppercase tracking-wider">Jukwaa / Platform</span>
                  <span className="font-extrabold text-neutral-800 text-right">Ujuzi Freelance Job Assistant</span>
                </div>
                <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100">
                  <span className="text-slate-400 font-bold uppercase tracking-wider">Mamlaka (Jurisdiction)</span>
                  <span className="font-extrabold text-neutral-800">Tanzania (United Republic)</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-bold uppercase tracking-wider">Mawasiliano</span>
                  <a href="mailto:legal@ujuzi.app" className="font-extrabold text-indigo-600 hover:underline">legal@ujuzi.app</a>
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed font-semibold italic text-center select-text">
                "Hati hizi zinadhibiti matumizi yako ya jukwaa na huduma za Ujuzi, pamoja na application hii na muunganisho wa mifumo mingine yoyote ya AI. Kwa kutumia Ujuzi unakubali masharti haya kikamilifu."
              </p>

              {/* PART 1 — TERMS OF SERVICE */}
              {(activeTab === 'all' || activeTab === 'terms') && (
                <div className="space-y-4 select-text">
                  <div className="flex items-center gap-2 border-b border-indigo-100 pb-2">
                    <Scale className="w-5 h-5 text-indigo-500 shrink-0" />
                    <h3 className="font-sans font-black text-base text-neutral-950 uppercase tracking-tight">
                      SEHEMU YA 1 — TERMS OF SERVICE
                    </h3>
                  </div>

                  <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
                    <div>
                      <h4 className="font-black text-neutral-900 mb-1">1.1 Kuhusu Ujuzi (About Ujuzi)</h4>
                      <p>
                        Ujuzi ni mfumo wa kisasa unaotumia Artificial Intelligence (AI) kukupa masomo ya biashara, mbinu za masoko na mafunzo tanzu nchini Tanzania na Afrika Mashariki kwa ujumla.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-black text-neutral-900 mb-1">1.2 Vigezo vya Kujiunga (Eligibility)</h4>
                      <p>Mtumiaji lazima awe na umri wa miaka 18 au zaidi, na uwezo wa kisheria wa kukubaliana na masharti haya.</p>
                    </div>

                    <div>
                      <h4 className="font-black text-neutral-900 mb-1">1.3 Usajili wa Akaunti (Account Registration)</h4>
                      <p>
                        Unalazimika kuweka siri habari zako za kujiunga na kuhakikisha usalama wako. Toa taarifa mara moja kupitia <strong className="text-neutral-900">support@ujuzi.app</strong> ukihisi udukuzi.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-black text-neutral-900 mb-1">1.4 Gharama na Malipo (Billing & Subscriptions)</h4>
                      <p>
                        Ujuzi inatoa masomo ya bure na yenye malipo (subscription). Malipo yoyote ya kifurushi cha kwanza au vipengele vya juu hayasamehewi au kurejeshwa (non-refundable) isipokuwa kwa mujibu wa sheria.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-black text-neutral-900 mb-1">1.5 Maudhui ya AI (AI-Generated Content)</h4>
                      <p>
                        Majaribio na ushauri wa AI hutolewa kwa msaada tu na haijahakikishiwa kutoa mafanikio ya papo hapo bila vitendo vyako binafsi vya ujasiriamali. Una jukumu la kupitia vyema majibu au mapendekezo yoyote.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* PART 2 — PRIVACY POLICY */}
              {(activeTab === 'all' || activeTab === 'privacy') && (
                <div className="space-y-4 select-text">
                  <div className="flex items-center gap-2 border-b border-indigo-100 pb-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                    <h3 className="font-sans font-black text-base text-neutral-950 uppercase tracking-tight">
                      SEHEMU YA 2 — PRIVACY POLICY
                    </h3>
                  </div>

                  <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
                    <div>
                      <h4 className="font-black text-neutral-900 mb-1.5 inline-block">2.1 Taarifa Tunazokusanya (Data We Collect)</h4>
                      <ul className="list-disc list-inside space-y-1 pl-1 text-slate-500">
                        <li><strong>Identity:</strong> Jina kamili, jina la mtumiaji, na picha ya wasifu ya Google.</li>
                        <li><strong>Contact:</strong> Barua pepe na nambari ya simu ya WhatsApp.</li>
                        <li><strong>Professional:</strong> Malengo ya biashara, ujuzi, na masomo unayopenda kuchukua.</li>
                        <li><strong>Usage & Device:</strong> IP address, aina ya kifaa, na taarifa za uendeshaji katika kivinjari chako.</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-black text-neutral-900 mb-1">2.2 Matumizi ya Data Yako (How We Use Data)</h4>
                      <p>
                        Kukuandalia masomo yanayoendana na biashara yako, kukutumia arifa za mafunzo mapya au arifa za kusukuma katika kivinjari chako, pamoja na kuboresha programu hii.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-black text-neutral-900 mb-1">2.3 Kushiriki kwa Taarifa (Data Sharing)</h4>
                      <p>
                        Ujuzi hauuzyi data zako kwa watu wengine. Tunaweza kushirikisha watoa huduma wetu wa Cloud na muunganisho salama wa AI kama Gemini kwa ulinzi mkali na makubaliano rasmi pekee.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-black text-neutral-900 mb-1">2.4 Haki Zako za Kisheria (Your Rights)</h4>
                      <p>
                        Una haki ya kupata taarifa zako, kurekebisha makosa, na hata kuomba akaunti yako na taarifa zake zote zifutwe ndani ya siku 30 kwa kututumia ujumbe kupitia <strong className="text-neutral-900">privacy@ujuzi.app</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* PART 3 — ACCEPTABLE USE POLICY */}
              {(activeTab === 'all' || activeTab === 'acceptable') && (
                <div className="space-y-4 select-text">
                  <div className="flex items-center gap-2 border-b border-indigo-100 pb-2">
                    <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0" />
                    <h3 className="font-sans font-black text-base text-neutral-950 uppercase tracking-tight">
                      SEHEMU YA 3 — ACCEPTABLE USE POLICY
                    </h3>
                  </div>

                  <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
                    <div>
                      <h4 className="font-black text-neutral-900 mb-1">3.1 Malengo Yetu (Purpose)</h4>
                      <p>
                        Kusimamia maadili na kuruhusu utumiaji wenye tija wa programu hii ya kujifunzia ili kuwasaidia wajasiriamali wadogo nchini Tanzania na Afrika Mashariki.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-black text-neutral-900 mb-1.5">3.2 Matumizi Yasiyokubalika (Prohibited Use)</h4>
                      <ul className="list-disc list-inside space-y-1 pl-1 text-slate-500">
                        <li>Kugonga, kukanyaga au kuingilia mifumo ya usalama ya app hii.</li>
                        <li>Kutupia maoni yasiyofaa na unyanyasaji wa watumiaji wengine.</li>
                        <li>Kunakili na kusambaza upya maudhui ya Ujuzi bila kibali rasmi.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* FOOTER OF LEGAL DOCUMENTS */}
              <div className="pt-6 border-t border-neutral-200 text-center text-[10px] text-slate-400 select-text">
                <p>© 2026 Ujuzi. All rights reserved. Built with pride in Tanzania 🇹🇿</p>
                <p className="mt-1">Toleo thabiti: 1.0.4 • Leseni ya Kisheria ya TZ</p>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
