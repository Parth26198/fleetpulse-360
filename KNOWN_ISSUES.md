# FLEETPULSE 360 — Known Issues, Edge Cases & Data Reconciliations

**Document Version:** 1.0.0  
**Application:** FLEETPULSE 360  
**Target Excel Source:** `SHREEJ_DAILY REPORT.xlsx`  
**Last Updated:** November 16, 2026  

---

## 1. Overview

During the end-to-end analysis, data extraction, and quality assurance auditing of the source Excel workbook `SHREEJ_DAILY REPORT.xlsx` (11 sheets, 1,017 KB), several data anomalies, formatting inconsistencies, environment quirks, and edge cases were identified.

This document records each identified issue, the exact technical mitigation implemented, and future roadmap recommendations.

---

## 2. Source Excel Workbook Anomalies & Reconciliations

### 2.1 Out-of-Bounds Date Serial in `MONTHLY_PAYROLL_TRACKER` (Cell Q11)
- **Symptom:** OpenPyXL and Excel readers emitted the warning:
  `UserWarning: Cell Q11 is marked as a date but the serial value 9850149392.0 is outside the limits for dates.`
- **Root Cause:** A 10-digit Indian mobile number (`9850149392`) was entered into column Q (Emergency Contact / Phone) of the payroll sheet, but the cell format was accidentally set to `DATE` in Excel formatting metadata.
- **Resolution:** The data ingestion pipeline inspects column headers and data types. When an out-of-bounds numeric value exceeds `2,958,465` (Excel's max date serial Dec 31, 9999), the parser intercepts it and coerces the value to a standardized string representation of a contact phone number.

### 2.2 Uncalculated November Deductions in `MONTHLY_PAYROLL_TRACKER`
- **Symptom:** In the static `data_only=True` view of the Excel file, November payroll rows showed `0` for absent deductions and late deductions, while base salary and net salary were equal (e.g., ANSHIKA showed Base ₹17,000, Net ₹17,000 despite having 12 absent days and 3 late marks in `ATTENDENCE_ NOV`).
- **Root Cause:** The workbook was saved before the end of November, so the formula cells `=ROUND(E11*(K11/31),0)` and `=K11-N11` had not been calculated or evaluated by Excel's formula engine.
- **Resolution:** FLEETPULSE 360 does not rely on static uncalculated cached cells. `PayrollService.generatePayrollFromAttendance()` recalculates payroll dynamically from the daily attendance log:
  $$\text{absentDeduction} = \text{ROUND}\left(\text{absentDays} \times \frac{\text{baseSalary}}{31}, 0\right)$$
  $$\text{lateDeduction} = \text{ROUND}\left(\lfloor \frac{\text{lateMarks}}{2} \rfloor \times \frac{\text{baseSalary}}{31}, 0\right)$$
  $$\text{netSalary} = \max(0, \text{baseSalary} - \text{absentDeduction} - \text{lateDeduction})$$

### 2.3 Stopped Cabs Segregation (`STOP CABS` Worksheet)
- **Symptom:** The workbook contained 7 vehicles under the sheet `STOP CABS` separate from `DAILY_VEHICLE_TRACKER` and `vehicels complince`.
- **Root Cause:** In manual operations, decommissioned or temporarily halted cabs (due to engine overhaul, accidents, or driver shortages) are moved to a separate sheet to avoid skewing daily attendance metrics.
- **Resolution:** Rather than losing these vehicles or maintaining disconnected tables, the database schema introduces a `status: STOPPED` state and an optional `stopReason` column on the `Vehicle` entity. All 7 stopped cabs (`MH-12-PQ-1001` through `MH-12-PQ-1007`) are preserved with audit history and can be reactivated with one click in the UI.

### 2.4 Multi-Department Task Log Merged Cells (`DAILY WORKING_Shreej`)
- **Symptom:** The `DAILY WORKING_Shreej` sheet contained tasks across 8 departments (MIS, Operations, Accounts, Billing, HR, Fleet) with inconsistent date formatting and merged status blocks.
- **Resolution:** The schema models a dedicated `Task` table with standardized departments, priorities (`URGENT`, `HIGH`, `MEDIUM`, `LOW`), statuses (`PENDING`, `IN_PROGRESS`, `COMPLETED`), and assigned staff relationships.

---

## 3. Platform & Operating System Environment Quirks

### 3.1 Windows Path Ampersand (`&`) Command Splitting
- **Symptom:** Running `npm run build` or `npx prisma` inside the directory:
  `c:\Users\Paresh\OneDrive\Desktop\SHREEJ LOGISTICS & OPERATIONS — EXECUTIVE OVERVIEW`
  caused the Windows `cmd.exe` shell to crash with:
  `'OPERATIONS' is not recognized as an internal or external command`.
- **Root Cause:** Windows command interpreters treat the unquoted `&` in the folder path as a command separator (`cmd1 & cmd2`), attempting to execute `OPERATIONS` as a separate executable.
- **Resolution:** All build scripts and CLI tools in the project documentation and package configurations execute Node binaries directly via PowerShell quotes:
  ```powershell
  node ./node_modules/prisma/build/index.js db push
  node ./node_modules/typescript/bin/tsc
  node ./node_modules/vite/bin/vite.js
  ```

### 3.2 Python Console UnicodeEncodeError (`\u20b9` Rupee Symbol)
- **Symptom:** Python test runners or diagnostic scripts raised:
  `UnicodeEncodeError: 'charmap' codec can't encode character '\u20b9' in position...`
- **Root Cause:** Windows standard console default code page (`cp1252`) does not contain the Indian Rupee symbol (`₹`).
- **Resolution:** Added `sys.stdout.reconfigure(encoding='utf-8')` to all Python audit scripts and CLI utilities.

---

## 4. Edge Cases Handled in Domain Business Logic

| Domain | Edge Case | Handling in FLEETPULSE 360 |
|---|---|---|
| **Attendance** | Odd number of late marks (e.g., 3 or 5) | Integer floor division `Math.floor(lateMarks / 2)` ensures drivers/staff are not penalized fractional days. |
| **Attendance** | 0 days attended (Month-long absence) | Base deductions do not exceed base salary (`Math.max(0, netSalary)`), preventing negative payroll liabilities. |
| **Tracker** | Vehicle present on duty but 0 trips completed | Attendance status recorded as `STANDBY` with 0 CNG expenditure. |
| **CNG Recovery** | Non-CNG vehicles (Diesel / Petrol / EV) | Recovery rate defaults to 0.0%; surcharge is strictly applied to CNG-tagged vehicles. |
| **Compliance** | Missing statutory documents | Vehicles without registered documents are flagged `NON_COMPLIANT` immediately with a warning badge. |
| **Client Billing** | Extra kilometer billing beyond package slab | Invoicing engine automatically compares trip total km against package slab base km and applies `extraKmRate`. |

---

## 5. Future Roadmap & Enhancements (v1.1 - v2.0)

1. **Driver Progressive Web App (PWA):**
   - Offline-capable mobile interface for drivers to mark attendance, log odometer readings, and upload CNG fuel receipts.
2. **Automated WhatsApp Dispatch Alerts:**
   - Twilio / WhatsApp Business API integration to push 5-stage dispatch journey updates directly to corporate passengers and corporate fleet coordinators.
3. **Automated FASTag Toll Reconciliation:**
   - Direct integration with NETC FASTag APIs to ingest toll plaza charges in real time, eliminating manual toll cash settlements.
4. **GPS Telematics API Integration:**
   - Webhook listeners for popular Indian vehicle tracking hardware (Teltonika, Convex, Fleetx) to automate real-time trip start and destination reporting.
