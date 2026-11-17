import { prisma } from '../lib/prisma';
import { AttendanceService } from './attendanceService';

export class PayrollService {
  static async getMonthlyPayroll(companyId: string, month = 11, year = 2026): Promise<any> {
    const payrolls = await prisma.payroll.findMany({
      where: { companyId, month, year },
      include: {
        employee: true,
      },
      orderBy: { employee: { name: 'asc' } },
    });

    // If no payroll exists yet for this month, generate drafts from attendance
    if (payrolls.length === 0) {
      return this.generatePayrollFromAttendance(companyId, month, year);
    }

    const totalGross = payrolls.reduce((sum, p) => sum + p.baseSalary, 0);
    const totalAbsentDed = payrolls.reduce((sum, p) => sum + p.absentDeduction, 0);
    const totalLateDed = payrolls.reduce((sum, p) => sum + p.lateDeduction, 0);
    const totalDeductions = totalAbsentDed + totalLateDed;
    const totalNetPayable = payrolls.reduce((sum, p) => sum + p.netSalary, 0);
    const totalPresentDays = payrolls.reduce((sum, p) => sum + p.presentDays, 0);
    const totalAbsentDays = payrolls.reduce((sum, p) => sum + p.absentDays, 0);
    const overallPresentRate =
      totalPresentDays + totalAbsentDays > 0
        ? Number(((totalPresentDays / (totalPresentDays + totalAbsentDays)) * 100).toFixed(1))
        : 100;

    return {
      month,
      year,
      summary: {
        totalWorkforce: payrolls.length,
        overallPresentRate,
        totalGrossSalary: Math.round(totalGross),
        totalDeductions: Math.round(totalDeductions),
        totalAbsentDed: Math.round(totalAbsentDed),
        totalLateDed: Math.round(totalLateDed),
        netPayablePayroll: Math.round(totalNetPayable),
      },
      records: payrolls.map((p) => ({
        id: p.id,
        employeeId: p.employeeId,
        employeeCode: p.employee.employeeCode,
        name: p.employee.name,
        department: p.employee.department,
        roleTitle: p.employee.roleTitle,
        presentDays: p.presentDays,
        absentDays: p.absentDays,
        weekOffDays: p.weekOffDays,
        lateMarks: p.lateMarks,
        lateDeductionDays: p.lateDeductionDays,
        payableDays: p.payableDays,
        attendancePercentage: p.attendancePercentage,
        baseSalary: p.baseSalary,
        absentDeduction: p.absentDeduction,
        lateDeduction: p.lateDeduction,
        totalDeductions: p.absentDeduction + p.lateDeduction,
        netSalary: p.netSalary,
        status: p.status,
        approvedBy: p.approvedBy,
        approvedAt: p.approvedAt,
      })),
    };
  }

  static async generatePayrollFromAttendance(companyId: string, month = 11, year = 2026): Promise<any> {
    const attData = await AttendanceService.getMonthlyRegister(companyId, month, year);
    const daysInMonth = attData.daysInMonth;

    const records: any[] = [];
    for (const emp of attData.employees) {
      const employee = await prisma.employee.findUnique({ where: { id: emp.employeeId } });
      const baseSalary = typeof employee?.baseSalary === 'number' ? employee.baseSalary : 15000;

      // Exact Excel formulas from MONTHLY_PAYROLL_TRACKER:
      // Statutory company payroll standard divisor = 31 (Row 34: Base Monthly Salary ÷ 31)
      // Absent Deduction = ROUND(absentDays * (baseSalary / 31), 0)
      const statutoryDivisor = 31;
      const absentDed = Math.round(emp.summary.absentDays * (baseSalary / statutoryDivisor));
      // Late Deduction = ROUND(lateDeductionDays * (baseSalary / 31), 0)
      const lateDed = Math.round(emp.summary.lateDeductionDays * (baseSalary / statutoryDivisor));
      const netSalary = Math.max(0, baseSalary - absentDed - lateDed);

      const payroll = await prisma.payroll.upsert({
        where: {
          companyId_employeeId_month_year: {
            companyId,
            employeeId: emp.employeeId,
            month,
            year,
          },
        },
        update: {
          presentDays: emp.summary.presentDays,
          absentDays: emp.summary.absentDays,
          weekOffDays: emp.summary.weekOffDays,
          lateMarks: emp.summary.lateMarks,
          lateDeductionDays: emp.summary.lateDeductionDays,
          payableDays: emp.summary.payableDays,
          attendancePercentage: emp.summary.attendancePercentage,
          baseSalary,
          absentDeduction: absentDed,
          lateDeduction: lateDed,
          netSalary,
        },
        create: {
          companyId,
          employeeId: emp.employeeId,
          month,
          year,
          presentDays: emp.summary.presentDays,
          absentDays: emp.summary.absentDays,
          weekOffDays: emp.summary.weekOffDays,
          lateMarks: emp.summary.lateMarks,
          lateDeductionDays: emp.summary.lateDeductionDays,
          payableDays: emp.summary.payableDays,
          attendancePercentage: emp.summary.attendancePercentage,
          baseSalary,
          absentDeduction: absentDed,
          lateDeduction: lateDed,
          netSalary,
          status: 'DRAFT',
        },
        include: { employee: true },
      });

      records.push(payroll);
    }

    return this.getMonthlyPayroll(companyId, month, year);
  }

  static async updateStatus(companyId: string, id: string, status: string, approverName = 'Admin') {
    return prisma.payroll.updateMany({
      where: { id, companyId },
      data: {
        status,
        approvedBy: approverName,
        approvedAt: new Date(),
      },
    });
  }
}
