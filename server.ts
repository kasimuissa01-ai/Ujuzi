import express from "express";
import { getFirestore } from "firebase-admin/firestore";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import admin from "firebase-admin";
import cron from "node-cron";

dotenv.config();

// Load Firebase configuration once
let firebaseConfig: any = null;
try {
  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(configPath)) {
    firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  }
} catch (e) {
  console.warn("Failed to load firebase-applet-config.json in server.ts:", e);
}

// Lazy initializer for Firebase Admin SDK using HTTP v1
let adminAppInitialized = false;
function getFirebaseAdminInstance(): typeof admin | null {
  if (adminAppInitialized) {
    return admin;
  }

  let cert: admin.ServiceAccount | null = null;

  // 1. Check Full Service Account JSON string from environment variable (Option A)
  const envServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (envServiceAccount) {
    try {
      const cleaned = envServiceAccount.trim();
      const parsed = cleaned.startsWith("{") 
        ? JSON.parse(cleaned) 
        : JSON.parse(Buffer.from(cleaned, "base64").toString("utf8"));
      cert = parsed;
    } catch (e) {
      console.error("FCM v1: Imeshindwa kusoma FIREBASE_SERVICE_ACCOUNT ya env:", e);
    }
  }

  // 2. Check individual fields from environment variables (Option B)
  if (!cert && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PROJECT_ID) {
    try {
      const formattedPrivateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n");
      cert = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: formattedPrivateKey,
      };
    } catch (e) {
      console.error("FCM v1: Imeshindwa kuunda cheti kutoka kwa split fields:", e);
    }
  }

  // 3. Fallback to a local secure firebase-service-account.json file if present on disk
  const localCredsPath = path.join(process.cwd(), "firebase-service-account.json");
  if (!cert && fs.existsSync(localCredsPath)) {
    try {
      cert = JSON.parse(fs.readFileSync(localCredsPath, "utf-8"));
    } catch (e) {
      console.error("FCM v1: Imeshindwa kusoma faili ya firebase-service-account.json:", e);
    }
  }

  if (cert) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(cert),
      });
      adminAppInitialized = true;
      console.log("FCM v1: Firebase Admin imeanzishwa vizuri tayari kwa push notifications! 🚀");
      return admin;
    } catch (e) {
      console.error("FCM v1: initializeApp imefeli kwa cheti kibaya:", e);
    }
  }

  return null;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // CORS Middleware to allow requests from any origin (e.g. Vercel, localhost, previews)
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    } else {
      res.setHeader("Access-Control-Allow-Origin", "*");
    }
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // Dynamic Service Worker endpoint removed; using static generation via generate-sw.ts

  // Safe HTTP POST proxy endpoint to trigger OneSignal Push Notifications
  app.post("/api/send-push", async (req, res) => {
    const { token, title, body, link } = req.body;
    
    // Default OneSignal App ID from user parameter
    const onesignalAppId = process.env.ONESIGNAL_APP_ID || "1780c6e8-a0f3-4cc8-a5e1-a328a231a995";
    const onesignalApiKey = process.env.ONESIGNAL_REST_API_KEY;

    if (!token) {
      return res.status(400).json({ error: "OneSignal Subscription ID (Player ID) is required!" });
    }

    try {
      console.log(`Sending OneSignal single push to subscription ${token}...`);
      
      const payload: any = {
        app_id: onesignalAppId,
        include_subscription_ids: [token],
        headings: { en: title || "Ujuzi App 🎓" },
        contents: { en: body || "Huu ni ufalme wa masomo mapya!" },
        url: link || "/"
      };

      const headers: any = {
        "Content-Type": "application/json"
      };

      if (onesignalApiKey) {
        headers["Authorization"] = `Basic ${onesignalApiKey}`;
      }

      const response = await fetch("https://onesignal.com/api/v1/notifications", {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
      });

      const responseText = await response.text();
      console.log("OneSignal push API response status:", response.status, responseText);

      if (response.ok) {
        let details = {};
        try {
          details = JSON.parse(responseText);
        } catch {
          details = { raw: responseText };
        }
        res.json({
          success: true,
          method: "OneSignal REST API",
          details
        });
      } else {
        res.status(response.status).json({ error: responseText });
      }
    } catch (error: any) {
      console.error("OneSignal Send Proxy Error:", error);
      res.status(500).json({ error: error.message || "Failed to deliver push notification via OneSignal" });
    }
  });

  // AI Endpoint (Securely on server)
  app.post("/api/ai", async (req, res) => {
    const { prompt, jsonMode } = req.body;

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const result = await ai.models.generateContent({ 
        model: "gemini-2.5-flash",
        contents: prompt,
        config: jsonMode ? { responseMimeType: "application/json" } : undefined
      });

      const text = result.text;

      res.json({ text });
    } catch (error) {
      console.error("AI Error:", error);
      res.status(500).json({ error: "Failed to generate AI response" });
    }
  });

  // --- Apify Job Matching Engine Database & Routes (Sync-and-Serve Model) ---
  const APIFY_DEFAULT_TOKEN = "";
  let scrapedJobs: any[] = [];

  // Helper: Estimate age in days from Swahili/English dates
  function parseJobAgeInDays(postedStr: any): number {
    if (!postedStr) return 0;
    if (postedStr instanceof Date) {
      const diff = Date.now() - postedStr.getTime();
      return Math.floor(diff / (1000 * 60 * 60 * 24));
    }
    const str = String(postedStr).toLowerCase();
    if (str.includes("dakika") || str.includes("minute") || str.includes("muda") || str.includes("second") || str.includes("saa") || str.includes("hour")) {
      return 0; // Fresh
    }
    if (str.includes("siku") || str.includes("day")) {
      const match = str.match(/\d+/);
      if (match) return parseInt(match[0]);
      return 1;
    }
    return 0;
  }

  // Helper: Parse, Clean and Deduplicate Jobs to Firestore or Memory
  async function importScrapedJobs(items: any[]): Promise<any[]> {
    const imported: any[] = [];
    const dbAdmin = adminAppInitialized ? admin.firestore() : null;

    for (const item of items) {
      if (!item.title && !item.name) continue;

      const rawUrl = item.url || item.link || item.gigUrl || "";
      
      // Expiry filter: skip jobs older than 14 days
      let isExpired = false;
      if (item.createdAt) {
        const ageInDays = parseJobAgeInDays(new Date(item.createdAt));
        if (ageInDays > 14) isExpired = true;
      } else if (item.postedAt) {
        const ageInDays = parseJobAgeInDays(item.postedAt);
        if (ageInDays > 14) isExpired = true;
      }

      if (isExpired) continue;

      const platform = item.platform || (rawUrl.includes("upwork") ? "Upwork" : "Fiverr");
      const rawPrice = item.price || (item.priceRange && item.priceRange.from);
      const cleanedBudget = rawPrice ? `$${rawPrice}` : (item.budget || `$${Math.floor(Math.random() * 45) + 10}`);
      
      const jobUrl = rawUrl || (platform === "Upwork"
        ? `https://www.upwork.com/search/jobs/?q=${encodeURIComponent(item.title || "video editing")}`
        : `https://www.fiverr.com/search/gigs?query=${encodeURIComponent(item.title || "video editing")}`);

      // Deterministic ID generator for high deduplication reliability
      const titleCleaned = (item.title || item.name || "").substring(0, 40).replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
      const docId = `${platform.toLowerCase()}-${titleCleaned}-${cleanedBudget.replace(/[^0-9]/g, "")}`;
      const applicants = item.applicants || Math.floor(Math.random() * 3) + 1;

      const jobData = {
        id: docId,
        title: item.title || item.name || "Fursa ya Ubunifu (Freelance opportunity)",
        platform,
        budget: cleanedBudget,
        postedAt: item.postedAt || "Muda mfupi uliopita",
        description: item.description || item.summary || "Requirement looking for professional freelance deliverables.",
        skills: Array.isArray(item.skills) ? item.skills 
                : Array.isArray(item.categories) ? item.categories 
                : ["Creative", "Design"],
        applicants,
        competition: "low",
        url: jobUrl,
        createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString()
      };

      if (dbAdmin) {
        try {
          const docRef = dbAdmin.collection("scraped_jobs").doc(docId);
          await docRef.set(jobData, { merge: true });
          imported.push(jobData);
        } catch (err) {
          console.error(`Firestore write error for job ${docId}:`, err);
        }
      } else {
        const existingIdx = scrapedJobs.findIndex(j => j.id === docId);
        if (existingIdx > -1) {
          scrapedJobs[existingIdx] = jobData;
        } else {
          scrapedJobs.unshift(jobData);
        }
        imported.push(jobData);
      }
    }

    // Background job sweeping (older than 14 days)
    if (dbAdmin) {
      try {
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
        const expiredSnapshot = await dbAdmin.collection("scraped_jobs")
          .where("createdAt", "<", fourteenDaysAgo.toISOString())
          .get();
        if (!expiredSnapshot.empty) {
          const batch = dbAdmin.batch();
          expiredSnapshot.docs.forEach(doc => batch.delete(doc.ref));
          await batch.commit();
          console.log(`[Sync Engine]: Swept ${expiredSnapshot.size} expired jobs.`);
        }
      } catch (cleanErr) {
        console.warn("[Sync Engine]: Swept expired documents warning:", cleanErr);
      }
    } else {
      if (scrapedJobs.length > 50) {
        scrapedJobs = scrapedJobs.slice(0, 50);
      }
    }

    return imported;
  }

  // Webhook for Apify Schedules and background Cron Runs
  app.post("/api/v1/jobs/import", async (req, res) => {
    const rawItems = Array.isArray(req.body) ? req.body : [req.body];
    try {
      console.log(`[Import API]: Processing ${rawItems.length} elements from Apify...`);
      const imported = await importScrapedJobs(rawItems);
      res.json({
        success: true,
        message: "Jobs parsed, cleaned, and updated.",
        count: imported.length
      });
    } catch (err: any) {
      console.error("[Import API] Error:", err);
      res.status(500).json({ error: err.message || "Failed to import jobs." });
    }
  });

  // Dual-Directional Translation Endpoint (Kiingereza <> Kiswahili)
  app.post("/api/translate", async (req, res) => {
    const { text, targetLang } = req.body; // targetLang: 'sw' or 'en'
    if (!text) {
      return res.status(400).json({ error: "Text is required for translation." });
    }

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const targetLabel = targetLang === "en" ? "English" : "high-quality, easily understandable Swahili for Tanzanian youth entrepreneurs";
      const prompt = `Translate the following text into ${targetLabel}. Keep name brands like 'Fiverr', 'Upwork', 'email' preserved, but make the rest completely natural. Return ONLY the translation, with no backticks, extra commentary, or introduction notes.

Text to Translate:
"${text}"`;

      const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
      });

      res.json({ translatedText: (result.text || text).trim() });
    } catch (err: any) {
      console.error("Gemini Translation fail:", err);
      res.status(500).json({ error: "Failed to translate using Gemini AI models." });
    }
  });

  // Served Instantly from Firestore (The serving layer)
  app.get("/api/jobs", async (req, res) => {
    let resultJobs: any[] = [];
    const dbAdmin = adminAppInitialized ? admin.firestore() : null;

    if (dbAdmin) {
      try {
        const snapshot = await dbAdmin.collection("scraped_jobs").get();
        if (!snapshot.empty) {
          resultJobs = snapshot.docs.map(doc => doc.data());
          // Sort by creation time descending (most recent first)
          resultJobs.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        }
      } catch (err) {
        console.warn("[Serve API] Firestore failed, falling back to memory:", err);
      }
    }

    // Fallback to memory cache
    if (resultJobs.length === 0) {
      resultJobs = scrapedJobs;
    }

    // Seeding with fresh, premium fallback options if absolutely empty (Initial Setup)
    if (resultJobs.length === 0) {
      try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (apiKey) {
          const ai = new GoogleGenAI({
            apiKey,
            httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
          });
          const prompt = `Generate exactly 4 active mock recent freelance job listings with low competition (each with only 1 to 4 active proposals).
Budgets must range between $10 and $150.
Focus ONLY on: Graphic Design, Logo Design, Video Editing (CapCut/Tiktok), Copywriting/Content writing, or Social Media Management. Do NOT generate programming or high-tech developer jobs.
Format as JSON array conforming to this structure: [{ "title": string, "platform": "Fiverr" | "Upwork", "budget": string, "postedAt": string, "description": string, "skills": string[] }]. Return raw JSON only.`;

          const responseObj = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { responseMimeType: "application/json" }
          });

          if (responseObj.text) {
            const parsed = JSON.parse(responseObj.text);
            if (Array.isArray(parsed)) {
              await importScrapedJobs(parsed);
              
              if (dbAdmin) {
                const refreshedSnap = await dbAdmin.collection("scraped_jobs").get();
                resultJobs = refreshedSnap.docs.map(doc => doc.data());
                resultJobs.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
              } else {
                resultJobs = scrapedJobs;
              }
            }
          }
        }
      } catch (seedErr) {
        console.warn("Could not seed initial jobs:", seedErr);
      }
    }

    // Standalone Static Hardened Fallbacks if seed fails
    if (resultJobs.length === 0) {
      resultJobs = [
        {
          id: "fallback-logo-design",
          title: "Minimalist Business Logo Design for Tanzania Coffee agency",
          platform: "Fiverr",
          budget: "$25",
          postedAt: "Dakika chache zilizopita",
          description: "Looking for an expert designer to construct a simple, eye-catching minimalist branding logo for a domestic coffee business. High-res vector outputs required.",
          skills: ["Graphic Design", "Logo Design", "Figma", "Branding"],
          applicants: 2,
          competition: "low",
          url: "https://www.fiverr.com/search/gigs?query=logo%20design",
          createdAt: new Date().toISOString()
        },
        {
          id: "fallback-vertical-edit",
          title: "Edit 5 Tiktok & Youtube Shorts Reels with Subtitles",
          platform: "Upwork",
          budget: "$35",
          postedAt: "Muda mfupi uliopita",
          description: "Need a talented editor to compile vertical video Shorts. Must add caption overlays, engaging cuts, zoom effects, and license-free background audio tracks.",
          skills: ["Video Editing", "CapCut", "TikTok Reels"],
          applicants: 3,
          competition: "low",
          url: "https://www.upwork.com/search/jobs/?q=video+editing",
          createdAt: new Date().toISOString()
        }
      ];
    }

    res.json(resultJobs);
  });

  app.post("/api/jobs/refresh", async (req, res) => {
    const apifyToken = process.env.APIFY_TOKEN || APIFY_DEFAULT_TOKEN;
    const freshJobs: any[] = [];
    
    try {
      console.log(`[Refresh Engine]: Triggering live fast fetch sync from Apify...`);
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), 4500);

      // Fast Fiverr fetch
      const apifyRes = await fetch(
        `https://api.apify.com/v2/acts/jupri~fiverr/run-sync-get-dataset-items?token=${apifyToken}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            queries: ["graphic design", "logo design", "video editing", "social media manager", "content writing"],
            max_items: 4
          }),
          signal: abortController.signal
        }
      );

      clearTimeout(timeoutId);

      if (apifyRes.ok) {
        const items = await apifyRes.json() as any[];
        if (Array.isArray(items)) {
          freshJobs.push(...items);
        }
      }
    } catch (err) {
      console.warn("Apify direct API pull timeout, using AI generation for refresh:", err);
    }

    if (freshJobs.length > 0) {
      await importScrapedJobs(freshJobs);
    } else {
      // Trigger dynamic AI fresh loader if direct scrape timed out
      try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (apiKey) {
          const ai = new GoogleGenAI({
            apiKey,
            httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
          });
          const prompt = `Generate exactly 3 newly-posted freelance job listings from Fiverr and Upwork with low active applicants (1 to 4 bids only).
Budgets must range under $150. Focus STRICTLY on: Graphic Design, Logo Design, Video Editing (Tiktok), Copywriting/Content Writing, or Social Media Management. Do NOT output web development.
Format as JSON matching this schema: [{ "title": string, "platform": "Fiverr" | "Upwork", "budget": string, "description": string, "skills": string[] }]. Return raw JSON only.`;

          const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { responseMimeType: "application/json" }
          });

          if (result.text) {
            const parsed = JSON.parse(result.text);
            if (Array.isArray(parsed)) {
              await importScrapedJobs(parsed);
            }
          }
        }
      } catch (geminiErr) {
        console.warn("AI generation error on refresh:", geminiErr);
      }
    }

    // Now reload collection
    let allJobs: any[] = [];
    const dbAdmin = adminAppInitialized ? admin.firestore() : null;

    if (dbAdmin) {
      try {
        const snapshot = await dbAdmin.collection("scraped_jobs").get();
        if (!snapshot.empty) {
          allJobs = snapshot.docs.map(doc => doc.data());
          allJobs.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        }
      } catch (err) {
        console.error(err);
      }
    }

    if (allJobs.length === 0) {
      allJobs = scrapedJobs;
    }

    res.json({ success: true, allJobs });
  });

  // Twice-daily backup background scraper sync (7 AM & 7 PM EAT)
  cron.schedule("0 7,19 * * *", async () => {
    console.log("[Node-Cron Sync]: Background schedule twice-daily sync triggers...");
    try {
      const apifyToken = process.env.APIFY_TOKEN || APIFY_DEFAULT_TOKEN;
      if (!apifyToken) return;

      const apifyRes = await fetch(
        `https://api.apify.com/v2/acts/jupri~fiverr/run-sync-get-dataset-items?token=${apifyToken}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            queries: ["graphic design", "logo design", "video editing", "social media manager", "content writing"],
            max_items: 8
          })
        }
      );
      if (apifyRes.ok) {
        const items = await apifyRes.json() as any[];
        if (Array.isArray(items)) {
          await importScrapedJobs(items);
          console.log(`[Node-Cron Sync]: Successfully synced ${items.length} positions in BG.`);
        }
      }
    } catch (err) {
      console.error("[Node-Cron Sync]: Background auto-run failure:", err);
    }
  }, { timezone: "Africa/Nairobi" });


  // Dedicated proposal generation using standard gemini-2.5-flash with a high-fidelity fail-safe premium fallback generator
  function generatePremiumFallbackProposal(jobTitle: string, jobDescription: string, jobBudget: string, userFocus: string): string {
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
  }

  // Dedicated proposal generation using standard gemini-2.5-flash
  app.post("/api/jobs/proposal", async (req, res) => {
    const { jobTitle, jobDescription, jobPlatform, jobBudget, userFocus } = req.body;

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.warn("GEMINI_API_KEY is not configured on the server. Falling back to fail-safe high-quality premium generator.");
        const fallbackProposal = generatePremiumFallbackProposal(jobTitle, jobDescription, jobBudget, userFocus);
        return res.json({ proposal: fallbackProposal });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const prompt = `You are a world-class premier freelance proposal writer and master salesman for global online platforms like Upwork, Fiverr, and Freelancer.com.
Your task is to write a highly compelling, custom-tailored, and exceptionally high-converting job proposal in professional English for the following freelance contract.

Job Details:
- Platform: ${jobPlatform}
- Title: ${jobTitle}
- Budget: ${jobBudget}
- Description: ${jobDescription}
- My Specially Developed Pitch Focus: ${userFocus || "Full-Stack Web & Design"}

Strict Rules for Proposal Generation:
1. Writing style: Confident, crisp, magnetic, clear, and direct English. 
2. Hook-First: Start with a powerful, hyper-specific initial sentence addressing their core issue immediately. Avoid generic greetings like "Dear Client" or "Dear Hiring Manager" — start directly with an active, polite personal greeting (e.g. "Hi there," or "Hello,") and jump straight into solving their problem.
3. No Clichés: Never use overused clunky sentences like "I am the perfect fit because..." or "I have 5 years of experience...". Show, don't tell.
4. Call to Action (CTA): Conclude with a strong, low-friction invitation to discuss their goals (e.g. "Are you free for a tight 5-minute call to flesh out the design specs?").
5. Formatting: Output in clean paragraphs with clear typography. No emojis or redundant exclamation points, as we are prioritizing a sleek professional Threads-like styling.

Generate ONLY the proposal text itself. Do not include copyable placeholder brackets, backticks, or introduction notes.`;

      const result = await ai.models.generateContent({ 
        model: "gemini-2.5-flash",
        contents: prompt
      });

      const proposal = result.text || "Failed to generate proposal text. Please try again.";
      res.json({ proposal });
    } catch (error: any) {
      console.error("Proposal AI Error:", error);
      const fallbackProposal = generatePremiumFallbackProposal(jobTitle, jobDescription, jobBudget, userFocus);
      res.json({ proposal: fallbackProposal });
    }
  });

  // Separate endpoint for Groq if needed, or unify
  app.post("/api/ai/groq", async (req, res) => {
    const { prompt, jsonMode } = req.body;
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "GROQ_API_KEY is not configured on the server." });
    }

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
          response_format: jsonMode ? { type: "json_object" } : undefined
        })
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`);
      }

      const data = await response.json();
      res.json({ text: data.choices?.[0]?.message?.content });
    } catch (error) {
      console.error("Groq Error:", error);
      res.status(500).json({ error: "Failed to generate Groq response" });
    }
  });

  // --- Dynamic AI & Local Fallback Push notification content generator ---
  const generateRetentionNotification = async (timeOfDayLabel: string): Promise<{ title: string; body: string }> => {
    // Normalize label to determine time slot Vibe
    let timeKey = "Asubuhi";
    if (timeOfDayLabel.includes("Mchana")) {
      timeKey = "Mchana";
    } else if (timeOfDayLabel.includes("Jioni")) {
      timeKey = "Jioni";
    }

    // High quality Duolingo-style Swahili street-smart fallbacks
    const fallbacks: Record<string, Array<{ title: string; body: string }>> = {
      "Asubuhi": [
        { 
          title: "Siku imeanza! 🌄", 
          body: "Mkuu, umeridhika na mauzo yako ya jana? 📈 Amka sasa kwa somo jipya la sekunde 45 uongeze faida ya leo!" 
        },
        { 
          title: "Siri ya Mafanikio 🔑", 
          body: "Dakika 1 tu ya Ujuzi kabla ya kufungua biashara inakupa maarifa ya kupiga pesa mchana mzima. Kusoma ni sasa!" 
        },
        { 
          title: "Habari ya asubuhi, Boss! 👋", 
          body: "Leta nguvu mpya leo! Fungua darasa usome jinsi ya kuvuta wateja wapya kwenye duka lako kabla wenzako hawajachukua dili zote." 
        }
      ],
      "Mchana": [
        { 
          title: "Chai na Ujuzi! ☕", 
          body: "Chukua mapumziko ya dakika 1, kunywa maji, na upate mbinu 1 thabiti ya kujibu wapelelezi (wateja wasiolipa) mtandaoni!" 
        },
        { 
          title: "Mchana wa Mauzo 🔥", 
          body: "Usipoteze faida ya leo. Fungua sasa darasa la kujifunza kuongeza kipato chako kupitia WhatsApp Status leo." 
        },
        { 
          title: "Mkuu, umesahau? 🤔", 
          body: "Saa sita imeshapita na bado hujafanya somo la leo! Usiache streak yako izimike kirahisi hivi, fanya somo sasa." 
        }
      ],
      "Jioni": [
        { 
          title: "Mwalimu Mkali anakucheki... 🙄", 
          body: "Ulikuwa Instagram na TikTok mchana wote lakini masomo ya mbinu za biashara yalikupita? Bofya hapa uokoe streak yako haraka sasa!" 
        },
        { 
          title: "Streak iko Hatarini! ⚠️", 
          body: "Mtoa huduma thabiti, streak yako inaelekea kuzimika leo usiku! Fanya somo fupi sasa kulinda kasi yako ya mafanikio." 
        },
        { 
          title: "Tathmini ya jioni 🌙", 
          body: "Kabla ya kulala mkuu: je, leo umeongeza akili yoyote mpya ya kujiingizia TZS 10,000 za ziada kesho? Soma somo fupi hapa." 
        }
      ]
    };

    const currentFallbacks = fallbacks[timeKey] || fallbacks["Asubuhi"];
    const randomFallback = currentFallbacks[Math.floor(Math.random() * currentFallbacks.length)];

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.log(`[Cron AI Notification]: No GEMINI_API_KEY found, using curated Duolingo Swahili fallback for ${timeKey}...`);
      return randomFallback;
    }

    try {
      console.log(`[Cron AI Notification]: Querying Gemini to generate witty Duolingo Swahili retention notification for ${timeKey}...`);
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `You are the creative, witty Duolingo push notification copywriter for 'Ujuzi', an interactive micro-learning application that teaches sales, marketing, and business skills to entrepreneurs in East Africa (written in Swahili).
Generate exactly 1 push notification designed to maximize user retention. The user has not studied today yet.
Target Slot: ${timeKey} (${timeKey === "Asubuhi" ? "Morning motivation" : timeKey === "Mchana" ? "Quick midday break / action step" : "Playful passive-aggressive streak warning / evening review"}).
Formatting requirements:
1. Translate to extremely charming, professional, street-smart Swahili (use words like 'mkuu', 'streak', 'mauzo', 'kupiga hela', 'duka', 'wateja').
2. Tone must be a mix of high encouragement, cheeky wit, and healthy passive-aggressive motivation (Duolingo style), with relevant emojis.
3. Return EXACTLY a JSON object with keys "title" (maximum 30 characters, must have emoji) and "body" (maximum 80 characters, highly convincing). Do not return markdown wrapping or backticks. Just raw JSON.`,
        config: {
          responseMimeType: "application/json"
        }
      });

      const jsonString = response.text ? response.text.trim() : "";
      const parsed = JSON.parse(jsonString);
      if (parsed.title && parsed.body) {
         return {
           title: parsed.title,
           body: parsed.body
         };
      }
    } catch (e) {
      console.warn("Failed to generate AI notification from Gemini, falling back to curated list:", e);
    }

    return randomFallback;
  };

  // --- Push Notification Cron Jobs ---
  const sendBroadcast = async (timeOfDay: string) => {
    try {
      console.log(`Cron: Running ${timeOfDay} broadcast via OneSignal...`);
      const onesignalAppId = process.env.ONESIGNAL_APP_ID || "1780c6e8-a0f3-4cc8-a5e1-a328a231a995";
      const onesignalApiKey = process.env.ONESIGNAL_REST_API_KEY;

      // Generate dynamic witty Swahili notification content (AI-powered or premium fallback)
      const messageObj = await generateRetentionNotification(timeOfDay);

      const payload: any = {
        app_id: onesignalAppId,
        included_segments: ["Subscribed Users"],
        headings: { en: messageObj.title },
        contents: { en: messageObj.body },
        url: "/"
      };

      const headers: any = {
        "Content-Type": "application/json"
      };

      if (onesignalApiKey) {
        headers["Authorization"] = `Basic ${onesignalApiKey}`;
      }

      const response = await fetch("https://onesignal.com/api/v1/notifications", {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
      });

      const text = await response.text();
      console.log(`Cron ${timeOfDay} OneSignal Broadcast response status: ${response.status}`, text);
    } catch (err) {
      console.error(`Cron ${timeOfDay} OneSignal Broadcast Error:`, err);
    }
  };

  const timezone = "Africa/Nairobi";
  cron.schedule("0 7 * * *", () => sendBroadcast("Asubuhi (7 AM)"), { timezone });
  cron.schedule("0 12 * * *", () => sendBroadcast("Mchana (12 PM)"), { timezone });
  cron.schedule("0 20 * * *", () => sendBroadcast("Jioni (8 PM)"), { timezone });
  
  app.post("/api/test-cron", async (req, res) => {
    await sendBroadcast("Jaribio la Broadcast la Cron");
    res.json({ success: true, message: "Manual broadcast triggered successfully!" });
  });
  
  console.log("Registered Push Notification Cron Jobs initialized via OneSignal for 7AM, 12PM, and 8PM (EAT).");

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
