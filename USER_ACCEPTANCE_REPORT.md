# FLEETPULSE 360 — USER ACCEPTANCE TEST REPORT (UAT)

**Execution Date:** November 17, 2026  
**Auditor:** Principal Solutions Architect & Business Acceptance Lead  
**Test Environment:** FLEETPULSE 360 Full-Stack Production Staging (`http://127.0.0.1:5173` / `:5000`)  
**Source Excel Ledger:** `SHREEJ_DAILY REPORT.xlsx`  
**Overall UAT Outcome:** **7 / 7 CORE WORKFLOWS PASSED (100% BUSINESS ACCEPTANCE)**  

---

## 1. Executive Summary

User Acceptance Testing (UAT) verifies that FLEETPULSE 360 accurately executes multi-step enterprise workflows required by fleet operations, dispatchers, compliance officers, accountants, HR specialists, and corporate clients. Every workflow was tested end-to-end with real transactional mutations, state changes, mathematical formula checks, and database state verifications.

---

## 2. End-to-End Workflow Audit Matrix

| Workflow ID | Business Operational Flow | Steps Executed | Key Validations & Results | Status |
|---|---|---|---|:---:|
| **UAT-WF-01** | **5-Stage Trip Dispatch** | Create $\rightarrow$ Assign $\rightarrow$ Multi-Stop Routing $\rightarrow$ Dispatch $\rightarrow$ Complete | 3 stops registered, daily vehicle tracking linked, cascade deletion verified | **PASS** |
| **UAT-WF-02** | **Attendance & Payroll Recalc** | Mark 2 Late Marks $\rightarrow$ Recalculate Payroll $\rightarrow$ Verify Deductions $\rightarrow$ Restore | 2 Late Marks = 1 Absent Day penalty triggered, Net salary reduced by ₹484, restored | **PASS** |
| **UAT-WF-03** | **Compliance Expiry Alerts** | Update Document Date $\rightarrow$ Evaluate Thresholds $\rightarrow$ Badge Lifecycle | Document transitioned: `EXPIRING_SOON` (15d) $\rightarrow$ `EXPIRED` (-10d) $\rightarrow$ `VALID` (225d) | **PASS** |
| **UAT-WF-04** | **Expense Logging & Aggregation**| Log Expense $\rightarrow$ Real-Time Dashboard KPI Update $\rightarrow$ Reconcile | Total expenses dynamically updated from ₹278,875 to ₹280,875, restored to ₹278,875 | **PASS** |
| **UAT-WF-05** | **Invoicing, PDF & Client Portal**| Generate Invoice $\rightarrow$ Stream PDF $\rightarrow$ Client Portal View $\rightarrow$ Pay | Valid `%PDF-1.3` binary stream (2,393 bytes), Client saw invoice, status updated to `PAID` | **PASS** |
| **UAT-WF-06** | **Excel Ingestion & Schema** | Workbook Upload $\rightarrow$ Detect 11 Worksheets $\rightarrow$ Schema Mapping | All 11 sheets detected, `DAILY_VEHICLE_TRACKER` parsed with 5% recovery columns | **PASS** |
| **UAT-WF-07** | **Report Exports & Reopening** | Dynamic XLSX Stream $\rightarrow$ Save File $\rightarrow$ Openpyxl Reopening Audit | Fleet (35 rows), Payroll (16 rows), Tracker (28 rows) reopened and verified | **PASS** |

---

## 3. Detailed Workflow Test Walkthroughs

### Workflow 1: 5-Stage Trip Dispatch & Multi-Stop Waypoint Routing
- **Business Purpose:** Facilitate employee corporate pickup/drop scheduling with multi-stop sequential routing, vehicle and driver assignment, and automatic vehicle attendance synchronization.
- **Test Steps Executed:**
  1. Selected active vehicle `MH-12-VT-0033` (Sedan) and assigned commercial driver `Amol Vitthal Kale`.
  2. Targeted corporate client `WIPRO`.
  3. Built sequential 3-stop route payload:
     - Stop 1: `Pickup Depot Bhosari` (06:00, PICKUP)
     - Stop 2: `Client Campus Hinjewadi` (07:30, DROP)
     - Stop 3: `Return Depot Chinchwad` (09:00, DROP)
  4. Dispatched itinerary via `POST /api/trips`.
  5. Verified trip created with HTTP 201, ID `ab83e4ad-24eb-4186-9b2d-c12ea77421d4`.
  6. Verified all 3 sequential stops stored in database in exact sequence order.
  7. Verified `DailyVehicleTracking` trip count updated automatically.
  8. Cleaned up test trip and verified cascade deletion of all child waypoints.
- **Workflow Status:** **PASS**

---

### Workflow 2: Attendance, Late Mark Penalty & Payroll Recalculation
- **Business Purpose:** Enforce corporate HR payroll rule: **2 Late Marks = 1 Absent Day Deduction**, calculated on a statutory 31-day divisor cycle.
- **Test Steps Executed:**
  1. Selected employee `ANSHIKA` (Base Monthly Salary: ₹15,000.00).
  2. Baseline November Payroll Record: Base: ₹15,000.00 | Late Marks: 0 | Late Ded Days: 0 | Net Salary: ₹15,000.00.
  3. Recorded 2 late check-in marks for November via `POST /api/attendance` (`checkIn: '10:45'` and `'10:50'`, `isLate: True`).
  4. Triggered on-demand payroll recalculation via `POST /api/payroll/recalculate`.
  5. Evaluated recalculation result:
     - Late Marks: `2`
     - Late Deduction Days: $\lfloor 2 / 2 \rfloor = 1 \text{ day}$
     - Late Deduction Amount: $\text{ROUND}(1 \times 15000 / 31) = ₹484.00$
     - Revised Net Disbursable Salary: $15000 - 484 = ₹14,516.00$
  6. Reverted attendance test marks to on-time (`09:00`, `isLate: False`) and recalculated payroll.
  7. Confirmed Net Salary restored to exact original certified baseline (₹15,000.00).
- **Workflow Status:** **PASS**

---

### Workflow 3: Vehicle Compliance Countdown & Alert Badge Lifecycle
- **Business Purpose:** Proactively monitor vehicle statutory documents (Fitness, Road Tax, Permit, PUC, Insurance) and flag impending expiries before penalties occur.
- **Test Steps Executed:**
  1. Selected operational cab `MH-12-UM-5035`.
  2. **Stage A (Expiring Soon):** Updated PUC expiry date to 15 days in future (`2026-12-02`).
     - System Status returned: `EXPIRING_SOON` (Amber badge).
     - Days remaining: `15d`.
  3. **Stage B (Expired):** Updated PUC expiry date to past date (`2026-11-01`).
     - System Status returned: `EXPIRED` (Red badge).
     - Days remaining: `-16d`.
  4. **Stage C (Compliant):** Restored PUC expiry date to valid future date (`2027-06-30`).
     - System Status returned: `VALID` (Green badge).
     - Days remaining: `225d`.
- **Workflow Status:** **PASS**

---

### Workflow 4: Expense Logging & Real-Time Dashboard KPI Updates
- **Business Purpose:** Real-time visibility into operational cash disbursements and category-wise spending.
- **Test Steps Executed:**
  1. Read baseline dashboard statistics (`GET /api/dashboard/stats`):
     - Initial Total Disbursed Expenses: **₹278,875.00**
  2. Logged new expense disbursement:
     - Amount: ₹2,000.00 | Category: `OFFICE` | Payment Mode: `GPAY` | Beneficiary: `Audit Supplies`
  3. Queried updated dashboard statistics:
     - Updated Total Expenses: **₹280,875.00** ($278875 + 2000$)
     - Recharts expense category breakdown reflected updated allocation.
  4. Deleted test transaction via `DELETE /api/expenses/:id`.
  5. Verified dashboard total expenses restored to exact baseline **₹278,875.00**.
- **Workflow Status:** **PASS**

---

### Workflow 5: Invoicing, PDF Generation & Client Portal Access
- **Business Purpose:** Automated monthly corporate client invoicing with tax breakdown (CGST/SGST 18%), on-the-fly PDF invoice generation, and client portal visibility.
- **Test Steps Executed:**
  1. Generated corporate tax invoice for client `ORIX` (`POST /api/invoices`):
     - Subtotal: ₹20,000.00 | Tax (18% GST): ₹3,600.00 | Total Invoice Value: ₹23,600.00.
  2. Downloaded dynamic PDF from endpoint `GET /api/invoices/:id/pdf`.
     - Validated binary stream: Header `%PDF-1.3`, file length: 2,393 bytes.
  3. Authenticated as Orix Client Viewer (`client@orix.com`) and fetched `/api/invoices`.
     - Confirmed invoice visible in client's portal.
  4. Recorded payment receipt (`POST /api/invoices/:id/payment`):
     - Paid Amount: ₹23,600.00 | Mode: `NEFT` | Status updated to `PAID`.
  5. Cleaned up test invoice to preserve original historical register.
- **Workflow Status:** **PASS**

---

### Workflow 6: Excel Workbook Auto-Detection & Migration Dry-Run
- **Business Purpose:** Ingest and parse enterprise Excel workbooks without data corruption.
- **Test Steps Executed:**
  1. Uploaded original workbook `SHREEJ_DAILY REPORT.xlsx` (1,017 KB).
  2. Validated detection of all 11 worksheets:
     - `EXECUTIVE SUMMARY`, `DAILY WORKING_Shreej`, `ATTENDENCE_ NOV`, `vehicels complince`, `EXPENSES_NOV`, `ONE PAGER_NOV`, `STOP CABS`, `EXPENSES May`, `MONTHLY_PAYROLL_TRACKER`, `CLINET DETAILS & ESCSLETIONS MA`, `DAILY_VEHICLE_TRACKER`.
  3. Inspected column mapping for `DAILY_VEHICLE_TRACKER`:
     - Identified: Cab Registration, Assigned Driver, 24-Hr Trips, Attendance, Today CNG, MTD CNG, 5% CNG Recovery Surcharge, Total Recoverable Outflow.
- **Workflow Status:** **PASS**

---

### Workflow 7: Report Exports & Openpyxl File Reopening Audit
- **Business Purpose:** Generate authentic, production-grade ExcelJS binary reports that open cleanly in spreadsheet software.
- **Test Steps Executed:**
  1. **Fleet Inventory & Compliance Export (`/reports/fleet/export`):**
     - File size: 10,004 bytes | Reopened with `openpyxl`.
     - Verified: 35 rows $\times$ 13 columns | Sheet: `Fleet Compliance Register`.
  2. **November 2026 Payroll Export (`/reports/payroll/export?month=11&year=2026`):**
     - File size: 7,924 bytes | Reopened with `openpyxl`.
     - Verified: 16 rows $\times$ 15 columns | Sheet: `Payroll_11_2026`.
  3. **Daily Vehicle & CNG Tracker Export (`/reports/tracker/export`):**
     - File size: 8,601 bytes | Reopened with `openpyxl`.
     - Verified: 28 rows $\times$ 9 columns | Sheet: `Daily Vehicle Tracker`.
- **Workflow Status:** **PASS**

---

## 4. User Acceptance Certification

All 7 core operational and financial workflows have successfully executed, validated mathematical business logic, and returned cleanly to stable, certified baseline states.

**User Acceptance Test Sign-Off:** **CERTIFIED ACCEPTED**
