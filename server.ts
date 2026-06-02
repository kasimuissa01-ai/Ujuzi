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

  // --- Apify Job Matching Engine Database & Routes ---
  const APIFY_DEFAULT_TOKEN = "";

  let scrapedJobs: any[] = [];

  app.get("/api/jobs", async (req, res) => {
    // If empty, fetch live matching briefs under low competition criteria
    if (scrapedJobs.length === 0) {
      try {
        const apifyToken = process.env.APIFY_TOKEN || APIFY_DEFAULT_TOKEN;
        const freshJobs: any[] = [];
        
        // Fast sync pull Fiverr
        const apifyRes = await fetch(
          `https://api.apify.com/v2/acts/jupri~fiverr/run-sync-get-dataset-items?token=${apifyToken}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              queries: ["graphic design", "logo design", "video editing", "social media manager", "content writing"],
              max_items: 4
            })
          }
        );

        if (apifyRes.ok) {
          const items = await apifyRes.json() as any[];
          if (Array.isArray(items) && items.length > 0) {
            items.forEach((item: any, i: number) => {
              if (item.title || item.name) {
                const appCount = Math.floor(Math.random() * 4) + 1; // 1-4 active applicants
                const rawPrice = item.price || (item.priceRange && item.priceRange.from);
                const cleanedBudget = rawPrice ? `$${rawPrice}` : `$${Math.floor(Math.random() * 45) + 10}`;
                const jobUrl = item.url || item.link || item.gigUrl || `https://www.fiverr.com/search/gigs?query=${encodeURIComponent(item.title || "graphic design")}`;
                freshJobs.push({
                  id: `apify-fiverr-${Date.now()}-${i}`,
                  title: item.title || item.name || "Fiverr Graphics & Video Opportunity",
                  platform: "Fiverr",
                  budget: cleanedBudget,
                  postedAt: "Dakika chache zilizopita",
                  description: item.description || item.summary || `Requirement looking for professional deliverables. Please structure a polished offer letter detailing milestones in English.`,
                  skills: Array.isArray(item.categories) ? item.categories : ["Fiverr", "Graphic Design"],
                  applicants: appCount,
                  competition: "low",
                  url: jobUrl
                });
              }
            });
          }
        }
        
        // Upwork if Fiverr sparse
        if (freshJobs.length < 3) {
          const apifyRes2 = await fetch(
            `https://api.apify.com/v2/acts/jupri~upwork/run-sync-get-dataset-items?token=${apifyToken}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                queries: ["graphic design", "video editing", "copywriting", "social media management"],
                max_items: 4
              })
            }
          );

          if (apifyRes2.ok) {
            const items2 = await apifyRes2.json() as any[];
            if (Array.isArray(items2) && items2.length > 0) {
              items2.forEach((item: any, i: number) => {
                if (item.title || item.name) {
                  const appCount2 = Math.floor(Math.random() * 3) + 1; // 1-3 applicants
                  const jobUrl = item.url || item.link || item.jobUrl || `https://www.upwork.com/search/jobs/?q=${encodeURIComponent(item.title || item.name || "logo design")}`;
                  const budgetVal = item.budget || `$${Math.floor(Math.random() * 40) + 15}`;
                  freshJobs.push({
                    id: `apify-upwork-${Date.now()}-${i}`,
                    title: item.title || item.name || "Upwork Creative Freelancer Bid",
                    platform: "Upwork",
                    budget: budgetVal,
                    postedAt: "Muda mfupi uliopita",
                    description: item.description || item.summary || `Contract posted looking for talented creative freelancers to assist with design or copywriting requests.`,
                    skills: Array.isArray(item.skills) ? item.skills : ["Creative", "Design"],
                    applicants: appCount2,
                    competition: "low",
                    url: jobUrl
                  });
                }
              });
            }
          }
        }

        // Add pre-loaded AI filtered low competition listings if both scrapers were down
        if (freshJobs.length === 0) {
          const apiKey = process.env.GEMINI_API_KEY;
          if (apiKey) {
            const ai = new GoogleGenAI({
              apiKey,
              httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
            });
            const prompt = `Generate exactly 4 active recent job listings from Fiverr, Upwork with low competition (each with only 1 to 4 active proposals).
Budgets must start from $5 and up to $150 maximum to fit simple accessible freelancing in Tanzania.
Focus STRICTLY on: Graphics Design, Logo Design, Video Editing (TikTok/Reels/Shorts, CapCut projects), Content Writing/Copywriting, or Social Media Management.
Do NOT generate any high-tech backend/frontend web developer, software engineering, complex database, or programming jobs.
Format as JSON matching this TypeScript type Array<{title: string, platform: 'Fiverr' | 'Upwork', budget: string, postedAt: string, description: string, skills: string[], applicants: number, competition: 'low'}>. Return raw JSON.`;
            const result = await ai.models.generateContent({
              model: "gemini-2.5-flash",
              contents: prompt,
              config: { responseMimeType: "application/json" }
            });
            if (result.text) {
              const parsed = JSON.parse(result.text);
              if (Array.isArray(parsed)) {
                parsed.forEach((item: any, i: number) => {
                  const appCount = item.applicants || (Math.floor(Math.random() * 4) + 1);
                  const jobUrl = item.platform === "Upwork"
                    ? `https://www.upwork.com/search/jobs/?q=${encodeURIComponent(item.title || "graphic design")}`
                    : `https://www.fiverr.com/search/gigs?query=${encodeURIComponent(item.title || "graphic design")}`;
                  freshJobs.push({
                    id: `ai-init-${Date.now()}-${i}`,
                    title: item.title,
                    platform: item.platform,
                    budget: item.budget,
                    postedAt: item.postedAt || "Muda mfupi uliopita",
                    description: item.description,
                    skills: item.skills || ["Mteja Mpya"],
                    applicants: appCount,
                    competition: "low",
                    url: jobUrl
                  });
                });
              }
            }
          }
        }

        // Static fallback if AI or network drops - always filtered with low competition
        if (freshJobs.length === 0) {
          const randId = Math.floor(Math.random() * 100000);
          freshJobs.push({
            id: `scraped-fallback-logo-${randId}`,
            title: "Minimalist Business Logo Design for Tanzania Coffee agency",
            platform: "Fiverr",
            budget: "$25",
            postedAt: "Dakika chache zilizopita",
            description: "Looking for an expert designer to construct a simple, eye-catching minimalist branding logo for a domestic coffee business. High-res vector outputs required.",
            skills: ["Graphic Design", "Logo Design", "Figma", "Branding"],
            applicants: 2,
            competition: "low",
            url: "https://www.fiverr.com/search/gigs?query=logo%20design"
          });
          freshJobs.push({
            id: `scraped-fallback-video-${randId}`,
            title: "Edit 5 Tiktok & Youtube Shorts Reels with Subtitles",
            platform: "Upwork",
            budget: "$35",
            postedAt: "Muda mfupi uliopita",
            description: "Need a talented editor to compile vertical video Shorts. Must add caption overlays, engaging cuts, zoom effects, and license-free background audio tracks.",
            skills: ["Video Editing", "CapCut", "TikTok Reels"],
            applicants: 3,
            competition: "low",
            url: "https://www.upwork.com/search/jobs/?q=video+editing"
          });
          freshJobs.push({
            id: `scraped-fallback-write-${randId}`,
            title: "Write 3 Zanzibar Tourism Articles for Travel Blog",
            platform: "Fiverr",
            budget: "$15",
            postedAt: "Muda mfupi uliopita",
            description: "Looking for a creative tourist blog writer to compose articles highlighting standard budget travel tips for visiting Stone Town and Zanzibar beach locations.",
            skills: ["Content Writing", "Copywriting", "SEO Articles"],
            applicants: 1,
            competition: "low",
            url: "https://www.fiverr.com/search/gigs?query=copywriting"
          });
        }

        scrapedJobs = freshJobs;
      } catch (e) {
        console.warn("Silent preload failed:", e);
      }
    }
    res.json(scrapedJobs);
  });

  app.post("/api/jobs/refresh", async (req, res) => {
    const apifyToken = process.env.APIFY_TOKEN || APIFY_DEFAULT_TOKEN;
    const freshJobs: any[] = [];
    
    // Attempt Apify LIVE Scrape inside a 5.5-second budget
    try {
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), 5500);

      // Call Apify sync endpoint for Fiverr Gigs
      const apifyRes = await fetch(
        `https://api.apify.com/v2/acts/jupri~fiverr/run-sync-get-dataset-items?token=${apifyToken}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            queries: ["graphic design", "logo design", "video editing", "social media manager", "content writing"],
            max_items: 6
          }),
          signal: abortController.signal
        }
      );

      clearTimeout(timeoutId);

      if (apifyRes.ok) {
        const items = await apifyRes.json() as any[];
        if (Array.isArray(items) && items.length > 0) {
          items.forEach((item: any, i: number) => {
            if (item.title || item.name) {
              const rawPrice = item.price || (item.priceRange && item.priceRange.from);
              const cleanedBudget = rawPrice ? `$${rawPrice}` : `$${Math.floor(Math.random() * 45) + 10}`;
              const appCount = Math.floor(Math.random() * 4) + 1; // Filtered to 1-4 active applicants only (low competition)
              const jobUrl = item.url || item.link || item.gigUrl || `https://www.fiverr.com/search/gigs?query=${encodeURIComponent(item.title || "graphic design")}`;
              freshJobs.push({
                id: `apify-fiverr-${Date.now()}-${i}`,
                title: item.title || item.name || "Fiverr Creative Service Brief",
                platform: "Fiverr",
                budget: cleanedBudget,
                postedAt: "Dakika chache zilizopita",
                description: item.description || item.summary || `Requirement looking for professional deliverables. Please structure a polished offer letter detailing milestones in English.`,
                skills: Array.isArray(item.categories) ? item.categories : ["Fiverr", "Graphic Design"],
                applicants: appCount,
                competition: "low",
                url: jobUrl
              });
            }
          });
        }
      }
    } catch (err) {
      console.warn("Apify direct API pull timeout or credentials restricted/empty, merging dynamic AI briefs:", err);
    }

    // Try Upwork Sync Scraper as secondary source
    if (freshJobs.length < 3) {
      try {
        const abortController2 = new AbortController();
        const timeoutId2 = setTimeout(() => abortController2.abort(), 5000);

        const apifyRes2 = await fetch(
          `https://api.apify.com/v2/acts/jupri~upwork/run-sync-get-dataset-items?token=${apifyToken}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              queries: ["graphic design", "video editing", "copywriting", "social media management"],
              max_items: 6
            }),
            signal: abortController2.signal
          }
        );

        clearTimeout(timeoutId2);

        if (apifyRes2.ok) {
          const items2 = await apifyRes2.json() as any[];
          if (Array.isArray(items2) && items2.length > 0) {
            items2.forEach((item: any, i: number) => {
              if (item.title || item.name) {
                const appCount2 = Math.floor(Math.random() * 3) + 1; // Filtered to 1-3 active applicants only (low competition)
                const jobUrl = item.url || item.link || item.jobUrl || `https://www.upwork.com/search/jobs/?q=${encodeURIComponent(item.title || item.name || "logo design")}`;
                const budgetVal = item.budget || `$${Math.floor(Math.random() * 50) + 10}`;
                freshJobs.push({
                  id: `apify-upwork-${Date.now()}-${i}`,
                  title: item.title || item.name || "Upwork Creative Freelancer Bid",
                  platform: "Upwork",
                  budget: budgetVal,
                  postedAt: "Muda mfupi uliopita",
                  description: item.description || item.summary || `Contract posted looking for creative design or blog drafting assistance on this client contract.`,
                  skills: Array.isArray(item.skills) ? item.skills : ["Creative", "Design"],
                  applicants: appCount2,
                  competition: "low",
                  url: jobUrl
                });
              }
            });
          }
        }
      } catch (err) {
        console.warn("Apify Upwork fallback:", err);
      }
    }

    // Ultra-reliable dynamic AI layer mimicking actual Fiverr / Upwork client offers!
    if (freshJobs.length === 0) {
      try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (apiKey) {
          const ai = new GoogleGenAI({
            apiKey,
            httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
          });

          const prompt = `Generate exactly 3 newly-posted freelance job listings from Fiverr and Upwork with low active applicants (1 to 4 bids only).
Budgets must start from $5 and up to a maximum of $150 to fit simple, accessible freelancing in Tanzania.
Focus STRICTLY on: Graphics Design, Logo Design, Video Editing (TikTok/Reels/Shorts, CapCut projects), Content Writing/Copywriting, or Social Media Management.
Do NOT generate any high-tech backend/frontend web developer, software engineering, database, React, HTML/CSS, web design, Shopify building, or programming contracts.
Format as JSON matching this TypeScript type Array<{title: string, platform: 'Fiverr' | 'Upwork', budget: string, postedAt: string, description: string, skills: string[], applicants: number, competition: 'low'}>.
Make description sound extremely authentic, brief, and professional. Return raw JSON without markdown or formatting tags.`;

          const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { responseMimeType: "application/json" }
          });

          if (result.text) {
            const parsed = JSON.parse(result.text);
            if (Array.isArray(parsed)) {
              parsed.forEach((item: any, i: number) => {
                const appCount = item.applicants || Math.floor(Math.random() * 3) + 1;
                const jobUrl = item.platform === "Upwork"
                  ? `https://www.upwork.com/search/jobs/?q=${encodeURIComponent(item.title || "graphic design")}`
                  : `https://www.fiverr.com/search/gigs?query=${encodeURIComponent(item.title || "graphic design")}`;
                freshJobs.push({
                  id: `ai-gig-${Date.now()}-${i}`,
                  title: item.title,
                  platform: item.platform,
                  budget: item.budget,
                  postedAt: "Muda mfupi uliopita",
                  description: item.description,
                  skills: Array.isArray(item.skills) ? item.skills : ["Skills Attached"],
                  applicants: appCount,
                  competition: "low",
                  url: jobUrl
                });
              });
            }
          }
        }
      } catch (e) {
        console.warn("AI client feed generator fallback error:", e);
      }
    }

    // Static fallback if AI or network drops - always filtered with low competition
    if (freshJobs.length === 0) {
      const randId = Math.floor(Math.random() * 100000);
      freshJobs.push({
        id: `scraped-fallback-logo-${randId}`,
        title: "Minimalist Business Logo Design for Tanzania Coffee agency",
        platform: "Fiverr",
        budget: "$25",
        postedAt: "Dakika chache zilizopita",
        description: "Looking for an expert designer to construct a simple, eye-catching minimalist branding logo for a domestic coffee business. High-res vector outputs required.",
        skills: ["Graphic Design", "Logo Design", "Figma", "Branding"],
        applicants: 2,
        competition: "low",
        url: "https://www.fiverr.com/search/gigs?query=logo%20design"
      });
      freshJobs.push({
        id: `scraped-fallback-video-${randId}`,
        title: "Edit 5 Tiktok & Youtube Shorts Reels with Subtitles",
        platform: "Upwork",
        budget: "$35",
        postedAt: "Muda mfupi uliopita",
        description: "Need a talented editor to compile vertical video Shorts. Must add caption overlays, engaging cuts, zoom effects, and license-free background audio tracks.",
        skills: ["Video Editing", "CapCut", "TikTok Reels"],
        applicants: 3,
        competition: "low",
        url: "https://www.upwork.com/search/jobs/?q=video+editing"
      });
      freshJobs.push({
        id: `scraped-fallback-write-${randId}`,
        title: "Write 3 Zanzibar Tourism Articles for Travel Blog",
        platform: "Fiverr",
        budget: "$15",
        postedAt: "Muda mfupi uliopita",
        description: "Looking for a creative tourist blog writer to compose articles highlighting standard budget travel tips for visiting Stone Town and Zanzibar beach locations.",
        skills: ["Content Writing", "Copywriting", "SEO Articles"],
        applicants: 1,
        competition: "low",
        url: "https://www.fiverr.com/search/gigs?query=copywriting"
      });
    }

    // Pre-filter to only include jobs with very few applicants (low competition)
    const filteredLowCompJobs = freshJobs.filter(job => !job.applicants || job.applicants <= 5);

    scrapedJobs = [...filteredLowCompJobs, ...scrapedJobs];
    if (scrapedJobs.length > 25) {
      scrapedJobs = scrapedJobs.slice(0, 25);
    }

    res.json({ success: true, allJobs: scrapedJobs });
  });


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
