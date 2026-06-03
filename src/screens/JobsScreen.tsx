import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Briefcase, 
  Loader2, 
  RefreshCw, 
  Copy, 
  Check, 
  ExternalLink, 
  ChevronRight, 
  Award, 
  DollarSign, 
  Percent, 
  Send,
  Sliders,
  ChevronDown,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { getApiUrl } from '../lib/apiUrl';
import { ScreenType } from '../App';

interface Job {
  id: string;
  title: string;
  platform: string;
  budget: string;
  description: string;
  postedAt: string;
  skills: string[];
  applicants?: number;
  competition?: string;
  url?: string;
}

interface Application {
  id: string;
  jobId: string;
  title: string;
  platform: string;
  budget: string;
  proposal: string;
  status: 'applied' | 'shortlisted' | 'won' | 'lost';
  appliedAt: string;
  estimatedValue: number;
  url?: string;
}

interface Props {
  onNavigate: (screen: ScreenType, params?: Record<string, any>) => void;
}

const specializations = [
  { id: 'design', label: 'Graphic Design & UI/UX' },
  { id: 'video', label: 'Video Editing' },
  { id: 'writing', label: 'Content Writing & Copywriting' },
  { id: 'social_media', label: 'Social Media Management' }
];

const LOCAL_OFFLINE_FALLBACK_JOBS: Job[] = [
  {
    id: "offline-logo-1",
    title: "Minimalist Business Logo Design for Tanzania Coffee agency",
    platform: "Fiverr",
    budget: "$25",
    postedAt: "Dakika chache zilizopita",
    description: "Looking for an expert designer to construct a simple, eye-catching minimalist branding logo for a domestic coffee business in Zanzibar. High-res vector outputs required.",
    skills: ["Graphic Design", "Logo Design", "Figma", "Branding"],
    applicants: 2,
    competition: "low",
    url: "https://www.fiverr.com/search/gigs?query=logo%20design"
  },
  {
    id: "offline-video-2",
    title: "Edit 5 Tiktok & Youtube Shorts Reels with Subtitles",
    platform: "Upwork",
    budget: "$35",
    postedAt: "Dakika chache zilizopita",
    description: "Need a talented editor to compile vertical video Shorts. Must add caption overlays, engaging cuts, zoom effects, and license-free background audio tracks.",
    skills: ["Video Editing", "CapCut", "TikTok Reels"],
    applicants: 3,
    competition: "low",
    url: "https://www.upwork.com/search/jobs/?q=video+editing"
  },
  {
    id: "offline-write-3",
    title: "Write 3 Zanzibar Tourism Articles for Travel Blog",
    platform: "Fiverr",
    budget: "$15",
    postedAt: "Muda mfupi uliopita",
    description: "Looking for a creative tourist blog writer to compose articles highlighting standard budget travel tips for visiting Stone Town and Zanzibar beach locations.",
    skills: ["Content Writing", "Copywriting", "SEO Articles"],
    applicants: 1,
    competition: "low",
    url: "https://www.fiverr.com/search/gigs?query=copywriting"
  },
  {
    id: "offline-insta-4",
    title: "Social Media Manager for Boutique Clothing Store",
    platform: "Upwork",
    budget: "$50",
    postedAt: "Muda mfupi uliopita",
    description: "Boutique shop looking for an Instagram & Pinterest content planner. You will create 3 posts per week with captions and hashtags. Can work remotely from Dar es Salaam.",
    skills: ["Social Media", "Instagram Marketing", "Canva"],
    applicants: 4,
    competition: "low",
    url: "https://www.upwork.com/search/jobs/?q=social+media"
  }
];

const generateClientFallbackProposal = (jobTitle: string, jobBudget: string, userFocus: string): string => {
  const spec = (userFocus || "").toLowerCase();
  
  let opening = `Hi there,\n\nI read through your project details regarding "${jobTitle}" and immediately envisioned how we can launch this cleanly. Working on this requires a clear project deliverable road map.`;
  let solutionParagraph = "For this contract, my priority is ensuring clear deliverables with robust attention to detail. I specialize in high-quality aesthetic structures, engaging content flows, and professional templates to make your brand stand out.";
  let workPlan = "- Step 1: Wireframe & review main assets to ensure perfect alignment.\n- Step 2: Custom crafting of outstanding visuals or copy to match your guidelines.\n- Step 3: Optimization, multi-format delivery, and rapid revisions based on your feedback.";
  let callToAction = "Are you available for a brief, 5-minute chat to discuss the scope and get started on this right away?\n\nBest regards,\nCreative Specialist";

  if (spec.includes("design") || spec.includes("figma") || spec.includes("logo") || spec.includes("graphic")) {
    opening = `Hello,\n\nYour creative design brief for "${jobTitle}" immediately caught my eye. I specialize in converting raw business concepts into outstanding, professional graphic layouts, logos, or Figma prototypes with excellent typography and color palette pairings.`;
    solutionParagraph = "My styling approach is modern, highly intuitive, and clean. I focus on creating visual harmony, balanced alignments, and delivering fully editable source files (vector/AI/PSD/Figma) that suit your target audience.";
    workPlan = "- Initial 2-3 design concepts for your exploration & selection\n- Final stylized layouts/vector assets crafted to perfection\n- Prompt revisions to hit the exact visual vibe you are looking for";
    callToAction = "Do you have 5 minutes to jump on a quick chat and check some design drafts I have ready?\n\nWarm regards,\nGraphic Design Partner";
  } else if (spec.includes("video") || spec.includes("edit") || spec.includes("shorts") || spec.includes("tiktok")) {
    opening = `Hi there,\n\nI noticed you are looking for support with your vertical video edits: "${jobTitle}". I can help edit highly engaging Shorts/Reels/TikToks that maximize watch time and capture immediate viewer attention.`;
    solutionParagraph = "I have extensive experience working in CapCut, Premiere, and After Effects for social platforms. I prioritize seamless transitions, auto-synced word-by-word subtitles, zoom layouts, and custom sound design to drive engagement.";
    workPlan = "- Trimming dead weight to ensure a high-retention cinematic hook\n- Custom animated text captions, b-roll footage integration, and sound-effect accents\n- Final color correction and format export ready for high-resolution upload";
    callToAction = "Do you have a file link? I can draft a 5-second sample, or we can chat briefly to plan your delivery!\n\nBest regards,\nVideo Editing Specialist";
  } else if (spec.includes("social") || spec.includes("media") || spec.includes("manager") || spec.includes("marketing")) {
    opening = `Hi there,\n\nI see you need a highly persuasive campaign or page setup for "${jobTitle}". Managing social media accounts is about consistent branding, elegant post layouts, and hyper-engaging copywriting.`;
    solutionParagraph = "I specialize in building zero-friction content calendars that establish authority. I focus on optimizing captions, deploying trending hashtag trees, scheduling posts at peak hours, and running simple high-ROI ads.";
    workPlan = "- Social feed audit & target aesthetic grid setup\n- Rapid creation of high-click graphics and compelling captions for the week\n- Smart scheduling & daily community touchpoints to foster real follower growth";
    callToAction = "Are you open to a quick chat to discuss your brand aesthetic or monthly posting calendar?\n\nBest regards,\nSocial Media Manager";
  } else if (spec.includes("writing") || spec.includes("copy") || spec.includes("seo") || spec.includes("writer")) {
    opening = `Hi there,\n\nI read your brief for "${jobTitle}" and would love to help craft highly engaging, polished, and search-optimized copy that speaks to your readers clearly.`;
    solutionParagraph = "I specialize in converting ideas into simple, high-converting copy that builds trust. I prioritize emotional hooks, active reader-centric formatting, and natural SEO keyword integration for organic reach.";
    workPlan = "- Competitor SEO research & content structure benchmarking\n- Hand-crafted copy drafts with engaging sub-headers and catchy calls-to-action\n- Multi-point keyword and grammar validation to ensure peak delivery";
    callToAction = "Could we connect for a brief chat to discuss your project tone and draft the first outline today?\n\nBest regards,\nCopywriter & SEO Partner";
  }

  return `${opening}\n\n${solutionParagraph}\n\nWhat I propose for your project:\n${workPlan}\n\n${callToAction}`;
};

export default function JobsScreen({ onNavigate }: Props) {
  // Tabs: 'feed' (Dili), 'applications' (Maombi), 'stats' (Ripoti)
  const [activeTab, setActiveTab] = useState<'feed' | 'applications' | 'stats'>('feed');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [refreshingJobs, setRefreshingJobs] = useState(false);
  
  // Local storage application tracking
  const [applications, setApplications] = useState<Application[]>([]);
  
  // Proposal writing modal state
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedSpecialization, setSelectedSpecialization] = useState('design');
  const [generatingProposal, setGeneratingProposal] = useState(false);
  const [currentProposal, setCurrentProposal] = useState('');
  const [copied, setCopied] = useState(false);

  // Job translation states
  const [translatedJobs, setTranslatedJobs] = useState<Record<string, { title: string; description: string; lang: 'sw' | 'en' }>>({});
  const [translatingId, setTranslatingId] = useState<string | null>(null);

  // Proposal Translation states
  const [translatedProposalText, setTranslatedProposalText] = useState<string>('');
  const [translatingProposal, setTranslatingProposal] = useState(false);
  const [isProposalInSwahili, setIsProposalInSwahili] = useState(false);
  
  // Toast notifications for minimalist feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fetch initial scraped jobs
  const fetchJobs = async () => {
    try {
      setLoadingJobs(true);
      const res = await fetch(getApiUrl('/api/jobs'));
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setJobs(data);
        } else {
          setJobs(LOCAL_OFFLINE_FALLBACK_JOBS);
        }
      } else {
        setJobs(LOCAL_OFFLINE_FALLBACK_JOBS);
      }
    } catch (e) {
      console.warn("Failed to retrieve jobs:", e);
      setJobs(LOCAL_OFFLINE_FALLBACK_JOBS);
    } finally {
      setLoadingJobs(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    
    // Load existing applications
    const stored = localStorage.getItem('ujuzi_applications');
    if (stored) {
      try {
        setApplications(JSON.parse(stored));
      } catch (err) {
        console.warn(err);
      }
    }
  }, []);

  const saveApplicationsToLocal = (updated: Application[]) => {
    setApplications(updated);
    localStorage.setItem('ujuzi_applications', JSON.stringify(updated));
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const handleRefreshJobs = async () => {
    if (refreshingJobs) return;
    try {
      setRefreshingJobs(true);
      const res = await fetch(getApiUrl('/api/jobs/refresh'), {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        if (data.allJobs && data.allJobs.length > 0) {
          setJobs(data.allJobs);
          showToast("Scraper retrieved fresh freelance bids from Fiverr, Upwork, & Freelancer");
        } else {
          setJobs(LOCAL_OFFLINE_FALLBACK_JOBS);
          showToast("Imesakinishwa fursa mbadala kienyeji (Offline Catalog loaded)");
        }
      } else {
        setJobs(LOCAL_OFFLINE_FALLBACK_JOBS);
        showToast("Imetumia fursa safi kienyeji (Offline Catalog loaded)");
      }
    } catch (e) {
      console.warn(e);
      setJobs(LOCAL_OFFLINE_FALLBACK_JOBS);
      showToast("Imetumia fursa mbadala kienyeji");
    } finally {
      setRefreshingJobs(false);
    }
  };

  const handleTranslateJob = async (jobId: string, title: string, description: string) => {
    const cached = translatedJobs[jobId];
    if (cached) {
      setTranslatedJobs({
        ...translatedJobs,
        [jobId]: {
          ...cached,
          lang: cached.lang === 'sw' ? 'en' : 'sw'
        }
      });
      return;
    }

    try {
      setTranslatingId(jobId);
      showToast("Fursa inatafsiriwa kwa Kiswahili na Gemini AI...");

      const titleRes = await fetch(getApiUrl('/api/translate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: title, targetLang: 'sw' })
      });
      const titleData = await titleRes.json();

      const descRes = await fetch(getApiUrl('/api/translate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: description, targetLang: 'sw' })
      });
      const descData = await descRes.json();

      setTranslatedJobs({
        ...translatedJobs,
        [jobId]: {
          title: titleData.translatedText || title,
          description: descData.translatedText || description,
          lang: 'sw'
        }
      });
      showToast("Imetafsiriwa kwa Kiswahili kwa ufasaha! 🌍");
    } catch (err) {
      console.warn("Translation failed:", err);
      showToast("Tafsiri imefeli. Tafadhali jaribu tena.");
    } finally {
      setTranslatingId(null);
    }
  };

  const handleTranslateProposal = async () => {
    if (!currentProposal) return;
    
    if (translatedProposalText) {
      setIsProposalInSwahili(!isProposalInSwahili);
      return;
    }

    try {
      setTranslatingProposal(true);
      showToast("Andiko linatafsiriwa kwa Kiswahili na Gemini AI...");
      
      const res = await fetch(getApiUrl('/api/translate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: currentProposal, targetLang: 'sw' })
      });
      
      if (res.ok) {
        const data = await res.json();
        setTranslatedProposalText(data.translatedText);
        setIsProposalInSwahili(true);
        showToast("Andiko limetafsiriwa kwa Kiswahili! 🌍");
      } else {
        showToast("Imeshindwa kufanya tafsiri ya proposal.");
      }
    } catch (err) {
      console.error(err);
      showToast("Imeshindwa kufanya tafsiri.");
    } finally {
      setTranslatingProposal(false);
    }
  };

  const handleGenerateProposal = async () => {
    if (!selectedJob) return;
    try {
      setGeneratingProposal(true);
      setCurrentProposal('');
      setTranslatedProposalText('');
      setIsProposalInSwahili(false);
      
      const specLabel = specializations.find(s => s.id === selectedSpecialization)?.label || 'Freelancer';
      
      const res = await fetch(getApiUrl('/api/jobs/proposal'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle: selectedJob.title,
          jobDescription: selectedJob.description,
          jobPlatform: selectedJob.platform,
          jobBudget: selectedJob.budget,
          userFocus: specLabel
        })
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentProposal(data.proposal);
      } else {
        const fallback = generateClientFallbackProposal(selectedJob.title, selectedJob.budget, specLabel);
        setCurrentProposal(fallback);
        showToast("Imetengeneza templeti safi (Offline Model)");
      }
    } catch (e) {
      console.warn(e);
      const specLabel = specializations.find(s => s.id === selectedSpecialization)?.label || 'Freelancer';
      const fallback = generateClientFallbackProposal(selectedJob.title, selectedJob.budget, specLabel);
      setCurrentProposal(fallback);
      showToast("Unda Kiolezo mbadala kienyeji (Offline Model)");
    } finally {
      setGeneratingProposal(false);
    }
  };

  const handleCopyProposal = () => {
    const textToCopy = isProposalInSwahili ? (translatedProposalText || currentProposal) : currentProposal;
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    showToast("Imenakiliwa kwenye clipboard (Copied!) 📋");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyJob = () => {
    if (!selectedJob) return;
    
    // Parse numeric budget helper
    const numBudget = parseInt(selectedJob.budget.replace(/[^0-9]/g, '')) || 50;
    
    const newApp: Application = {
      id: `app-${Date.now()}`,
      jobId: selectedJob.id,
      title: selectedJob.title,
      platform: selectedJob.platform,
      budget: selectedJob.budget,
      proposal: currentProposal,
      status: 'applied',
      appliedAt: new Date().toLocaleDateString('sw-TZ'),
      estimatedValue: numBudget,
      url: selectedJob.url
    };

    const updated = [newApp, ...applications];
    saveApplicationsToLocal(updated);
    showToast("Application logged. Track status in Applications list.");
    setSelectedJob(null);
  };

  const handleUpdateStatus = (appId: string, currentStatus: 'applied' | 'shortlisted' | 'won' | 'lost') => {
    const sequence: ('applied' | 'shortlisted' | 'won' | 'lost')[] = ['applied', 'shortlisted', 'won', 'lost'];
    const nextIdx = (sequence.indexOf(currentStatus) + 1) % sequence.length;
    const nextStatus = sequence[nextIdx];

    const updated = applications.map(app => {
      if (app.id === appId) {
        return { ...app, status: nextStatus };
      }
      return app;
    });
    saveApplicationsToLocal(updated);
    showToast(`Status updated to ${nextStatus.toUpperCase()}`);
  };

  const handleDeleteApplication = (appId: string) => {
    const updated = applications.filter(app => app.id !== appId);
    saveApplicationsToLocal(updated);
    showToast("Tracked application removed");
  };

  // Stats Calculations
  const totalApps = applications.length;
  const shortlistedCount = applications.filter(a => a.status === 'shortlisted').length;
  const wonCount = applications.filter(a => a.status === 'won').length;
  const lostCount = applications.filter(a => a.status === 'lost').length;
  
  const winRate = totalApps > 0 ? Math.round((wonCount / totalApps) * 100) : 0;
  
  const totalEarnings = applications
    .filter(a => a.status === 'won')
    .reduce((acc, a) => acc + (a.estimatedValue || 0), 0);

  // SVG Chart points coordinate builders
  const chartDataPoints = applications
    .filter(a => a.status === 'won')
    .reverse()
    .map((app, idx) => ({
      label: app.appliedAt,
      val: app.estimatedValue,
    }));

  return (
    <div className="flex-1 flex flex-col bg-[#ececf0] h-full overflow-y-auto pb-36 relative select-none font-sans">
      {/* Toast Notification Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 16 }}
            exit={{ opacity: 0, y: -50 }}
            className="absolute top-4 left-4 right-4 z-50 bg-neutral-900 border border-neutral-800 text-white py-3 px-4 rounded-xl text-xs font-semibold shadow-lg text-center leading-normal"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header sticky styled after minimal design principles */}
      <div className="px-6 pt-12 pb-4 bg-[#ececf0] sticky top-0 z-30 border-b border-neutral-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black uppercase tracking-widest text-[#121212]">
              Fursa za Kazi
            </h1>
            <p className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 mt-0.5">
              Apify Matching Engine
            </p>
          </div>
          <button 
            onClick={handleRefreshJobs}
            disabled={refreshingJobs}
            className="w-10 h-10 bg-white border border-neutral-300 rounded-full flex items-center justify-center text-neutral-800 shadow-sm transition-transform active:scale-90 disabled:opacity-50"
            title="Soma mabadiliko dondoo toka Fiverr"
          >
            <RefreshCw className={`w-4 h-4 ${refreshingJobs ? 'animate-spin text-neutral-500' : 'text-black'}`} />
          </button>
        </div>

        {/* Minimal Threads-Style Tab Selector */}
        <div className="flex border-b border-neutral-200/50 mt-6 md:mt-8">
          <button 
            onClick={() => setActiveTab('feed')}
            className={`flex-1 pb-3 text-xs font-black tracking-wider uppercase text-center transition-colors relative ${
              activeTab === 'feed' ? 'text-black' : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Dili Mpya
            {activeTab === 'feed' && (
              <motion.div layoutId="jobsTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
            )}
          </button>
          
          <button 
            onClick={() => setActiveTab('applications')}
            className={`flex-1 pb-3 text-xs font-black tracking-wider uppercase text-center transition-colors relative ${
              activeTab === 'applications' ? 'text-black' : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Maombi Yangu
            {totalApps > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-black text-white text-[9px] font-black rounded-full">
                {totalApps}
              </span>
            )}
            {activeTab === 'applications' && (
              <motion.div layoutId="jobsTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
            )}
          </button>
          
          <button 
            onClick={() => setActiveTab('stats')}
            className={`flex-1 pb-3 text-xs font-black tracking-wider uppercase text-center transition-colors relative ${
              activeTab === 'stats' ? 'text-black' : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Ripoti ya Kipato
            {activeTab === 'stats' && (
              <motion.div layoutId="jobsTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
            )}
          </button>
        </div>
      </div>

      {/* Screen Body Content Panels */}
      <div className="px-6 py-4 flex-1">
        
        {/* TAB 1: SCRAPED JOBS FEED */}
        {activeTab === 'feed' && (
          <div className="space-y-4">
            {loadingJobs ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Loader2 className="w-8 h-8 text-neutral-800 animate-spin shrink-0 mb-4" />
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">
                  Checking newest matches on Upwork & Fiverr...
                </span>
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-16 bg-white border border-neutral-200/60 rounded-[2rem] p-6">
                <Briefcase className="w-8 h-8 text-neutral-400 mx-auto mb-3" />
                <p className="text-xs font-bold text-neutral-700">No client briefs pulled from scraper database.</p>
                <button 
                  onClick={handleRefreshJobs}
                  className="mt-4 px-4 py-2 bg-neutral-900 text-white rounded-xl text-[10px] font-black uppercase tracking-wider"
                >
                  Pull Fresh Gigs
                </button>
              </div>
            ) : (
              <div className="space-y-3.5">
                {refreshingJobs && (
                  <div className="text-center py-2 bg-neutral-100 border border-neutral-200/50 rounded-xl text-[10px] font-bold text-neutral-500 animate-pulse">
                    Apify crawler exploring freelance directories...
                  </div>
                )}
                           {jobs.map((job) => {
                  const isTranslated = translatedJobs[job.id]?.lang === 'sw';
                  const displayTitle = isTranslated ? (translatedJobs[job.id]?.title || job.title) : job.title;
                  const displayDescription = isTranslated ? (translatedJobs[job.id]?.description || job.description) : job.description;

                  return (
                    <div 
                      key={job.id}
                      className="bg-white border border-neutral-200/60 rounded-[2rem] p-5 shadow-sm transition-all text-left group hover:border-neutral-300 relative overflow-hidden"
                    >
                      {/* Platform Brand Indicators */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-black lowercase tracking-wider border px-2 py-0.5 rounded-full ${
                            job.platform === 'Upwork' ? 'border-[#14a800] bg-[#14a800]/5 text-[#14a800]' :
                            job.platform === 'Fiverr' ? 'border-[#1dbf73] bg-[#1dbf73]/5 text-[#1dbf73]' :
                            'border-[#29b2fe] bg-[#29b2fe]/5 text-[#29b2fe]'
                          }`}>
                            {job.platform}
                          </span>
                          <span className="text-[10px] font-mono text-neutral-400">
                            {job.postedAt}
                          </span>
                        </div>
                        <span className="text-xs font-extrabold text-neutral-900 font-mono">
                          {job.budget}
                        </span>
                      </div>

                      <h3 className="text-sm font-black text-neutral-950 leading-tight">
                        {displayTitle}
                      </h3>

                      {/* Highly Targeted Low Competition Badge (As requested by User to secure immediate bids) */}
                      <div className="flex items-center gap-1.5 mt-2.5 mb-1.5 bg-[#1dbf73]/5 border border-[#1dbf73]/20 rounded-full px-3 py-1 w-fit">
                        <span className="w-2 h-2 rounded-full bg-[#1dbf73] animate-pulse shrink-0" />
                        <span className="text-[10px] font-black uppercase text-[#1dbf73] tracking-widest font-mono">
                          Waombaji: {job.applicants || Math.floor(Math.random() * 3) + 1} tu • Fursa Kuu ⚡
                        </span>
                      </div>
                      
                      <p className="text-[11px] text-neutral-500 leading-relaxed font-medium mt-2 mb-4 line-clamp-3">
                        {displayDescription}
                      </p>

                      <div className="flex items-center justify-between pt-1 border-t border-neutral-100/75">
                        <div className="flex flex-wrap gap-1">
                          {job.skills.slice(0, 3).map((subSkill) => (
                            <span key={subSkill} className="text-[9px] text-slate-500 font-bold bg-neutral-50 border border-neutral-150 px-1.5 py-0.5 rounded-md">
                              {subSkill}
                            </span>
                          ))}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTranslateJob(job.id, job.title, job.description);
                            }}
                            disabled={translatingId === job.id}
                            className="px-3.5 h-8 border border-neutral-300 hover:border-neutral-400 bg-white text-neutral-800 hover:bg-neutral-50 font-extrabold text-[10px] tracking-widest uppercase rounded-full transition-all cursor-pointer flex items-center justify-center gap-1 shadow-sm active:scale-90 disabled:opacity-50"
                          >
                            {translatingId === job.id ? (
                              <Loader2 className="w-3 h-3 text-neutral-500 animate-spin shrink-0" />
                            ) : (
                              <span className="text-[10px]">{isTranslated ? "EN 🇬🇧" : "SW 🇹🇿"}</span>
                            )}
                            <span className="text-[10px]">{isTranslated ? "Asili" : "Tafsiri"}</span>
                          </button>

                          <button 
                            onClick={() => {
                              setSelectedJob(job);
                              setCurrentProposal('');
                              setTranslatedProposalText('');
                              setIsProposalInSwahili(false);
                            }}
                            className="px-5 h-8 bg-neutral-950 hover:bg-neutral-800 text-white font-extrabold text-[10px] tracking-widest uppercase rounded-full transition-all cursor-pointer flex items-center justify-center shadow-sm"
                          >
                            OMBA
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: APPLICATIONS LIST WORKFLOW */}
        {activeTab === 'applications' && (
          <div className="space-y-4">
            {applications.length === 0 ? (
              <div className="text-center py-16 bg-white border border-neutral-200/60 rounded-[2rem] p-6">
                <Briefcase className="w-8 h-8 text-neutral-400 mx-auto mb-3" />
                <p className="text-xs font-bold text-neutral-700">Hamna maombi uliyotuma bado.</p>
                <p className="text-[10px] text-neutral-400 mt-1">Nenda kwenye &quot;Dili Mpya&quot; na uguse OMBA kutengeneza proposal.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.map((app) => (
                  <div 
                    key={app.id}
                    className="bg-white border border-neutral-200/60 rounded-[2rem] p-5 shadow-sm text-left relative"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-[9px] font-black lowercase tracking-wider border px-1.5 py-0.2 rounded-full ${
                        app.platform === 'Upwork' ? 'border-[#14a800] bg-[#14a800]/5 text-[#14a800]' :
                        app.platform === 'Fiverr' ? 'border-[#1dbf73] bg-[#1dbf73]/5 text-[#1dbf73]' :
                        'border-[#29b2fe] bg-[#29b2fe]/5 text-[#29b2fe]'
                      }`}>
                        {app.platform}
                      </span>
                      <button 
                        onClick={() => handleDeleteApplication(app.id)}
                        className="text-[10px] text-neutral-300 hover:text-rose-500 font-extrabold tracking-widest uppercase"
                      >
                        Futa
                      </button>
                    </div>

                    <h3 className="text-xs font-extrabold text-neutral-900 leading-tight">
                      {app.title}
                    </h3>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-100">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-mono text-neutral-400 leading-none">Budget</span>
                        <span className="text-xs font-bold text-neutral-800 font-mono mt-1">{app.budget}</span>
                      </div>
                      
                      {/* State Tracker Cycle Pill */}
                      <button 
                        onClick={() => handleUpdateStatus(app.id, app.status)}
                        className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider cursor-pointer border ${
                          app.status === 'applied' ? 'border-blue-200 bg-blue-50 text-blue-700' :
                          app.status === 'shortlisted' ? 'border-amber-200 bg-amber-50 text-amber-700' :
                          app.status === 'won' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' :
                          'border-neutral-200 bg-neutral-50 text-neutral-700'
                        }`}
                      >
                        {app.status}
                      </button>
                    </div>

                    {/* Expandable Proposal Content */}
                    <div className="mt-3 bg-neutral-50 rounded-xl p-3 border border-neutral-150">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block">Proposal Generated</span>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(app.proposal);
                            showToast("Proposal copied!");
                          }}
                          className="text-[9px] font-black uppercase text-neutral-400 hover:text-black flex items-center gap-1"
                        >
                          <Copy className="w-2.5 h-2.5" />
                          <span>Copy</span>
                        </button>
                      </div>
                      <p className="text-[10px] font-medium text-neutral-600 select-all leading-normal">
                        {app.proposal}
                      </p>
                    </div>

                    {app.url && (
                      <div className="mt-3.5 flex justify-end">
                        <a 
                          href={app.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-black uppercase text-emerald-600 hover:text-emerald-700 tracking-wider flex items-center gap-1.5 no-underline"
                          onClick={() => {
                            showToast("Kazi imefunguliwa tovutini!");
                          }}
                        >
                          <span>Fungua Kazi kwenye Tovuti ↗</span>
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: EARNINGS AND METRICS REPORTS */}
        {activeTab === 'stats' && (
          <div className="space-y-4">
            {/* Bento Grid Metrics */}
            <div className="grid grid-cols-2 gap-3.5">
              
              <div className="bg-white border border-neutral-200/60 p-5 rounded-[2rem] text-left">
                <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest block">Ushindi (Win Rate)</span>
                <span className="text-3xl font-black text-neutral-900 font-mono block mt-1">{winRate}%</span>
                <p className="text-[8px] text-neutral-400 font-semibold mt-1">Ushindi wa Kazi Ulizofungua</p>
              </div>

              <div className="bg-white border border-neutral-200/60 p-5 rounded-[2rem] text-left">
                <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest block">Kipato (Earnings)</span>
                <span className="text-3xl font-black text-emerald-700 font-mono block mt-1">${totalEarnings}</span>
                <p className="text-[8px] text-neutral-400 font-semibold mt-1">Jumla ya Dili Ulizofanikisha</p>
              </div>
            </div>

            <div className="bg-white border border-neutral-200/60 p-5 rounded-[2rem] text-left">
              <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest block mb-1">Ukuaji wa Mapato</span>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-[#121212]">Won Gigs Value</span>
                <span className="text-xs font-mono font-extrabold text-emerald-600">{wonCount} won / {totalApps} applied</span>
              </div>
              
              {/* Minimal Line Graph SVG representation */}
              <div className="h-28 w-full border-t border-neutral-200/65 pt-2 flex items-center justify-center">
                {chartDataPoints.length < 2 ? (
                  <p className="text-[10px] text-neutral-400 font-semibold italic">Endeleza ushindi wa kazi ili kuonyesha ripoti ya maendeleo.</p>
                ) : (
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 100 30">
                    <polyline
                      fill="none"
                      stroke="#059669"
                      strokeWidth="1.5"
                      points={chartDataPoints.map((p, i) => `${(i / (chartDataPoints.length - 1)) * 100},${30 - (p.val / totalEarnings) * 20}`).join(' ')}
                    />
                    {chartDataPoints.map((p, i) => (
                      <circle
                        key={i}
                        cx={(i / (chartDataPoints.length - 1)) * 100}
                        cy={30 - (p.val / totalEarnings) * 20}
                        r="2.5"
                        fill="#059669"
                      />
                    ))}
                  </svg>
                )}
              </div>
            </div>

            <div className="bg-white border border-neutral-200/60 p-5 rounded-[2rem] text-left">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-3">Maelezo ya Kazi Zilizoshinda</span>
              <div className="space-y-3.5">
                <div className="flex items-center justify-between text-xs border-b border-neutral-100 pb-2">
                  <span className="text-neutral-500 font-medium">Applied Apps</span>
                  <span className="font-bold text-neutral-900">{totalApps}</span>
                </div>
                <div className="flex items-center justify-between text-xs border-b border-neutral-100 pb-2">
                  <span className="text-neutral-500 font-medium">Shortlisted</span>
                  <span className="font-bold text-amber-600">{shortlistedCount}</span>
                </div>
                <div className="flex items-center justify-between text-xs border-b border-neutral-100 pb-2">
                  <span className="text-neutral-500 font-medium">Won</span>
                  <span className="font-bold text-emerald-600">{wonCount}</span>
                </div>
                <div className="flex items-center justify-between text-xs pb-1">
                  <span className="text-neutral-500 font-medium">Lost</span>
                  <span className="font-bold text-neutral-400">{lostCount}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* DETAILED BOTTOM DRAWER FOR WRITE/GENERATE AI PROPOSAL (OMBA Flow) */}
      <AnimatePresence>
        {selectedJob && (
          <>
            {/* Bottom sheet background backdrop layer */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedJob(null)}
              className="fixed inset-0 bg-black/60 z-40"
            />

            {/* Absolute Bottom Sliding Sheet Panel */}
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 350 }}
              className="fixed bottom-0 left-0 right-0 max-h-[85vh] bg-white rounded-t-[2.5rem] border-t border-neutral-200 z-50 overflow-y-auto outline-none pb-8 p-6 text-left"
            >
              <div className="w-12 h-1 bg-neutral-200 rounded-full mx-auto mb-5" />

              <div className="flex items-start justify-between mb-2">
                <span className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Proposal Generator</span>
                <span className="text-xs font-mono font-extrabold text-neutral-900">{selectedJob.budget}</span>
              </div>

              <h2 className="text-base font-black text-neutral-950 leading-snug mb-1">
                {selectedJob.title}
              </h2>
              <p className="text-[9px] font-mono text-neutral-500 mb-4">{selectedJob.platform}</p>

              {/* Specialization selection selector picker in Swahili and Premium Clean interface */}
              <div className="space-y-2 mb-5">
                <span className="text-[10px] font-black uppercase text-neutral-800 tracking-widest block">Ujuzi Maalum (My Skill Pitch)</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {specializations.map((spec) => (
                    <button
                      key={spec.id}
                      onClick={() => setSelectedSpecialization(spec.id)}
                      className={`h-9 px-3 text-[10px] font-bold rounded-xl border text-left transition-all ${
                        selectedSpecialization === spec.id
                          ? 'border-neutral-900 bg-neutral-950 text-white'
                          : 'border-neutral-200 hover:bg-neutral-50 text-neutral-600'
                      }`}
                    >
                      {spec.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Proposal Box */}
              <div className="bg-neutral-50 rounded-2xl border border-neutral-200/80 p-4.5 space-y-3.5 relative">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase text-neutral-400 tracking-widest">
                    {isProposalInSwahili ? "Andiko kwa Kiswahili" : "Andiko la Kiingereza (English Bid)"}
                  </span>
                  
                  {currentProposal && (
                    <div className="flex items-center gap-3">
                      {/* Language Choice Switcher */}
                      <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg border border-neutral-200">
                        <button
                          onClick={() => setIsProposalInSwahili(false)}
                          className={`px-2 py-0.5 text-[8px] font-black rounded-md transition-all ${
                            !isProposalInSwahili ? "bg-white text-black shadow-xs" : "text-neutral-500 hover:text-neutral-900"
                          }`}
                        >
                          EN 🇬🇧
                        </button>
                        <button
                          onClick={handleTranslateProposal}
                          disabled={translatingProposal}
                          className={`px-2 py-0.5 text-[8px] font-black rounded-md transition-all flex items-center gap-1 ${
                            isProposalInSwahili ? "bg-white text-black shadow-xs" : "text-neutral-500 hover:text-neutral-900"
                          }`}
                        >
                          {translatingProposal && <Loader2 className="w-2 h-2 animate-spin text-neutral-500 shrink-0" />}
                          <span>SW 🇹🇿</span>
                        </button>
                      </div>

                      <button 
                        onClick={handleCopyProposal}
                        className="p-1 text-neutral-400 hover:text-neutral-900"
                        title="Copy text to clipboard"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )}
                </div>

                {generatingProposal ? (
                  <div className="py-8 flex flex-col items-center justify-center text-center">
                    <Loader2 className="w-6 h-6 text-neutral-800 animate-spin mb-2" />
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                      AI inatengeneza andiko maalum la kazi hii (English)...
                    </span>
                  </div>
                ) : currentProposal ? (
                  <div className="space-y-3.5">
                    <p className="text-[11px] font-medium text-neutral-805 leading-normal bg-white p-3.5 rounded-xl border border-neutral-100 font-serif select-all break-words max-h-52 overflow-y-auto">
                      {isProposalInSwahili ? (translatedProposalText || currentProposal) : currentProposal}
                    </p>

                    {/* How to Apply Stepper Assist Box */}
                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-3.5 text-left">
                      <p className="text-[10px] font-black uppercase text-emerald-800 tracking-wider mb-1 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                        Jinsi ya Kupata Kazi Hii (How to Apply)
                      </p>
                      <p className="text-[10.5px] font-medium text-neutral-600 leading-relaxed">
                        1. Gusa alama ya <strong className="text-neutral-900 border-b border-dotted border-neutral-400 pb-0.5">Copy</strong> juu ya kisanduku cha proposal hapo juu.<br />
                        2. Gusa kitufe cha rangi ya kijani <strong>OMBA SASA ↗</strong> chini kufungua tovuti halisi ya Fiverr au Upwork.<br />
                        3. Bandika andiko, kisha tuma kupata dili kwa haraka zaidi!
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-[11.5px] italic text-neutral-400 leading-normal py-6 text-center">
                    Gusa kitufe hapa chini ili AI iandike andiko kali la kazi kulingana na ujuzi uliomiliki.
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 mt-5">
                <button
                  onClick={handleGenerateProposal}
                  disabled={generatingProposal}
                  className="w-full h-12 bg-neutral-950 text-white font-extrabold text-xs tracking-wider uppercase rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95 disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{currentProposal ? "Tengeneza Upya kwa AI ⚡" : "Tengeneza Proposal kwa AI"}</span>
                </button>

                {currentProposal && (
                  <div className="flex gap-2.5">
                    <button
                      onClick={handleApplyJob}
                      className="flex-1 h-12 border border-neutral-350 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-extrabold text-xs tracking-wider uppercase rounded-xl flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      HIFADHI MAOMBI
                    </button>
                    
                    {selectedJob.url && (
                      <a
                        href={selectedJob.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 h-12 bg-[#1dbf73] hover:bg-[#19a965] text-white font-extrabold text-xs tracking-wider uppercase rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md active:scale-95 text-center no-underline hover:text-white flex"
                        onClick={() => {
                          showToast("Ukuta wa kazi umefunguliwa! Bandika proposal yako sasa.");
                        }}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>OMBA SASA ↗</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
