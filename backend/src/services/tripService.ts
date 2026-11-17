import { prisma } from '../lib/prisma';

export class TripService {
  static async listTrips(companyId: string, query?: { date?: string; clientId?: string; vehicleId?: string; shift?: string }) {
    const where: any = { companyId };
    if (query?.clientId) where.clientId = query.clientId;
    if (query?.vehicleId) where.vehicleId = query.vehicleId;
    if (query?.shift) where.shift = query.shift;
    if (query?.date) {
      const d = new Date(query.date);
      const nextD = new Date(d);
      nextD.setDate(d.getDate() + 1);
      where.tripDate = { gte: d, lt: nextD };
    }

    return prisma.trip.findMany({
      where,
      include: {
        vehicle: true,
        driver: true,
        client: true,
        stops: {
          orderBy: { stopOrder: 'asc' },
        },
      },
      orderBy: { tripDate: 'desc' },
    });
  }

  static async createTrip(companyId: string, data: any) {
    const trip = await prisma.trip.create({
      data: {
        companyId,
        tripDate: data.tripDate ? new Date(data.tripDate) : new Date(),
        clientId: data.clientId || null,
        vehicleId: data.vehicleId,
        driverId: data.driverId || null,
        shift: data.shift || 'DAY',
        routeName: data.routeName || null,
        tripDirection: data.tripDirection || (data.shift === 'LOGIN' ? 'IN' : 'OUT'),
        status: data.status || 'COMPLETED',
        remarks: data.remarks || null,
      },
    });

    if (data.stops && Array.isArray(data.stops)) {
      for (let i = 0; i < data.stops.length; i++) {
        const s = data.stops[i];
        await prisma.tripStop.create({
          data: {
            tripId: trip.id,
            stopOrder: i + 1,
            stopName: typeof s === 'string' ? s : s.stopName,
            landmark: s.landmark || null,
            scheduledTime: s.scheduledTime || null,
            stopType: s.stopType || (data.shift === 'LOGIN' ? 'PICKUP' : 'DROP'),
          },
        });
      }
    }

    // Update Daily Vehicle Tracking trip count
    const trackingDate = new Date(trip.tripDate.toISOString().split('T')[0]);
    const existingTracking = await prisma.dailyVehicleTracking.findFirst({
      where: { companyId, vehicleId: trip.vehicleId, trackingDate },
    });

    if (existingTracking) {
      const newCount = existingTracking.tripCount + 1;
      await prisma.dailyVehicleTracking.update({
        where: { id: existingTracking.id },
        data: {
          tripCount: newCount,
          attendanceStatus: 'PRESENT',
        },
      });
    } else {
      await prisma.dailyVehicleTracking.create({
        data: {
          companyId,
          vehicleId: trip.vehicleId,
          driverId: trip.driverId,
          trackingDate,
          tripCount: 1,
          attendanceStatus: 'PRESENT',
        },
      });
    }

    return trip;
  }

  static async deleteTrip(companyId: string, id: string) {
    return prisma.trip.deleteMany({
      where: { id, companyId },
    });
  }
}
