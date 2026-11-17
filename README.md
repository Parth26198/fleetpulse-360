# FLEETPULSE 360 — Complete Fleet. Complete Control.

> **Enterprise Fleet & Operations Management Suite**  
> Built and validated directly against `SHREEJ_DAILY REPORT.xlsx` (11 Worksheets, 1,017 KB).  
> Dual-engine architecture: Zero-setup SQLite (Development) & Scalable MySQL 8 (Production).

---

## 🌟 Executive Overview

**FLEETPULSE 360** is a full-stack, production-grade, multi-tenant enterprise web application designed to replace and automate complex spreadsheet-driven fleet logistics.

The system incorporates:
- **Fleet Inventory & Statutory Compliance:** 34 vehicles, live countdown timers for Fitness, Road Tax, Permit, PUC, and Insurance with automated color-coded health badges.
- **5-Stage Dispatch Workflow:** Depot Departure -> Client Report -> Duty Complete -> Depot Return -> Invoiced.
- **Daily 24-Hr Vehicle Tracker:** Vehicle attendance, daily trip counts, and real-time **5% CNG Recovery Surcharge** calculation.
- **Attendance & Executive Payroll:** 30-day attendance grid with the **2 Late Marks = 1 Absent Day** penalty rule, prorated absent/late deductions on a 31-day cycle, and automated Net Salary disbursement.
- **Cash Outflows & Expenses:** Complete cash flow ledger matching ₹278,875 across fuel, advances, repairs, and office expenses.
- **Corporate CRM & Slab Billing:** 12 client profiles, escalation contacts, custom package rate cards, and dynamic PDF tax invoice generation.
- **Multi-Worksheet Excel Migration Engine:** Auto-detects and migrates all 11 worksheets from the raw `SHREEJ_DAILY REPORT.xlsx` file with preview and validation.

---

## 🚀 Live Services & Local URLs

The application is running and accessible locally:

| Service | URL | Health Check / Note |
|---|---|---|
| **Frontend Web Application** | [http://127.0.0.1:5173](http://127.0.0.1:5173) | React 18 + Vite SPA with Dark Navy Shell (`#0F172A`) & Orange Accent (`#F97316`) |
| **Backend REST API** | [http://127.0.0.1:5000](http://127.0.0.1:5000) | Express + Prisma ORM + TypeScript |
| **API Health Endpoint** | [http://127.0.0.1:5000/api/health](http://127.0.0.1:5000/api/health) | Returns JSON status, uptime, and service metadata |

---

## 🔐 Demo Credentials (Password for all: `admin123`)

| Email | User Name | Role | Tenant Company | Scope of Access |
|---|---|---|---|---|
| `admin@shreej.com` | Shashi Shekhar | `COMPANY_ADMIN` | Shreej Logistics & Operations | Full enterprise access across all 12 modules |
| `ops@shreej.com` | Ganesh Kumbhar | `OPERATIONS_LEAD` | Shreej Logistics & Operations | Fleet, 5-stage dispatch, daily tracker, tasks |
| `fleet@shreej.com` | Dnyaneshwar | `FLEET_MANAGER` | Shreej Logistics & Operations | Vehicle directory, document renewal, stopped cabs |
| `accounts@shreej.com` | Chhaya | `ACCOUNTS_EXEC` | Shreej Logistics & Operations | Expenses, cash outflows, payroll, invoices |
| `hr@shreej.com` | Rahul P | `HR_EXEC` | Shreej Logistics & Operations | Employee master, 30-day attendance, late marks |
| `client@orix.com` | Amit Sharma | `CLIENT_VIEWER` | Shreej Logistics (Client Portal)| Client-specific trips, assigned vehicles, invoices |
| `admin@fleetpulse.com` | Super Admin | `SUPER_ADMIN` | Global Platform | Cross-company platform management |
| `admin@apex.com` | Apex Admin | `COMPANY_ADMIN` | Apex Corporate Transport Ltd | **Isolated Tenant** (0 Shreej data visible) |

---

## 📊 Core Business Logic & Verified Formulas

### 1. Attendance Late Mark Penalty Rule
$$\text{lateDeductionDays} = \lfloor \frac{\text{lateMarks}}{2} \rfloor$$
$$\text{payableDays} = \text{presentDays} + \text{weekOffDays} - \text{lateDeductionDays}$$

### 2. Prorated Monthly Payroll Formulas
$$\text{absentDeduction} = \text{ROUND}\left(\text{absentDays} \times \frac{\text{baseSalary}}{31}, 0\right)$$
$$\text{lateDeduction} = \text{ROUND}\left(\text{lateDeductionDays} \times \frac{\text{baseSalary}}{31}, 0\right)$$
$$\text{netSalary} = \max\left(0, \text{baseSalary} - \text{absentDeduction} - \text{lateDeduction}\right)$$

### 3. Daily Vehicle Tracker 5% CNG Recovery Surcharge
$$\text{cngRecoveryAmount} = \text{ROUND}(\text{cngExpenseMtd} \times 0.05, 2)$$
$$\text{totalRecoverableCng} = \text{cngExpenseMtd} + \text{cngRecoveryAmount}$$

### 4. Vehicle Statutory Compliance Countdown
$$\text{Days Remaining} = \lceil \frac{\text{expiryDate} - \text{currentDate}}{86,400,000} \rceil$$
- `< 0 days`: **EXPIRED** (Red badge)
- `0 to 30 days`: **EXPIRING SOON** (Amber badge)
- `> 30 days`: **COMPLIANT** (Green badge)

---

## 🛠️ Technology Stack

```
Frontend:
├── React 18.3 (Component Architecture, Hooks, Context API)
├── Vite 6.2 (Lightning-fast HMR & Production Bundler)
├── TypeScript 5.8 (Strict Type Safety)
├── Tailwind CSS 3.4 (Custom Design System, Dark Navy & Orange)
├── Lucide React (Enterprise Iconography)
└── Recharts (Responsive Analytics, KPIs, Outflow Distribution)

Backend:
├── Node.js 22 LTS & Express 4.21
├── Prisma ORM 6.4 (Type-safe Database Client & Migration Engine)
├── SQLite (Local Zero-Config Development) & MySQL 8.0 (Production)
├── ExcelJS (High-Performance Streaming XLSX Export & Ingestion)
├── PDFKit (Dynamic Corporate Tax Invoice PDF Generation)
├── bcrypt (Salt Rounds = 10, Secure Password Hashing)
└── jsonwebtoken (Stateless HMAC SHA-256 JWT Authentication)
```

---

## 🏃 Quick Start Guide

### Prerequisites
- Node.js 20+ installed
- PowerShell / Bash

### 1. Backend Setup
```bash
cd backend
npm install
# Push SQLite schema (for local dev)
node ./node_modules/prisma/build/index.js db push
# Seed authentic Excel records
node ./node_modules/ts-node/dist/bin.js prisma/seed.ts
# Build and run
npm run build
node dist/src/server.js
```
*Backend will start on `http://127.0.0.1:5000`.*

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run build
node ./node_modules/vite/bin/vite.js --port 5173 --host 127.0.0.1
```
*Frontend will start on `http://127.0.0.1:5173`.*

---

## 📚 Deliverables & Audit Documentation

Detailed architectural, compliance, and acceptance reports are available in the project root:

1. [**FRONTEND_QA_REPORT.md**](file:///c:/Users/Paresh/OneDrive/Desktop/SHREEJ%20LOGISTICS%20&%20OPERATIONS%20%E2%80%94%20EXECUTIVE%20OVERVIEW/FRONTEND_QA_REPORT.md): Phase 3 Real Browser Playwright E2E audit of all 25 frontend views & modals with zero console errors and 22 screenshots.
2. [**USER_ACCEPTANCE_REPORT.md**](file:///c:/Users/Paresh/OneDrive/Desktop/SHREEJ%20LOGISTICS%20&%20OPERATIONS%20%E2%80%94%20EXECUTIVE%20OVERVIEW/USER_ACCEPTANCE_REPORT.md): End-to-end verification of 7 core business operational workflows from dispatch to payroll recalculation and Excel ingestion.
3. [**RBAC_PERMISSION_TEST_REPORT.md**](file:///c:/Users/Paresh/OneDrive/Desktop/SHREEJ%20LOGISTICS%20&%20OPERATIONS%20%E2%80%94%20EXECUTIVE%20OVERVIEW/RBAC_PERMISSION_TEST_REPORT.md): Comprehensive security audit across all 8 user roles verifying allowed vs forbidden (403) endpoints and strict tenant isolation.
4. [**PRODUCTION_READINESS_CHECKLIST.md**](file:///c:/Users/Paresh/OneDrive/Desktop/SHREEJ%20LOGISTICS%20&%20OPERATIONS%20%E2%80%94%20EXECUTIVE%20OVERVIEW/PRODUCTION_READINESS_CHECKLIST.md): Production gateway checklist (MySQL 8 staging validation, backup/restore, secret hardening, and remaining blockers).
5. [**BUSINESS_ACCEPTANCE_REPORT.md**](file:///c:/Users/Paresh/OneDrive/Desktop/SHREEJ%20LOGISTICS%20&%20OPERATIONS%20%E2%80%94%20EXECUTIVE%20OVERVIEW/BUSINESS_ACCEPTANCE_REPORT.md): Phase 2 Business Acceptance Testing (BAT) across all 10 core operational and financial modules with Excel source comparisons and zero variance (10/10 PASS).
6. [**PAYROLL_RECONCILIATION.md**](file:///c:/Users/Paresh/OneDrive/Desktop/SHREEJ%20LOGISTICS%20&%20OPERATIONS%20%E2%80%94%20EXECUTIVE%20OVERVIEW/PAYROLL_RECONCILIATION.md): Complete employee-wise reconciliation comparing Excel `MONTHLY_PAYROLL_TRACKER` vs application database & live API (100% RECONCILED).
7. [**QA_REPORT.md**](file:///c:/Users/Paresh/OneDrive/Desktop/SHREEJ%20LOGISTICS%20&%20OPERATIONS%20%E2%80%94%20EXECUTIVE%20OVERVIEW/QA_REPORT.md): Complete 23-point automated E2E test matrix, formula verifications, and 25-view UI audit (100% PASS).
8. [**SECURITY_AUDIT.md**](file:///c:/Users/Paresh/OneDrive/Desktop/SHREEJ%20LOGISTICS%20&%20OPERATIONS%20%E2%80%94%20EXECUTIVE%20OVERVIEW/SECURITY_AUDIT.md): Multi-tenant isolation testing, RBAC permission matrix across 8 roles, bcrypt verification, and injection defense.
9. [**PRODUCTION_DEPLOYMENT.md**](file:///c:/Users/Paresh/OneDrive/Desktop/SHREEJ%20LOGISTICS%20&%20OPERATIONS%20%E2%80%94%20EXECUTIVE%20OVERVIEW/PRODUCTION_DEPLOYMENT.md): Step-by-step production deployment for MySQL 8, PM2 cluster mode, Nginx reverse proxy with SSL, and Docker Compose.
10. [**KNOWN_ISSUES.md**](file:///c:/Users/Paresh/OneDrive/Desktop/SHREEJ%20LOGISTICS%20&%20OPERATIONS%20%E2%80%94%20EXECUTIVE%20OVERVIEW/KNOWN_ISSUES.md): Excel workbook idiosyncrasies reconciled, Windows environment handling, and v2.0 roadmap.
