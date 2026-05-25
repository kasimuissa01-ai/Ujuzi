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

  // Dynamic Service Worker endpoint removed; using static generation via generate-sw.ts

  // Safe HTTP POST proxy endpoint to trigger Firebase Cloud Messaging (FCM)
  app.post("/api/send-push", async (req, res) => {
    const { token, serverKey: bodyServerKey, title, body, link } = req.body;
    
    // 1. Try FCM HTTP v1 via official Firebase Admin SDK (Recommended)
    const adminSdk = getFirebaseAdminInstance();
    if (adminSdk) {
      try {
        console.log("Using FCM HTTP v1 (Service Account) to deliver notification...");
        const response = await adminSdk.messaging().send({
          token: token,
          notification: {
            title: title || "Ujuzi App 🎓",
            body: body || "Huu ni ufalme wa masomo mapya!",
          },
          data: {
            link: link || "/",
            title: title || "Ujuzi App 🎓",
            body: body || "Huu ni ufalme wa masomo mapya!",
          },
          webpush: {
            notification: {
              icon: "/icon.svg",
              badge: "/icon.svg",
              vibrate: [150, 80, 150],
            },
            fcmOptions: {
              link: link || "/",
            }
          }
        });
        
        console.log("FCM HTTP v1 delivered successfully response:", response);
        return res.json({ 
          success: true, 
          method: "FCM HTTP v1 (Secure Service Account)", 
          messageId: response 
        });
      } catch (err: any) {
        console.error("FCM HTTP v1 Delivery failed:", err);
        return res.status(500).json({ 
          error: `FCM HTTP v1 Delivery failed: ${err.message || 'Unknown error'}` 
        });
      }
    }

    // 2. Fallback to Legacy HTTP protocol if Server Key is provided (Highly discouraged, deprecated by Google)
    const serverKey = process.env.FCM_SERVER_KEY || bodyServerKey;
    if (!token || !serverKey) {
      return res.status(400).json({ 
        error: "FCM Device Token na Server Key / Service Account credentials vinahitajika! Tafadhali sanidi Service Account kwenye Vercel/env kufuata matakwa ya Google ya sasa." 
      });
    }

    try {
      console.log("Using Deprecated FCM Legacy API with Server Key...");
      const response = await fetch("https://fcm.googleapis.com/fcm/send", {
        method: "POST",
        headers: {
          "Authorization": `key=${serverKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          to: token,
          notification: {
            title: title || "Ujuzi App 🎓",
            body: body || "Huu ni ufalme wa masomo mapya!",
            icon: "/icon.svg",
            sound: "default"
          },
          data: {
            link: link || "/",
            title: title,
            body: body
          }
        })
      });

      const responseText = await response.text();
      if (response.ok) {
        res.json({ 
          success: true, 
          method: "FCM Legacy API (Deprecated)", 
          details: responseText 
        });
      } else {
        res.status(response.status).json({ error: responseText });
      }
    } catch (error: any) {
      console.error("FCM Legacy Send Proxy Error:", error);
      res.status(500).json({ error: error.message || "Failed to deliver push notification via FCM" });
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

  // --- Push Notification Cron Jobs ---
  const adminSdk = getFirebaseAdminInstance();
  if (adminSdk) {
    let db;
    if (firebaseConfig && firebaseConfig.firestoreDatabaseId) {
      db = getFirestore(adminSdk.app(), firebaseConfig.firestoreDatabaseId);
    } else {
      db = adminSdk.firestore();
    }
    
    const sendBroadcast = async (timeOfDay: string) => {
      try {
        console.log(`Cron: Running ${timeOfDay} broadcast`);
        console.log(`Cron: Fetching users from Firestore...`);
        const usersSnap = await db.collection("users").get();
        console.log(`Cron: Fetched ${usersSnap.size} users`);
        const tokens: string[] = [];
        
        usersSnap.forEach(doc => {
          const data = doc.data();
          if (data.fcmTokens && Array.isArray(data.fcmTokens)) {
            data.fcmTokens.forEach((token: string) => {
              if (token) tokens.push(token);
            });
          }
        });
        
        // Optional unique filter
        const uniqueTokens = Array.from(new Set(tokens));
        console.log(`Cron: Found ${uniqueTokens.length} unique FCM tokens to send to`);

        if (uniqueTokens.length > 0) {
          const messagePayload = {
            tokens: uniqueTokens,
            notification: {
              title: "Ujuzi App 🎓",
              body: "Ni wakati wa kujifunza! Fungua Ujuzi na uendelee na masomo yako sasa.",
            },
            data: {
              link: "/",
            },
            webpush: {
              notification: {
                icon: "/icon.svg", 
                badge: "/icon.svg",
                vibrate: [150, 80, 150],
              },
              fcmOptions: {
                link: "/",
              }
            }
          };
          
          // Chunk tokens as sendEachForMulticast accepts maximum of 500 tokens at a time
          const chunkSize = 500;
          for (let i = 0; i < uniqueTokens.length; i += chunkSize) {
            const chunk = uniqueTokens.slice(i, i + chunkSize);
            console.log(`Cron: Sending chunk of ${chunk.length} tokens via FCM...`);
            const response = await adminSdk.messaging().sendEachForMulticast({ ...messagePayload, tokens: chunk });
            console.log(`Cron ${timeOfDay} delivery chunk success: ${response.successCount}, failed: ${response.failureCount}`);
            if (response.failureCount > 0) {
              response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                  console.error(`Token failed: ${chunk[idx]} - Error: ${resp.error?.message}`);
                }
              });
            }
          }
        }
      } catch (err) {
        console.error(`Cron ${timeOfDay} Error:`, err);
      }
    };

    const timezone = "Africa/Nairobi";
    cron.schedule("* * * * *", () => sendBroadcast("Morning (7 AM - TESTING EVERY MINUTE)"), { timezone });
    cron.schedule("0 12 * * *", () => sendBroadcast("Afternoon (12 PM)"), { timezone });
    cron.schedule("0 20 * * *", () => sendBroadcast("Evening (8 PM)"), { timezone });
    
    console.log("Registered Push Notification Cron Jobs initialized for 7AM, 12PM, and 8PM (EAT).");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
