# Ujuzi Scraper & AI Service - Client/Server Setup & Deployment Manual

Welcome to your standalone scraping and AI companion backend! This directory is pre-configured for a smooth deployment to any full Node.js environment—including **Render** and **Google Cloud Engine**.

This guide answers all your structural questions and provides a step-by-step roadmap.

---

## 💡 Q&A: Behind the Scenes Architecture

Before we start, let's address your questions about why this setup is needed and how the systems connect together:

### 1. Why doesn't Apify work on serverless platforms (like Vercel)?
Vercel is a **serverless (Function-as-a-Service)** environment. When you make an API call, Vercel boots a brief process, runs the code, and immediately freezes it. 
- **The Execution Timeout Limit:** Serverless execution is capped around 10 to 15 seconds. Scrapers like Apify make intensive round-trips to extract live listings, taking significant time. This triggers Vercel's **504 Gateway Timeout**.
- **No Idle Timeouts / State Preservation:** Serverless systems cannot run background chronometers or time loops (Scheduler/Cron). Any interval setup inside your Vercel code disappears the moment your function has returned a response.

### 2. How does Render's Free Tier handle sleeping & waking?
Render's Free Web Service goes into a **sleeping state** if there is no traffic for 15 minutes. 
- **Waking Up:** The next person who opens the app has to wait between 50 to 90 seconds while the container boots from scratch.
- **Keeping it Awake (UptimeRobot):** You can use free web monitors like **[UptimeRobot](https://uptimerobot.com)** or **[Better Stack](https://betterstack.com)**. Simply point them to your Render URL (`https://<your-service>.onrender.com/`) with an HTTP monitoring interval of **once every 12 to 14 minutes**. This sends a tiny packet that keeps the application awake 24/7.

### 3. Understanding Render's Free tier limits (750 Hours):
Your Render account gets **750 free running hours per month** across web services. 
- Running **one** web service 24/7 consumes exactly 720–744 hours per month. 
- This means you can keep exactly **one** main service alive continuously with UptimeRobot within the free tier. If you spawn two free services, they will exhaust your account's free hours around the 15th day of the month!

### 4. How to use Google Cloud Platform (GCP) for unlimited 24/7 free hosting?
If you want **100% free, continuous, zero-sleeping hosting** with absolute control, Google Cloud offers an **Always Free Compute Engine Virtual Machine**:
- **The Free Resource:** You get exactly 1 free `e2-micro` VM instance per month (running in `us-central1` Iowa, `us-west1` Oregon, or `us-east1` South Carolina) with 30GB of Persistent Boot Disk and 1GB of RAM.
- **Why it is better than Render Free Tier:** It **never sleeps**, does not have a 750-hour container limit, has dedicated resources, and runs continuous Node/Python servers on a permanent system.

---

## ☁️ Google Cloud Free-Tier VM Deployment Tutorial
If you decide to deploy your scraper backend on a Google Cloud Always-Free VM:

### Step 1: Create your Free Virtual Machine
1. Go to the **[Google Cloud Console](https://console.cloud.google.com/)** and search for **Compute Engine** > **VM Instances**.
2. Click **Create Instance**.
3. **Region Selection (Crucial for Free Tier):** Choose `us-central1` (Iowa), `us-west1` (Oregon), or `us-east1` (South Carolina).
4. **Machine Family:** Choose **General-purpose** > **E2**. Under Series, select **E2**. Under Machine Type, select **`e2-micro`** (2 vCPUs, 1 GB RAM). *This tells GCP to flag it under the Always Free tier!*
5. **Boot Disk:** Click Change. Choose OS as **Ubuntu (latest LTS)**, and set Size to **30 GB (Standard persistent disk)**.
6. **Firewall:** Under Firewall settings, check:
   - `Allow HTTP traffic`
   - `Allow HTTPS traffic`
7. Click **Create**. Copy your VM's **External IP address**.

### Step 2: Configure VM Networking (Open Port 3000)
By default, GCP blocks all random incoming ports. Let's create a rule allowing ports for Node:
1. Search public search for **VPC Network** > **Firewall**.
2. Click **Create Firewall Rule**.
3. Name it: `allow-ujuzi-backend`.
4. Set **Targets** to `All instances in the network`.
5. Set **Source IP ranges** to `0.0.0.0/0`.
6. Under **Protocols and ports**, check **Specified protocols and ports** > tick `tcp` and type `3000`.
7. Click **Create**.

### Step 3: Log in and Setup the Node Environment
Click the **SSH** button next to your virtual machine on GCP Console to open your cloud terminal, then execute:

```bash
# Update and upgrade systems
sudo apt update && sudo apt upgrade -y

# Download and install Node.js v18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs unzip git

# Install PM2 globally to keep your node app running 24/7
sudo npm install -y -g pm2
```

### Step 4: Load and Configure Your Scraper Code
Clone your repository or upload the files inside `/render-backend/` into a folder:

```bash
mkdir ujuzi-backend && cd ujuzi-backend
# Create the server.js, package.json, and .env files here
# Save your variables in a secure prod .env file matching the keys in .env.example

# Install dependencies
npm install

# Start development check:
node server.js
```

### Step 5: Start 24/7 with PM2 (Alternative to Render UptimeRobot)
To ensure the backend continues running if you close your computer or if GCP restarts, use **PM2 (Process Manager)**:

```bash
# Start your server via process manager
pm2 start server.js --name "ujuzi-api"

# Make PM2 restart automatically if VM boots
pm2 startup
pm2 save
```
Your API server will now run 100% stable at `http://<your-gcp-vm-external-ip>:3000`.

---

## 🚀 Step-by-Step Render Deployment (Quickest Setup)

To deploy to Render instead of GCP in under 2 minutes:

1. Create a free account at **[render.com](https://render.com)**.
2. Select **New** > **Web Service**.
3. Connect your GitHub repository containing the `/render-backend` directory, or use a standalone repo with this package.
4. Fill in the following Configuration Details:
   - **Name:** `ujuzi-scraper-service`
   - **Environment:** `Node`
   - **Region:** Choose whichever region is closest to your target audience.
   - **Branch:** `main` (or your work branch)
   - **Root Directory:** `render-backend` (Mandatory if it is a folder inside your mono-repo!)
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Click **Advanced** and fill in your Environment Secrets:
   - `GEMINI_API_KEY` - (Your key from AI Studio)
   - `APIFY_TOKEN` - (Your Apify scraper automation token)
   - `ONESIGNAL_APP_ID` - (Your OneSignal app container ID)
   - `ONESIGNAL_REST_API_KEY` - (Your OneSignal security REST api key)
   - `GROQ_API_KEY` - (Your Groq compiler backup token, optional)
6. Click **Deploy Web Service** and copy your live `.onrender.com` URL!

---

## 🔗 Syncing your Client Frontend (Vercel) to your Backend (Render/GCP)

Your frontend application is pre-configured to adapt instantly to your deployed backend. All you need to do is tell your frontend where your new server is located using a Vercel environment variable.

1. Go to your **[Vercel Dashboard](https://vercel.com/)** and click on your client project.
2. Go to **Settings** > **Environment Variables**.
3. Add the following key:
   - **Key:** `VITE_PRODUCTION_API_URL`
   - **Value:** Paste your live Render URL or GCP VM IP block. Make sure to omit the trailing slash (e.g., `https://ujuzi-scraper.onrender.com` or `http://104.197.123.45:3000`).
4. Trigger a **Redeploy** on Vercel for your changes to compile.

Your client app will now fetch all data, proposals, push instructions, and automated brief updates live from your Render or GCP VM server seamlessly!
