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
        model: "gemini-3-flash-preview",
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

  // --- Push Notification Cron Jobs ---
  const sendBroadcast = async (timeOfDay: string) => {
    try {
      console.log(`Cron: Running ${timeOfDay} broadcast via OneSignal...`);
      const onesignalAppId = process.env.ONESIGNAL_APP_ID || "1780c6e8-a0f3-4cc8-a5e1-a328a231a995";
      const onesignalApiKey = process.env.ONESIGNAL_REST_API_KEY;

      const payload: any = {
        app_id: onesignalAppId,
        included_segments: ["Subscribed Users"],
        headings: { en: "Mbinu Mpya ya Ujuzi! 🎓" },
        contents: { en: `Mkuu, ufundi na maarifa mapya ya biashara yameshaingia leo (${timeOfDay}). Bofya hapa kujiunga na wenzako kujifunza sasa!` },
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
