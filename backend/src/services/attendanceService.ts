import { prisma } from '../lib/prisma';

export class AttendanceService {
  static async getMonthlyRegister(companyId: string, month = 11, year = 2026) {
    const employees = await prisma.employee.findMany({
      where: { companyId, status: 'ACTIVE' },
      include: {
        attendances: {
          where: {
            attendanceDate: {
              gte: new Date(year, month - 1, 1),
              lt: new Date(year, month, 1),
            },
          },
          orderBy: { attendanceDate: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });

    const daysInMonth = new Date(year, month, 0).getDate();

    const register = employees.map((emp) => {
      const dayMap = new Map<number, any>();
      for (const att of emp.attendances) {
        const day = new Date(att.attendanceDate).getDate();
        dayMap.set(day, att);
      }

      const days: any[] = [];
      let presentCount = 0;
      let absentCount = 0;
      let weekOffCount = 0;
      let lateMarks = 0;

      for (let d = 1; d <= daysInMonth; d++) {
        const att = dayMap.get(d);
        if (att) {
          days.push({
            day: d,
            status: att.status,
            checkIn: att.checkInTime,
            checkOut: att.checkOutTime,
            isLate: att.isLateMark,
          });

          if (att.status === 'PRESENT') presentCount++;
          else if (att.status === 'ABSENT') absentCount++;
          else if (att.status === 'WEEK_OFF') weekOffCount++;

          if (att.isLateMark || att.status === 'LATE') lateMarks++;
        } else {
          // Unrecorded days (e.g. future days in mid-month cycles)
          const dt = new Date(year, month - 1, d);
          const isSun = dt.getDay() === 0;
          days.push({
            day: d,
            status: isSun ? 'WEEK_OFF' : 'UNRECORDED',
            checkIn: null,
            checkOut: null,
            isLate: false,
          });
          if (isSun) weekOffCount++;
        }
      }

      // Exact Excel formulas
      // Late Deduction Days = INT(lateMarks / 2)
      const lateDeductionDays = Math.floor(lateMarks / 2);
      // Net Payable Days = Present + WeekOff - Late Deduction Days
      const payableDays = presentCount + weekOffCount - lateDeductionDays;
      const attendancePercentage =
        presentCount + absentCount > 0
          ? Number(((presentCount / (presentCount + absentCount)) * 100).toFixed(1))
          : 100;

      return {
        employeeId: emp.id,
        employeeCode: emp.employeeCode,
        name: emp.name,
        department: emp.department,
        roleTitle: emp.roleTitle,
        shiftTiming: emp.shiftTiming,
        location: emp.location,
        emergencyContact: emp.emergencyContact,
        days,
        summary: {
          presentDays: presentCount,
          absentDays: absentCount,
          weekOffDays: weekOffCount,
          lateMarks,
          lateDeductionDays,
          payableDays,
          attendancePercentage,
        },
      };
    });

    return {
      month,
      year,
      daysInMonth,
      employees: register,
    };
  }

  static async markAttendance(companyId: string, data: { employeeId: string; date: string; status: string; checkIn?: string; checkOut?: string; isLate?: boolean }) {
    const attendanceDate = new Date(data.date);
    let isLate = Boolean(data.isLate);
    if (data.checkIn && !data.isLate) {
      const parts = data.checkIn.split(':');
      if (parts.length >= 1) {
        const hr = parseInt(parts[0], 10);
        if (hr >= 10) isLate = true;
      }
    }

    return prisma.attendance.upsert({
      where: {
        companyId_employeeId_attendanceDate: {
          companyId,
          employeeId: data.employeeId,
          attendanceDate,
        },
      },
      update: {
        status: data.status,
        checkInTime: data.checkIn || null,
        checkOutTime: data.checkOut || null,
        isLateMark: isLate,
      },
      create: {
        companyId,
        employeeId: data.employeeId,
        attendanceDate,
        status: data.status,
        checkInTime: data.checkIn || null,
        checkOutTime: data.checkOut || null,
        isLateMark: isLate,
      },
    });
  }
}
