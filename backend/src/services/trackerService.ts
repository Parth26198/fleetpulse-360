import { prisma } from '../lib/prisma';

export class TrackerService {
  static async getDailyTracker(companyId: string, dateStr?: string) {
    const targetDate = dateStr ? new Date(dateStr) : new Date('2026-11-16');
    const startOfDay = new Date(targetDate.toISOString().split('T')[0]);

    // Fetch all active vehicles
    const vehicles = await prisma.vehicle.findMany({
      where: { companyId, status: 'ACTIVE' },
      include: {
        assignedDriver: true,
        dailyTrackings: {
          where: { trackingDate: startOfDay },
        },
      },
      orderBy: { registrationNumber: 'asc' },
    });

    const rows = vehicles.map((v) => {
      const tracking = v.dailyTrackings[0];
      const tripCount = tracking ? tracking.tripCount : 0;
      const attendanceStatus = tracking ? tracking.attendanceStatus : (tripCount > 0 ? 'PRESENT' : 'ABSENT');
      const cngExpenseToday = tracking ? tracking.cngExpenseToday : 0;
      const cngExpenseMtd = tracking ? tracking.cngExpenseMtd : 0;
      const cngRecoveryRate = tracking ? tracking.cngRecoveryRate : 5.0;
      const cngRecoveryAmount = tracking ? tracking.cngRecoveryAmount : Number((cngExpenseMtd * 0.05).toFixed(2));
      const totalRecoverableCng = tracking ? tracking.totalRecoverableCng : Number((cngExpenseMtd + cngRecoveryAmount).toFixed(2));

      return {
        id: tracking?.id || v.id,
        vehicleId: v.id,
        registrationNumber: v.registrationNumber,
        assignedDriverName: v.assignedDriver?.name || 'Unassigned',
        driverPhone: v.assignedDriver?.phone || '',
        tripCount,
        attendanceStatus,
        cngExpenseToday,
        cngExpenseMtd,
        cngRecoveryRate,
        cngRecoveryAmount,
        totalRecoverableCng,
        trackingDate: startOfDay,
      };
    });

    // Summary calculation
    const totalFleet = rows.length;
    const presentCount = rows.filter((r) => r.attendanceStatus === 'PRESENT').length;
    const absentCount = totalFleet - presentCount;
    const fleetUtilization = totalFleet > 0 ? Number(((presentCount / totalFleet) * 100).toFixed(1)) : 0;
    const totalTodayCng = rows.reduce((sum, r) => sum + r.cngExpenseToday, 0);
    const totalMtdCng = rows.reduce((sum, r) => sum + r.cngExpenseMtd, 0);
    const totalRecoverableOutflow = rows.reduce((sum, r) => sum + r.totalRecoverableCng, 0);

    return {
      summary: {
        totalFleet,
        presentCount,
        absentCount,
        fleetUtilization,
        totalTodayCng,
        totalMtdCng,
        totalRecoverableOutflow,
      },
      vehicles: rows,
    };
  }

  static async updateVehicleCng(companyId: string, vehicleId: string, cngToday: number, dateStr?: string) {
    const targetDate = dateStr ? new Date(dateStr) : new Date('2026-11-16');
    const startOfDay = new Date(targetDate.toISOString().split('T')[0]);

    const existing = await prisma.dailyVehicleTracking.findFirst({
      where: { companyId, vehicleId, trackingDate: startOfDay },
    });

    const cngMtd = (existing ? existing.cngExpenseMtd : 0) + cngToday;
    const recoveryAmt = Number((cngMtd * 0.05).toFixed(2));
    const totalRecoverable = Number((cngMtd + recoveryAmt).toFixed(2));

    if (existing) {
      return prisma.dailyVehicleTracking.update({
        where: { id: existing.id },
        data: {
          cngExpenseToday: cngToday,
          cngExpenseMtd: cngMtd,
          cngRecoveryAmount: recoveryAmt,
          totalRecoverableCng: totalRecoverable,
        },
      });
    } else {
      return prisma.dailyVehicleTracking.create({
        data: {
          companyId,
          vehicleId,
          trackingDate: startOfDay,
          tripCount: 0,
          attendanceStatus: 'ABSENT',
          cngExpenseToday: cngToday,
          cngExpenseMtd: cngMtd,
          cngRecoveryRate: 5.0,
          cngRecoveryAmount: recoveryAmt,
          totalRecoverableCng: totalRecoverable,
        },
      });
    }
  }
}
