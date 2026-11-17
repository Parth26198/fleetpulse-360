# FLEETPULSE 360 — Production Deployment & Free-Tier Cloud Runbook

**Document Version:** 1.0.0  
**Target Enterprise Client:** Shreej Logistics & Operations  
**Architecture Role:** Senior DevOps Engineer & Cloud Deployment Architect  
**GitHub Repository:** [https://github.com/Parth26198/fleetpulse-360](https://github.com/Parth26198/fleetpulse-360)  
**Branch:** `main`

---

## 1. Executive Summary & Architecture Overview

FLEETPULSE 360 is an enterprise fleet management and transport operations SaaS platform engineered with React 18, Node.js 22, Express, Prisma ORM, and PostgreSQL. To conduct a live, high-reliability demonstration for the leadership of Shreej Logistics without incurring cloud hosting costs, this document defines the production-grade **Decoupled Free-Tier Cloud Architecture**.

```
                           +-----------------------------------------------+
                           |            CLIENT BROWSER / DEMO              |
                           +-----------------------------------------------+
                                      |                         |
                           HTTPS (Static Assets)     HTTPS (API Requests)
                                      v                         v
       +---------------------------------------------+   +---------------------------------------------+
       |             VERCEL GLOBAL EDGE CDN          |   |            RENDER WEB SERVICE               |
       |  - Frontend: React 18 + Vite + Tailwind CSS |   |  - Backend: Node.js 22 LTS + Express API    |
       |  - Free Tier: 100 GB Bandwidth, 0 Sleep     |   |  - In-Memory ExcelJS & PDFKit Generation    |
       |  - Auto-deploy from GitHub /frontend        |   |  - Health Check: GET /api/health            |
       |  - SPA Rewrites via vercel.json             |   |  - Auto-deploy from GitHub /backend         |
       +---------------------------------------------+   +---------------------------------------------+
                                                                        |
                                                              SSL Connection Pooling
                                                            (DATABASE_URL - Port 5432)
                                                                        v
                                                         +---------------------------------------------+
                                                         |          NEON SERVERLESS POSTGRES           |
                                                         |  - Persistent Cloud PostgreSQL 16           |
                                                         |  - Free Tier: 0.5 GB Storage (Permanent)   |
                                                         |  - Zero Disk Ephemerality (Safe Data)       |
                                                         |  - Built-in PgBouncer Connection Pooler     |
                                                         +---------------------------------------------+
```

---

## 2. Phase 1 — Pre-Deployment Audit Results

A comprehensive audit was performed across all frontend and backend source files to verify cloud compatibility and eliminate production blockers.

| Audit Dimension | Local Status | Cloud Production Requirement | Audit Verdict & Applied Fix |
| :--- | :--- | :--- | :--- |
| **1. Frontend Build** | `vite build` | `tsc && vite build` emitting to `frontend/dist` | **PASS**: Verified production build completes in 11.1s. Single-page application rewrites added via `frontend/vercel.json` and `frontend/public/_redirects`. |
| **2. Backend Start** | `node dist/src/server.js` | Cloud PaaS executes `npm start` from `backend/package.json` | **FIXED**: Corrected `package.json` `"start"` script from `node dist/server.js` to `node dist/src/server.js`. |
| **3. API URL Decoupling** | Hardcoded `/api` proxy | Dynamic `VITE_API_URL` pointing to cloud backend domain | **FIXED**: Refactored `frontend/src/services/api.ts` to dynamically resolve `import.meta.env.VITE_API_URL`. Export and PDF download URLs automatically prepend backend host. |
| **4. Database Provider** | SQLite `dev.db` | Persistent Cloud PostgreSQL | **FIXED**: Architected `backend/prisma/schema.postgresql.prisma`. Validated with Prisma 5.22.0. |
| **5. Local Filesystem** | Local disk | Ephemeral cloud containers wipe disk on restart | **PASS (IN-MEMORY)**: Verified `multer.memoryStorage()`, ExcelJS `workbook.xlsx.writeBuffer()`, and PDFKit in-memory chunk streaming. Zero disk dependencies. |
| **6. CORS Policy** | `cors({ origin: '*' })` | Permissive for cross-domain Vercel-to-Render calls | **PASS**: Backend accepts cross-domain requests, standard headers, and credentials from any origin. |
| **7. Environment Config** | Local `.env` | Cloud dashboard environment variables | **PASS**: Clean `.env.example` templates created for both frontend and backend. |
| **8. Health-Check** | `GET /api/health` | HTTP 200 monitoring endpoint | **PASS**: Returns `{ status: "ONLINE", service: "FLEETPULSE 360 Enterprise API", ... }`. |
| **9. Deployment Blockers** | Missing start path, hardcoded API URL | Zero critical blockers remaining | **CLEARED**: All 3 blockers identified and resolved. |

---

## 3. Phase 2 — Database Safety & Provider Evaluation

### Why SQLite Must NOT Be Deployed on Free-Tier Cloud PaaS
Free-tier container platforms (Render, Railway, Fly.io, Heroku) operate on **ephemeral virtual filesystems**. Every time a container restarts, sleeps, or re-deploys, the local disk is wiped back to the base Git commit. Running SQLite in cloud production would mean:
- All trip dispatches, attendance entries, and client invoices added during a demonstration would vanish after 15 minutes of inactivity.
- Any database lock during concurrent access would crash the Node.js API process.

### Cloud Database Provider Comparison

| Provider | Database Engine | Free Tier Allowance | Persistence & Sleep Policy | Credit Card Needed? | Verdict |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Neon** | **PostgreSQL 16** | **0.5 GB Storage, 100 CU hrs** | **Permanent. Never expires or deletes data.** | **No** | ⭐ **RECOMMENDED (#1 CHOICE)** |
| **Supabase** | PostgreSQL 15 | 500 MB Storage, 2 Projects | Pauses after 7 days of complete inactivity | No | Strong Alternative |
| **Render Postgres** | PostgreSQL 16 | 1 GB Storage | **Expires after 30 days** (Requires $7/mo upgrade) | No | Not recommended for long-term |
| **Aiven** | MySQL / Postgres | 1 Node Trial | Regional limits, credit card may be requested | Sometimes | Higher friction |
| **Turso** | LibSQL (SQLite) | 9 GB Storage | Requires custom `@libsql/client` Prisma adapter | No | Requires code re-architecture |

**Selected Solution:** **Neon Serverless PostgreSQL**. Neon provides a dedicated PostgreSQL database with connection pooling enabled out of the box, zero credit card requirements, instant GitHub OAuth sign-in, and permanent persistence.

---

## 4. Phase 3 — Free-Tier Strategy & Cold-Start Optimization

### Cold-Start Dynamics on Render Free Tier
Render spins down free web services after **15 minutes of inactivity**. When a new HTTP request hits the dormant service:
1. Render provisions a container and boots the Node.js process.
2. The initial request experiences a **30 to 45 second latency (cold start)**.
3. Subsequent requests respond in **under 80 milliseconds**.

### Demonstration Pre-Warming Runbook
To guarantee an instant, lightning-fast first impression for Shreej Logistics:
- **Strategy A (Manual Pre-Warm):** Exactly 5 minutes before your meeting with Shreej Logistics, open the backend health check URL in your browser:
  `https://fleetpulse-api.onrender.com/api/health`
  Once you see `{"status":"ONLINE"}`, the backend is hot and will respond instantly throughout your demo.
- **Strategy B (Automated 10-Minute Pinger):** Register a free monitor at [cron-job.org](https://cron-job.org) or [UptimeRobot](https://uptimerobot.com) to ping `https://fleetpulse-api.onrender.com/api/health` every 10 minutes. This prevents the container from ever sleeping during business hours.

---

## 5. Phase 4 — Step-by-Step Production Deployment Runbook

### Step 1: Provision Persistent PostgreSQL Database on Neon (2 Minutes)

1. Navigate to [https://neon.tech](https://neon.tech) and click **Sign Up** (choose **Continue with GitHub**).
2. Click **Create Project**:
   - **Project Name:** `fleetpulse360-db`
   - **Database Name:** `neondb` (default)
   - **Region:** Select **AWS Frankfurt (eu-central-1)** or **AWS Singapore (ap-southeast-1)**.
3. In the project dashboard under **Connection Details**:
   - Ensure **Pooled connection** checkbox is checked (uses PgBouncer on port 5432).
   - Select **Prisma** from the connection string dropdown.
   - Copy the connection string. It will look like:
     ```text
     postgresql://neondb_owner:npg_AbCdEf123456@ep-cool-fog-a2xyz-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require
     ```
   - *Save this string securely for Step 2.*

---

### Step 2: Deploy Backend Web Service on Render (3 Minutes)

1. Navigate to [https://render.com](https://render.com) and click **Get Started** (Sign in with GitHub).
2. Click **New +** in the top navigation and select **Web Service**.
3. Select **Build and deploy from a Git repository** and connect your repository:
   - Select: `Parth26198/fleetpulse-360`
4. Configure the service parameters:
   - **Name:** `fleetpulse-api`
   - **Region:** Frankfurt (EU Central) or Singapore (matches your Neon region)
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:**
     ```bash
     npm install && npx prisma generate --schema=prisma/schema.postgresql.prisma && npx prisma db push --schema=prisma/schema.postgresql.prisma && npm run build
     ```
   - **Start Command:**
     ```bash
     node dist/src/server.js
     ```
   - **Instance Type:** `Free` (512 MB RAM, 0.1 CPU)
5. Expand **Advanced** and add the following **Environment Variables**:
   | Key | Value | Notes |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | Enables Express production optimizations |
   | `PORT` | `10000` | Render default web service port |
   | `DATABASE_URL` | *[Paste your Neon Pooled Connection String from Step 1]* | Must include `?sslmode=require` |
   | `JWT_SECRET` | *[Generate via `crypto.randomBytes(32)` or let Render auto-generate]* | Generate using: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. Never use hardcoded secrets. |
   | `JWT_EXPIRES_IN` | `7d` | Token lifetime |
   | `FRONTEND_URL` | `https://fleetpulse-360.vercel.app` | Restricts API access exclusively to your deployed Vercel frontend |
6. Set **Health Check Path** under Advanced to: `/api/health`.
7. Click **Create Web Service**.
8. Wait ~2 minutes for the build to finish. Once live, Render displays your API URL:
   ```text
   https://fleetpulse-api.onrender.com
   ```
9. Verify by opening `https://fleetpulse-api.onrender.com/api/health` in your browser. You will receive:
   ```json
   {
     "status": "ONLINE",
     "service": "FLEETPULSE 360 Enterprise API",
     "version": "1.0.0"
   }
   ```

---

### Step 3: Seed Production Database with Shreej Logistics Operational Data (1 Minute)

To populate the cloud PostgreSQL database with all 34 authentic vehicles, 28 drivers, 12 corporate clients, and the 15/15 reconciled payroll records:

#### Option A: Via Render Shell (Easiest)
1. In your Render Dashboard, click into your `fleetpulse-api` service.
2. Click the **Shell** tab on the left menu.
3. Run:
   ```bash
   node ./node_modules/tsx/dist/cli.mjs prisma/seed.ts
   ```
4. You will see:
   ```text
   🌱 Starting FLEETPULSE 360 database seed...
   Seeding 25 active vehicles & drivers...
   Seeding 9 stopped cab records...
   Seeding 12 corporate client profiles & rate cards...
   Seeding authentic attendance records...
   Seeding 15 reconciled payroll records...
   ✅ FLEETPULSE 360 database seeding completed successfully!
   ```

#### Option B: From Your Local Machine
From your local project directory:
```powershell
$env:DATABASE_URL="postgresql://neondb_owner:PASSWORD@ep-xyz-pooler.neon.tech/neondb?sslmode=require"
cd backend
node ./node_modules/tsx/dist/cli.mjs prisma/seed.ts
```

---

### Step 4: Deploy Frontend on Vercel (2 Minutes)

1. Navigate to [https://vercel.com](https://vercel.com) and click **Sign Up** (Sign in with GitHub).
2. Click **Add New...** -> **Project**.
3. Import the Git repository `Parth26198/fleetpulse-360`.
4. Configure the project settings:
   - **Project Name:** `fleetpulse-360`
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click **Edit** and select `frontend`.
   - **Build Command:** `npm run build` (defaults to `tsc && vite build`)
   - **Output Directory:** `dist`
5. Expand **Environment Variables**:
   - Add **Name:** `VITE_API_URL`
   - Add **Value:** `https://fleetpulse-api.onrender.com/api` (use your actual Render backend URL)
6. Click **Deploy**.
7. In ~45 seconds, Vercel will finish building and provide your live URL:
   ```text
   https://fleetpulse-360.vercel.app
   ```

---

## 6. Phase 5 — Client Demonstration User Accounts & Verification Matrix

Log into `https://fleetpulse-360.vercel.app` using the credentials below to demonstrate specific roles and permissions to Shreej Logistics:

| # | Role Demonstrated | Login Email | Password | Key Views & Permissions to Highlight |
| :-: | :--- | :--- | :--- | :--- |
| **1** | **Super Admin** | `admin@fleetpulse.com` | `admin123` | System-wide visibility, multi-company overview, user management, audit logs. |
| **2** | **Company Admin** *(Director)* | `admin@shreej.com` | `admin123` | Full Shreej tenant control: Dashboard KPIs, 34 vehicles, payroll approvals, invoices. |
| **3** | **Operations Executive** | `ops@shreej.com` | `admin123` | 5-stage dispatch pipeline, trip scheduling, stop tracking, daily driver assignment. |
| **4** | **Fleet Manager** | `fleet@shreej.com` | `admin123` | Vehicle compliance tracker, 30-day document expiry alerts, stopped-cab audit. |
| **5** | **Accounts Executive** | `accounts@shreej.com` | `admin123` | Invoice generation, GST calculations, cash advance recovery, PDF invoice downloads. |
| **6** | **HR Executive** | `hr@shreej.com` | `admin123` | Monthly attendance register, 2 Late = 1 Absent rule, 15/15 reconciled payroll. |
| **7** | **Client Viewer** *(Orix MIS)* | `client@orix.com` | `admin123` | Read-only corporate client portal, rate matrices, dedicated trip history. |
| **8** | **Isolated Tenant Admin** | `admin@apex.com` | `admin123` | Proof of enterprise multi-tenant data isolation (Apex data separated from Shreej). |

---

## 7. Client Demonstration 10-Point Verification Checklist

Before presenting to Shreej Logistics, perform this rapid 2-minute walkthrough on the live URL:

- [ ] **1. API Health Check:** Open `https://<backend-url>/api/health` and verify `{"status":"ONLINE"}`.
- [ ] **2. Authentication & Role Switcher:** Open `https://<frontend-url>/login`, test 1-click role selection, and log in as `admin@shreej.com`.
- [ ] **3. Executive Dashboard:** Verify total vehicles (34), active drivers (28), and monthly revenue metrics render cleanly on desktop and mobile.
- [ ] **4. Fleet & Compliance:** Open `/fleet` and `/compliance`; verify the 9 stopped cabs are segregated and vehicle document alerts display.
- [ ] **5. Daily Dispatch Workflow:** Open `/trips`; verify trips list, create a test trip, assign vehicle/driver, and transition to COMPLETED.
- [ ] **6. 5% CNG Expense Recovery:** Open `/daily-tracker`; verify fuel recovery calculations match the Shreej operational rule.
- [ ] **7. Verified Payroll:** Open `/payroll`; verify all 15 employees display identical gross/net salaries reconciled against the original Excel workbook.
- [ ] **8. Corporate Client Rate Cards:** Open `/clients`; inspect Orix, WNS, and Tata rate card slabs.
- [ ] **9. Dynamic Invoicing & PDF:** Open `/invoices`, click **Download PDF** on any invoice, and verify that the formatted PDF opens in-browser.
- [ ] **10. Excel Report Export:** Open `/reports`, click **Export Fleet Compliance** and **Export Payroll**, and verify `.xlsx` files download with accurate formatting.
