import ExcelJS from 'exceljs';
import { prisma } from '../lib/prisma';
import { FleetService } from './fleetService';
import { AttendanceService } from './attendanceService';
import { PayrollService } from './payrollService';
import { ExpenseService } from './expenseService';
import { TrackerService } from './trackerService';

export class ReportService {
  static async exportFleetCompliance(companyId: string): Promise<Buffer> {
    const vehicles = await FleetService.listVehicles(companyId);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'FLEETPULSE 360';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Fleet Compliance Register');

    sheet.columns = [
      { header: 'Vehicle Number', key: 'regNo', width: 18 },
      { header: 'Type', key: 'type', width: 12 },
      { header: 'Make & Model', key: 'makeModel', width: 22 },
      { header: 'Assigned Driver', key: 'driver', width: 22 },
      { header: 'Compliance Status', key: 'status', width: 18 },
      { header: 'Next Expiry Date', key: 'nextExpiry', width: 16 },
      { header: 'Days Remaining', key: 'daysLeft', width: 16 },
      { header: 'Registration', key: 'regExp', width: 16 },
      { header: 'Fitness', key: 'fitExp', width: 16 },
      { header: 'Tax', key: 'taxExp', width: 16 },
      { header: 'Permit', key: 'perExp', width: 16 },
      { header: 'PUC', key: 'pucExp', width: 16 },
      { header: 'Insurance', key: 'insExp', width: 16 },
    ];

    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0F172A' } };

    for (const v of vehicles) {
      const docMap = new Map<string, string>();
      for (const d of v.vehicleDocuments) {
        if (d.expiryDate) {
          docMap.set(d.documentType, new Date(d.expiryDate).toISOString().split('T')[0]);
        }
      }

      const row = sheet.addRow({
        regNo: v.registrationNumber,
        type: v.vehicleType,
        makeModel: `${v.make} ${v.model}`,
        driver: v.assignedDriver?.name || 'Unassigned',
        status: v.complianceStatus,
        nextExpiry: v.nextExpiryDate ? new Date(v.nextExpiryDate).toISOString().split('T')[0] : 'N/A',
        daysLeft: v.daysRemaining !== null ? v.daysRemaining : 'N/A',
        regExp: docMap.get('REGISTRATION') || 'N/A',
        fitExp: docMap.get('FITNESS') || 'N/A',
        taxExp: docMap.get('TAX') || 'N/A',
        perExp: docMap.get('PERMIT') || 'N/A',
        pucExp: docMap.get('PUC') || 'N/A',
        insExp: docMap.get('INSURANCE') || 'N/A',
      });

      // Highlight status
      const statusCell = row.getCell('status');
      if (v.complianceStatus === 'EXPIRED') {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEE2E2' } };
        statusCell.font = { color: { argb: 'DC2626' }, bold: true };
      } else if (v.complianceStatus === 'EXPIRING SOON') {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEF3C7' } };
        statusCell.font = { color: { argb: 'D97706' }, bold: true };
      } else {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'DCFCE7' } };
        statusCell.font = { color: { argb: '16A34A' }, bold: true };
      }
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  static async exportPayroll(companyId: string, month = 11, year = 2026): Promise<Buffer> {
    const payrollData = await PayrollService.getMonthlyPayroll(companyId, month, year);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(`Payroll_${month}_${year}`);

    sheet.columns = [
      { header: 'Employee Code', key: 'code', width: 16 },
      { header: 'Employee Name', key: 'name', width: 22 },
      { header: 'Department', key: 'dept', width: 20 },
      { header: 'Present Days', key: 'present', width: 14 },
      { header: 'Absent Days', key: 'absent', width: 14 },
      { header: 'Week Offs', key: 'wo', width: 14 },
      { header: 'Late Marks', key: 'late', width: 14 },
      { header: 'Late Ded Days', key: 'lateDed', width: 14 },
      { header: 'Payable Days', key: 'payable', width: 14 },
      { header: 'Base Salary (₹)', key: 'base', width: 16 },
      { header: 'Absent Ded (₹)', key: 'absDed', width: 16 },
      { header: 'Late Ded (₹)', key: 'lateDedAmt', width: 16 },
      { header: 'Total Ded (₹)', key: 'totDed', width: 16 },
      { header: 'Net Salary (₹)', key: 'net', width: 18 },
      { header: 'Status', key: 'status', width: 14 },
    ];

    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0F172A' } };

    for (const r of payrollData.records) {
      sheet.addRow({
        code: r.employeeCode,
        name: r.name,
        dept: r.department,
        present: r.presentDays,
        absent: r.absentDays,
        wo: r.weekOffDays,
        late: r.lateMarks,
        lateDed: r.lateDeductionDays,
        payable: r.payableDays,
        base: r.baseSalary,
        absDed: r.absentDeduction,
        lateDedAmt: r.lateDeduction,
        totDed: r.totalDeductions,
        net: r.netSalary,
        status: r.status,
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  static async exportDailyTracker(companyId: string, dateStr?: string): Promise<Buffer> {
    const tracker = await TrackerService.getDailyTracker(companyId, dateStr);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Daily Vehicle Tracker');

    sheet.columns = [
      { header: 'Vehicle Number', key: 'regNo', width: 18 },
      { header: 'Assigned Driver', key: 'driver', width: 22 },
      { header: 'Driver Phone', key: 'phone', width: 16 },
      { header: '24-Hr Trips', key: 'trips', width: 14 },
      { header: 'Attendance', key: 'status', width: 14 },
      { header: 'Today CNG (₹)', key: 'todayCng', width: 16 },
      { header: 'MTD CNG Total (₹)', key: 'mtdCng', width: 18 },
      { header: 'CNG Recovery (5%)', key: 'recovery', width: 18 },
      { header: 'Total Recoverable (₹)', key: 'totalRec', width: 20 },
    ];

    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0F172A' } };

    for (const v of tracker.vehicles) {
      sheet.addRow({
        regNo: v.registrationNumber,
        driver: v.assignedDriverName,
        phone: v.driverPhone,
        trips: v.tripCount,
        status: v.attendanceStatus,
        todayCng: v.cngExpenseToday,
        mtdCng: v.cngExpenseMtd,
        recovery: v.cngRecoveryAmount,
        totalRec: v.totalRecoverableCng,
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
